import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardResumes } from '@/components/resume/DashboardResumes';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { PlanUpgradeCard } from '@/components/dashboard/PlanUpgradeCard';
import { TipsCard } from '@/components/dashboard/TipsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { logUserAction } from '@/lib/logger';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  await logUserAction({
    userId: user.id,
    action: 'VIEWED_DASHBOARD',
  });

  const sessionId = searchParams?.session_id as string | undefined;
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'subscription'],
      });
      if (session.payment_status === 'paid') {
        const stripePrice = session.line_items?.data[0]?.price;
        const customerId = session.customer as string;

        let plan = 'FREE';
        const priceId = stripePrice?.id;
        if (priceId === process.env.STRIPE_PRICE_ID_MAX) plan = 'MAX';
        else if (priceId === process.env.STRIPE_PRICE_ID_PRO) plan = 'PRO';
        else if (priceId === process.env.STRIPE_PRICE_ID_UNIC) plan = 'UNIC';
        else if (priceId === process.env.STRIPE_PRICE_ID_PC_PRO) plan = 'PC_PRO';
        else {
          const unitAmount = stripePrice?.unit_amount ?? 0;
          if (unitAmount >= 3990) plan = 'MAX';
          else if (unitAmount >= 1990) plan = 'PRO';
          else if (unitAmount >= 990) plan = 'UNIC';
        }

        let planRenewsAt = null;
        let stripeSubscriptionId = null;

        if (session.mode === 'subscription' && session.subscription) {
          const sub = session.subscription as any;
          planRenewsAt = new Date(sub.current_period_end * 1000);
          stripeSubscriptionId = sub.id;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            stripeCustomerId: customerId,
            stripePriceId: priceId,
            stripeSubscriptionId,
            planStartedAt: new Date(),
            planRenewsAt,
            stripeCurrentPeriodEnd: planRenewsAt,
          },
        });

        redirect('/dashboard');
      }
    } catch (e) {
      console.error('[Dashboard] Falha ao verificar session_id:', e);
    }
  }

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

  const lastResumeId = resumes[0]?.id;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Greeting Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Visão Geral
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Olá, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie seus currículos e acompanhe o uso do seu plano.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/linkedin">
            <Button variant="secondary" className="gap-2 h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold text-slate-700">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Auditar LinkedIn
            </Button>
          </Link>
          <Link href="/resumes/new">
            <Button variant="primary" className="gap-2 h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-white shadow-md shadow-indigo-500/20">
              <Plus className="h-4 w-4" />
              Novo currículo
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stats Row */}
      <DashboardStats user={user} totalResumes={resumes.length} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Coluna Esquerda: Ações e Currículos */}
        <div className="lg:col-span-2 space-y-8">
          <QuickActions lastResumeId={lastResumeId} userPlan={user.plan} />
          <DashboardResumes
            resumes={resumes.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() }))}
          />
        </div>

        {/* Coluna Direita: Seu plano e Dicas */}
        <div className="space-y-6">
          <PlanUpgradeCard user={user} />
          <TipsCard />
        </div>
      </div>
    </div>
  );
}
