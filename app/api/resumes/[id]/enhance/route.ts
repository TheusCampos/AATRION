import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runAI, AIError } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { checkAIQuota, consumeAIUsage } from '@/lib/plan';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { startTimer, trackApiCall } from '@/lib/api-telemetry';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const getElapsed = startTimer();
  let currentUserId: string | null = null;

  try {
    const user = await getCurrentUser();
    if (!user) {
      trackApiCall({
        req,
        routeName: '/api/resumes/[id]/enhance',
        status: 401,
        durationMs: getElapsed(),
        responseMessage: 'Unauthorized',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    currentUserId = user.id;

    // SEC-006: Rate limiting por usuário
    const rl = await checkRateLimit(`ai:${user.id}`, RATE_LIMITS.ai);
    if (!rl.allowed) {
      trackApiCall({
        req,
        routeName: '/api/resumes/[id]/enhance',
        status: 429,
        durationMs: getElapsed(),
        userId: user.id,
        responseMessage: 'Rate limit excedido',
      });
      return rl.response;
    }

    // Usamos a cota de 'analyze' para melhorar o resumo (ou poderia ser uma cota específica)
    const quota = await checkAIQuota(user.id, user.plan, 'analyze');
    if (!quota.allowed) {
      const msg = `Limite mensal de IA atingido (${quota.used}/${quota.limit}). Faça upgrade de plano.`;
      trackApiCall({
        req,
        routeName: '/api/resumes/[id]/enhance',
        status: 403,
        durationMs: getElapsed(),
        userId: user.id,
        responseMessage: msg,
      });
      return NextResponse.json(
        { error: msg },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { summary } = body;

    if (!summary) {
      trackApiCall({
        req,
        routeName: '/api/resumes/[id]/enhance',
        status: 400,
        durationMs: getElapsed(),
        userId: user.id,
        responseMessage: 'Um resumo atual é obrigatório para melhorar.',
      });
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
      trackApiCall({
        req,
        routeName: '/api/resumes/[id]/enhance',
        status: 404,
        durationMs: getElapsed(),
        userId: user.id,
        responseMessage: 'Not found or forbidden',
      });
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
      await consumeAIUsage(user.id, user.plan, 'analyze');
    } catch (err) {
      console.error('[/enhance] erro ao contabilizar uso de IA:', err);
    }

    trackApiCall({
      req,
      routeName: '/api/resumes/[id]/enhance',
      status: 200,
      durationMs: getElapsed(),
      userId: user.id,
      details: { resumeId: params.id },
    });

    return NextResponse.json({ summary: improvedSummary });
  } catch (error) {
    console.error('[ENHANCE_SUMMARY_ERROR]', error);
    const msg = error instanceof AIError ? error.message : 'Internal Server Error';

    trackApiCall({
      req,
      routeName: '/api/resumes/[id]/enhance',
      status: 500,
      durationMs: getElapsed(),
      userId: currentUserId,
      responseMessage: msg,
      error,
    });

    if (error instanceof AIError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

