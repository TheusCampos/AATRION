/**
 * Rate limiter centralizado usando @upstash/ratelimit + @upstash/redis.
 *
 * Configurações:
 *   - UPSTASH_REDIS_REST_URL  (obrigatória em produção)
 *   - UPSTASH_REDIS_REST_TOKEN (obrigatória em produção)
 *
 * Em desenvolvimento, se as credenciais não estiverem configuradas,
 * o rate limiter é permissivo (noop) para não bloquear dev.
 */

import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ratelimit: any = null;

function getRateLimiter(
  identifier: string,
  opts: { requests: number; windowSec: number }
) {
  // Se já temos o módulo carregado e as credenciais existem, usar Upstash
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Ratelimit } = require('@upstash/ratelimit');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require('@upstash/redis');

      if (!_ratelimit) {
        _ratelimit = {};
      }

      const key = `${opts.requests}:${opts.windowSec}`;
      if (!_ratelimit[key]) {
        _ratelimit[key] = new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(opts.requests, `${opts.windowSec} s`),
          analytics: false,
          prefix: 'cvforge:rl',
        });
      }

      return _ratelimit[key];
    } catch {
      // Fallback: sem rate limiting se o módulo falhar
      return null;
    }
  }

  // Dev sem Upstash: sem rate limiting
  return null;
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Verifica rate limit para um identificador (userId, IP, etc).
 * Retorna { success: true } se permitido, ou uma NextResponse 429 se bloqueado.
 */
export async function checkRateLimit(
  identifier: string,
  opts: { requests: number; windowSec: number }
): Promise<{ allowed: true } | { allowed: false; response: NextResponse }> {
  const limiter = getRateLimiter(identifier, opts);

  if (!limiter) {
    // Sem limiter configurado (dev) → permitir
    return { allowed: true };
  }

  try {
    const result = await limiter.limit(identifier);

    if (!result.success) {
      return {
        allowed: false,
        response: NextResponse.json(
          {
            error: 'Muitas requisições. Tente novamente em alguns instantes.',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': String(result.remaining),
            },
          }
        ),
      };
    }

    return { allowed: true };
  } catch (err) {
    // Se o Redis falhar, permitir a request (fail-open)
    console.error('[RateLimit] Erro ao verificar rate limit:', err);
    return { allowed: true };
  }
}

/**
 * Limites predefinidos por tipo de endpoint.
 */
export const RATE_LIMITS = {
  /** Endpoints de IA (caros): 5 req/min por usuário */
  ai: { requests: 5, windowSec: 60 },
  /** Upload de arquivos: 10 req/min por usuário */
  upload: { requests: 10, windowSec: 60 },
  /** Busca de vagas: 30 req/min por IP */
  jobs: { requests: 30, windowSec: 60 },
  /** Checkout/portal Stripe: 3 req/min por usuário */
  checkout: { requests: 3, windowSec: 60 },
  /** CRUD geral (resumes, settings): 30 req/min por usuário */
  general: { requests: 30, windowSec: 60 },
} as const;
