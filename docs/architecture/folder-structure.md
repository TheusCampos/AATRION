# Estrutura de Pastas

> Convenção para o **monorepo do ATRION**. Backend + Frontend + Tipos no mesmo
> repositório. Cada pasta tem um `README.md` próprio explicando seu conteúdo.

## Visão geral

```
cvforge/
├── app/                # Next.js 14 App Router (rotas, layouts, API)
├── components/         # Componentes React (UI, editor, ats, linkedin, ...)
├── lib/                # Clientes, helpers, regras de negócio
├── prisma/             # Schema + migrations + seed
├── public/             # Assets estáticos servidos pelo Next
├── styles/             # CSS global, tokens, animações
├── tests/              # Vitest (unit/integration) + Playwright (E2E)
├── scripts/            # Scripts utilitários (extract-docx, seed, backup)
├── types/              # Tipagens TS compartilhadas
├── docs/               # 📚 Documentação organizada por domínio
├── .projeto/           # Documentos de planejamento originais (.docx)
├── .env.example        # Modelo de variáveis de ambiente
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

## `app/` — Next.js 14 App Router

```
app/
├── (marketing)/                 # Páginas públicas (sem auth)
│   ├── page.tsx                 # Landing page
│   ├── pricing/page.tsx
│   ├── blog/[slug]/page.tsx
│   └── templates/[id]/page.tsx  # SEO — templates indexáveis
│
├── (auth)/                      # Login, cadastro, MFA
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── verify-email/page.tsx
│   └── mfa/page.tsx
│
├── (app)/                       # Área autenticada (com sidebar)
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── editor/
│   │   ├── [id]/page.tsx
│   │   └── [id]/versions/page.tsx
│   ├── ats/[id]/page.tsx
│   ├── linkedin/
│   │   ├── page.tsx
│   │   └── [auditId]/page.tsx
│   ├── applications/page.tsx
│   ├── templates/page.tsx
│   └── profile/page.tsx
│
├── api/                         # API Routes REST
│   ├── auth/[...all]/route.ts
│   ├── resumes/
│   │   ├── route.ts             # GET list, POST create
│   │   └── [id]/
│   │       ├── route.ts         # GET, PUT, DELETE
│   │       └── versions/route.ts
│   ├── ats/analyze/route.ts
│   ├── ai/
│   │   ├── adapt-to-job/route.ts
│   │   ├── cover-letter/route.ts
│   │   ├── improve/route.ts
│   │   └── simulator/route.ts
│   ├── linkedin/
│   │   ├── audit/route.ts
│   │   └── [auditId]/route.ts
│   ├── pdf/generate/route.ts
│   ├── upload/route.ts
│   ├── stripe/
│   │   ├── checkout/route.ts
│   │   └── webhook/route.ts
│   └── applications/route.ts
│
├── cv/[slug]/page.tsx           # Página pública do currículo (Pro)
├── layout.tsx                   # Root layout (html, body, providers)
├── page.tsx                     # Redireciona ou landing
├── error.tsx
├── not-found.tsx
└── globals.css
```

**Convenções de Route Groups:**
- `(marketing)` — sem sidebar, sem auth
- `(auth)` — layout minimalista para foco em formulários
- `(app)` — layout com sidebar persistente, exige auth

## `components/`

```
components/
├── ui/                  # shadcn/ui base (Button, Input, Dialog, ...)
├── editor/              # Editor de currículo
│   ├── steps/           # PersonalStep, ExperienceStep, ...
│   ├── StepNav.tsx
│   ├── ResumePreview.tsx
│   ├── ATSScorePanel.tsx
│   └── AIAssistPanel.tsx
├── ats/                 # Gauge, breakdown, issues
├── linkedin/            # Auditoria, score cards
├── resume-templates/    # Templates HTML para Puppeteer
├── applications/        # Kanban board
├── shared/              # Header, Sidebar, Footer
└── marketing/           # Hero, Pricing, FAQ
```

**Convenção:** `index.ts` em cada subpasta (barrel export) para simplificar imports.

## `lib/`

```
lib/
├── auth.ts              # Config Better Auth
├── prisma.ts            # Singleton PrismaClient
├── openai.ts            # Cliente OpenAI + helpers
├── r2.ts                # Cloudflare R2
├── stripe.ts            # Stripe + webhooks
├── resend.ts            # Email transacional
├── crypto.ts            # AES-256-GCM
├── ats.ts               # Lógica de scoring ATS
├── linkedin-parser.ts   # Extração de dados
├── rate-limit.ts        # Upstash helpers
├── audit.ts             # Log de auditoria
├── pdf/
│   ├── client.ts        # Cliente HTTP Puppeteer
│   └── queue.ts         # BullMQ / QStash
├── validations/         # Schemas Zod por domínio
└── utils/               # cn, formatCurrency, ...
```

**Convenção:** `lib/` nunca importa de `app/`, `components/` ou `types/`.
É a **única camada** que conhece provedores externos (OpenAI, Stripe, R2, ...).

## `prisma/`

```
prisma/
├── schema.prisma        # Schema principal
├── migrations/          # Versionadas por prisma migrate
├── seed.ts              # Templates, planos, exemplos
└── client.ts            # Re-export opcional
```

## `tests/`

```
tests/
├── unit/                # Vitest — funções puras
├── integration/         # Vitest — com DB (branch Neon de teste)
├── e2e/                 # Playwright — fluxos completos
│   ├── auth.spec.ts
│   ├── resume-creation.spec.ts
│   ├── pdf-export.spec.ts
│   ├── stripe-checkout.spec.ts
│   └── linkedin-audit.spec.ts
└── fixtures/            # Dados e mocks
```

## `docs/`

```
docs/
├── README.md            # Índice geral
├── architecture/        # Como o sistema é construído
├── features/            # O que o sistema faz
├── flows/               # Fluxos de usuário + processos
├── functions/           # Catálogo de funções
├── technologies/        # Stack com versões
├── roadmap/             # Sprints por versão
└── api/                 # Endpoints da API
```

## Regras de organização

1. **Limite de profundidade:** 4 níveis (`app/(app)/editor/[id]/page.tsx` = 4).
2. **Co-localização:** Componentes usados por apenas uma rota ficam em `_components/` dentro da rota.
3. **Barrel exports:** Cada pasta de domínio com 3+ arquivos exporta via `index.ts`.
4. **Sem `any`:** TypeScript estrito. Tipos compartilhados em `types/`.
5. **Sem lógica em rotas:** Rotas são finas — chamam helpers de `lib/`.
6. **Sem CSS inline:** Tokens em `styles/tokens.css`, classes em `components/`.
7. **Server vs Client:** `'use client'` **só** quando necessário (estado, efeitos, eventos).
