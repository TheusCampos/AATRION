# ATRION — Gerador de Currículos com IA

SaaS de currículos profissionais com IA, auditoria de LinkedIn e busca de vagas.
Construído com Next.js 14 (App Router), TypeScript, Prisma, Clerk e Gemini/OpenRouter.

---

## 1. Visão geral

O usuário se autentica, cria/edita currículos, roda análises com IA, adapta o
currículo para vagas específicas, audita seu LinkedIn e busca vagas reais
(Adzuna).

### Stack

- **Frontend:** Next.js 14 (App Router) + React + TailwindCSS + shadcn/ui
- **Auth:** Clerk (`@clerk/nextjs`)
- **DB / ORM:** Prisma 5 + SQLite (dev) — Postgres recomendado em produção
- **IA:** Google Gemini (padrão) com fallback para OpenRouter (`openrouter/free`)
- **Vagas:** Adzuna Jobs API
- **PDF:** `html2canvas` + `jsPDF` no client

---

## 2. Estrutura de pastas

```
app/
  (app)/                    # Area logada (AppLayout com header sticky)
    dashboard/              # Lista de curriculos
    editor/[id]/            # Editor + preview + acoes de IA
    jobs/                   # Busca de vagas (Adzuna)
    linkedin/               # Auditoria de LinkedIn
    settings/               # Configuracoes do usuario (plano, dados, IA, PDF)
  (auth)/
    login/[[...sign-in]]/   # Catch-all do Clerk SignIn
    register/[[...sign-up]]/# Catch-all do Clerk SignUp
  api/
    health/                 # GET /api/health
    jobs/                   # GET /api/jobs?q=...&location=...  (Adzuna)
    resumes/                # CRUD de curriculos
      [id]/analyze/         # POST -> analise do curriculo com IA
      [id]/adapt/           # POST -> adapta o curriculo a uma vaga
      import/               # POST -> importa de PDF/texto
    linkedin/audit/         # GET/POST + [id] GET/DELETE
    user/settings/          # GET / PUT -> configuracoes do usuario
  pricing/                  # Pagina publica de planos
  docs/                     # Documentacao interna (privada)
  page.tsx                  # Landing

lib/
  ai.ts                     # Wrapper Gemini + OpenRouter (com fallback)
  gemini.ts                 # Cliente Gemini
  openrouter.ts             # Cliente OpenRouter
  auth.ts                   # getCurrentUser() enriquecido com plano/uso
  plan.ts                   # Regras FREE / PRO / MAX + quotas mensais
  completeness.ts           # Calcula completude do curriculo (0-100)
  prisma.ts                 # Singleton do PrismaClient
  linkedin-analyzer.ts      # Analise heuristica de LinkedIn (V1)
  validations/              # Schemas Zod (resume, ai-resume, user-settings, ...)

components/
  resume/                   # Editor, preview, acoes de IA
  forms/LinkedInAuditForm.tsx
  ui/                       # Button, Card, Input (design system)

middleware.ts               # clerkMiddleware: protege rotas privadas
prisma/
  schema.prisma             # User, Resume, LinkedInAudit
  dev.db                    # Banco SQLite de desenvolvimento
```

---

## 3. Fluxos principais

### 3.1 Autenticação

- Middleware (`middleware.ts`) protege todas as rotas fora de `isPublicRoute`
  (`/`, `/login(.*)`, `/register(.*)`, `/api/webhooks(.*)`, `/api/jobs(.*)`).
- `getCurrentUser()` resolve o `clerkId` da sessão → Prisma:
  1. match por `clerkId`
  2. fallback por `email` (vincula conta pré-existente)
  3. cria novo usuário `plan: FREE`
- O objeto retornado vem **enriquecido** com `limits` e `usage` (contadores
  do mês corrente).

### 3.2 Planos e quotas

Toda a regra está centralizada em [lib/plan.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/lib/plan.ts).

| Plano | Preço     | Currículos | Análises IA/mês | Adaptações IA/mês | Auditorias LinkedIn/mês | PDF |
|-------|-----------|------------|-----------------|-------------------|-------------------------|-----|
| FREE  | R$ 0      | 3          | 2               | 1                 | 1                       | ✓   |
| PRO   | R$ 29/mês | 25         | 30              | 15                | 5                       | ✓   |
| MAX   | R$ 79/mês | ilimitado  | ilimitado       | ilimitado         | ilimitado               | ✓   |

Os contadores vivem em `User.aiAnalyzeUsed | aiAdaptUsed | aiAuditUsed` e
resetam automaticamente no primeiro uso de cada novo mês (campo
`aiUsagePeriod` no formato `YYYY-MM`).

### 3.3 Currículo (CRUD + IA)

- **Criar** `POST /api/resumes` — checa `user.limits.maxResumes` antes de gravar.
- **Ler / Atualizar / Deletar** `GET | PUT | DELETE /api/resumes/[id]`.
- **Analisar com IA** `POST /api/resumes/[id]/analyze` — chama
  `checkAIQuota('analyze')`, faz prompt agnóstico de área (ver
  `systemInstruction` no arquivo), persiste o `atsScore` e incrementa
  `aiAnalyzeUsed`.
- **Adaptar para vaga** `POST /api/resumes/[id]/adapt` — mesmo padrão com
  `checkAIQuota('adapt')`. A IA recebe o currículo e a vaga, devolve JSON
  com `id`s preservados. O backend faz **merge** (nunca sobrescreve
  cargos/empresas/datas/contatos). A cada adaptação a IA devolve
  `changesLog` exibido no modal.
- **Fallback de IA**: se Gemini e OpenRouter falharem, `/analyze` usa
  `heuristicFallback` (não consome tokens). `/adapt` retorna 502 porque
  precisa de reescrita real.

### 3.4 LinkedIn

- `POST /api/linkedin/audit` recebe o texto do perfil e roda
  `analyzeLinkedInProfile()` (heurística V1, com roadmap para LLM).
- `checkAIQuota('audit')` controla o limite mensal.
- Resultado serializado em `LinkedInAudit.result`.

### 3.5 Vagas (Adzuna)

- `GET /api/jobs?q=&location=&page=` proxya a Adzuna Jobs API.
- Requer `ADZUNA_APP_ID` e `ADZUNA_APP_KEY` no `.env`.
- Rota **pública** (não exige login) para permitir descoberta anônima.

---

## 4. Variáveis de ambiente

```env
# Banco
DATABASE_URL="file:./dev.db"

# Clerk (auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# IA - Gemini (padrao)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite

# IA - OpenRouter (fallback)
OPENROUTER_API_KEY=sk-or-v1-...
# (modelo padrao: "openrouter/free")

# Vagas (Adzuna)
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Configuração local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar o .env (copie o bloco acima)

# 3. Sincronizar schema do Prisma (cria/atualiza o SQLite)
npx prisma db push

# 4. Gerar o Prisma Client
npx prisma generate

# 5. Subir o servidor
npm run dev
# -> http://localhost:3000
```

### Build de produção

```bash
npm run build
npm start
```

---

## 6. Níveis de acesso e permissões

| Recurso                  | FREE | PRO | MAX |
|--------------------------|------|-----|-----|
| Criar currículo          | ✓ (3) | ✓ (25) | ✓ (∞) |
| Editar currículo         | ✓    | ✓   | ✓   |
| Exportar PDF             | ✓    | ✓   | ✓   |
| Análise com IA (mês)     | 2    | 30  | ∞   |
| Adaptação para vaga (mês)| 1    | 15  | ∞   |
| Auditoria LinkedIn (mês) | 1    | 5   | ∞   |
| Editar `/settings`       | ✓    | ✓   | ✓   |

Todas as checagens vivem em [lib/plan.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/lib/plan.ts). As rotas
`/api/*` chamam `checkAIQuota()` antes de gastar tokens e incrementam via
`consumeAIUsage()` somente após o sucesso.

---

## 7. Tela `/settings`

Acessível pelo botão ⚙️ no header (ao lado do avatar).

Seções:

1. **Seu plano** — código do plano, preço, data de início, **contador de dias
   para a renovação** (`daysUntilRenewal`) e CTA de upgrade.
2. **Dados pessoais** — nome, telefone, cargo pretendido, localização e
   LinkedIn. Atualiza a tabela `User`.
3. **Exportação em PDF** — toggle `allowPdfDownload` (esconde o botão
   "Baixar PDF" no editor quando desativado).
4. **Uso de IA** — três barras de progresso (análise, adaptação, auditoria)
   com cores semafóricas baseadas em `%` consumido e reset automático a
   cada mês.

---

## 8. Testes rápidos (smoke)

```bash
# Type-check completo
npx tsc --noEmit

# Healthcheck
curl http://localhost:3000/api/health
# -> {"status":"ok","name":"cvforge",...}

# (autenticado) ver configuracoes
curl -b cookies.txt http://localhost:3000/api/user/settings
```

---

## 9. Roadmap

- [ ] Migração SQLite → Postgres (trocar provider + `DATABASE_URL`)
- [ ] Stripe / Asaas para upgrade PRO / MAX
- [ ] V2 do `linkedin-analyzer` com LLM
- [ ] Compartilhamento público de currículo via link assinado
- [ ] Importação de PDF via LLM (parser de PDF mais robusto)
#   A A T R I O N  
 