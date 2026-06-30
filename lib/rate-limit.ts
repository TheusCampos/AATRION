
import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ratelimit: any = null;

function getRateLimiter(
  identifier: string,
  opts: { requests: number; windowSec: number }
) {
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
      return null;
    }
  }

  return null;
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export async function checkRateLimit(
  identifier: string,
  opts: { requests: number; windowSec: number }
): Promise<{ allowed: true } | { allowed: false; response: NextResponse }> {
  const limiter = getRateLimiter(identifier, opts);

  if (!limiter) {
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
    console.error('[RateLimit] Erro:', err);
    return { allowed: true };
  }
}

export const RATE_LIMITS = {
  ai: { requests: 5, windowSec: 60 },
  upload: { requests: 10, windowSec: 60 },
  jobs: { requests: 30, windowSec: 60 },
  checkout: { requests: 3, windowSec: 60 },
  general: { requests: 30, windowSec: 60 },
} as const;
