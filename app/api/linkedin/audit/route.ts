import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createAuditSchema } from '@/lib/validations/linkedin';
import { checkAIQuota, consumeAIUsage } from '@/lib/plan';
import { runAI, safeParseJSON } from '@/lib/ai';
import type { AuditResult } from '@/lib/linkedin-analyzer';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const audits = await prisma.linkedInAudit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      profileUrl: true,
      area: true,
      targetJob: true,
      overallScore: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ audits });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-006: Rate limiting por usuário
  const rl = await checkRateLimit(`ai:${user.id}`, RATE_LIMITS.ai);
  if (!rl.allowed) return rl.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = createAuditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Quota mensal de auditorias (usa o mesmo limite de IA/audit)
  const quota = await checkAIQuota(user.id, user.plan, 'audit');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Limite mensal de auditorias LinkedIn atingido (${quota.used}/${quota.limit}). Faça upgrade de plano.`,
        quota,
      },
      { status: 403 }
    );
  }

  const { profileText, profileUrl, area, targetJob } = parsed.data;

  const systemInstruction = `Você é um consultor de carreira e headhunter. Analise o perfil do LinkedIn e retorne APENAS JSON válido:

{
  "overallScore": 85,
  "summary": "Resumo em 1-2 frases.",
  "sections": [
    {"key": "headline", "label": "Título", "present": true, "score": 90, "notes": ["nota1"]},
    {"key": "about", "label": "Sobre", "present": true, "score": 80, "notes": ["nota1"]},
    {"key": "experience", "label": "Experiência", "present": true, "score": 85, "notes": []},
    {"key": "skills", "label": "Habilidades", "present": true, "score": 75, "notes": []},
    {"key": "education", "label": "Formação", "present": false, "score": 0, "notes": ["ausente"]},
    {"key": "image", "label": "Imagem e Banner", "present": true, "score": 80, "notes": []},
    {"key": "posts", "label": "Postagens e Atividade", "present": true, "score": 70, "notes": []}
  ],
  "issues": [
    {"id": "i1", "severity": "high", "area": "Sobre", "message": "Mensagem curta."}
  ],
  "suggestions": [
    {"id": "s1", "area": "Experiência", "message": "Adicione métricas."}
  ],
  "postIdeas": ["Ideia 1", "Ideia 2", "Ideia 3"],
  "metrics": {"charCount": 0, "wordCount": 0, "lineCount": 0, "hasNumbers": false, "hasLinks": false, "hasBullets": false}
}

Regras: Faça uma leitura completa do perfil (imagem, texto, postagens, e outros campos). As 'sections' DEVE conter headline, about, experience, skills, education, image, posts. issues máx 6. suggestions máx 6. postIdeas de 3-5.`;

  const userPrompt = `Área atual/foco: ${area || 'Não informado'}
Vaga/Objetivo Alvo: ${targetJob || 'Não informado'}

TEXTO DO PERFIL DO LINKEDIN (Pode incluir descrições visuais de imagens, publicações, atividades, etc):
${profileText.substring(0, 20000)}`;

  let result: AuditResult;
  try {
    const aiResponse = await runAI({
      model: 'google/gemini-2.5-flash-lite',
      systemInstruction,
      userText: userPrompt,
      responseJson: true,
      temperature: 0.2,
      maxOutputTokens: 4096,
    });

    const parsedResult = safeParseJSON<AuditResult>(aiResponse.text);
    if (!parsedResult || typeof parsedResult.overallScore !== 'number') {
      throw new Error('JSON inválido retornado pela IA');
    }
    result = parsedResult;
    
    // Calcula métricas básicas de texto para o JSON de saída caso a IA zere
    if (!result.metrics || result.metrics.charCount === 0) {
      result.metrics = {
        charCount: profileText.length,
        wordCount: profileText.split(/\s+/).length,
        lineCount: profileText.split('\n').length,
        hasNumbers: /\d/.test(profileText),
        hasLinks: /http|www/.test(profileText),
        hasBullets: /[-•*]/.test(profileText),
      };
    }
  } catch (err) {
    console.error('Falha na IA do LinkedIn:', err);
    return NextResponse.json({ error: 'Falha ao analisar o perfil com IA.' }, { status: 500 });
  }

  const audit = await prisma.linkedInAudit.create({
    data: {
      userId: user.id,
      profileText,
      profileUrl: profileUrl || null,
      area: area || null,
      targetJob: targetJob || null,
      status: 'done',
      overallScore: result.overallScore,
      result: JSON.stringify(result),
    },
    select: { id: true, overallScore: true, createdAt: true },
  });

  let usage;
  try {
    usage = await consumeAIUsage(user.id, 'audit');
  } catch (err) {
    console.error('[/linkedin/audit] erro ao contabilizar uso:', err);
  }

  return NextResponse.json(
    {
      audit,
      result,
      usage: usage
        ? {
            analyzeUsed: usage.aiAnalyzeUsed,
            adaptUsed: usage.aiAdaptUsed,
            auditUsed: usage.aiAuditUsed,
            period: usage.aiUsagePeriod,
          }
        : undefined,
    },
    { status: 201 }
  );
}
