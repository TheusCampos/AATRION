import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MAX_PDF_SIZE_MB = 8;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

/**
 * Extrai e estrutura dados de um PDF do LinkedIn usando a API do OpenRouter
 * com Gemini Flash Lite via visão multimodal (sem pdf-parse).
 * O PDF é enviado como base64, eliminando dependência de qualquer lib nativa.
 * Retorna texto formatado (não JSON) para evitar truncamento na etapa de auditoria.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Você precisa estar logado para realizar esta ação.' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado. Por favor, selecione um PDF.' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'O arquivo enviado não é um PDF válido. Por favor, envie seu currículo em formato .pdf' },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: `O arquivo excede o tamanho máximo de ${MAX_PDF_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    // Converte o PDF para base64 — sem nenhuma lib nativa, 100% nativo do Node
    const arrayBuffer = await file.arrayBuffer();
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64');

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY não está configurada.');
    }

    // Prompt para retornar texto formatado (não JSON) — evita problema de truncamento
    // no JSON de auditoria, que tem um schema muito mais complexo.
    const systemPrompt = `Você é um extrator especialista de currículos em PDF do LinkedIn.
O usuário vai te enviar um PDF. Extraia TODAS as informações do perfil e retorne o conteúdo em texto simples e organizado, no seguinte formato:

NOME: [Nome completo]
TÍTULO: [Headline / Cargo atual]
LOCALIDADE: [Cidade, Estado, País]

SOBRE:
[Texto completo da seção Sobre]

EXPERIÊNCIAS:
[Cargo] | [Empresa] | [Período]
[Descrição completa das responsabilidades e conquistas]

[Repita para cada cargo]

FORMAÇÃO:
[Curso] | [Instituição] | [Período]

HABILIDADES:
[Lista de habilidades separadas por vírgula]

CERTIFICAÇÕES:
[Lista de certificações]

IDIOMAS:
[Lista de idiomas com nível]

REGRAS:
- Não invente informações. Use apenas o que está no PDF.
- Mantenha todos os cargos, não apenas o mais recente.
- Se uma seção não existir, omita-a.
- Retorne APENAS o texto formatado, sem explicações adicionais.`;

    // Chamada direta ao OpenRouter com suporte multimodal (PDF via base64)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'ATRION CVForge',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia todas as informações deste currículo PDF do LinkedIn e retorne o texto estruturado conforme as instruções.',
              },
              {
                type: 'file',
                file: {
                  filename: file.name,
                  file_data: `data:application/pdf;base64,${base64Pdf}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({})) as Record<string, unknown>;
      const errMsg = (errData.error as Record<string, string>)?.message || response.statusText;
      throw new Error(`Falha na IA de extração: ${errMsg}`);
    }

    const result = await response.json();
    const rawText = result.choices?.[0]?.message?.content;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'A IA não conseguiu extrair informações do PDF. Verifique se o PDF contém texto selecionável (não é uma imagem escaneada).' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, text: rawText });
  } catch (error: unknown) {
    console.error('[extract-pdf] Erro:', error);
    const msg = error instanceof Error ? error.message : 'Erro interno desconhecido.';
    return NextResponse.json({ error: `Falha ao processar o PDF: ${msg}` }, { status: 500 });
  }
}
