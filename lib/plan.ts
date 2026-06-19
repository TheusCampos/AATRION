/**
 * Central de regras de plano (FREE / PRO / MAX).
 *
 * Onde usar:
 *   - lib/auth.ts        -> getCurrentUser() enriquece o retorno com `planInfo`
 *   - /api/resumes       -> valida limite de curriculos
 *   - /api/linkedin/audit-> valida limite mensal
 *   - /api/resumes/[id]/analyze | adapt -> valida quota de IA
 *   - /settings          -> renderiza contadores e data de renovacao
 */

import { prisma } from './prisma';

export type PlanCode = 'FREE' | 'PRO' | 'MAX';

export type PlanLimits = {
  /** Numero maximo de curriculos ativos. -1 = ilimitado. */
  maxResumes: number;
  /** Cota mensal de analises com IA (endpoint /analyze). -1 = ilimitado. */
  aiAnalyzePerMonth: number;
  /** Cota mensal de adaptacoes com IA (endpoint /adapt). -1 = ilimitado. */
  aiAdaptPerMonth: number;
  /** Cota mensal de auditorias LinkedIn. -1 = ilimitado. */
  aiAuditPerMonth: number;
  /** Permite exportar PDF. */
  allowPdfDownload: boolean;
  /** Permite editar preferencias de usuario em /settings. */
  allowSettings: boolean;
};

export const PLAN_LIMITS: Record<PlanCode, PlanLimits> = {
  FREE: {
    maxResumes: 1,
    aiAnalyzePerMonth: 1,
    aiAdaptPerMonth: 0,
    aiAuditPerMonth: 0,
    allowPdfDownload: true,
    allowSettings: true,
  },
  PRO: {
    maxResumes: 10,
    aiAnalyzePerMonth: 10,
    aiAdaptPerMonth: 10,
    aiAuditPerMonth: 3,
    allowPdfDownload: true,
    allowSettings: true,
  },
  MAX: {
    maxResumes: 30,
    aiAnalyzePerMonth: 50,
    aiAdaptPerMonth: 30,
    aiAuditPerMonth: 10,
    allowPdfDownload: true,
    allowSettings: true,
  },
};

export const PLAN_LABELS: Record<PlanCode, string> = {
  FREE: 'Grátis',
  PRO: 'Pro',
  MAX: 'Max',
};

export const PLAN_PRICES: Record<PlanCode, { monthly: number; yearly: number }> = {
  FREE: { monthly: 0, yearly: 0 },
  PRO: { monthly: 19.90, yearly: 199.00 },
  MAX: { monthly: 39.90, yearly: 399.00 },
};

export function normalizePlan(plan: string | null | undefined): PlanCode {
  if (plan === 'PRO' || plan === 'MAX') return plan;
  return 'FREE';
}

export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

/**
 * Retorna o periodo corrente no formato "YYYY-MM" no fuso local.
 * Usado como chave de reset dos contadores de uso de IA.
 */
export function currentPeriod(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Garante que os contadores de uso de IA estao com o periodo atual.
 * Se o usuario tem o periodo antigo, zera os contadores (nova janela mensal).
 */
export async function ensureFreshUsagePeriod(userId: string) {
  const period = currentPeriod();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { aiUsagePeriod: true, aiAnalyzeUsed: true, aiAdaptUsed: true, aiAuditUsed: true },
  });
  if (!user) return { aiAnalyzeUsed: 0, aiAdaptUsed: 0, aiAuditUsed: 0, period };
  if (user.aiUsagePeriod === period) {
    return {
      aiAnalyzeUsed: user.aiAnalyzeUsed,
      aiAdaptUsed: user.aiAdaptUsed,
      aiAuditUsed: user.aiAuditUsed,
      period,
    };
  }
  // Reset: o periodo novo nao bate com o gravado
  await prisma.user.update({
    where: { id: userId },
    data: { aiUsagePeriod: period, aiAnalyzeUsed: 0, aiAdaptUsed: 0, aiAuditUsed: 0 },
  });
  return { aiAnalyzeUsed: 0, aiAdaptUsed: 0, aiAuditUsed: 0, period };
}

export type UsageKind = 'analyze' | 'adapt' | 'audit';

function quotaFor(limits: PlanLimits, kind: UsageKind): number {
  if (kind === 'analyze') return limits.aiAnalyzePerMonth;
  if (kind === 'adapt') return limits.aiAdaptPerMonth;
  return limits.aiAuditPerMonth;
}

function fieldFor(kind: UsageKind) {
  if (kind === 'analyze') return 'aiAnalyzeUsed' as const;
  if (kind === 'adapt') return 'aiAdaptUsed' as const;
  return 'aiAuditUsed' as const;
}

/**
 * Verifica se o usuario tem quota disponivel para um recurso de IA.
 * NAO consome a cota — para isso chame `consumeAIUsage` em seguida.
 */
export async function checkAIQuota(
  userId: string,
  plan: string | null,
  kind: UsageKind
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
  const limits = getPlanLimits(plan);
  const cap = quotaFor(limits, kind);
  if (cap === -1) {
    return { allowed: true, used: 0, limit: -1, remaining: -1 };
  }
  const usage = await ensureFreshUsagePeriod(userId);
  const used = kind === 'analyze' ? usage.aiAnalyzeUsed : kind === 'adapt' ? usage.aiAdaptUsed : usage.aiAuditUsed;
  return {
    allowed: used < cap,
    used,
    limit: cap,
    remaining: Math.max(0, cap - used),
  };
}

/**
 * Incrementa o contador de uso apos uma chamada bem sucedida a IA.
 * Idempotente nao — chame uma vez por request concluido.
 */
export async function consumeAIUsage(userId: string, kind: UsageKind) {
  await ensureFreshUsagePeriod(userId);
  const data = { [fieldFor(kind)]: { increment: 1 } } as const;
  return prisma.user.update({ where: { id: userId }, data });
}

/**
 * Calcula quantos dias faltam ate a renovacao do plano.
 * Retorna null se o plano nao tem data de renovacao (ex: FREE vitalicio).
 */
export function daysUntilRenewal(planRenewsAt: Date | null | undefined, now: Date = new Date()): number | null {
  if (!planRenewsAt) return null;
  const diffMs = planRenewsAt.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
