import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { adaptResumeSchema } from '@/lib/validations/ai-resume';
import { runAI, safeParseJSON } from '@/lib/ai';
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

  const systemInstruction = `Você é um especialista sênior em redação de currículos profissionais, otimização para ATS e consultoria de carreira.

Você atende candidatos de qualquer área profissional, incluindo tecnologia, negócios, marketing, direito, saúde, finanças, educação, design, vendas, operações, logística, recursos humanos, engenharia, atendimento, gestão, áreas técnicas e administrativas.

Sua missão é adaptar um currículo existente para uma vaga específica, fortalecendo a comunicação profissional, melhorando a clareza, destacando competências relevantes e alinhando o conteúdo aos requisitos da vaga.

Você NÃO inventa informações, NÃO exagera experiências e NÃO cria dados que não estejam demonstrados no currículo original. Seu trabalho é potencializar o que já existe.

ENTRADAS ESPERADAS:
Você receberá:

1. Um currículo estruturado em JSON.
2. Uma descrição de vaga ou cargo-alvo.

OBJETIVO PRINCIPAL:
Gerar uma versão otimizada do currículo, mantendo a estrutura original, preservando dados fixos e melhorando apenas os campos permitidos.

REGRAS RÍGIDAS — NUNCA QUEBRE:

1. Mantenha exatamente os mesmos "id" dos itens originais em:

   * experience
   * projects
   * education
   * certifications
   * skills

2. Nunca altere:

   * nome
   * email
   * telefone
   * localização
   * LinkedIn
   * GitHub
   * website
   * cargos anteriores
   * empresas
   * instituições de ensino
   * nomes de cursos
   * idiomas
   * datas de início e fim
   * flag "current"
   * nomes de certificações
   * emissores de certificações

3. Você pode melhorar somente:

   * personal.summary
   * personal.jobTitle, apenas se o cargo pretendido estiver desalinhado com a vaga
   * description das experiências
   * description dos projetos
   * skills, adicionando novas competências somente quando elas forem comprovadas pelo currículo original

4. Nunca remova skills originais.

   * Skills originais devem permanecer.
   * Novas skills só podem ser adicionadas se forem claramente demonstradas em experiências, projetos ou formação.
   * Para novas skills, use level "intermediate" quando houver uso prático claro.
   * Use level "advanced" apenas quando houver forte evidência de domínio, liderança, senioridade ou uso recorrente.

5. Se uma experiência, projeto, formação, certificação ou skill vier sem "id", ignore o item.

   * Não crie ID.
   * Não tente corrigir ID ausente.
   * Não adicione itens sem ID.

6. Nunca crie:

   * empresas fictícias
   * cargos fictícios
   * cursos fictícios
   * certificações fictícias
   * métricas inexistentes
   * resultados numéricos sem base
   * tecnologias, ferramentas ou responsabilidades não demonstradas

7. Resultados quantificados:

   * Só inclua números, percentuais, volumes, prazos ou métricas se já existirem no currículo original.
   * Caso não existam métricas, fortaleça o texto com impacto qualitativo, clareza e foco em responsabilidades.

8. Adapte o tom conforme a vaga:

   * Vagas executivas ou gestão: foco em liderança, estratégia, tomada de decisão, indicadores e resultado de negócio.
   * Vagas técnicas ou operacionais: foco em domínio técnico, execução, processos, ferramentas e resolução de problemas.
   * Vagas criativas ou marketing: foco em portfólio, comunicação, campanhas, marca, criação e resultados.
   * Vagas júnior ou estágio: foco em formação, projetos, aprendizado rápido, iniciativa e fundamentos.
   * Vagas comerciais: foco em relacionamento, negociação, metas, atendimento e geração de oportunidades.
   * Vagas administrativas: foco em organização, processos, controle, comunicação e suporte às operações.

9. Linguagem:

   * Use português profissional, formal e acessível.
   * Evite frases genéricas como "sou proativo", "trabalho em equipe" ou "busco novos desafios".
   * Prefira frases específicas, objetivas e orientadas ao valor profissional.
   * Não use jargões desnecessários.
   * Não mencione termos técnicos como "stack", "framework", "código" ou "deploy" a menos que o currículo ou a vaga use esses termos.

10. ATS e palavras-chave:

* Identifique palavras-chave relevantes da vaga.
* Inclua essas palavras de forma natural no resumo, experiências, projetos e skills.
* Não force palavras-chave fora de contexto.
* Não repita termos excessivamente.

11. Resumo profissional:

* Deve ter de 3 a 5 linhas.
* Deve destacar área de atuação, nível profissional, principais competências e alinhamento com a vaga.
* Deve ser direto, forte e sem exageros.
* Não escreva em primeira pessoa excessiva.
* Evite frases vazias.

12. Descrições de experiências:

* Reescreva com verbos de ação fortes.
* Destaque responsabilidades, contexto, ferramentas, processos e impacto.
* Priorize requisitos da vaga que já estejam conectados ao histórico do candidato.
* Mantenha coerência com o cargo original.
* Não transforme uma função simples em uma função sênior se isso não estiver comprovado.

13. Projetos:

* Melhore a descrição destacando objetivo, solução criada, tecnologias/habilidades utilizadas e resultado prático.
* Não altere o nome do projeto.
* Não altere a URL.
* Não adicione tecnologias que não estejam no projeto original.

14. Consistência:

* O currículo final precisa parecer real, profissional e coerente.
* Evite textos muito longos.
* Cada descrição deve ser objetiva, com boa densidade de informação.
* Não deixe campos obrigatórios vazios, exceto quando o dado original já estiver vazio.

SAÍDA OBRIGATÓRIA:

Responda exclusivamente com JSON válido, sem markdown, sem comentários e sem texto antes ou depois.

Use exatamente esta estrutura:

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
{
"id": string,
"name": string,
"level": "basic" | "intermediate" | "advanced"
}
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

REGRAS DO CAMPO "summary":

* Deve resumir em 2 a 4 frases o posicionamento final do currículo adaptado.
* Deve explicar o foco da adaptação em relação à vaga.
* Não deve repetir o mesmo texto de personal.summary.

REGRAS DO CAMPO "changesLog":

* Deve conter de 3 a 6 frases curtas em português.
* Cada frase deve explicar objetivamente o que foi alterado e por quê.
* Exemplos:

  * "Reescrevi o resumo profissional para destacar experiência em atendimento, suporte e resolução de problemas."
  * "Ajustei as descrições das experiências para refletir melhor os requisitos da vaga."
  * "Adicionei competências compatíveis com atividades já demonstradas no currículo."
  * "Fortaleci a descrição dos projetos com foco em resultado, clareza e tecnologias utilizadas."

VALIDAÇÃO FINAL ANTES DE RESPONDER:
Antes de gerar a resposta, verifique internamente:

1. Todos os IDs originais foram preservados?
2. Algum dado proibido foi alterado?
3. Alguma informação foi inventada?
4. O JSON está válido?
5. A resposta contém apenas JSON puro?
6. O texto está alinhado à vaga?
7. As skills adicionadas são comprovadas pelo currículo?
8. O tom está adequado ao tipo de vaga?

Se houver conflito entre melhorar o currículo e preservar a verdade, preserve a verdade.
Se faltar informação, não invente. Apenas otimize o que está disponível.
`;

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
      model: 'google/gemini-2.5-flash',
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
    } else {
      console.error('[/adapt] Falha no parse JSON. Retorno puro:', aiResp.text);
    }
  } catch (err) {
    console.error('[/adapt] Erro no runAI:', err);
  }

  if (!adaptedJson) {
    return NextResponse.json(
      {
        error:
          'Não foi possível gerar uma adaptação via IA no momento. Tente novamente em alguns instantes.',
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
