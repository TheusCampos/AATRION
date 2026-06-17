/**
 * ATRION — LinkedIn Profile Analyzer (V1: heurístico, sem IA)
 *
 * Recebe o texto colado do perfil do LinkedIn pelo usuário e produz:
 *  - overallScore (0-100)
 *  - sections[]  — nota e observações por seção detectada
 *  - issues[]    — problemas priorizados (high / medium / low)
 *  - suggestions[] — ações práticas sugeridas
 *  - postIdeas[] — 3 ideias de post alinhadas à área/targetJob
 *
 * Substituir por análise com LLM na V2 (ATRION roadmap).
 */

export type AuditSeverity = 'high' | 'medium' | 'low';

export type AuditIssue = {
  id: string;
  severity: AuditSeverity;
  area: string;       // ex: "Headline", "About", "Experience"
  message: string;
};

export type AuditSuggestion = {
  id: string;
  area: string;
  message: string;
};

export type AuditSection = {
  key: string;
  label: string;
  present: boolean;
  score: number;       // 0-100
  notes: string[];
};

export type AuditResult = {
  overallScore: number;
  summary: string;
  sections: AuditSection[];
  issues: AuditIssue[];
  suggestions: AuditSuggestion[];
  postIdeas: string[];
  metrics: {
    charCount: number;
    wordCount: number;
    lineCount: number;
    hasNumbers: boolean;
    hasLinks: boolean;
    hasBullets: boolean;
  };
};

export type AnalyzeInput = {
  profileText: string;
  area?: string;
  targetJob?: string;
};

const HEADLINE_KEYWORDS = [
  'desenvolvedor', 'developer', 'engenheiro', 'engineer', 'designer', 'product',
  'analista', 'analyst', 'gerente', 'manager', 'diretor', 'director',
  'arquiteto', 'architect', 'data', 'full stack', 'frontend', 'backend',
  'mobile', 'devops', 'qa', 'sre', 'tech lead', 'scrum master', 'po',
];

const SOFT_SKILL_KEYWORDS = [
  'comunicação', 'liderança', 'proatividade', 'trabalho em equipe',
  'resolução de problemas', 'organização', 'autonomia', 'colaboração',
  'ownership', 'mentoria', 'comunication', 'leadership', 'teamwork',
];

const TECH_SKILL_PATTERNS: RegExp[] = [
  /\b(react|next\.?js|vue|angular|svelte|node\.?js|typescript|javascript|python|java|kotlin|swift|go|rust|c\+\+|c#|ruby|php|laravel|django|flask|fastapi|spring|\.net|aws|gcp|azure|docker|kubernetes|terraform|graphql|rest|sql|postgresql|mysql|mongodb|redis|kafka|rabbitmq|airflow|spark|hadoop|scikit-learn|pytorch|tensorflow|tableau|power\s?bi|excel|figma|adobe|illustrator|photoshop|after\s?effects|premiere|jira|confluence|git|github|gitlab|ci\/cd|scrum|kanban|agile|seo|sem|google\s?ads|meta\s?ads)\b/gi,
];

// ============== Helpers ==============

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function hasSection(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function detectBullets(text: string): boolean {
  return /(^|\n)\s*([-•·*]|\d+[.)])\s+/m.test(text);
}

function detectNumbers(text: string): boolean {
  return /\b\d+([.,]\d+)?(%|x|\+|\s*mil|\s*k|million|milhões?|kpi|mrr|arr)?\b/i.test(text);
}

function detectLinks(text: string): boolean {
  return /(https?:\/\/|www\.|linkedin\.com|github\.com|behance\.net|dribbble\.com)/i.test(text);
}

// ============== Section detection ==============

function checkHeadline(text: string): {
  present: boolean;
  score: number;
  notes: string[];
  headline: string;
} {
  // Heurística: primeira linha não-vazia é tratada como headline
  const firstLine = text.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  const headline = firstLine.slice(0, 120);
  const lower = headline.toLowerCase();
  const hasKeywords = HEADLINE_KEYWORDS.some((k) => lower.includes(k));
  const tooShort = headline.length < 30;
  const tooLong = headline.length > 120;
  const present = headline.length > 0;

  let score = 0;
  if (present) score += 30;
  if (headline.length >= 30 && headline.length <= 120) score += 30;
  if (hasKeywords) score += 40;
  if (/[\|·•@]/.test(headline)) score += 5;

  const notes: string[] = [];
  if (!present) notes.push('Headline vazia.');
  if (tooShort) notes.push(`Headline muito curta (${headline.length} caracteres). Recomendado: 60–120.`);
  if (tooLong) notes.push('Headline muito longa — será cortada em aproximadamente 120 caracteres.');
  if (!hasKeywords) notes.push('Não detectamos cargo/área na headline. Adicione palavras-chave como "Desenvolvedor", "Engenheiro" etc.');

  return { present, score: clamp(score, 0, 100), notes, headline };
}

function checkAbout(text: string): { present: boolean; score: number; notes: string[]; length: number } {
  // Tenta achar uma seção "Sobre" / "About"
  const match = text.match(/(sobre|about|resumo)[\s\S]{0,2500}/i);
  const snippet = match ? match[0] : '';
  const length = snippet.length;
  const present = length > 80;
  let score = 0;
  if (present) score += 30;
  if (length >= 400 && length <= 2000) score += 30;
  if (detectNumbers(snippet)) score += 15;
  if (hasSection(snippet, SOFT_SKILL_KEYWORDS)) score += 15;
  if (detectBullets(snippet)) score += 10;

  const notes: string[] = [];
  if (!present) notes.push('Seção "Sobre" ausente ou muito curta.');
  if (length < 400) notes.push('Recomendamos um "Sobre" de 600–1.300 caracteres.');
  if (length > 2000) notes.push('"Sobre" muito longo — mantenha foco (600–1.300).');
  if (!detectNumbers(snippet)) notes.push('Adicione números concretos (ex: "+30% conversão", "5 projetos").');

  return { present, score: clamp(score, 0, 100), notes, length };
}

function checkExperience(text: string): { present: boolean; score: number; notes: string[]; items: number } {
  const present = hasSection(text, ['experiência', 'experience', 'experiencias', 'trajetória']);
  const hasDates = /\b(20\d{2}|19\d{2})\b/.test(text);
  const hasCompanies = /\b(ltda|inc|llc|s\.?a\.?|corp|company|tecnologia|tech|solutions|labs|studio|consultoria)\b/i.test(text);
  const items = countMatches(text, /\b(20\d{2}|19\d{2})\b/g);

  let score = 0;
  if (present) score += 40;
  if (hasDates) score += 20;
  if (hasCompanies) score += 20;
  if (detectBullets(text)) score += 10;
  if (detectNumbers(text)) score += 10;

  const notes: string[] = [];
  if (!present) notes.push('Não detectamos seção de Experiência.');
  if (!hasDates) notes.push('Adicione datas de início/fim em cada experiência.');
  if (!detectBullets(text)) notes.push('Use bullet points para destacar conquistas em cada cargo.');
  if (!detectNumbers(text)) notes.push('Quantifique resultados: %, R$, tempo, volume.');

  return { present, score: clamp(score, 0, 100), notes, items };
}

function checkSkills(text: string): { present: boolean; score: number; notes: string[]; count: number } {
  const techMatches = TECH_SKILL_PATTERNS.reduce(
    (sum, p) => sum + countMatches(text, p),
    0
  );
  const present = hasSection(text, ['skills', 'competências', 'competencias', 'habilidades', 'tecnologias']);
  const count = techMatches;
  let score = 0;
  if (present) score += 30;
  if (count >= 5) score += 25;
  if (count >= 10) score += 20;
  if (count >= 20) score += 15;
  if (hasSection(text, SOFT_SKILL_KEYWORDS)) score += 10;

  const notes: string[] = [];
  if (!present) notes.push('Seção de Habilidades/Competências não detectada.');
  if (count < 5) notes.push('Liste ao menos 10 skills técnicas relevantes.');
  if (count < 10) notes.push('Adicione mais habilidades técnicas (atualmente detectamos poucas).');

  return { present, score: clamp(score, 0, 100), notes, count };
}

function checkEducation(text: string): { present: boolean; score: number; notes: string[] } {
  const present = hasSection(text, ['formação', 'formacao', 'educação', 'education', 'graduação', 'graduacao', 'pós', 'pos', 'mba', 'faculdade', 'universidade']);
  let score = 0;
  if (present) score += 60;
  if (/\b(20\d{2}|19\d{2})\b/.test(text)) score += 20;
  if (/\b(graduação|bacharelado|licenciatura|mba|mestrado|doutorado|tecnólogo|tecnologo)\b/i.test(text)) score += 20;

  const notes: string[] = [];
  if (!present) notes.push('Adicione sua formação acadêmica.');

  return { present, score: clamp(score, 0, 100), notes };
}

function checkCertifications(text: string): { present: boolean; score: number; notes: string[]; count: number } {
  const present = hasSection(text, ['certificação', 'certificacao', 'certificado', 'certificates', 'certifications']);
  const count = countMatches(text, /\b(aws|gcp|azure|google|meta|coursera|udemy|alura|scrum|psm|pspo|pmp|itil|cisco|microsoft|kubernetes|cka|ckad)\b/gi);
  let score = 0;
  if (present) score += 50;
  if (count >= 1) score += 30;
  if (count >= 3) score += 20;

  const notes: string[] = [];
  if (!present) notes.push('Considere adicionar certificações relevantes para sua área.');

  return { present, score: clamp(score, 0, 100), notes, count };
}

function checkProjects(text: string): { present: boolean; score: number; notes: string[]; count: number } {
  const present = hasSection(text, ['projetos', 'projects', 'portfólio', 'portfolio']);
  const hasLinks = detectLinks(text);
  let score = 0;
  if (present) score += 50;
  if (hasLinks) score += 30;
  if (detectNumbers(text)) score += 20;

  const notes: string[] = [];
  if (!present) notes.push('Adicione uma seção de Projetos / Portfólio com links (GitHub, Behance, site).');

  return { present, score: clamp(score, 0, 100), notes, count: present ? 1 : 0 };
}

// ============== Issues & Suggestions ==============

function buildIssues(sections: AuditSection[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const s of sections) {
    if (s.score >= 80) continue;
    const severity: AuditSeverity = !s.present ? 'high' : s.score < 50 ? 'high' : s.score < 75 ? 'medium' : 'low';
    for (const n of s.notes) {
      issues.push({
        id: uid('iss'),
        severity,
        area: s.label,
        message: n,
      });
    }
  }
  // ordena: high > medium > low
  const order: Record<AuditSeverity, number> = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);
  return issues.slice(0, 20);
}

function buildSuggestions(sections: AuditSection[], input: AnalyzeInput): AuditSuggestion[] {
  const sugg: AuditSuggestion[] = [];
  for (const s of sections) {
    if (s.score >= 85) continue;
    for (const n of s.notes) {
      sugg.push({ id: uid('sug'), area: s.label, message: n });
    }
  }
  if (input.targetJob) {
    sugg.push({
      id: uid('sug'),
      area: 'Alinhamento à vaga',
      message: `Releia a descrição da vaga alvo (${input.targetJob}) e espelhe 5–8 palavras-chave exatas no seu "Sobre" e nas experiências.`,
    });
  }
  return sugg.slice(0, 12);
}

function buildPostIdeas(input: AnalyzeInput): string[] {
  const area = (input.area || 'sua área').trim();
  const target = (input.targetJob || 'a vaga').trim();
  return [
    `Carrossel: "5 erros que eu cometi como ${area} e como corrigi"`,
    `Texto: "O que eu entregaria nos primeiros 30 dias em ${target} — e o que eu evitaria"`,
    `Thread: "3 projetos que me ensinaram mais que qualquer curso de ${area}"`,
    `Post curto: "Uma métrica que me fez entender ${area} de verdade"`,
    `Antes/depois: "Meu pitch de ${area} em 1 frase — antes e depois da revisão"`,
  ];
}

function buildSummary(overall: number, sections: AuditSection[]): string {
  if (overall >= 85) return 'Perfil forte e bem estruturado — pequenos ajustes podem elevá-lo ainda mais.';
  if (overall >= 70) return 'Bom perfil, com boas bases. Foque nos pontos médios abaixo para chegar ao próximo nível.';
  if (overall >= 50) return 'Perfil razoável, mas com lacunas importantes. Recomendamos revisar as seções marcadas em amarelo/vermelho.';
  return 'Perfil precisa de atenção. Sugerimos reescrever a headline, expandir o "Sobre" e adicionar resultados quantificados nas experiências.';

  // unreachable
  void sections;
}

// ============== Main ==============

export function analyzeLinkedInProfile(input: AnalyzeInput): AuditResult {
  const text = (input.profileText || '').trim();
  const headline = checkHeadline(text);
  const about = checkAbout(text);
  const experience = checkExperience(text);
  const skills = checkSkills(text);
  const education = checkEducation(text);
  const certifications = checkCertifications(text);
  const projects = checkProjects(text);

  const sections: AuditSection[] = [
    { key: 'headline', label: 'Headline', present: headline.present, score: headline.score, notes: headline.notes },
    { key: 'about', label: 'Sobre / About', present: about.present, score: about.score, notes: about.notes },
    { key: 'experience', label: 'Experiência', present: experience.present, score: experience.score, notes: experience.notes },
    { key: 'skills', label: 'Habilidades', present: skills.present, score: skills.score, notes: skills.notes },
    { key: 'education', label: 'Formação', present: education.present, score: education.score, notes: education.notes },
    { key: 'certifications', label: 'Certificações', present: certifications.present, score: certifications.score, notes: certifications.notes },
    { key: 'projects', label: 'Projetos', present: projects.present, score: projects.score, notes: projects.notes },
  ];

  // Pesos por seção
  const weights: Record<string, number> = {
    headline: 0.18,
    about: 0.20,
    experience: 0.25,
    skills: 0.17,
    education: 0.08,
    certifications: 0.06,
    projects: 0.06,
  };
  const overallScore = Math.round(
    sections.reduce((sum, s) => sum + s.score * (weights[s.key] ?? 0.1), 0)
  );

  const issues = buildIssues(sections);
  const suggestions = buildSuggestions(sections, input);
  const postIdeas = buildPostIdeas(input);

  return {
    overallScore,
    summary: buildSummary(overallScore, sections),
    sections,
    issues,
    suggestions,
    postIdeas,
    metrics: {
      charCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      lineCount: text.split('\n').length,
      hasNumbers: detectNumbers(text),
      hasLinks: detectLinks(text),
      hasBullets: detectBullets(text),
    },
  };
}
