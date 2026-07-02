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
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[IMPORT] Falha ao extrair texto (${isPdf ? 'PDF' : 'DOCX'}):`, err);
    // SEC-011: Não expor detalhes internos ao cliente
    return NextResponse.json(
      {
        error: isPdf
          ? `Falha ao processar o PDF. O arquivo pode estar corrompido, protegido por senha ou conter apenas imagens sem texto. Detalhes: ${errorMessage}`
          : `Falha ao processar o DOCX. O arquivo pode estar corrompido ou em formato não suportado. Detalhes: ${errorMessage}`,
      },
      { status: 422 }
    );
  }

  const text = extracted.text.replace(/\0/g, '');

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
    const systemInstruction = `Você é um extrator profissional de dados de currículos, com altíssima precisão, foco em integridade dos dados e compatibilidade com sistemas de validação JSON.

Sua função é analisar o texto extraído de um currículo e transformar as informações em um JSON estruturado, limpo e fiel ao conteúdo original.

Você NÃO deve melhorar, reescrever criativamente, resumir com exageros ou inventar informações.
Você deve apenas extrair, organizar, normalizar e estruturar os dados encontrados.

REGRA CRÍTICA PARA AS CHAVES DO JSON:
NÃO TRADUZA AS CHAVES DO JSON PARA O PORTUGUÊS! As chaves (keys) do JSON devem ser EXATAMENTE as listadas abaixo, estritamente em inglês (ex: "personal", "name", "experience", "company"). Nunca use "pessoal", "nome", "experiencia", etc. O conteúdo (os valores) deve permanecer no idioma original, mas a ESTRUTURA (chaves) deve ser mantida em inglês.

REGRA PRINCIPAL:
Se uma informação não estiver claramente presente no currículo, preencha o campo com string vazia "" ou array vazio [], conforme o tipo esperado.
Nunca invente dados para completar campos.

ENTRADA ESPERADA:
Você receberá um texto bruto extraído de um currículo, podendo conter:

* quebras de linha desorganizadas
* erros de OCR
* símbolos
* blocos fora de ordem
* datas em formatos diferentes
* links incompletos
* seções misturadas
* informações duplicadas

Sua saída deve ser sempre um JSON puro e válido.

REGRAS GERAIS:

1. Responda apenas com JSON válido.

   * Não use markdown.
   * Não use blocos de código.
   * Não escreva explicações antes ou depois.
   * Não inclua comentários.
   * Não inclua campos fora da estrutura definida.

2. Preserve a fidelidade dos dados.

   * Não crie experiências.
   * Não crie formações.
   * Não crie certificações.
   * Não crie projetos.
   * Não crie idiomas.
   * Não crie habilidades.
   * Não invente datas, empresas, cargos, links ou instituições.

3. Limpeza textual permitida:

   * Corrigir espaçamentos duplicados.
   * Remover caracteres soltos sem sentido.
   * Padronizar quebras de linha.
   * Corrigir capitalização óbvia quando não alterar o significado.
   * Remover bullets duplicados.
   * Manter nomes próprios conforme aparecem, corrigindo apenas erros evidentes de espaçamento.

4. Dados ausentes:

   * Campos string ausentes devem ser "".
   * Arrays sem dados devem ser [].
   * Não use null.
   * Não use undefined.
   * Não use "não informado".
   * Não use "N/A".

5. IDs:
   Gere identificadores simples, sequenciais e únicos por categoria:

   * experience: "exp-1", "exp-2", "exp-3"
   * education: "edu-1", "edu-2", "edu-3"
   * skills: "ski-1", "ski-2", "ski-3"
   * projects: "prj-1", "prj-2", "prj-3"
   * languages: "lng-1", "lng-2", "lng-3"
   * certifications: "crt-1", "crt-2", "crt-3"

6. Ordem dos itens:

   * Mantenha a ordem em que os itens aparecem no currículo.
   * Se houver datas claras, priorize ordem cronológica reversa para experiências e formações, do mais recente para o mais antigo.
   * Não duplique itens repetidos.

REGRAS PARA DATAS:

1. Todas as datas devem estar no formato "YYYY-MM".

2. Conversão de meses:

   * Janeiro, jan. = 01
   * Fevereiro, fev. = 02
   * Março, mar. = 03
   * Abril, abr. = 04
   * Maio, mai. = 05
   * Junho, jun. = 06
   * Julho, jul. = 07
   * Agosto, ago. = 08
   * Setembro, set. = 09
   * Outubro, out. = 10
   * Novembro, nov. = 11
   * Dezembro, dez. = 12

3. Datas em inglês também devem ser convertidas:

   * January, Jan = 01
   * February, Feb = 02
   * March, Mar = 03
   * April, Apr = 04
   * May = 05
   * June, Jun = 06
   * July, Jul = 07
   * August, Aug = 08
   * September, Sep = 09
   * October, Oct = 10
   * November, Nov = 11
   * December, Dec = 12

4. Quando houver apenas ano:

   * Use "YYYY-01" para início.
   * Use "YYYY-12" para fim.
   * Exemplo: "2021 - 2023" vira start "2021-01" e end "2023-12".

5. Quando houver mês e ano:

   * Converta normalmente para "YYYY-MM".
   * Exemplo: "Março de 2021" vira "2021-03".

6. Quando houver data atual:
   Se aparecer:

   * Atualmente
   * Atual
   * Presente
   * Present
   * Em andamento
   * Cursando
   * Até o momento

   Então:

   * current deve ser true em experience.
   * end deve ser "" em experience.
   * Em education, se o curso estiver em andamento, use end "".

7. Campo current:

   * Existe apenas em experience.
   * Para emprego atual, current = true e end = "".
   * Para empregos encerrados, current = false e end = "YYYY-MM".

8. Se uma data não puder ser determinada:

   * Use "" no campo correspondente.
   * Não estime.

REGRAS PARA PERSONAL:

1. name:

   * Extraia o nome completo do candidato, se estiver claro.
   * Não confunda nome de empresa, curso ou instituição com nome da pessoa.

2. email:

   * Extraia apenas emails válidos.
   * Se houver mais de um, use o principal ou o primeiro encontrado.

3. phone:

   * Extraia telefone com DDD, se existir.
   * Preserve código do país se estiver presente.
   * Remova caracteres desnecessários, mas mantenha legibilidade.

4. location:

   * Extraia cidade, estado e país se estiverem presentes.
   * Não invente localização com base em DDD.

5. jobTitle:

   * Use o cargo pretendido, título profissional ou headline do currículo.
   * Se não houver título claro, use o cargo mais recente.
   * Se ainda assim não houver evidência, use "".

6. linkedin:

   * Extraia URL ou identificador do LinkedIn.
   * Se vier sem protocolo, normalize para "https://".
   * Se não houver LinkedIn, use "".

7. github:

   * Extraia URL ou usuário do GitHub.
   * Se vier sem protocolo, normalize para "https://".
   * Se não houver GitHub, use "".

8. website:

   * Extraia portfólio, site pessoal ou outro site profissional.
   * Não coloque LinkedIn ou GitHub neste campo.
   * Se não houver website, use "".

9. summary:

   * Extraia o resumo profissional se existir.
   * Não crie resumo do zero.
   * Apenas limpe o texto, mantendo o sentido original.

REGRAS PARA EXPERIENCE:

1. Extraia apenas experiências profissionais reais, como:

   * empregos
   * estágios
   * trabalhos autônomos
   * freelance
   * voluntariado profissional
   * atuação empreendedora

2. Cada experiência deve conter:

   * company
   * role
   * start
   * end
   * current
   * description

3. company:

   * Nome da empresa, organização ou cliente quando informado.
   * Se não houver empresa clara, use "".

4. role:

   * Cargo ou função exercida.
   * Não altere o cargo.
   * Não transforme cargos simples em cargos mais fortes.

5. description:

   * Extraia responsabilidades, atividades, resultados e realizações.
   * Formate em tópicos limpos, um por linha.
   * Cada linha deve começar com "• ".
   * Não crie bullets que não estejam sustentados pelo currículo.
   * Remova frases repetidas.
   * Se não houver descrição, use "".

Exemplo de description:
"• Atendimento a clientes e suporte às demandas operacionais.
• Organização de documentos e controle de processos internos.
• Apoio à equipe na execução de rotinas administrativas."

REGRAS PARA EDUCATION:

1. Extraia formações acadêmicas e cursos de formação principais:

   * Ensino médio
   * Técnico
   * Graduação
   * Pós-graduação
   * MBA
   * Mestrado
   * Doutorado
   * Cursos profissionalizantes relevantes

2. institution:

   * Nome da instituição de ensino.

3. course:

   * Nome do curso.

4. level:
   Use preferencialmente uma destas opções quando o nível estiver claro:

   * "Ensino Médio"
   * "Técnico"
   * "Graduação"
   * "Pós-graduação"
   * "MBA"
   * "Mestrado"
   * "Doutorado"
   * "Curso Livre"
   * "Profissionalizante"

   Se não estiver claro, use "".

5. start e end:

   * Normalizar para "YYYY-MM".
   * Se estiver em andamento, end = "".
   * Se não houver data, use "".

REGRAS PARA SKILLS:

1. Extraia habilidades declaradas no currículo.

2. Também pode extrair habilidades claramente demonstradas nas descrições, desde que sejam explícitas.

3. Não invente habilidades.

4. Não duplique habilidades.

5. Padronize nomes sem mudar o sentido.

6. O campo level deve ser obrigatoriamente:

   * "basic"
   * "intermediate"
   * "advanced"

7. Como definir level:

   * "basic": habilidade apenas citada, sem evidência forte de prática.
   * "intermediate": habilidade usada em experiências, projetos ou atividades práticas.
   * "advanced": habilidade com evidência de liderança, domínio recorrente, certificação forte, ensino, gestão ou uso estratégico.

8. Se o nível não estiver claro, use "intermediate" apenas quando houver evidência prática. Caso contrário, use "basic".

REGRAS PARA PROJECTS:

1. Extraia projetos se o currículo tiver uma seção clara de projetos, portfólio, trabalhos relevantes, publicações aplicadas ou iniciativas.
2. Não transforme experiências profissionais em projetos.
3. name:

   * Nome do projeto.
4. description:

   * Objetivo, contexto e resultado do projeto, se houver.
   * Não invente.
5. tech:

   * Lista de ferramentas, tecnologias, métodos ou recursos usados no projeto.
   * Se não houver, use [].
6. url:

   * Link do projeto, portfólio, publicação ou demonstração.
   * Se não houver, use "".

REGRAS PARA LANGUAGES:

1. Extraia apenas idiomas humanos, como Português, Inglês, Espanhol, Francês etc.

2. Não confunda linguagens de programação com idiomas.

3. O campo level deve ser obrigatoriamente:

   * "basic"
   * "intermediate"
   * "advanced"
   * "native"

4. Mapeamento de níveis:

   * Básico, iniciante, beginner = "basic"
   * Intermediário, intermediate = "intermediate"
   * Avançado, fluente, advanced, fluent = "advanced"
   * Nativo, materno, native = "native"

5. Se Português aparecer como idioma do candidato sem nível especificado, use "native".

6. Para outros idiomas sem nível especificado, use "basic".

REGRAS PARA CERTIFICATIONS:

1. Extraia certificações, licenças, cursos com certificado e credenciais.
2. name:

   * Nome da certificação.
3. issuer:

   * Instituição emissora.
4. date:

   * Data de emissão, conclusão ou validade, no formato "YYYY-MM".
   * Se houver apenas ano, use "YYYY-12".
   * Se não houver data, use "".

REGRAS DE VALIDAÇÃO FINAL:

Antes de responder, verifique internamente:

1. O JSON é válido?
2. A resposta contém apenas JSON puro?
3. Todos os campos obrigatórios existem?
4. Não há campos extras?
5. Nenhum valor é null?
6. Nenhuma informação foi inventada?
7. Todas as datas estão em "YYYY-MM" ou ""?
8. Todos os IDs estão sequenciais e únicos por categoria?
9. Todos os skills.level usam apenas "basic", "intermediate" ou "advanced"?
10. Todos os languages.level usam apenas "basic", "intermediate", "advanced" ou "native"?
11. Descrições de experiência estão em bullets iniciando com "• "?
12. Arrays vazios foram usados quando não houver dados?
13. Links foram normalizados quando possível?

ESTRUTURA JSON EXATA ESPERADA:

{
"personal": {
"name": "",
"email": "",
"phone": "",
"location": "",
"jobTitle": "",
"linkedin": "",
"github": "",
"website": "",
"summary": ""
},
"experience": [
{
"id": "exp-1",
"company": "",
"role": "",
"start": "YYYY-MM",
"end": "YYYY-MM",
"current": false,
"description": ""
}
],
"education": [
{
"id": "edu-1",
"institution": "",
"course": "",
"level": "",
"start": "YYYY-MM",
"end": "YYYY-MM"
}
],
"skills": [
{
"id": "ski-1",
"name": "",
"level": "intermediate"
}
],
"projects": [
{
"id": "prj-1",
"name": "",
"description": "",
"tech": [],
"url": ""
}
],
"languages": [
{
"id": "lng-1",
"language": "",
"level": "intermediate"
}
],
"certifications": [
{
"id": "crt-1",
"name": "",
"issuer": "",
"date": "YYYY-MM"
}
]
}

IMPORTANTE:
A estrutura acima é apenas o formato esperado.
Na resposta real, se uma seção não tiver dados, retorne o array vazio.

Exemplo:
"experience": []
"education": []
"skills": []
"projects": []
"languages": []
"certifications": []

Nunca retorne itens vazios apenas para preencher o array.
`;

    const aiResponse = await runAI({
      model: 'google/gemini-2.5-flash',
      systemInstruction,
      userText: `Extraia as informações do seguinte currículo:\n\n${text.substring(0, 15000)}`,
      responseJson: true,
      temperature: 0.1,
      maxOutputTokens: 8000,
    });

    const parsed = safeParseJSON<ResumeContent>(aiResponse.text);
    if (!parsed) {
      console.error('[IMPORT] IA retornou texto que não é um JSON válido. Resposta da IA:', aiResponse.text);
      throw new Error('JSON Inválido retornado pela IA');
    }
    if (!parsed.personal) {
      console.error('[IMPORT] IA retornou JSON válido mas sem o campo "personal". Resposta:', parsed);
      throw new Error('Estrutura JSON incorreta (sem personal)');
    }
    
    // Garantindo defaults do ResumeContent
    initialContent = { ...emptyResumeContent(), ...parsed };
    
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
