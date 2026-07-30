import { NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ratelimit: any = null;

function getRateLimiter(
  identifier: string,
  opts: { requests: number; windowSec: number }
) {
  const key = `${opts.requests}:${opts.windowSec}`;
  
  if (!_ratelimit) {
    _ratelimit = {};
  }

  if (_ratelimit[key]) {
    return _ratelimit[key];
  }

  try {
    // 1. Tenta usar o REDIS_URL padrão (ex: Redis Labs) com ioredis
    if (process.env.REDIS_URL) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Ratelimit } = require('@upstash/ratelimit');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require('ioredis');
      
      const ioredisClient = new Redis(process.env.REDIS_URL);
      
      // Adaptador para compatibilizar o ioredis com o que o @upstash/ratelimit espera
      const redisAdapter = {
        sadd: (key: string, ...members: string[]) => ioredisClient.sadd(key, ...members),
        eval: (script: string, keys: string[], args: unknown[]) => 
          ioredisClient.eval(script, keys.length, ...keys, ...(args as string[])),
        evalsha: (sha: string, keys: string[], args: unknown[]) => 
          ioredisClient.evalsha(sha, keys.length, ...keys, ...(args as string[])),
        get: (key: string) => ioredisClient.get(key),
        set: (key: string, value: string, opts?: { px?: number; ex?: number }) => {
          if (opts?.px) return ioredisClient.set(key, value, 'PX', opts.px);
          if (opts?.ex) return ioredisClient.set(key, value, 'EX', opts.ex);
          return ioredisClient.set(key, value);
        },
        del: (key: string) => ioredisClient.del(key),
      };

      _ratelimit[key] = new Ratelimit({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        redis: redisAdapter as any,
        limiter: Ratelimit.slidingWindow(opts.requests, `${opts.windowSec} s`),
        analytics: false,
        prefix: 'cvforge:rl',
      });
      return _ratelimit[key];
    }
    
    // 2. Fallback para UPSTASH_REDIS_REST_URL (Upstash Serverless)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Ratelimit } = require('@upstash/ratelimit');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Redis } = require('@upstash/redis');

      _ratelimit[key] = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(opts.requests, `${opts.windowSec} s`),
        analytics: false,
        prefix: 'cvforge:rl',
      });
      return _ratelimit[key];
    }
  } catch (error) {
    console.error('[RateLimit] Erro ao inicializar o cliente Redis:', error);
    return null;
  }

  // Fallback in-memory
  return null;
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function checkInMemoryLimit(identifier: string, opts: { requests: number; windowSec: number }): RateLimitResult {
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;
  const key = `${identifier}:${opts.requests}:${opts.windowSec}`;
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit: opts.requests, remaining: opts.requests - 1, reset: now + windowMs };
  }

  if (entry.count >= opts.requests) {
    return { success: false, limit: opts.requests, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, limit: opts.requests, remaining: opts.requests - entry.count, reset: entry.resetAt };
}

export async function checkRateLimit(
  identifier: string,
  opts: { requests: number; windowSec: number }
): Promise<{ allowed: true } | { allowed: false; response: NextResponse }> {
  const limiter = getRateLimiter(identifier, opts);

  try {
    const result: RateLimitResult = limiter
      ? await limiter.limit(identifier)
      : checkInMemoryLimit(identifier, opts);

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
    // SEC-FIX: Fail-closed — bloqueia se o sistema de rate limit falhar
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Serviço temporariamente indisponível. Tente novamente em instantes.' },
        { status: 503 }
      ),
    };
  }
}

export const RATE_LIMITS = {
  ai: { requests: 5, windowSec: 60 },
  upload: { requests: 10, windowSec: 60 },
  jobs: { requests: 30, windowSec: 60 },
  checkout: { requests: 3, windowSec: 60 },
  general: { requests: 30, windowSec: 60 },
} as const;
