import 'server-only';
import { auth, currentUser, type User as ClerkUser } from '@clerk/nextjs/server';
import { cache } from 'react';
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
  const email = clerk.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;
  const name = pickClerkName(clerk, email);

  const byClerk = await prisma.user.findUnique({ where: { clerkId: clerk.id } });
  if (byClerk) {
    if (byClerk.email !== email || byClerk.name !== name) {
      return prisma.user.update({
        where: { id: byClerk.id },
        data: { email, name },
      });
    }
    return byClerk;
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId: clerk.id, name },
    });
  }

  return prisma.user.create({
    data: { email, name, clerkId: clerk.id, plan: 'FREE' },
  });
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
    const { userId: clerkId } = auth();
    if (!clerkId) return null;

    let user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) {
      const clerk = await currentUser();
      if (!clerk) return null;
      user = await syncClerkUser(clerk);
    }
    if (!user) return null;
    return enrich(user);
  } catch (error) {
    console.error('getCurrentUser ERROR:', error);
    return null;
  }
});

