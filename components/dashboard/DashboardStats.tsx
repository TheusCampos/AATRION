import { FileText, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { AuthUser } from '@/lib/auth';

export function DashboardStats({
  user,
  totalResumes,
}: {
  user: AuthUser;
  totalResumes: number;
}) {
  const resumeLimit = user.limits.maxResumes;
  const analyzeLimit = user.limits.aiAnalyzePerMonth;
  const adaptLimit = user.limits.aiAdaptPerMonth;

  // Curriculos
  const resumeUsed = totalResumes;
  const resumeUnlimited = resumeLimit === -1;
  const resumePct = resumeUnlimited ? 5 : Math.min(100, Math.round((resumeUsed / Math.max(resumeLimit, 1)) * 100));

  // Analises
  const analyzeUsed = user.usage.analyzeUsed;
  const analyzeUnlimited = analyzeLimit === -1;
  const analyzePct = analyzeUnlimited ? 5 : Math.min(100, Math.round((analyzeUsed / Math.max(analyzeLimit, 1)) * 100));

  // Adaptacoes
  const adaptUsed = user.usage.adaptUsed;
  const adaptUnlimited = adaptLimit === -1;
  const adaptPct = adaptUnlimited ? 5 : Math.min(100, Math.round((adaptUsed / Math.max(adaptLimit, 1)) * 100));

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      {/* Currículos */}
      <Card className="flex flex-col rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600">Currículos</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{resumeUsed}</span>
              <span className="text-sm text-slate-500">
                de {resumeUnlimited ? 'ilimitado' : resumeLimit} utilizado{resumeUsed !== 1 && 's'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
              style={{ width: `${resumePct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Limite do seu plano</p>
        </div>
      </Card>

      {/* Análises com IA */}
      <Card className="flex flex-col rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600">Análises com IA</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{analyzeUsed}</span>
              <span className="text-sm text-slate-500">
                de {analyzeUnlimited ? 'ilimitadas' : analyzeLimit} utilizada{analyzeUsed !== 1 && 's'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-fuchsia-500 transition-all"
              style={{ width: `${analyzePct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Limite do seu plano</p>
        </div>
      </Card>

      {/* Adaptações com IA */}
      <Card className="flex flex-col rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-600 flex items-center gap-2">
              Adaptações com IA
            </h3>
            {user.plan === 'FREE' ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">Não incluso</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">PRO</span>
              </div>
            ) : (
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{adaptUsed}</span>
                <span className="text-sm text-slate-500">
                  de {adaptUnlimited ? 'ilimitadas' : adaptLimit} utilizada{adaptUsed !== 1 && 's'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto">
          {user.plan === 'FREE' ? (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" />
              <p className="mt-2 text-xs text-slate-500">Disponível no Pro</p>
            </>
          ) : (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${adaptPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Limite do seu plano</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
