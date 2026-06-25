import { prisma } from './prisma';
import { headers } from 'next/headers';

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
  | 'OTHER';

interface LogOptions {
  userId: string;
  action: UserActionType;
  details?: Record<string, unknown>;
}

/**
 * Registra uma ação do usuário na tabela ActivityLog.
 * Tenta capturar o IP e o User-Agent a partir dos headers da requisição, se disponíveis.
 */
export async function logUserAction({ userId, action, details }: LogOptions) {
  try {
    let ipAddress = null;
    let userAgent = null;

    try {
      const headersList = headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || null;
      userAgent = headersList.get('user-agent') || null;
    } catch {
      // Ignorar erros caso headers() não possa ser chamado neste contexto (ex: rotas não-dinâmicas)
    }

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
    // Não vamos estourar um erro para o usuário se o log falhar
    console.error('Falha ao gravar ActivityLog:', error);
  }
}
