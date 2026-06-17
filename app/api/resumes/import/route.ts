import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { emptyResumeContent, type ResumeContent } from '@/lib/validations/resume';
import { runAI, safeParseJSON } from '@/lib/ai';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

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


  // Plano FREE: limitar a 3 currículos
  if (user.plan === 'FREE') {
    try {
      const count = await prisma.resume.count({ where: { userId: user.id } });
      if (count >= 3) {
        return NextResponse.json(
          {
            error:
              'Limite do plano FREE atingido (3 currículos). Faça upgrade para criar mais.',
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
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[IMPORT] Falha ao extrair texto (${isPdf ? 'PDF' : 'DOCX'}):`, err);
    return NextResponse.json(
      {
        error: isPdf
          ? 'Falha ao processar o PDF. O arquivo pode estar corrompido, protegido por senha ou conter apenas imagens sem texto.'
          : 'Falha ao processar o DOCX. O arquivo pode estar corrompido ou em formato não suportado.',
        detail,
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
    const systemInstruction = `Você é um extrator de dados de currículos altamente preciso.
Seu trabalho é analisar o texto extraído de um arquivo de currículo do usuário e estruturar os dados rigorosamente no formato JSON especificado abaixo.
As chaves do JSON são: personal, experience, education, skills, projects, languages, certifications.
Os IDs devem ser strings aleatórias simples (ex: "exp-1", "edu-2").

Estrutura EXATA esperada (retorne APENAS JSON, sem markdown):
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "jobTitle": "", "linkedin": "", "github": "", "website": "", "summary": "" },
  "experience": [ { "id": "1", "company": "", "role": "", "start": "YYYY-MM", "end": "YYYY-MM", "current": false, "description": "" } ],
  "education": [ { "id": "1", "institution": "", "course": "", "level": "", "start": "YYYY-MM", "end": "YYYY-MM" } ],
  "skills": [ { "id": "1", "name": "", "level": "intermediate" } ],
  "projects": [ { "id": "1", "name": "", "description": "", "tech": [], "url": "" } ],
  "languages": [ { "id": "1", "language": "", "level": "intermediate" } ],
  "certifications": [ { "id": "1", "name": "", "issuer": "", "date": "YYYY-MM" } ]
}`;

    const aiResponse = await runAI({
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
