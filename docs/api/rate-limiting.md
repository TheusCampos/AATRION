# Rate Limiting

> Proteção contra abuso, controle de custos (IA, PDF) e garantia de
> disponibilidade. Implementado com **Upstash Ratelimit** + Redis serverless.

## Algoritmos Utilizados

| Algoritmo | Quando usar |
|---|---|
| **Fixed Window** | Endpoints com limite rígido por período (ex: logins/15min) |
| **Sliding Window** | Distribuição mais suave (ex: cadastros/hora) |
| **Token Bucket** | Custos por uso variável (ex: chamadas IA) |

## Limites por Endpoint

### Autenticação

| Endpoint | Algoritmo | Limite | Penalidade |
|---|---|---|---|
| `POST /api/auth/sign-in/email` | Fixed Window | 5 tentativas / 15min por IP+email | Bloquear IP por 30min |
| `POST /api/auth/sign-up/email` | Sliding Window | 10 cadastros / hora por IP | Turnstile obrigatório após 3 |
| `POST /api/auth/forget-password` | Fixed Window | 3 / hora por IP | Bloquear |
| `POST /api/auth/reset-password` | Fixed Window | 5 / hora por IP | Bloquear |
| `POST /api/auth/verify-email` | Fixed Window | 5 tentativas / 15min | Bloquear |
| `POST /api/auth/send-verification-email` | Fixed Window | 3 / hora | Bloquear |
| `POST /api/auth/mfa/verify` | Fixed Window | 5 tentativas / 10min | Bloquear conta 30min |

### Currículos

| Endpoint | Algoritmo | Limite |
|---|---|---|
| `GET /api/resumes` | Sliding Window | 200 req / min por userId |
| `POST /api/resumes` | Fixed Window | 10 criações / hora (Free: bloqueia 4º) |
| `PATCH /api/resumes/[id]` | Sliding Window | 60 saves / min (debounce no FE protege) |
| `GET /api/resumes/[id]` | Sliding Window | 200 req / min |

### ATS Score

| Endpoint | Plano | Limite | Reset |
|---|---|---|---|
| `POST /api/ats/analyze` | Free | 3 análises | Mensal |
| `POST /api/ats/analyze` | Pro Mensal | ∞ | — |
| `POST /api/ats/analyze` | Pro Anual | ∞ | — |

> Chave Redis: `ats:${userId}:${YYYY-MM}`

### IA

| Endpoint | Plano | Limite | Reset |
|---|---|---|---|
| `POST /api/ai/adapt-to-job` | Pro Mensal | 20 | Mensal |
| `POST /api/ai/adapt-to-job` | Pro Anual | ∞ | — |
| `POST /api/ai/cover-letter` | Pro Mensal | 10 | Mensal |
| `POST /api/ai/cover-letter` | Pro Anual | ∞ | — |
| `POST /api/ai/simulator` | Pro Mensal | 5 | Mensal |
| `POST /api/ai/simulator` | Pro Anual | ∞ | — |
| `POST /api/ai/improve` | Pro | 50 | Mensal |

> Chave Redis: `${feature}:${userId}:${YYYY-MM}`

### LinkedIn

| Endpoint | Plano | Limite | Reset |
|---|---|---|---|
| `POST /api/linkedin/audit` | Free | 1 | Mensal |
| `POST /api/linkedin/audit` | Pro Mensal | 5 | Mensal |
| `POST /api/linkedin/audit` | Pro Anual | ∞ | — |

### PDF

| Endpoint | Plano | Limite | Reset |
|---|---|---|---|
| `POST /api/pdf/generate` | Todos | 20 PDFs | Diário (UTC) |

### Candidaturas

| Endpoint | Plano | Limite |
|---|---|---|
| `POST /api/applications` | Free | 5 vagas ativas (Encerrado não conta) |
| `POST /api/applications` | Pro | ∞ |

## Implementação

```ts
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const ratelimit = {
  // Auth
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '15 m'),
    prefix: 'login',
  }),
  signup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'signup',
  }),
  mfa: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, '10 m'),
    prefix: 'mfa',
  }),

  // API
  resumes: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 m'),
    prefix: 'resumes',
  }),

  // IA — mensais (chave dinâmica)
  aiAdapt: (userId: string) => new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(20, '1 month', 20),
    prefix: `ai:adapt:${userId}:${currentMonth()}`,
    ephemeralCache: new Map(),
  }),

  // PDF
  pdf: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(20, '1 d'),
    prefix: 'pdf',
  }),
};
```

## Uso em uma API Route

```ts
// app/api/ai/adapt-to-job/route.ts
import { ratelimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return unauthorized();

  // Rate limit por feature + user
  const { success, limit, remaining, reset } = await ratelimit.aiAdapt(session.user.id).limit(session.user.id);
  if (!success) {
    return Response.json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Você atingiu o limite mensal de adaptações.',
        details: { limit, resetAt: new Date(reset).toISOString() },
      },
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  // ... lógica
}
```

## Resposta 429 Padronizada

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Você atingiu o limite mensal de auditorias LinkedIn.",
    "details": {
      "limit": 1,
      "resetAt": "2026-07-01T00:00:00Z"
    }
  }
}
```

**Headers:**

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1722998400
Retry-After: 864000
```

## Quando NÃO Aplicar

- **Stripe webhooks** — já validados por assinatura
- **Health check** — sem custo
- **Páginas públicas** (`/api/public/*`) — rate limit por IP, mais permissivo (60/min)

## Bypass (Admin)

```ts
// lib/auth.ts
const ADMIN_USER_IDS = env.ADMIN_USER_IDS.split(',');

export async function bypassRateLimit(userId: string): Promise<boolean> {
  return ADMIN_USER_IDS.includes(userId);
}
```

> Apenas para owner + devs em produção para debugging.

## Monitoramento

Dashboard interno monitora:
- Taxa de 429 por endpoint (alvo: < 0,1%)
- Latência de Upstash (alvo: < 10ms p95)
- Custo de Upstash vs receita

> Ver [`/docs/architecture/security.md`](../../architecture/security.md#3-rate-limiting-granular-upstash-redis) para visão de segurança.
