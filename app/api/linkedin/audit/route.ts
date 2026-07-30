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

  const systemInstruction = `Você é um Consultor de Carreira Sênior e Especialista em Recrutamento Tech.
Analise detalhadamente o perfil do LinkedIn fornecido e retorne APENAS um JSON válido que siga ESTRITAMENTE a estrutura abaixo:

{
  "overallScore": 85,
  "executiveSummary": "Resumo executivo de 2-3 frases sobre como um recrutador vê esse perfil.",
  "categories": [
    {
      "id": "ats",
      "title": "Compatibilidade ATS",
      "score": 90,
      "explanation": "Breve explicação do porquê desta nota.",
      "recommendations": ["Ação prática 1", "Ação prática 2"]
    },
    // Incluir TODOS os IDs exatos: 'ats', 'seo', 'personal_brand', 'experience', 'skills', 'projects', 'certifications', 'general_quality'
  ],
  "keywords": {
    "missing": ["Palavra1", "Palavra2"],
    "suggested": ["Sugestão1", "Sugestão2"],
    "matchWithTarget": "Análise de como o perfil bate com a vaga alvo."
  },
  "generatedContent": {
    "headline": "Sua nova sugestão de título profissional",
    "about": "Um novo texto 'Sobre' otimizado, persuasivo e profissional (use quebras de linha \\n)",
    "experienceImprovements": [
      {
        "companyOrRole": "Nome da Empresa ou Cargo",
        "suggestion": "Como reescrever os bullet points dessa experiência focando em métricas e impacto."
      }
    ]
  },
  "actionPlan": [
    {
      "id": "action_1",
      "priority": "high",
      "action": "O que fazer exatamente",
      "impact": "O que isso vai melhorar (ex: +15% de alcance)"
    }
  ],
  "metrics": {
    "charCount": 0,
    "wordCount": 0,
    "hasNumbers": false,
    "hasLinks": false
  }
}

REGRAS CRÍTICAS:
1. Retorne APENAS o JSON, sem blocos \`\`\`json ou texto adicional.
2. Seja rigoroso nas notas (0 a 100). Perfis medianos devem ter notas entre 50-70.
3. Se algo estiver ausente (ex: certificações), dê nota 0 e recomende a inclusão.
4. As categorias ("categories") DEVEM ter exatamente os seguintes IDs: 'ats', 'seo', 'personal_brand', 'experience', 'skills', 'projects', 'certifications', 'general_quality'.
5. NUNCA use quebras de linha reais (raw newlines) dentro dos valores das strings. Se precisar quebrar linha, use literalmente os caracteres \\n. JSONs com quebras de linha literais vão quebrar a aplicação.`;

  // Limitamos a 12.000 chars para garantir que o output caiba no limite de tokens
  const textForAI = profileText.substring(0, 12000);

  const userPrompt = `Área atual/foco: ${area || 'Não informado'}
Vaga/Objetivo Alvo: ${targetJob || 'Não informado'}

TEXTO DO PERFIL DO LINKEDIN (Conteúdo bruto colado pelo usuário):
${textForAI}`;

  let result: AuditResult;
  try {
    // Tenta primeiro com o modelo mais leve
    let aiResponse = await runAI({
      model: 'google/gemini-2.5-flash-lite',
      systemInstruction,
      userText: userPrompt,
      responseJson: true,
      temperature: 0.2,
      maxOutputTokens: 16000,
    });

    let parsedResult = safeParseJSON<AuditResult>(aiResponse.text);

    // Se falhou o parse, tenta novamente com um modelo incrivelmente estável para JSON (gpt-4o-mini)
    if (!parsedResult || typeof parsedResult.overallScore !== 'number') {
      console.warn('[LinkedIn Audit] JSON inválido do flash-lite, tentando com gpt-4o-mini...');
      console.warn('[LinkedIn Audit] Resposta bruta (primeiros 500 chars):', aiResponse.text?.substring(0, 500));

      aiResponse = await runAI({
        model: 'openai/gpt-4o-mini',
        systemInstruction,
        userText: userPrompt,
        responseJson: true,
        temperature: 0.1,
        maxOutputTokens: 16000,
      });

      parsedResult = safeParseJSON<AuditResult>(aiResponse.text);

      if (!parsedResult || typeof parsedResult.overallScore !== 'number') {
        console.error('[LinkedIn Audit] Falha no parse mesmo com gpt-4o-mini. Resposta bruta:', aiResponse.text?.substring(0, 500));
        throw new Error('JSON inválido retornado pela IA após retry');
      }
    }

    result = parsedResult;
    
    if (!result.metrics || result.metrics.charCount === 0) {
      result.metrics = {
        charCount: profileText.length,
        wordCount: profileText.split(/\s+/).length,
        hasNumbers: /\d/.test(profileText),
        hasLinks: /http|www/.test(profileText),
      };
    }
  } catch (err) {
    console.error('Falha na IA do LinkedIn:', err);
    return NextResponse.json({ error: 'Falha ao analisar o perfil com IA. Tente novamente em instantes.' }, { status: 500 });
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
    usage = await consumeAIUsage(user.id, user.plan, 'audit');
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
