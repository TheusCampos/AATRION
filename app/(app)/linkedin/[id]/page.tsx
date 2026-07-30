import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Linkedin,
  CheckCircle,
  Lightbulb,
  ExternalLink,
  Target,
  PenTool,
  BarChart,
  ListTodo,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import type { AuditResult } from '@/lib/linkedin-analyzer';

type Params = { params: { id: string } };

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

export default async function AuditResultPage({ params }: Params) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const audit = await prisma.linkedInAudit.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!audit) redirect('/linkedin');

  let result: AuditResult | null = null;
  try {
    result = JSON.parse(audit.result) as AuditResult;
  } catch {
    result = null;
  }

  if (!result || !result.categories) {
    return (
      <div className="space-y-4">
        <Link href="/linkedin" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Card>
          <p className="text-muted-foreground">O resultado da auditoria está em um formato antigo ou não pôde ser carregado.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/linkedin"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Resultado da Auditoria</h1>
          </div>
        </div>
        {audit.profileUrl && (
          <a
            href={audit.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            Ver perfil <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Main Score Header */}
      <div className={`rounded-3xl border p-8 shadow-sm ${getScoreBg(audit.overallScore)} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Resumo Executivo do Recrutador</h2>
            <p className="text-xl font-medium leading-relaxed text-foreground">
              {result.executiveSummary}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-muted-foreground">
              {audit.area && <span className="flex items-center gap-1"><PenTool className="h-4 w-4"/> {audit.area}</span>}
              {audit.targetJob && <span className="flex items-center gap-1"><Target className="h-4 w-4"/> Alvo: {audit.targetJob}</span>}
              <span className="flex items-center gap-1"><BarChart className="h-4 w-4"/> {result.metrics?.wordCount || 0} palavras</span>
            </div>
          </div>
          
          <div className="relative shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90 drop-shadow-md">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/50" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(audit.overallScore / 100) * 327} 327`}
                className={getScoreColor(audit.overallScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold tabular-nums ${getScoreColor(audit.overallScore)}`}>
                {audit.overallScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <div className="mb-6 flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Plano de Ação Priorizado</h2>
        </div>
        <div className="space-y-4">
          {result.actionPlan?.map((action, idx) => (
            <div key={idx} className="flex gap-4 items-start p-4 rounded-xl border border-border bg-muted/20">
              <div className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                action.priority === 'high' ? 'bg-red-100 text-red-700' :
                action.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
              </div>
              <div>
                <p className="font-medium text-foreground">{action.action}</p>
                <p className="text-sm text-muted-foreground mt-1"><span className="font-medium">Impacto:</span> {action.impact}</p>
              </div>
            </div>
          ))}
          {(!result.actionPlan || result.actionPlan.length === 0) && (
             <p className="text-sm text-muted-foreground">Nenhuma ação crítica pendente.</p>
          )}
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-300">
        {result.categories?.map((cat) => (
          <Card key={cat.id} className="flex flex-col p-6 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="font-semibold text-lg">{cat.title}</h3>
              <div className={`px-2.5 py-1 rounded-md font-bold tabular-nums text-sm ${getScoreBg(cat.score)} ${getScoreColor(cat.score)}`}>
                {cat.score} / 100
              </div>
            </div>
            
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary mb-4">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${cat.score}%`,
                  backgroundColor: cat.score >= 80 ? '#10b981' : cat.score >= 60 ? '#d97706' : '#ef4444',
                }}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {cat.explanation}
            </p>
            
            {cat.recommendations && cat.recommendations.length > 0 && (
              <div className="mt-auto pt-4 border-t border-border">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {cat.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* AI Generated Content Section */}
      {result.generatedContent && (
        <Card className="p-6 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Conteúdo Sugerido pela IA</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Headline (Título Profissional)</h3>
              </div>
              <div className="relative rounded-lg bg-background border p-4 text-sm font-medium">
                {result.generatedContent.headline}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Resumo (Sobre)</h3>
              </div>
              <div className="relative rounded-lg bg-background border p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {result.generatedContent.about}
              </div>
            </div>

            {result.generatedContent.experienceImprovements?.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-medium text-foreground">Melhorias de Experiência</h3>
                {result.generatedContent.experienceImprovements.map((exp, idx) => (
                  <div key={idx} className="rounded-lg bg-background border p-4 text-sm">
                    <p className="font-semibold mb-1">{exp.companyOrRole}</p>
                    <p className="text-muted-foreground">{exp.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Keywords Section */}
      {result.keywords && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-700">
          <h2 className="text-lg font-semibold mb-4">Análise de Palavras-Chave</h2>
          <p className="text-sm text-muted-foreground mb-6">{result.keywords.matchWithTarget}</p>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-red-600 flex items-center gap-1 mb-3">
                <AlertCircle className="h-4 w-4" /> Palavras Ausentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords.missing?.map(k => (
                  <span key={k} className="inline-flex items-center rounded-md bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 text-xs font-medium">
                    {k}
                  </span>
                ))}
                {(!result.keywords.missing || result.keywords.missing.length === 0) && (
                  <span className="text-sm text-muted-foreground">Nenhuma palavra essencial faltando.</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-emerald-600 flex items-center gap-1 mb-3">
                <CheckCircle className="h-4 w-4" /> Sugestões Adicionais
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords.suggested?.map(k => (
                  <span key={k} className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-medium">
                    {k}
                  </span>
                ))}
                {(!result.keywords.suggested || result.keywords.suggested.length === 0) && (
                  <span className="text-sm text-muted-foreground">Nenhuma sugestão adicional.</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-8">
        <Link
          href="/linkedin"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Fazer Nova Auditoria
        </Link>
      </div>
    </div>
  );
}
