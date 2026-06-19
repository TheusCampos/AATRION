import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { analyzeResumeSchema } from '@/lib/validations/ai-resume';
import { runAI, safeParseJSON, AIError } from '@/lib/ai';
import { resumeContentSchema, type ResumeContent } from '@/lib/validations/resume';
import { calculateCompleteness } from '@/lib/completeness';
import { checkAIQuota, consumeAIUsage } from '@/lib/plan';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

type AIAnalysis = {
  overallScore: number; // 0-100
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: Array<{ area: string; before?: string; after: string; reason: string }>;
  examples: Array<{ area: string; from: string; to: string; rationale: string }>;
  keywordGaps: string[];
  atsTips: string[];
};

function buildResumeText(content: ResumeContent): string {
  const p = content.personal;
  const lines: string[] = [];
  if (p.name) lines.push(`NOME: ${p.name}`);
  if (p.jobTitle) lines.push(`CARGO ALVO: ${p.jobTitle}`);
  // SEC-014: PII mascarado — email e telefone não são necessários para análise
  if (p.location) lines.push(`LOCALIZACAO: ${p.location}`);
  if (p.summary) lines.push(`\nRESUMO:\n${p.summary}`);

  if (content.experience.length) {
    lines.push('\nEXPERIENCIA PROFISSIONAL:');
    content.experience.forEach((e, i) => {
      lines.push(
        `${i + 1}. ${e.role || 'Cargo'} @ ${e.company || 'Empresa'} (${e.start || 'inicio'} - ${
          e.current ? 'atual' : e.end || 'fim'
        })`
      );
      if (e.description) lines.push(`   Descricao: ${e.description}`);
    });
  }
  if (content.education.length) {
    lines.push('\nFORMACAO:');
    content.education.forEach((e) => {
      lines.push(`- ${e.course} @ ${e.institution} (${e.start} - ${e.end})`);
    });
  }
  if (content.skills.length) {
    lines.push(`\nHABILIDADES: ${content.skills.map((s) => s.name).filter(Boolean).join(', ')}`);
  }
  if (content.projects.length) {
    lines.push('\nPROJETOS:');
    content.projects.forEach((p) => {
      lines.push(`- ${p.name}: ${p.description} [${p.tech.join(', ')}]`);
    });
  }
  if (content.languages.length) {
    lines.push(`\nIDIOMAS: ${content.languages.map((l) => `${l.language} (${l.level})`).join(', ')}`);
  }
  if (content.certifications.length) {
    lines.push('\nCERTIFICACOES:');
    content.certifications.forEach((c) => {
      lines.push(`- ${c.name} (${c.issuer} - ${c.date})`);
    });
  }
  return lines.join('\n');
}

function heuristicFallback(content: ResumeContent, targetJob?: string): AIAnalysis {
  const completeness = calculateCompleteness(content);
  const text = buildResumeText(content);
  const hasNumbers = /\d+(%|x|\+)/i.test(text);
  const hasBullets = /(^|\n)\s*[-•*]/.test(text);

  const improvements: string[] = [];
  if (!hasNumbers) improvements.push('Adicione metricas quantificadas (%, R$, tempo, volume).');
  if (!content.personal.summary) improvements.push('Escreva um resumo profissional de 3-5 linhas.');
  if (content.experience.length < 2) improvements.push('Adicione mais experiencias relevantes.');
  if (content.skills.length < 8) improvements.push('Liste ao menos 8-12 habilidades tecnicas relevantes.');

  const overallScore = Math.min(100, Math.round(completeness * 0.7 + (hasNumbers ? 15 : 0) + (hasBullets ? 10 : 0)));

  return {
    overallScore,
    summary:
      overallScore >= 75
        ? 'Curriculo bem estruturado. Pequenos ajustes podem elevar bastante a pontuacao.'
        : overallScore >= 50
          ? 'Curriculo razoavel. Recomendamos focar nas melhorias listadas abaixo.'
          : 'Curriculo precisa de revisao profunda. Aplique as correcoes sugeridas.',
    strengths: [
      completeness > 60 ? 'Boa completude das secoes.' : 'Curriculo editavel e estruturado.',
      content.experience.length > 0 ? 'Possui experiencia profissional listada.' : 'Pronto para adicionar experiencia.',
    ],
    improvements: improvements.length ? improvements : ['Revise ortografia e use verbos de acao fortes.'],
    corrections: [],
    examples: [],
    keywordGaps: targetJob
      ? [`Pesquise as palavras-chave exatas usadas na vaga de "${targetJob}".`]
      : ['Inclua palavras-chave da area nos topicos das experiencias.'],
    atsTips: [
      'Use titulos de secao padrao (Experiencia, Formacao, Habilidades).',
      'Evite tabelas, colunas complexas e imagens na descricao.',
      'Salve o PDF em texto selecionavel (nao escaneado).',
    ],
  };
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // SEC-006: Rate limiting por usuário
  const rl = await checkRateLimit(`ai:${user.id}`, RATE_LIMITS.ai);
  if (!rl.allowed) return rl.response;

  // Quota mensal de IA
  const quota = await checkAIQuota(user.id, user.plan, 'analyze');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Limite mensal de análises com IA atingido (${quota.used}/${quota.limit}). Faça upgrade de plano para mais.`,
        quota,
      },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  // Leitura opcional do body
  let targetJob: string | undefined;
  try {
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      const parsed = analyzeResumeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: parsed.error.flatten() },
          { status: 400 }
        );
      }
      targetJob = parsed.data.targetJob;
    }
  } catch {
    // sem body -> ok
  }

  const resume = await prisma.resume.findUnique({
    where: { id },
    select: { id: true, userId: true, content: true, atsScore: true },
  });
  if (!resume || resume.userId !== user.id) {
    return NextResponse.json({ error: 'Currículo não encontrado' }, { status: 404 });
  }

  let content: ResumeContent;
  try {
    const raw = JSON.parse(resume.content || '{}');
    content = resumeContentSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Conteudo do curriculo invalido' }, { status: 500 });
  }

  const text = buildResumeText(content);

  const systemInstruction = `Voce e um recrutador senior, consultor de carreira e especialista em curriculos profissionais para QUALQUER area (tecnologia, negocios, marketing, direito, saude, financas, educacao, design, vendas, operacoes, logistica, recursos humanos, etc.).

Sua analise deve ser 100% generica e adaptavel ao cargo/area do candidato. NUNCA presuma que o candidato trabalha com tecnologia, programacao, software, TI ou qualquer campo especifico a menos que o proprio curriculo deixe isso claro.

Criterios de avaliacao (use TODOS, com pesos iguais):
1) Clareza e redacao: frases objetivas, verbos de acao fortes, sem ambiguidades.
2) Impacto e resultados: uso de metricas quantificadas (%, R$, tempo, volume, clientes atendidos, alunos, pacientes, etc. - adapte ao contexto).
3) ATS (Applicant Tracking Systems): titulos de secao padrao, palavras-chave da area, formato limpo.
4) Completude das secoes: dados pessoais, resumo, experiencia, formacao, habilidades relevantes para a area.
5) Coerencia de cargo alvo: o curriculo esta alinhado com o cargo que a pessoa busca?
6) Diferenciais: certificacoes, idiomas, projetos, publicacoes, premios - tudo que agrega para a area.

Tarefa: Analise o curriculo e retorne um diagnostico em JSON com esta estrutura EXATA:
{
  "overallScore": numero inteiro de 0 a 100,
  "summary": resumo do curriculo em ate 2 frases,
  "strengths": array com 3 a 5 pontos fortes especificos do candidato,
  "improvements": array com 3 a 6 melhorias priorizadas e acionaveis,
  "corrections": array (max 5) com objetos { "area": string, "before": string, "after": string, "reason": string } - exemplos de reescrita antes/depois,
  "examples": array (max 3) com objetos { "area": string, "from": string, "to": string, "rationale": string } - ajustes de exemplo,
  "keywordGaps": array com 3 a 6 palavras-chave relevantes que faltam (adequadas a area do candidato),
  "atsTips": array com 3 a 4 dicas praticas para passar em sistemas ATS
}

Regras RIGIDAS:
- Responda APENAS com o JSON valido. Sem markdown, sem texto antes ou depois.
- Todas as sugestoes devem ser uteis para a area real do candidato inferida do proprio curriculo.
- NUNCA mencione termos como "desenvolvedor", "codigo", "programacao", "stack", "software" a menos que isso esteja no curriculo.
- Seja especifico: em vez de "melhore a descricao", diga exatamente o que reescrever.`;

  const userPrompt = `Analise o seguinte curriculo${targetJob ? ` para a vaga alvo: "${targetJob}"` : ''}:\n\n${text}`;

  let result: AIAnalysis | null = null;
  let provider: 'gemini' | 'openrouter' | 'heuristic' = 'heuristic';
  let model = 'heuristic-v1';

  try {
    const aiResp = await runAI({
      model: 'google/gemini-2.5-flash-lite',
      systemInstruction,
      userText: userPrompt,
      responseJson: true,
      temperature: 0.4,
      maxOutputTokens: 2048,
    });
    const parsed = safeParseJSON<AIAnalysis>(aiResp.text);
    if (parsed && typeof parsed.overallScore === 'number') {
      result = parsed;
      provider = aiResp.provider;
      model = aiResp.model;
    }
  } catch (err) {
    if (err instanceof AIError) {
      // cai no fallback
    } else {
      console.error('[/analyze] erro inesperado:', err);
    }
  }

  if (!result) {
    result = heuristicFallback(content, targetJob);
  }

  // Persiste atsScore no curriculo (sobrescreve se melhor) e contabiliza a IA
  const newAts = Math.round(result.overallScore);
  try {
    await prisma.resume.update({
      where: { id: resume.id },
      data: { atsScore: newAts },
    });
  } catch (err) {
    console.error('[/analyze] erro ao salvar atsScore:', err);
  }

  let usage;
  try {
    usage = await consumeAIUsage(user.id, 'analyze');
  } catch (err) {
    console.error('[/analyze] erro ao contabilizar uso de IA:', err);
  }

  return NextResponse.json({
    result,
    provider,
    model,
    usage: usage
      ? {
          analyzeUsed: usage.aiAnalyzeUsed,
          adaptUsed: usage.aiAdaptUsed,
          auditUsed: usage.aiAuditUsed,
          period: usage.aiUsagePeriod,
        }
      : undefined,
  });
}
