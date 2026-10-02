# Stack técnica atual

As versões abaixo vêm de `package.json`; use esse arquivo como fonte de verdade para upgrades.

| Categoria | Tecnologias | Uso no projeto |
|---|---|---|
| Framework | Next.js 16.3, React 18, TypeScript 6 | App Router, páginas, Route Handlers e tipagem estrita |
| UI | Tailwind CSS 3, Lucide, CVA, clsx | Interface e componentes reutilizáveis |
| Formulários | React Hook Form, Zod | Validação de entrada e formulários |
| Dados | Prisma 5, PostgreSQL | Persistência de usuários e conteúdo do produto |
| Auth | Clerk | Sessão, login e sincronização com a tabela `User` |
| IA | `@google/genai`, OpenRouter | Análise, adaptação, melhoria e extração de conteúdo |
| Storage | AWS SDK S3 + Cloudflare R2 | Fotos usadas nos currículos |
| Pagamentos | Stripe | Checkout, Portal e webhooks |
| Rate limit | Upstash Ratelimit/Redis ou ioredis | Proteção das rotas de maior custo |
| Telemetria | PostHog, OpenTelemetry, Traceloop | Eventos, traces e logs de IA |
| Testes | Vitest, Playwright | Unitários e E2E |

Não fazem parte da implementação atual: Better Auth, Hono, OpenAI SDK direto, Puppeteer/Fly.io, Resend, Sentry, Turnstile, QStash, React Email e Docker de banco. Podem ser avaliados futuramente, mas não devem ser configurados como pré-requisitos.