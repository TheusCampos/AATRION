import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { emptyResumeContent, type ResumeContent } from '@/lib/validations/resume';
import { runAI, safeParseJSON } from '@/lib/ai';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

// Forçar runtime Node.js: pdf-parse v2 + mammoth usam APIs nativas do Node
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Tipos MIME aceitos
const PDF_MIME = 'application/pdf';
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ExtractedFile = {
  text: string;
  pages: number;
  warnings: string[];
};

/**
 * Extrai texto de um PDF usando pdf-parse v2 (pdfjs-dist v5).
 * O parser é destruído após o uso para liberar memória.
 */
async function extractPdfText(buffer: Buffer): Promise<ExtractedFile> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      text: (result.text ?? '').trim(),
      pages: result.total ?? 0,
      warnings: [],
    };
  } finally {
    // Garante liberação dos recursos do worker
    try {
      await parser.destroy();
    } catch {
      // ignora erro de destroy
    }
  }
}

/**
 * Extrai texto de um DOCX usando mammoth.
 */
async function extractDocxText(buffer: Buffer): Promise<ExtractedFile> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: (result.value ?? '').trim(),
    pages: 0,
    warnings: result.messages?.map((m) => m.message) ?? [],
  };
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error('[IMPORT] Erro ao buscar usuário:', err);
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-006: Rate limiting por usuário (import usa IA)
  const rl = await checkRateLimit(`ai:${user.id}`, RATE_LIMITS.ai);
  if (!rl.allowed) return rl.response;


  // Limite de currículos conforme o plano.
  const { maxResumes } = user.limits;
  if (maxResumes !== -1) {
    try {
      const count = await prisma.resume.count({ where: { userId: user.id } });
      if (count >= maxResumes) {
        return NextResponse.json(
          {
            error: `Você atingiu o limite do plano Grátis (${maxResumes} currículo). Faça upgrade para o plano Pro para criar, importar e ter acesso a recursos ilimitados!`,
          },
          { status: 403 }
        );
      }
    } catch (err) {
      console.error('[IMPORT] Erro ao contar currículos:', err);
      return NextResponse.json(
        { error: 'Falha ao verificar limite do plano.' },
        { status: 500 }
      );
    }
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    console.error('[IMPORT] Falha ao ler formData:', err);
    return NextResponse.json(
      { error: 'Requisição inválida. Envie um arquivo no campo "file".' },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Nenhum arquivo enviado. Use o campo "file".' },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json(
      { error: 'Arquivo vazio. Envie um PDF ou DOCX com conteúdo.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Arquivo excede 5MB.' },
      { status: 400 }
    );
  }

  // Validação de tipo MIME — alguns navegadores/envios usam octet-stream
  const isPdf = file.type === PDF_MIME || file.name.toLowerCase().endsWith('.pdf');
  const isDocx = file.type === DOCX_MIME || file.name.toLowerCase().endsWith('.docx');

  if (!isPdf && !isDocx) {
    return NextResponse.json(
      { error: `Formato não suportado (${file.type || 'desconhecido'}). Envie PDF ou DOCX.` },
      { status: 400 }
    );
  }

  // Leitura do buffer (com try/catch pois File pode falhar em alguns ambientes)
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('[IMPORT] Falha ao ler bytes do arquivo:', err);
    return NextResponse.json(
      { error: 'Não foi possível ler o arquivo enviado.' },
      { status: 400 }
    );
  }

  // 1) Extração de texto
  let extracted: ExtractedFile;
  try {
    if (isPdf) {
      extracted = await extractPdfText(buffer);
    } else {
      extracted = await extractDocxText(buffer);
    }
  } catch (err) {
    console.error(`[IMPORT] Falha ao extrair texto (${isPdf ? 'PDF' : 'DOCX'}):`, err);
    // SEC-011: Não expor detalhes internos ao cliente
    return NextResponse.json(
      {
        error: isPdf
          ? 'Falha ao processar o PDF. O arquivo pode estar corrompido, protegido por senha ou conter apenas imagens sem texto.'
          : 'Falha ao processar o DOCX. O arquivo pode estar corrompido ou em formato não suportado.',
      },
      { status: 422 }
    );
  }

  const text = extracted.text;

  if (!text || text.length < 20) {
    return NextResponse.json(
      {
        error:
          'Não foi possível extrair texto legível do arquivo. Se for um PDF escaneado, exporte-o com texto selecionável e tente novamente.',
      },
      { status: 422 }
    );
  }

  // 2) Estruturação com IA (com fallback caso falhe)
  let initialContent: ResumeContent = emptyResumeContent();
  initialContent.personal.summary = text.substring(0, 1500);

  try {
    const systemInstruction = `Você é um extrator de dados de currículos profissional de altíssima precisão.
Seu trabalho é analisar o texto extraído de um currículo do usuário e estruturar os dados rigorosamente no formato JSON especificado.

Instruções importantes para garantir a integridade dos dados e evitar falhas de validação:
1. Datas de início e fim: Converta todas as datas extraídas para o formato "YYYY-MM" (ex: "2021-03"). Se for o emprego atual ou se o ano de conclusão não estiver especificado (ex: "Atualmente", "Presente", "Atual"), defina "current" como true e "end" como "".
2. Níveis de habilidades (skills.level): Deve ser obrigatoriamente um destes valores: "basic", "intermediate" ou "advanced".
3. Níveis de idiomas (languages.level): Deve ser obrigatoriamente um destes valores: "basic", "intermediate", "advanced" ou "native".
4. Descrição de experiências (experience.description): Extraia as realizações e responsabilidades principais, formatando em tópicos limpos por linha (começando com "• ").
5. IDs: Gere identificadores simples e únicos por categoria (ex: "exp-1", "edu-1", "ski-1", "prj-1").

Estrutura JSON EXATA esperada (retorne APENAS o JSON puro, sem blocos de código markdown ou explicações):
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "jobTitle": "", "linkedin": "", "github": "", "website": "", "summary": "" },
  "experience": [ { "id": "exp-1", "company": "", "role": "", "start": "YYYY-MM", "end": "YYYY-MM", "current": false, "description": "" } ],
  "education": [ { "id": "edu-1", "institution": "", "course": "", "level": "", "start": "YYYY-MM", "end": "YYYY-MM" } ],
  "skills": [ { "id": "ski-1", "name": "", "level": "intermediate" } ],
  "projects": [ { "id": "prj-1", "name": "", "description": "", "tech": [], "url": "" } ],
  "languages": [ { "id": "lng-1", "language": "", "level": "intermediate" } ],
  "certifications": [ { "id": "crt-1", "name": "", "issuer": "", "date": "YYYY-MM" } ]
}`;

    const aiResponse = await runAI({
      model: 'google/gemini-2.5-flash-lite',
      systemInstruction,
      userText: `Extraia as informações do seguinte currículo:\n\n${text.substring(0, 8000)}`,
      responseJson: true,
      temperature: 0.1,
      maxOutputTokens: 2500,
    });

    const parsed = safeParseJSON<ResumeContent>(aiResponse.text);
    if (parsed && parsed.personal) {
      // Garantindo defaults do ResumeContent
      initialContent = { ...emptyResumeContent(), ...parsed };
    }
  } catch (err) {
    console.error('[IMPORT] IA falhou ao estruturar (mantendo texto bruto):', err);
    // Mantém initialContent com o texto bruto no summary
    initialContent.personal.summary = `[TEXTO EXTRAÍDO DO ARQUIVO - A IA FALHOU AO ESTRUTURAR]\n\n${text.substring(0, 1500)}...`;
  }

  // 3) Persistência
  try {
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `Importado: ${file.name}`,
        content: JSON.stringify(initialContent),
        templateId: 'classic',
      },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (err) {
    console.error('[IMPORT] Falha ao salvar currículo no banco:', err);
    return NextResponse.json(
      { error: 'Falha ao salvar o currículo no banco de dados.' },
      { status: 500 }
    );
  }
}
