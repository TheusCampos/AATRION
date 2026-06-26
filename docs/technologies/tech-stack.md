# Stack Tecnológica — Versões e Finalidades

> Catálogo oficial de **todas** as tecnologias do ATRION com versão alvo,
> papel no projeto e justificativa da escolha.

---

## 1. Frontend

| Tecnologia | Versão | Função | Justificativa |
|---|---|---|---|
| **Next.js** | `14.2.x` (App Router) | Framework principal | SSR/SSG nativo, API Routes no mesmo repo, ótimo SEO, deploy automático na Vercel |
| **TypeScript** | `5.x` | Tipagem estática | Type safety ponta a ponta com Prisma e Zod |
| **Tailwind CSS** | `3.x` | Estilização utilitária | Sem CSS externo, purge automático, zero runtime |
| **shadcn/ui** | `latest` (Radix UI) | Componentes base | Acessível, headless, sem bundle pesado, total controle de estilo |
| **Zustand** | `4.x` | Estado global | Leve (2kb), sem boilerplate, persiste editor state no localStorage |
| **React Query (TanStack)** | `5.x` | Server state | Sincronização servidor-cliente, invalidação automática, optimistic updates |
| **React Hook Form** | `7.x` | Formulários | Performance máxima, integra com Zod, validação em tempo real |
| **Zod** | `3.x` | Validação de schemas | Schemas TypeScript-first reutilizados no front e backend |
| **Framer Motion** | `11.x` | Animações | Micro-interações no editor, ATS Score gauge, transições |
| **@dnd-kit** | `6.x` | Drag & Drop | Tracker Kanban, reordenação de seções do currículo |
| **Lucide React** | `latest` | Ícones | Consistência visual, tree-shakeable |

---

## 2. Backend / API

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Next.js API Routes** | Endpoints REST | Handler por arquivo, Edge runtime para rotas leves, Node.js para Puppeteer |
| **Hono.js** | Microframework para API | Middleware enxuto, ótimo para composição de handlers |
| **Better Auth** | Autenticação completa | Email+senha, Google OAuth, GitHub OAuth, MFA TOTP, sessões em Neon |
| **Prisma ORM** | Acesso ao banco | Schema-first, migrações automáticas, client type-safe |
| **Zod** | Validação de input | Parsing e validação em todas as API Routes antes de tocar o banco |
| **Upstash Ratelimit** | Rate limiting | Sliding window por userId e por IP, configurável por endpoint |
| **@aws-sdk/client-s3** | Upload para R2 | SDK S3-compatível, signed URLs, multipart upload para PDFs grandes |
| **OpenAI SDK** | Chamadas de IA | Streaming de respostas para UX melhor no simulador |
| **Stripe SDK** | Pagamentos | Checkout, webhooks, portal do cliente, subscription management |
| **Resend SDK** | Emails transacionais | Templates React Email, deliverability alta, rastreamento |
| **otplib** | MFA TOTP | Geração de secret e validação de código TOTP (Google Authenticator) |
| **qrcode** | Geração de QR | QR Code do otpauth:// URL na ativação de MFA |

---

## 3. Banco de Dados

| Tecnologia | Função | Detalhe |
|---|---|---|
| **PostgreSQL 16** | Banco principal | Serverless via Neon, PITR, branching por PR |
| **Neon** | Hosting Postgres | Free tier 0.5GB / Pro US$19/mês com 30d retention |
| **Prisma 5** | ORM | Schema em `prisma/schema.prisma`, migrations versionadas |
| **pg_crypto** (extensão) | AES-256 nativo | Alternativa ao `node:crypto` para queries SQL diretas |

---

## 4. Cache e Rate Limiting

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Upstash Redis** | Cache + rate limit | Free tier 10k req/dia, 256MB |
| **Upstash Ratelimit** | Algoritmos | Sliding window, fixed window, token bucket |
| **Upstash QStash** | Fila serverless | Geração de PDF em background |

---

## 5. Armazenamento (Storage)

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Cloudflare R2** | Storage S3-compatível | PDFs, fotos de perfil, backups — 10GB free |
| **rclone** | Backup | Sincronização semanal entre buckets R2 |

---

## 6. Inteligência Artificial

| Tecnologia | Modelo | Uso | Custo |
|---|---|---|---|
| **OpenAI** | `gpt-4o-mini` | ATS Score, adaptação, carta, simulador, ideias de post | ~US$0,002–0,005/req |
| **OpenAI** | `gpt-4o` | Auditoria LinkedIn completa (análise pesada) | ~US$0,01/auditoria |
| **Groq (fallback)** | `llama-3.3-70b` | Features menos críticas no V2+ | US$0,59/1M tokens |

> Interface genérica `aiClient.complete(prompt)` abstrai o provedor.
> Trocar OpenAI → Groq é transparente para o resto do código.

---

## 7. Geração de PDF

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Puppeteer** | Renderiza HTML→PDF | Worker no Fly.io, 256MB free tier |
| **@react-pdf/renderer** | Fallback no cliente | Preview rápido, sem chamada de API |

> Puppeteer preserva CSS completo (gradientes, fontes, layouts complexos).

---

## 8. Pagamentos

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Stripe Checkout** | UI de pagamento | PCI compliant, sem implementar formulário de cartão |
| **Stripe Webhooks** | Eventos de assinatura | `customer.subscription.created`, `.updated`, `.deleted` |
| **Stripe Customer Portal** | Auto-serviço do cliente | Cancelar, atualizar cartão, baixar faturas |

---

## 9. Email

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Resend** | SMTP transacional | Free 3k/mês, React Email templates |
| **React Email** | Templates | Componentes TSX, preview em tempo real |
| **DNS SPF/DKIM/DMARC** | Deliverability | Configurar no domínio `cvforge.com.br` |

---

## 10. Segurança

| Tecnologia | Função | Detalhe |
|---|---|---|
| **bcrypt** | Hash de senhas | Rounds 12 (padrão Better Auth) |
| **AES-256-GCM** | Criptografia simétrica | Telefone, MFA secret (LGPD) |
| **Cloudflare Turnstile** | Anti-bot invisível | Substitui reCAPTCHA, gratuito |
| **Helmet / headers manuais** | Security headers | CSP, HSTS, X-Frame-Options, etc. via `middleware.ts` |

---

## 11. Monitoramento e Analytics

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Sentry** | Error tracking | Free 5k erros/mês |
| **Vercel Analytics** | Pageviews + Web Vitals | Incluído no plano Hobby |
| **PostHog** (opcional) | Product analytics | Eventos customizados, funis, feature flags |

---

## 12. Deploy e CI/CD

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Vercel** | Frontend + API | Hobby free, Pro US$20/mês para escala |
| **Fly.io** | Worker Puppeteer | Free 3 shared VMs, US$1,94/VM 256MB |
| **GitHub Actions** | CI: lint, typecheck, test, build | Em todo PR e merge na `main` |
| **Neon Branching** | DB por PR | Preview environments isolados |

---

## 13. Desenvolvimento Local

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Node.js** | Runtime | `>= 20.x` |
| **npm** | Package manager (padrão) | `>= 10.x` — disponível em qualquer ambiente Node |
| **Bun** | Package manager (alternativo) | `>= 1.1.x` — 10–30x mais rápido no install, runtime compatível com Node |
| **Docker + Postgres 16** | DB local | Mesmo schema do Neon |
| **Cursor** | IDE com IA | Autocomplete contextual, chat inline |
| **Bruno** | Cliente REST | Alternativa open-source ao Postman |
| **stripe-cli** | Webhooks locais | Simular webhooks sem ngrok |
| **Doppler** (opcional) | Env management | Sincroniza dev/prod |

---

## 14. Testes

| Tecnologia | Função | Detalhe |
|---|---|---|
| **Vitest** | Testes unitários | Rápido, compatível com TS, JSDOM |
| **@vitest/ui** | UI para Vitest | Debug visual |
| **Playwright** | Testes E2E | Fluxos críticos: login, criar CV, pagar, exportar PDF |
| **happy-dom** | Alternativa leve ao JSDOM | Para testes de componentes |

---

## 15. Qualidade de Código

| Tecnologia | Função | Detalhe |
|---|---|---|
| **ESLint** | Lint | `eslint-config-next` + plugins |
| **Prettier** | Formatação | `prettier-plugin-tailwindcss` para classes |
| **Husky** | Git hooks | Pre-commit lint + typecheck |
| **lint-staged** | Stage selective | Roda lint apenas nos arquivos modificados |
| **TypeScript strict** | Type safety | `strict: true`, sem `any` |

---

## 16. Custos por Fase

| Fase | Usuários | Custo Fixo/mês | Custo Variável | Total estimado |
|---|---|---|---|---|
| V1 — MVP | 0–100 | R$ 15 (Fly.io) | R$ 20–50 (OpenAI) | R$ 35–65 |
| V2 — Crescimento | 100–1.000 | R$ 50–100 | R$ 50–200 | R$ 100–300 |
| V3 — Escala inicial | 1k–5k | R$ 200–500 | R$ 200–600 | R$ 400–1.100 |
| V4 — Escala | 5k–20k | R$ 800–2.000 | Proporcional | R$ 1.000–3.000 |

---

## 17. Política de Atualização

- **Dependências com `^` (minor + patch):** atualizar mensalmente via Dependabot
- **Major versions (ex: Next 14 → 15):** avaliar caso a caso, branch dedicada
- **CVEs:** patch imediato em produção após triagem
- **Lockfile (`package-lock.json` para npm, `bun.lock` / `bun.lockb` para Bun):** sempre commitado. Escolha **um** gerenciador e mantenha consistência no time — não misture os dois no mesmo repositório.
