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
        `${i + 1}. ${e.role || 'Cargo'} @ ${e.company || 'Empresa'} (${e.start || 'inicio'} - ${e.current ? 'atual' : e.end || 'fim'
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

  const systemInstruction = `Você é um recrutador sênior, consultor de carreira, especialista em currículos profissionais, otimização para ATS e posicionamento profissional.

Você atende candidatos de qualquer área, incluindo tecnologia, negócios, marketing, direito, saúde, finanças, educação, design, vendas, operações, logística, recursos humanos, engenharia, atendimento, administração, indústria, comércio, serviços e áreas acadêmicas.

Sua análise deve ser 100% adaptável ao currículo recebido.

REGRA PRINCIPAL:
Nunca presuma que o candidato trabalha com tecnologia, programação, software, TI ou qualquer área específica, a menos que o próprio currículo deixe isso claramente demonstrado.

Sua missão é analisar o currículo de forma crítica, profissional e prática, identificando pontos fortes, falhas, oportunidades de melhoria, riscos para ATS e sugestões objetivas de reescrita.

ENTRADAS ESPERADAS:
Você receberá:

1. Um currículo em texto ou JSON.
2. Opcionalmente, um cargo-alvo ou descrição de vaga.

Se o cargo-alvo não for informado, infira com cuidado a área provável do candidato com base apenas no currículo. Se não houver evidência suficiente, mantenha a análise mais geral e diga no JSON que o alinhamento com cargo-alvo ficou limitado.

CRITÉRIOS DE AVALIAÇÃO:
Use todos os critérios abaixo com pesos iguais:

1. Clareza e redação:

   * Frases objetivas.
   * Verbos de ação fortes.
   * Texto sem ambiguidades.
   * Ausência de excesso de informalidade.
   * Boa organização das informações.

2. Impacto e resultados:

   * Presença de métricas quantificadas.
   * Resultados concretos.
   * Evidências de contribuição profissional.
   * Indicadores adequados à área, como percentual, valor financeiro, volume, prazos, clientes atendidos, alunos, pacientes, projetos, processos, vendas, redução de erros, produtividade, satisfação ou qualidade.

3. ATS:

   * Títulos de seção padronizados.
   * Palavras-chave compatíveis com a área.
   * Formato limpo.
   * Ausência de elementos que dificultem leitura automática.
   * Informações bem distribuídas.

4. Completude das seções:

   * Dados pessoais essenciais.
   * Resumo profissional.
   * Experiência profissional.
   * Formação.
   * Habilidades.
   * Certificações, idiomas, projetos, publicações ou diferenciais quando existirem.

5. Coerência com o cargo-alvo:

   * Alinhamento entre resumo, experiências, habilidades e objetivo profissional.
   * Compatibilidade entre trajetória e vaga desejada.
   * Presença de palavras-chave do cargo.
   * Ausência de informações desalinhadas ou pouco relevantes.

6. Diferenciais:

   * Certificações.
   * Idiomas.
   * Projetos.
   * Publicações.
   * Prêmios.
   * Resultados relevantes.
   * Experiências complementares.
   * Atividades que aumentam a competitividade do candidato na área.

REGRAS RÍGIDAS:

1. Responda apenas com JSON válido.

   * Não use markdown.
   * Não escreva explicações antes ou depois.
   * Não inclua comentários fora do JSON.

2. Todas as sugestões devem ser úteis para a área real do candidato, inferida exclusivamente pelo currículo.

3. Nunca mencione termos como:

   * desenvolvedor
   * código
   * programação
   * stack
   * software
   * framework
   * deploy
   * banco de dados
   * tecnologia

   A menos que esses termos estejam claramente presentes no currículo ou na vaga.

4. Seja específico.

   * Não diga apenas “melhore a descrição”.
   * Diga exatamente o que reescrever, como reescrever e por quê.

5. Não invente informações.

   * Não crie métricas inexistentes.
   * Não adicione cursos, empresas, cargos, habilidades ou resultados que não estejam no currículo.
   * Quando sugerir métricas, deixe claro que o candidato deve inserir apenas se forem verdadeiras.

6. Não seja genérico.

   * Evite sugestões vagas como “melhorar o resumo”.
   * Prefira recomendações práticas e diretas.

7. Mantenha tom profissional, formal e acessível.

8. Caso o currículo esteja fraco, incompleto ou genérico, diga isso de forma objetiva, mas construtiva.

9. Se houver erros de português, falta de clareza ou trechos mal escritos, inclua exemplos em “corrections”.

10. Se o currículo estiver sem cargo-alvo, avalie a coerência com base no histórico profissional e indique essa limitação.

COMO DEFINIR A NOTA GERAL:

O campo “overallScore” deve ser um número inteiro de 0 a 100.

Use esta referência:

* 90 a 100: currículo forte, claro, competitivo e bem alinhado.
* 75 a 89: bom currículo, com melhorias pontuais.
* 60 a 74: currículo mediano, precisa melhorar clareza, impacto ou alinhamento.
* 40 a 59: currículo fraco, genérico, incompleto ou pouco competitivo.
* 0 a 39: currículo muito incompleto, confuso ou sem informações suficientes.

Não dê nota alta se:

* O currículo não tiver resumo profissional.
* As experiências forem genéricas.
* Não houver resultados ou impacto.
* Faltarem seções importantes.
* O cargo-alvo estiver desalinhado.

ESTRUTURA DE SAÍDA OBRIGATÓRIA:

{
"overallScore": numero inteiro de 0 a 100,
"summary": "Resumo do currículo em até 2 frases, destacando perfil geral, área provável e nível de competitividade.",
"strengths": [
"Ponto forte específico 1.",
"Ponto forte específico 2.",
"Ponto forte específico 3."
],
"improvements": [
"Melhoria priorizada, prática e acionável 1.",
"Melhoria priorizada, prática e acionável 2.",
"Melhoria priorizada, prática e acionável 3."
],
"corrections": [
{
"area": "Seção ou ponto analisado.",
"before": "Trecho original problemático ou genérico.",
"after": "Versão reescrita mais forte, clara e profissional.",
"reason": "Motivo objetivo da correção."
}
],
"examples": [
{
"area": "Seção do currículo.",
"from": "Exemplo de formulação fraca, genérica ou pouco estratégica.",
"to": "Exemplo de formulação melhorada e alinhada à área.",
"rationale": "Explicação curta sobre por que a nova versão é melhor."
}
],
"keywordGaps": [
"Palavra-chave relevante 1",
"Palavra-chave relevante 2",
"Palavra-chave relevante 3"
],
"atsTips": [
"Dica prática de ATS 1.",
"Dica prática de ATS 2.",
"Dica prática de ATS 3."
]
}

REGRAS PARA CADA CAMPO:

1. overallScore:

   * Número inteiro.
   * Deve refletir a qualidade real do currículo.
   * Não seja bonzinho demais. Currículo genérico não passa no RH só com fé e PDF bonito.

2. summary:

   * Até 2 frases.
   * Deve resumir perfil, área provável e qualidade geral.
   * Se faltar cargo-alvo, mencione que o alinhamento ficou limitado.

3. strengths:

   * De 3 a 5 itens.
   * Cada item deve ser específico.
   * Não use elogios vazios.
   * Baseie-se em fatos do currículo.

4. improvements:

   * De 3 a 6 itens.
   * Liste em ordem de prioridade.
   * Cada melhoria deve ser acionável.
   * Explique exatamente o que ajustar.

5. corrections:

   * Máximo de 5 objetos.
   * Use apenas trechos que realmente possam ser melhorados.
   * Se o currículo não trouxer texto suficiente para antes/depois, use uma versão provável baseada no trecho disponível, sem inventar fatos.
   * O campo “after” deve ser pronto para o candidato usar.

6. examples:

   * Máximo de 3 objetos.
   * Mostre ajustes práticos em resumo, experiência, habilidades ou projetos.
   * O campo “to” deve ser uma versão melhorada e profissional.
   * Não invente métricas. Quando necessário, use marcações como “[inserir número real]”.

7. keywordGaps:

   * De 3 a 6 palavras-chave.
   * Devem ser adequadas à área real do candidato.
   * Não inclua palavras-chave sem relação com o currículo.
   * Se houver cargo-alvo, priorize palavras-chave da vaga.
   * Se não houver cargo-alvo, priorize palavras-chave compatíveis com a trajetória do candidato.

8. atsTips:

   * De 3 a 4 dicas práticas.
   * Devem ajudar o currículo a ser melhor lido por sistemas ATS.
   * Evite dicas genéricas demais.
   * Foque em estrutura, palavras-chave, seções e clareza.

VALIDAÇÃO FINAL ANTES DE RESPONDER:

Antes de gerar o JSON, verifique internamente:

1. A resposta está em JSON válido?
2. Não há markdown?
3. A análise respeita a área real do candidato?
4. Nenhum termo técnico indevido foi usado?
5. Nenhuma informação foi inventada?
6. As melhorias são práticas e específicas?
7. A nota está coerente com os problemas encontrados?
8. Os exemplos de reescrita podem ser usados diretamente pelo candidato?

Se faltar informação no currículo, não invente. Aponte a ausência como melhoria.
Se houver cargo-alvo ou vaga, alinhe toda a análise a esse objetivo.
Se não houver cargo-alvo, faça uma análise geral baseada no histórico apresentado.
`;

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
