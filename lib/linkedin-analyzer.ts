export type AuditActionPriority = 'high' | 'medium' | 'low';

export type AuditActionPlanItem = {
  id: string;
  priority: AuditActionPriority;
  action: string;
  impact: string;
};

export type AuditCategory = {
  id: 'ats' | 'seo' | 'personal_brand' | 'experience' | 'skills' | 'projects' | 'certifications' | 'general_quality';
  title: string;
  score: number; // 0-100
  explanation: string;
  recommendations: string[];
};

export type AuditKeywords = {
  missing: string[];
  suggested: string[];
  matchWithTarget: string;
};

export type GeneratedContent = {
  headline: string;
  about: string;
  experienceImprovements: {
    companyOrRole: string;
    suggestion: string;
  }[];
};

export type AuditResult = {
  overallScore: number;
  executiveSummary: string;
  categories: AuditCategory[];
  keywords: AuditKeywords;
  generatedContent: GeneratedContent;
  actionPlan: AuditActionPlanItem[];
  metrics: {
    charCount: number;
    wordCount: number;
    hasNumbers: boolean;
    hasLinks: boolean;
  };
};

export type AnalyzeInput = {
  profileText: string;
  area?: string;
  targetJob?: string;
};

export function cleanLinkedInGarbage(text: string): string {
  if (!text) return '';
  const garbageLines = [
    'Messaging',
    'Notifications',
    'Me',
    'Home',
    'My Network',
    'Jobs',
    'Search',
    'LinkedIn',
    'Show all',
    'Ver mais',
    'Show less',
    'Ver menos',
    'Visualizar painel',
    'View dashboard',
    'Try Premium',
    'Experimente Premium',
    'Public profile & URL',
    'Add profile section',
  ];
  
  let lines = text.split('\n');
  lines = lines.map(l => l.trim()).filter(l => {
    if (l.length === 0) return false;
    if (garbageLines.some(g => l.toLowerCase() === g.toLowerCase())) return false;
    return true;
  });

  return lines.join('\n');
}
