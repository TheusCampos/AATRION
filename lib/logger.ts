import { prisma } from './prisma';
import { headers } from 'next/headers';
import { captureServerEvent } from './posthog-server';

export type UserActionType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'VIEWED_DASHBOARD'
  | 'CREATED_RESUME'
  | 'EDITED_RESUME'
  | 'DELETED_RESUME'
  | 'VIEWED_JOBS'
  | 'RAN_LINKEDIN_AUDIT'
  | 'UPDATED_SETTINGS'
  | 'VIEWED_PRICING'
  | 'PLAN_UPGRADED'
  | 'PLAN_DOWNGRADED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PAYMENT_REFUNDED'
  | 'CHECKOUT_STARTED'
  | 'OTHER';

interface LogOptions {
  userId: string;
  action: UserActionType;
  details?: Record<string, unknown>;
}

export async function logUserAction({ userId, action, details }: LogOptions) {
  try {
    let ipAddress = null;
    let userAgent = null;

    try {
      const headersList = headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;
      userAgent = headersList.get('user-agent') || null;
    } catch {
      // headers() indisponível neste contexto
    }

    // Enviar evento ao PostHog
    captureServerEvent(userId, `user_action_${action.toLowerCase()}`, {
      action,
      ipAddress,
      userAgent,
      ...(details || {}),
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Falha ao gravar ActivityLog:', error);
  }
}

/**
 * SEC-FIX: Versão para contextos onde headers() não está disponível (webhooks).
 * Não tenta extrair IP/UserAgent — marca como ação do sistema.
 */
export async function logSystemAction({ userId, action, details }: LogOptions) {
  try {
    // Enviar evento ao PostHog
    captureServerEvent(userId, `system_action_${action.toLowerCase()}`, {
      action,
      userAgent: 'system/webhook',
      ...(details || {}),
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress: null,
        userAgent: 'system/webhook',
      },
    });
  } catch (error) {
    console.error('Falha ao gravar ActivityLog (system):', error);
  }
}

