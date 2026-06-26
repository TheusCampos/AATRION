# Stack Tecnológica — Resumo

> Lista de alto nível. Detalhes de versões e propósito estão em
> [`/docs/technologies/tech-stack.md`](../technologies/tech-stack.md).

| Camada | Tecnologia | Função |
|---|---|---|
| Frontend | **Next.js 14** (App Router) | Framework principal |
| Linguagem | **TypeScript 5** | Tipagem estática end-to-end |
| Estilização | **Tailwind CSS 3** + **shadcn/ui** | Utilitário + componentes headless |
| Estado cliente | **Zustand 4** + **React Query 5** | Cache local + server state |
| Formulários | **React Hook Form 7** + **Zod 3** | Validação performática |
| Backend | **Next.js API Routes** + **Hono.js** | REST + middleware enxuto |
| ORM | **Prisma 5** | Acesso type-safe ao banco |
| Banco de dados | **PostgreSQL** (Neon serverless) | Persistência principal |
| Auth | **Better Auth** | Email/senha + OAuth + MFA |
| Cache | **Upstash Redis** | Rate limit + cache de sessão |
| IA | **OpenAI GPT-4o mini** + **GPT-4o** | Currículos + LinkedIn |
| PDF | **Puppeteer** (Fly.io) | HTML → PDF de alta qualidade |
| Storage | **Cloudflare R2** | PDFs, fotos, backups |
| Pagamentos | **Stripe** | Subscriptions + Checkout |
| Email | **Resend** | Transacional + React Email |
| Erros | **Sentry** | Monitoramento |
| Anti-bot | **Cloudflare Turnstile** | CAPTCHA invisível |
| Testes | **Vitest** + **Playwright** | Unit + E2E |
| CI/CD | **GitHub Actions** + **Vercel** | Deploy automático |

> Ver tabela completa com versões, justificativas e custos em
> [`/docs/technologies/tech-stack.md`](../technologies/tech-stack.md).
