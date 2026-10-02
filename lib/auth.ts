import 'server-only';
import { auth, currentUser, type User as ClerkUser } from '@clerk/nextjs/server';
import { cache } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { prisma } from './prisma';
import {
  ensureFreshUsagePeriod,
  normalizePlan,
  type PlanCode,
  type PlanLimits,
} from './plan';

type PrismaUserLite = {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  clerkId: string | null;
  phone: string | null;
  jobTitle: string | null;
  location: string | null;
  linkedinUrl: string | null;
  allowPdfDownload: boolean;
  planRenewsAt: Date | null;
  planStartedAt: Date | null;
  aiAnalyzeUsed: number;
  aiAdaptUsed: number;
  aiAuditUsed: number;
  aiUsagePeriod: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  plan: PlanCode;
  role: string;
  clerkId: string | null;
  phone: string | null;
  jobTitle: string | null;
  location: string | null;
  linkedinUrl: string | null;
  allowPdfDownload: boolean;
  planRenewsAt: Date | null;
  planStartedAt: Date | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  limits: PlanLimits;
  usage: {
    period: string;
    analyzeUsed: number;
    adaptUsed: number;
    auditUsed: number;
  };
};

function pickClerkName(clerk: ClerkUser, email: string): string {
  return (
    [clerk.firstName, clerk.lastName].filter(Boolean).join(' ').trim() ||
    clerk.username ||
    email.split('@')[0]
  );
}

async function syncClerkUser(clerk: ClerkUser): Promise<PrismaUserLite | null> {
  const email =
    clerk.emailAddresses?.find((e) => e.id === clerk.primaryEmailAddressId)?.emailAddress ||
    clerk.emailAddresses?.[0]?.emailAddress ||
    (clerk.username ? `${clerk.username}@clerk.user` : `${clerk.id}@clerk.user`);
  
  if (!email) return null;
  const name = pickClerkName(clerk, email);

  try {
    const byClerk = await prisma.user.findUnique({ where: { clerkId: clerk.id } });
    if (byClerk) {
      if (byClerk.email !== email || byClerk.name !== name) {
        return await prisma.user.update({
          where: { id: byClerk.id },
          data: { email, name },
        });
      }
      return byClerk;
    }

    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      return await prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: clerk.id, name },
      });
    }

    return await prisma.user.create({
      data: { email, name, clerkId: clerk.id, plan: 'FREE' },
    });
  } catch (err) {
    console.error('[Auth] syncClerkUser error:', err);
    return null;
  }
}

async function enrich(user: PrismaUserLite): Promise<AuthUser> {
  const { getPlanLimits } = await import('./plan');
  const usage = await ensureFreshUsagePeriod(user.id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: normalizePlan(user.plan),
    role: user.role,
    clerkId: user.clerkId,
    phone: user.phone,
    jobTitle: user.jobTitle,
    location: user.location,
    linkedinUrl: user.linkedinUrl,
    allowPdfDownload: user.allowPdfDownload,
    planRenewsAt: user.planRenewsAt,
    planStartedAt: user.planStartedAt,
    stripeSubscriptionId: user.stripeSubscriptionId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    limits: getPlanLimits(user.plan),
    usage: {
      period: usage.period,
      analyzeUsed: usage.aiAnalyzeUsed,
      adaptUsed: usage.aiAdaptUsed,
      auditUsed: usage.aiAuditUsed,
    },
  };
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    let user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) {
      const clerk = await currentUser();
      if (clerk) {
        user = await syncClerkUser(clerk);
      }
    }
    if (user) {
      return await enrich(user);
    }

    // Fallback: If user is authenticated in Clerk but DB sync failed, create emergency user or return fallback
    const clerk = await currentUser();
    const email =
      clerk?.emailAddresses?.find((e) => e.id === clerk?.primaryEmailAddressId)?.emailAddress ||
      clerk?.emailAddresses?.[0]?.emailAddress ||
      (clerk?.username ? `${clerk.username}@clerk.user` : `${clerkId}@clerk.user`);
    const name = clerk ? pickClerkName(clerk, email) : 'Usuário';

    try {
      const emergencyUser = await prisma.user.upsert({
        where: { clerkId },
        update: { email, name },
        create: {
          clerkId,
          email,
          name,
          plan: 'FREE',
        },
      });
      return await enrich(emergencyUser);
    } catch (e) {
      console.error('[Auth] Emergency user creation failed:', e);
    }

    const { getPlanLimits, currentPeriod } = await import('./plan');
    return {
      id: clerkId,
      email,
      name,
      plan: 'FREE',
      role: 'USER',
      clerkId,
      phone: null,
      jobTitle: null,
      location: null,
      linkedinUrl: null,
      allowPdfDownload: true,
      planRenewsAt: null,
      planStartedAt: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      limits: getPlanLimits('FREE'),
      usage: {
        period: currentPeriod(),
        analyzeUsed: 0,
        adaptUsed: 0,
        auditUsed: 0,
      },
    };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest: unknown }).digest === 'string' &&
      ((error as { digest: string }).digest === 'DYNAMIC_SERVER_USAGE' ||
        (error as { digest: string }).digest.startsWith('NEXT_'))
    ) {
      throw error;
    }
    console.error('getCurrentUser ERROR:', error);
    return null;
  }
});

