'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Crown } from 'lucide-react';
import { PLAN_LABELS } from '@/lib/plan';
import type { AuthUser } from '@/lib/auth';

export function PlanUpgradeCard({ user }: { user: AuthUser }) {
  const isFree = user.plan === 'FREE';
  const planLabel = PLAN_LABELS[user.plan] || user.plan;

  return (
    <Card className="flex flex-col rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur shadow-sm">
      <h3 className="text-sm font-semibold text-slate-600 mb-4">Seu plano</h3>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl font-extrabold tracking-tight text-slate-900">{planLabel}</span>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
          Atual
        </span>
      </div>

      <div className="h-px w-full bg-slate-100 mb-6" />

      {isFree ? (
        <>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Você atingiu o limite de uso do seu plano atual. Faça upgrade para criar mais currículos e desbloquear recursos avançados.
          </p>
          <Link href="/pricing" className="mt-auto">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2">
              <Crown className="h-5 w-5" />
              Conhecer plano Pro
            </Button>
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Obrigado por usar o plano {planLabel}! Você tem acesso a todos os recursos avançados de inteligência artificial.
          </p>
          <Link href="/settings" className="mt-auto">
            <Button variant="secondary" className="w-full rounded-xl h-12 font-semibold">
              Gerenciar assinatura
            </Button>
          </Link>
        </>
      )}
    </Card>
  );
}
