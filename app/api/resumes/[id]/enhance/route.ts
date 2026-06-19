import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAI, AIError } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { checkAIQuota, consumeAIUsage } from '@/lib/plan';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SEC-006: Rate limiting por usuário
    const rl = await checkRateLimit(`ai:${user.id}`, RATE_LIMITS.ai);
    if (!rl.allowed) return rl.response;

    // Usamos a cota de 'analyze' para melhorar o resumo (ou poderia ser uma cota específica)
    const quota = await checkAIQuota(user.id, user.plan, 'analyze');
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `Limite mensal de IA atingido (${quota.used}/${quota.limit}). Faça upgrade de plano.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { summary } = body;

    if (!summary) {
      return NextResponse.json(
        { error: 'Um resumo atual é obrigatório para melhorar.' },
        { status: 400 }
      );
    }

    // Verificar se o usuário é dono do currículo
    const resume = await prisma.resume.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!resume) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
    }

    const systemInstruction = `Você é um especialista em recrutamento e seleção de alto nível.
Sua tarefa é melhorar o resumo profissional fornecido pelo usuário.
O resumo deve:
1. Ser escrito em primeira pessoa, de forma profissional e cativante.
2. Destacar os principais pontos fortes e a proposta de valor do candidato.
3. Ter um tom confiante, mas não arrogante.
4. Ser conciso (em torno de 3 a 5 frases).
5. Manter o idioma original do texto fornecido.
Retorne APENAS o texto do resumo melhorado, sem aspas adicionais, introduções ou notas.`;

    const aiResponse = await runAI({
      systemInstruction,
      userText: `Melhore este resumo profissional:\n\n${summary}`,
      temperature: 0.7,
      maxOutputTokens: 300,
    });

    let improvedSummary = aiResponse.text.trim();
    // Remove quotes if the AI wrapped it in quotes
    if (improvedSummary.startsWith('"') && improvedSummary.endsWith('"')) {
      improvedSummary = improvedSummary.slice(1, -1).trim();
    }

    // Consome a cota de IA
    try {
      await consumeAIUsage(user.id, 'analyze');
    } catch (err) {
      console.error('[/enhance] erro ao contabilizar uso de IA:', err);
    }

    return NextResponse.json({ summary: improvedSummary });
  } catch (error) {
    console.error('[ENHANCE_SUMMARY_ERROR]', error);
    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
