import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles, Plus, BarChart3 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardResumes } from '@/components/resume/DashboardResumes';
import { PLAN_LABELS } from '@/lib/plan';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      templateId: true,
      colorScheme: true,
      atsScore: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = resumes.length;
  const max = user.limits.maxResumes;
  const remaining = max === -1 ? '∞' : Math.max(0, max - total);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Olá, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Plano {PLAN_LABELS[user.plan]} · {total} {total === 1 ? 'currículo' : 'currículos'}
            {max !== -1 ? ` de ${max}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/linkedin"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <Sparkles className="h-4 w-4" />
            Auditar LinkedIn
          </Link>
          <Link
            href="/resumes/new"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-shadow hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Novo currículo
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Currículos criados"
          value={String(total)}
          hint={max === -1 ? 'Ilimitado' : `Restam ${remaining} no seu plano`}
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Análises com IA no mês"
          value={`${user.usage.analyzeUsed}/${user.limits.aiAnalyzePerMonth === -1 ? '∞' : user.limits.aiAnalyzePerMonth}`}
        />
        <StatCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Adaptações com IA no mês"
          value={`${user.usage.adaptUsed}/${user.limits.aiAdaptPerMonth === -1 ? '∞' : user.limits.aiAdaptPerMonth}`}
        />
      </div>

      <DashboardResumes
        resumes={resumes.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600">
          {icon}
        </span>
        {label}
      </div>
      <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
