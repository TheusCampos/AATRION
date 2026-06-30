import Link from 'next/link';
import { Sparkles, SlidersHorizontal, Linkedin, Briefcase, ArrowRight, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { PlanCode } from '@/lib/plan';

type Action = {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bg: string;
  requiresPro?: boolean;
};

export function QuickActions({
  lastResumeId,
  userPlan = 'FREE',
}: {
  lastResumeId?: string;
  userPlan?: PlanCode;
}) {
  const isPro = userPlan === 'PRO' || userPlan === 'MAX';

  const actions: Action[] = [
    {
      title: 'Analisar currículo',
      description: 'Receba feedback com IA sobre seu currículo.',
      icon: <Sparkles className="h-5 w-5" />,
      href: lastResumeId ? `/editor/${lastResumeId}?action=analyze` : '/editor/new?action=analyze',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      requiresPro: false,
    },
    {
      title: 'Adaptar para vaga',
      description: 'Personalize seu currículo para uma vaga específica.',
      icon: <SlidersHorizontal className="h-5 w-5" />,
      href: lastResumeId ? `/editor/${lastResumeId}?action=adapt` : '/editor/new?action=adapt',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      requiresPro: true,
    },
    {
      title: 'Auditar LinkedIn',
      description: 'Avalie seu perfil e receba sugestões de melhoria.',
      icon: <Linkedin className="h-5 w-5" />,
      href: '/linkedin',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      requiresPro: true,
    },
    {
      title: 'Buscar vagas',
      description: 'Encontre oportunidades que combinam com você.',
      icon: <Briefcase className="h-5 w-5" />,
      href: '/jobs',
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      requiresPro: false,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Ações rápidas</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, idx) => {
          const isLocked = action.requiresPro && !isPro;
          const href = isLocked ? '/pricing' : action.href;

          return (
            <Link key={idx} href={href}>
              <Card
                className={`group flex h-full flex-col rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur transition-all duration-300 hover:shadow-md ${isLocked
                    ? 'hover:border-amber-400/40 opacity-80'
                    : 'hover:border-indigo-500/30'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} ${action.color} ${isLocked ? 'opacity-60' : ''
                      }`}
                  >
                    {action.icon}
                  </div>
                  {isLocked && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <Lock className="h-2.5 w-2.5" /> PRO
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-xs text-slate-500 mb-4 flex-1">
                  {isLocked
                    ? 'Disponível no plano Pro. Clique para ver os planos.'
                    : action.description}
                </p>
                <div className="mt-auto">
                  <ArrowRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isLocked ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'
                      }`}
                  />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
