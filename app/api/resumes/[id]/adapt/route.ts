import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { adaptResumeSchema } from '@/lib/validations/ai-resume';
import { runAI, safeParseJSON, AIError } from '@/lib/ai';
import { resumeContentSchema, type ResumeContent } from '@/lib/validations/resume';
import { checkAIQuota, consumeAIUsage } from '@/lib/plan';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

type AIAdapted = {
  personal: Partial<ResumeContent['personal']>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    start: string;
    end: string;
    current: boolean;
    description: string;
  }>;
  skills: Array<{ id: string; name: string; level: 'basic' | 'intermediate' | 'advanced' }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    tech: string[];
    url: string;
  }>;
  summary: string;
  changesLog: string[];
};

function buildResumeText(content: ResumeContent): string {
  const p = content.personal;
  const lines: string[] = [];
  if (p.name) lines.push(`NOME: ${p.name}`);
  if (p.jobTitle) lines.push(`CARGO ATUAL: ${p.jobTitle}`);
  if (p.location) lines.push(`LOCALIZACAO: ${p.location}`);
  if (p.summary) lines.push(`RESUMO ATUAL:\n${p.summary}`);
  if (content.experience.length) {
    lines.push('\nEXPERIENCIA:');
    content.experience.forEach((e, i) => {
      lines.push(
        `${i + 1}) id=${e.id} | ${e.role} @ ${e.company} (${e.start} - ${e.current ? 'atual' : e.end})`
      );
      lines.push(`   descricao: ${e.description}`);
    });
  }
  if (content.skills.length) {
    lines.push(`\nHABILIDADES: ${content.skills.map((s) => `${s.name}(${s.level})`).join(', ')}`);
  }
  if (content.projects.length) {
    lines.push('\nPROJETOS:');
    content.projects.forEach((p2) => {
      lines.push(`- id=${p2.id} | ${p2.name}: ${p2.description} [${p2.tech.join(', ')}]`);
    });
  }
  if (content.education.length) {
    lines.push('\nFORMACAO:');
    content.education.forEach((e) => {
      lines.push(`- id=${e.id} | ${e.course} @ ${e.institution} (${e.start} - ${e.end})`);
    });
  }
  if (content.languages.length) {
    lines.push(`\nIDIOMAS: ${content.languages.map((l) => `${l.language}(${l.level})`).join(', ')}`);
  }
  if (content.certifications.length) {
    lines.push('\nCERTIFICACOES:');
    content.certifications.forEach((c) => {
      lines.push(`- id=${c.id} | ${c.name} - ${c.issuer} (${c.date})`);
    });
  }
  return lines.join('\n');
}

/**
 * Mescla o JSON retornado pela IA com o curriculo original, preservando
 * todos os campos que o usuario preencheu (ids, datas, cargos, empresas)
 * e substituindo apenas descricoes, resumo e skills quando vierem da IA.
 */
function mergeAdapted(original: ResumeContent, ai: AIAdapted): ResumeContent {
  // Mapear experiencia por id
  const expMap = new Map(ai.experience.map((e) => [e.id, e]));
  const adaptedExperience = original.experience.map((e) => {
    const a = expMap.get(e.id);
    if (!a) return e;
    return {
      ...e,
      role: a.role || e.role,
      company: a.company || e.company,
      start: a.start || e.start,
      end: a.end || e.end,
      current: typeof a.current === 'boolean' ? a.current : e.current,
      description: a.description || e.description,
    };
  });

  // Skills: adiciona novas que vieram e mantem originais
  const existingSkillNames = new Set(
    original.skills.map((s) => s.name.trim().toLowerCase()).filter(Boolean)
  );
  const newSkills = (ai.skills || []).filter(
    (s) => s.name && !existingSkillNames.has(s.name.trim().toLowerCase())
  );
  const mergedSkills = [
    ...original.skills,
    ...newSkills.map((s) => ({ id: `sk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: s.name, level: s.level })),
  ];

  // Projects: mapear por id
  const projMap = new Map((ai.projects || []).map((p) => [p.id, p]));
  const adaptedProjects = original.projects.map((p) => {
    const a = projMap.get(p.id);
    if (!a) return p;
    return {
      ...p,
      name: a.name || p.name,
      description: a.description || p.description,
      tech: a.tech && a.tech.length ? a.tech : p.tech,
      url: a.url || p.url,
    };
  });

  return {
    ...original,
    personal: {
      ...original.personal,
      // permite trocar cargo alvo e resumo, mantem nome/contatos intactos
      jobTitle: ai.personal?.jobTitle || original.personal.jobTitle,
      summary: ai.personal?.summary || ai.summary || original.personal.summary,
    },
    experience: adaptedExperience,
    skills: mergedSkills,
    projects: adaptedProjects,
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

  // Quota mensal de IA (adaptacao custa mais caro que analise)
  const quota = await checkAIQuota(user.id, user.plan, 'adapt');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: `Limite mensal de adaptações com IA atingido (${quota.used}/${quota.limit}). Faça upgrade de plano.`,
        quota,
      },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  const parsed = adaptResumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados invalidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { jobDescription, jobTitle, company } = parsed.data;

  const resume = await prisma.resume.findUnique({
    where: { id },
    select: { id: true, userId: true, content: true },
  });
  if (!resume || resume.userId !== user.id) {
    return NextResponse.json({ error: 'Curriculo nao encontrado' }, { status: 404 });
  }

  let original: ResumeContent;
  try {
    const raw = JSON.parse(resume.content || '{}');
    original = resumeContentSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Conteudo do curriculo invalido' }, { status: 500 });
  }

  const resumeText = buildResumeText(original);

  const systemInstruction = `Voce e um especialista senior em redacao de curriculos profissionais e consultor de carreira. Atende candidatos de QUALQUER area: tecnologia, negocios, marketing, direito, saude, financas, educacao, design, vendas, operacoes, logistica, recursos humanos, engenharia, etc.

Sua missao e adaptar um curriculo existente a uma vaga especifica, deixando o texto mais forte, claro e alinhado aos requisitos. Voce NAO inventa nem exagera - voce potencializa o que ja existe.

REGRAS RIGIDAS (NUNCA QUEBRE):
1) MANTENHA EXATAMENTE os mesmos "id" dos itens originais (experience, projects, education, certifications, skills).
2) NAO altere em hipotese nenhuma:
   - nome, email, telefone, localizacao, linkedin, github, website
   - cargos, empresas, instituicoes de ensino, cursos, idiomas
   - datas de inicio/fim, flag "current" de trabalhos atuais
   - nomes de certificacoes e emissores
3) VOCE PODE reescrever/melhorar:
   - personal.summary (resumo profissional): 3-5 linhas fortes, alinhadas a vaga
   - personal.jobTitle (cargo pretendido): apenas se o cargo do candidato nao bater com a vaga
   - descricoes (description) das experiencias: use verbos de acao fortes, adicione resultados quantificados quando fizer sentido (apenas se houver indicacao no curriculo original), espelhe palavras-chave da vaga
   - descricoes de projetos: destaque resultados, tecnologias/habilidades utilizadas, contexto
   - skills: pode ADICIONAR novas skills relevantes que o candidato ja demonstra nas experiencias/projetos, mas NAO remova as originais. Use level "intermediate" ou "advanced".
4) Se uma experiencia/projeto vier sem id, IGNORE - nao invente.
5) Use linguagem profissional, formal mas acessivel, sem jargoes desnecessarios.
6) Adapte a linguagem ao tipo de vaga:
   - Vagas executivas/gestao: tom mais formal, foco em lideranca, estrategia, resultados de negocio
   - Vagas tecnicas/operacionais: tom tecnico adequado a area, foco em habilidades especificas
   - Vagas criativas/marketing: tom mais dinamico, foco em portfolio, campanhas, resultados
   - Vagas junior/estagio: tom mais objetivo, foco em formacao, vontade de aprender, projetos academicos
   - Etc. - adapte conforme a vaga descrita.

Saida OBRIGATORIA em JSON puro com esta estrutura EXATA:
{
  "personal": {
    "jobTitle": string,
    "summary": string
  },
  "experience": [
    {
      "id": string,
      "company": string,
      "role": string,
      "start": string,
      "end": string,
      "current": boolean,
      "description": string
    }
  ],
  "skills": [
    { "name": string, "level": "basic" | "intermediate" | "advanced" }
  ],
  "projects": [
    {
      "id": string,
      "name": string,
      "description": string,
      "tech": [string],
      "url": string
    }
  ],
  "summary": string,
  "changesLog": [string]
}

O campo "changesLog" deve ter 3-6 frases curtas em portugues explicando O QUE foi alterado e POR QUE (ex: "Reescrevi o resumo destacando os 8 anos de experiencia em gestao comercial, alinhando com o cargo alvo.").

Regras finais:
- Responda APENAS com o JSON valido. Sem markdown, sem texto antes ou depois.
- NUNCA mencione termos tecnologicos ("stack", "codigo", "framework") a menos que a vaga ou o curriculo usem esses termos.
- Cada descricao reescrita deve ser mais forte, especifica e alinhada a vaga, mas sem inventar fatos.`;

  const userPrompt = `CURRICULO ATUAL DO CANDIDATO:
${resumeText}

VAGA ALVO${jobTitle ? `: ${jobTitle}` : ''}${company ? ` @ ${company}` : ''}

DESCRICAO DA VAGA:
${jobDescription}

Adapte o curriculo acima para esta vaga. Mantenha o que existe, ajuste linguagem, adicione keywords relevantes e melhore as descricoes com foco em resultados e alinhamento a vaga. Retorne APENAS o JSON.`;

  let adaptedJson: AIAdapted | null = null;
  let provider: 'gemini' | 'openrouter' | 'heuristic' = 'heuristic';
  let model = 'heuristic-v1';

  try {
    const aiResp = await runAI({
      model: 'google/gemini-2.5-flash-lite',
      systemInstruction,
      userText: userPrompt,
      responseJson: true,
      temperature: 0.5,
      maxOutputTokens: 3000,
    });
    const parsedJson = safeParseJSON<AIAdapted>(aiResp.text);
    if (parsedJson) {
      adaptedJson = parsedJson;
      provider = aiResp.provider;
      model = aiResp.model;
    }
  } catch (err) {
    if (!(err instanceof AIError)) {
      console.error('[/adapt] erro inesperado:', err);
    }
  }

  if (!adaptedJson) {
    return NextResponse.json(
      {
        error:
          'Não foi possível gerar uma adaptação via IA no momento. Verifique as chaves GEMINI_API_KEY / OPENROUTER_API_KEY no .env e tente novamente.',
      },
      { status: 502 }
    );
  }

  const merged = mergeAdapted(original, adaptedJson);

  // Consome a cota de IA so apos adaptacao bem-sucedida
  let usage;
  try {
    usage = await consumeAIUsage(user.id, 'adapt');
  } catch (err) {
    console.error('[/adapt] erro ao contabilizar uso de IA:', err);
  }

  return NextResponse.json({
    content: merged,
    changesLog: adaptedJson.changesLog || [],
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
