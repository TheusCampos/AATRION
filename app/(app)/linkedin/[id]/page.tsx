import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Linkedin,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import type { AuditResult, AuditSeverity } from '@/lib/linkedin-analyzer';

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

function getSeverityIcon(s: AuditSeverity) {
  if (s === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />;
  if (s === 'medium') return <AlertCircle className="h-4 w-4 text-amber-500" />;
  return <AlertCircle className="h-4 w-4 text-blue-500" />;
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

  if (!result) {
    return (
      <div className="space-y-4">
        <Link href="/linkedin" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Card>
          <p className="text-muted-foreground">Não foi possível carregar o resultado.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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
            <h1 className="text-xl font-semibold tracking-tight">Auditoria</h1>
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

      <div className={`rounded-xl border p-6 ${getScoreBg(audit.overallScore)}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className={`text-5xl font-bold tabular-nums ${getScoreColor(audit.overallScore)}`}>
                {audit.overallScore}
              </span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <p className="text-lg font-medium leading-relaxed">{result.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{result.metrics.wordCount.toLocaleString('pt-BR')} palavras</span>
              <span>·</span>
              <span>{result.metrics.charCount.toLocaleString('pt-BR')} caracteres</span>
              {audit.area && <><span>·</span><span>{audit.area}</span></>}
              {audit.targetJob && <><span>·</span><span>Alvo: {audit.targetJob}</span></>}
            </div>
          </div>
          <div className="hidden sm:block">
            <svg viewBox="0 0 120 120" className="h-24 w-24 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
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
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {result.sections.map((s) => (
          <Card key={s.key} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{s.label}</span>
              <span className={`text-sm font-semibold ${getScoreColor(s.score)}`}>
                {s.score}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${s.score}%`,
                  backgroundColor: s.score >= 80 ? '#10b981' : s.score >= 60 ? '#d97706' : '#ef4444',
                }}
              />
            </div>
            {s.notes.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {s.notes.slice(0, 2).map((n, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {n}</li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {result.issues.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Pontos de Atenção</h2>
          </div>
          <ul className="space-y-2">
            {result.issues.slice(0, 4).map((iss) => (
              <li key={iss.id} className="flex items-start gap-3 text-sm">
                {getSeverityIcon(iss.severity)}
                <div>
                  <span className="font-medium text-foreground">{iss.area}</span>
                  <span className="text-muted-foreground"> — {iss.message}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.suggestions.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Sugestões</h2>
          </div>
          <ul className="space-y-2">
            {result.suggestions.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-start gap-3 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                <div>
                  <span className="font-medium text-foreground">{s.area}</span>
                  <span className="text-muted-foreground"> — {s.message}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.postIdeas.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Ideias de Conteúdo</h2>
          <div className="flex flex-wrap gap-2">
            {result.postIdeas.map((idea, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-sm"
              >
                {idea}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-2">
        <Link
          href="/linkedin"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
        >
          Nova Auditoria
        </Link>
      </div>
    </div>
  );
}
