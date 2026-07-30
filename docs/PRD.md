# PRD — ATRION (CVForge)
### Product Requirements Document — Versão 1.0
**Data:** 2026-06-17
**Autor:** Equipe de Desenvolvimento
**Status:** Em Desenvolvimento Ativo

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

**ATRION** (nome comercial: **CVForge**) é uma plataforma SaaS brasileira de geração, otimização e auditoria de currículos profissionais, integrada com análise de perfil LinkedIn e inteligência artificial generativa.

O produto permite que candidatos criem currículos profissionais de alto impacto, os adaptem automaticamente para vagas específicas, exportem em PDF de alta qualidade e auditem seus perfis LinkedIn — tudo com assistência de IA e insights de ATS (Applicant Tracking Systems).

### 1.2 Problema que Resolve

- Currículos genéricos que não se destacam em processos seletivos
- Falta de conhecimento sobre palavras-chave e requisitos de ATS
- Ausência de ferramentas integradas para currículo + LinkedIn
- Custo elevado de plataformas concorrentes (Zety: ~R$120/mês; Resume.io: ~R$60/mês)
- Dificuldade de adaptar o currículo para cada vaga

### 1.3 Solução

Uma plataforma all-in-one com:
- Editor de currículo em 7 etapas com preview em tempo real
- Análise de compatibilidade ATS com IA (0-100)
- Adaptação automática do currículo para vagas específicas
- Auditoria de perfil LinkedIn com insights acionáveis
- Exportação em PDF de alta qualidade
- Planos Free (gratuito) e Pro (R$29/mês ou R$197/ano)

### 1.4 Proposta de Valor

| Para candidatos | Para recruiters/HR |
|---|---|
| Currículo profissional em minutos | Candidatos melhor preparados |
| IA que otimiza para ATS | Currículos mais legíveis por sistemas |
| Análise LinkedIn integrada | Perfis LinkedIn mais profissionais |
| Custo 4x menor que concorrentes | — |

### 1.5 Modelo de Negócio

- **Freemium** com upgrade para Pro
- **Free:** 3 currículos, 1 análise/mês, auditoria LinkedIn limitada
- **Pro Mensal:** R$29/mês — ilimitado
- **Pro Anual:** R$197/ano (32% off) — ilimitado

---

## 2. Stack Tecnológica

### 2.1 Visão Geral da Arquitetura

| Camada | Tecnologia | Hosting | Status |
|---|---|---|---|
| **Frontend + SSR** | Next.js 14 (App Router) | Vercel | ✅ Ativo |
| **Estado Cliente** | Zustand + React Query | Browser | ✅ Ativo |
| **API** | Next.js API Routes | Vercel Functions | ✅ Ativo |
| **Autenticação** | Clerk Next.js SDK | Clerk | ✅ Ativo |
| **Banco de Dados** | Prisma ORM + SQLite (dev) / PostgreSQL (prod) | Local (dev) / Neon (prod) | ✅ Ativo |
| **IA — Currículos** | Gemini 2.5 Flash Lite (Primário) + GPT-4o-mini (Fallback Seguro) | API Externa (OpenRouter / OpenAI) | ✅ Ativo |
| **IA — LinkedIn** | Gemini 2.5 Flash Lite (Multimodal) + GPT-4o-mini (Fallback Seguro) | API Externa (OpenRouter / OpenAI) | ✅ Ativo |
| **Cache/Rate Limit** | Upstash Redis | Upstash | Dependente |
| **Upload de Arquivos** | AWS S3 + presigned URLs | AWS S3 | Dependente |
| **Rate Limiting API** | @upstash/ratelimit | Upstash | ⚠️ Dependência instalada, não integrada |
| **Validação** | Zod | — | ✅ Ativo |
| **UI Components** | shadcn/ui (Radix UI + Tailwind CSS) | — | ✅ Ativo |
| **Ícones** | Lucide React | — | ✅ Ativo |
| **Animações** | Framer Motion | — | ✅ Ativo |
| **Extração de Textos** | Gemini Multimodal (PDFs) / Mammoth (DOCX) | Server-side / API | ✅ Ativo (pdf-parse abandonado) |
| **PDF Generation** | html2canvas + jsPDF | Client-side | ✅ Ativo |
| **Email** | Resend | Resend | Dependente |
| **Pagamentos** | Stripe | Stripe | Dependente |
| **Monitoramento** | Sentry | Sentry | Dependente |

### 2.2 Estrutura de Pastas do Projeto

```
Gerador-curriculo-2.0/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── editor/[id]/
│   │   ├── jobs/
│   │   ├── linkedin/[id]/
│   │   ├── resumes/new/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── api/                      # API Routes (Serverless)
│   │   ├── health/
│   │   ├── jobs/
│   │   ├── linkedin/audit/
│   │   ├── resumes/[id]/{analyze,adapt}/
│   │   ├── resumes/{import}/
│   │   └── user/settings/
│   ├── docs/
│   ├── pricing/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── forms/
│   ├── resume/
│   └── ui/
├── lib/                          # Lógica de negócio
│   ├── ai.ts                     # Wrapper de IA (Gemini + OpenRouter)
│   ├── gemini.ts                 # Cliente Gemini
│   ├── openrouter.ts             # Cliente OpenRouter
│   ├── auth.ts                   # Integração Clerk
│   ├── prisma.ts                 # Instância Prisma
│   ├── plan.ts                   # Lógica de planos e limites
│   ├── plan.ts                   # Lógica de planos e limites
│   ├── linkedin-analyzer.ts       # Analisador de LinkedIn
│   ├── completeness.ts           # Cálculo de completude
│   ├── animations.ts
│   └── utils.ts
├── lib/validations/              # Schemas Zod
│   ├── resume.ts
│   ├── ai-resume.ts
│   ├── auth.ts
│   ├── linkedin.ts
│   └── user-settings.ts
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   ├── dev.db                    # SQLite local
│   └── migrations/
├── docs/                         # Documentação
├── public/                       # Assets estáticos
├── styles/
├── scripts/
├── tests/
├── types/
├── .env                          # Variáveis de ambiente (NÃO COMMITAR)
├── .env.example                  # Template de env
├── .gitignore
├── next.config.mjs
├── middleware.ts                 # Middleware Clerk
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 2.3 Dependências Principais

#### Production Dependencies
```json
{
  "@clerk/nextjs": "^5.7.6",
  "@prisma/client": "^5.22.0",
  "@tanstack/react-query": "^5.59.0",
  "@upstash/ratelimit": "^2.0.3",
  "@upstash/redis": "^1.34.0",
  "bcryptjs": "^3.0.3",
  "framer-motion": "^11.18.2",
  "html2canvas": "^1.4.1",
  "jspdf": "^4.2.1",
  "lucide-react": "^0.451.0",
  "next": "14.2.15",
  "openai": "^4.67.0",
  "stripe": "^17.2.0",
  "tailwindcss": "^3.4.13",
  "zod": "^3.23.8",
  "zustand": "^4.5.5"
}
```

#### Development Dependencies
```json
{
  "@playwright/test": "^1.48.0",
  "@types/bcryptjs": "^2.4.6",
  "eslint": "^8.57.1",
  "eslint-config-next": "^14.2.15",
  "husky": "^9.1.6",
  "lint-staged": "^15.2.10",
  "prettier": "^3.3.3",
  "prisma": "^5.22.0",
  "tsx": "^4.19.1",
  "typescript": "6.0.3",
  "vitest": "^2.1.0"
}
```

---

## 3. Funcionalidades Implementadas

### 3.1 Core Features

#### 3.1.1 Editor de Currículo (7 Steps)
**Path:** `app/(app)/editor/[id]/page.tsx`
**Componente:** `components/resume/ResumeEditor.tsx`

| Step | Campos | IA Helper |
|------|--------|-----------|
| 1. Dados Pessoais | Nome, email, telefone, cidade, cargo pretendido, LinkedIn, GitHub, website, resumo, foto | ✨ Sugerir resumo |
| 2. Experiência | Empresa, cargo, período, descrição, conquistas | ✨ Sugerir verbos de ação |
| 3. Formação | Instituição, curso, nível, período, descrição | Destacar cursos relevantes |
| 4. Habilidades | Tags com autocomplete, nível (basic/intermediate/advanced) | ✨ Sugerir habilidades faltantes |
| 5. Projetos | Nome, descrição, tecnologias, URL | Reformular descrição |
| 6. Idiomas | Idioma, nível | — |
| 7. Certificações | Nome, emissor, data, URL | Listar certificações valorizadas |

**Características:**
- Preview em tempo real (lado a lado)
- Autosave com debounce de 2 segundos
- Indicadores de status (idle/saving/saved/error)
- Suporte a múltiplos templates (Classic, Modern, Minimal)
- Esquema de cores customizável
- Zoom do preview
- Score de completude em tempo real

**Validação:** Zod schemas em `lib/validations/resume.ts`

#### 3.1.2 Análise ATS com IA
**Path:** `app/api/resumes/[id]/analyze/route.ts`

- Score ATS de 0-100
- Análise de 6 dimensões:
  - Clareza e redação
  - Impacto e resultados (métricas)
  - Compatibilidade ATS
  - Completude das seções
  - Coerência de cargo alvo
  - Diferenciais (certificações, idiomas)
- Sugestões de melhoria priorizadas
- Correções antes/depois
- Exemplos de reescrita
- Palavras-chave faltantes
- Dicas práticas de ATS

**Providers de IA:**
- Google Gemini 2.5 Flash Lite (preferencial)
- OpenRouter (fallback)
- Heurístico (fallback final)

#### 3.1.3 Adaptação para Vaga
**Path:** `app/api/resumes/[id]/adapt/route.ts`

- Adaptação automática do currículo para descrição de vaga
- Preserva IDs e dados originais
- Reescreve descrições com palavras-chave da vaga
- Adiciona habilidades relevantes
- Gera log de alterações
- Mantém nome, email, telefone intactos

#### 3.1.4 Importação de Currículo
**Path:** `app/api/resumes/import/route.ts`

- Upload de arquivos PDF e DOCX
- Extração de texto via pdf-parse e mammoth
- Estruturação automática com IA
- Fallback para texto bruto em caso de falha

#### 3.1.5 Auditoria de LinkedIn
**Path:** `app/api/linkedin/audit/route.ts`

- Input manual (colar texto do perfil)
- Análise de 8 seções:
  1. Foto de perfil (peso 10%)
  2. Foto de capa (peso 5%)
  3. Headline (peso 20%)
  4. About/resumo (peso 15%)
  5. Experiências (peso 20%)
  6. Habilidades (peso 10%)
  7. Recomendações (peso 10%)
  8. Atividade/posts (peso 10%)
- Score geral 0-100
- Sugestões acionáveis por seção
- Ideias de posts para LinkedIn
- Métricas básicas (caracteres, palavras, links)

#### 3.1.6 Busca de Vagas
**Path:** `app/api/jobs/route.ts`

- Integração com API Adzuna (Brasil)
- Busca por cargo, localização e palavras-chave
- Exibição de resultados com link direto para vaga
- Requisição autenticada

#### 3.1.7 Dashboard
**Path:** `app/(app)/dashboard/page.tsx`

- Lista de currículos do usuário
- Cards com preview, score ATS, data
- Quick actions (editar, excluir, duplicar)
- Status do plano e limites de uso de IA

### 3.2 Sistema de Planos e Limites

**Planos Implementados:**
- **FREE:** 3 currículos, 5 análises/mês, 3 adaptações/mês, 1 auditoria/mês
- **PRO:** Currículos ilimitados, análises/adaptações/auditorias ilimitadas

**Implementação:** `lib/plan.ts`

```typescript
type PlanCode = 'FREE' | 'PRO' | 'MAX';

interface PlanLimits {
  maxResumes: number;
  maxAnalyzePerMonth: number;
  maxAdaptPerMonth: number;
  maxAuditPerMonth: number;
  allowPdfDownload: boolean;
  allowPublicLink: boolean;
  allowSettings: boolean;
  allowJobSearch: boolean;
}
```

### 3.3 Autenticação

**Provider:** Clerk Next.js SDK
**Implementação:** `lib/auth.ts`, `middleware.ts`

- Login com email/senha
- OAuth (Google — configurado)
- Proteção de rotas via middleware
- Rotas públicas: `/`, `/login`, `/register`, `/api/webhooks`, `/api/jobs`
- Todas as outras rotas requerem autenticação

---

## 4. Modelo de Dados

### 4.1 Schema Prisma

```prisma
model User {
  id                 String    @id @default(cuid())
  clerkId            String?   @unique
  email              String    @unique
  name               String
  plan               String    @default("FREE")
  planStartedAt      DateTime?
  planRenewsAt       DateTime?
  phone              String?
  jobTitle           String?
  location           String?
  linkedinUrl        String?
  allowPdfDownload   Boolean   @default(true)
  aiAnalyzeUsed      Int       @default(0)
  aiAdaptUsed        Int       @default(0)
  aiAuditUsed        Int       @default(0)
  aiUsagePeriod      String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  resumes            Resume[]
  audits             LinkedInAudit[]
  @@index([plan])
}

model Resume {
  id          String   @id @default(cuid())
  userId      String
  title       String
  content     String   // JSON string
  templateId  String   @default("classic")
  colorScheme String   @default("blue")
  atsScore    Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model LinkedInAudit {
  id          String   @id @default(cuid())
  userId      String
  profileUrl  String?
  profileText String
  area        String?
  targetJob   String?
  status      String   @default("done")
  overallScore Int     @default(0)
  result      String   @default("{}")
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

---

## 5. API Endpoints

### 5.1 Endpoints Públicos

| Método | Path | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/health` | Health check | ❌ |

### 5.2 Endpoints Autenticados

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/resumes` | Listar currículos do usuário |
| POST | `/api/resumes` | Criar novo currículo |
| POST | `/api/resumes/import` | Importar de PDF/DOCX |
| GET | `/api/resumes/[id]` | Obter currículo específico |
| PUT | `/api/resumes/[id]` | Atualizar currículo |
| DELETE | `/api/resumes/[id]` | Deletar currículo |
| POST | `/api/resumes/[id]/analyze` | Analisar com IA |
| POST | `/api/resumes/[id]/adapt` | Adaptar para vaga |
| GET | `/api/linkedin/audit` | Listar auditorias LinkedIn |
| POST | `/api/linkedin/audit` | Criar auditoria LinkedIn |
| GET | `/api/linkedin/audit/[id]` | Obter auditoria específica |
| DELETE | `/api/linkedin/audit/[id]` | Deletar auditoria |
| GET | `/api/jobs` | Buscar vagas (Adzuna) |
| GET | `/api/user/settings` | Obter configurações do usuário |
| PUT | `/api/user/settings` | Atualizar configurações |

### 5.3 CORS Configuration

```javascript
// next.config.mjs
headers: [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: 'https://cvforge.com.br' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
    ],
  },
]
```

---

## 6. Fluxos de Usuário

### 6.1 Fluxo de Criação de Currículo

```
Usuário → Dashboard → "Novo Currículo" → 7 Steps do Editor → Preview PDF → Download/Salvar
                                    ↓
                          Análise ATS (opcional)
                                    ↓
                          Adaptação para Vaga (opcional)
```

### 6.2 Fluxo de Auditoria LinkedIn

```
Usuário → LinkedIn Page → Cola texto do perfil → Seleciona área/alvo → "Auditar"
                                     ↓
                           Processamento com IA
                                     ↓
                           Relatório detalhado + Score
                                     ↓
                           Sugestões + ideias de posts
```

### 6.3 Fluxo de Adaptação para Vaga

```
Currículo existente → "Adaptar para vaga" → Cole descrição da vaga → IA adapta
                                     ↓
                           Review das alterações (log)
                                     ↓
                           Aplicar ou Descartar
```

---

## 7. Segurança e Compliance

### 7.1 Autenticação e Autorização

- ✅ Clerk SDK para autenticação
- ✅ Middleware protegendo rotas
- ✅ Verificação de propriedade em todas as operações de dados
- ✅ Schemas Zod para validação de input

### 7.2 Proteção de Dados

- ✅ Dados armazenados com Prisma ORM
- ✅ Índices para performance
- ✅ Soft delete consideration (não implementado)
- ⚠️ LGPD: documentação existente, implementação pendente

### 7.3 Headers de Segurança

- ❌ CSP (Content-Security-Policy) — não configurado
- ❌ HSTS — não configurado
- ❌ X-Frame-Options — não configurado
- ❌ X-Content-Type-Options — não configurado

### 7.4 Vulnerabilidades Identificadas (Audit 2026-06-17)

**CRÍTICA:**
- Segredos em `.env` (Gemini API Key, OpenRouter Key, Adzuna Keys, Clerk Keys)
- 4 vulnerabilidades CRITICAL em dependências (Next.js DoS, Happy-DOM RCE)
- 14 vulnerabilidades HIGH em dependências

**ALTA:**
- XSS em `dangerouslySetInnerHTML` sem sanitização (jobs page)
- Rate limiting não implementado nos endpoints

**MÉDIA:**
- 7 vulnerabilidades MODERATE em dependências
- Headers de segurança ausentes

---

## 8. Features Planejadas (Roadmap)

### v1.1 — Polish
- [ ] Webhooks Stripe para billing
- [ ] Customer Portal para gestão de assinatura
- [ ] MFA TOTP completo
- [ ] Links públicos de currículo
- [ ] Notifications in-app

### v2.0 — Diferencial Competitivo
- [ ] LinkedIn Auditoria via Proxycurl API
- [ ] Simulador de Recrutador com IA
- [ ] Carta de Apresentação com IA
- [ ] Cover Letter Generator
- [ ] Application Tracker (Kanban)

### v3.0 — Escala
- [ ] Migração para PostgreSQL (Neon)
- [ ] Worker Puppeteer no Fly.io para PDFs
- [ ] Cache de prompts de IA
- [ ] CDN para assets estáticos

### v4.0 — Expansão
- [ ] API oficial para integrações
- [ ] Multi-idioma
- [ ] Team/Enterprise plan
- [ ] LinkedIn Official API integration

---

## 9. Métricas e KPIs

### 9.1 Produto
- Taxa de conversão Free → Pro
- Número de currículos criados por usuário
- Score ATS médio dos currículos
- Tempo médio de criação de currículo

### 9.2 Técnico
- Uptime da API
- Tempo de resposta p95
- Taxa de erro de IA (fallback para heurístico)
- Score Lighthouse (Performance, Accessibility, SEO)

### 9.3 Negócio
- MRR (Monthly Recurring Revenue)
- Churn rate
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| **ATS** | Applicant Tracking System — software usado por empresas para rastrear candidatos |
| **ATS Score** | Score de 0-100 que estima compatibilidade do currículo com ATS |
| **Clerk** | Provider de autenticação (替代 NextAuth) |
| **Prisma** | ORM para TypeScript/Node.js |
| **Zod** | Biblioteca de validação de schemas TypeScript-first |
| **Gemini** | Google Generative AI — modelo de linguagem usado para análise |
| **OpenRouter** | Aggregador de LLMs gratuito |
| **Upstash** | Redis serverless para cache e rate limiting |
| **LGPD** | Lei Geral de Proteção de Dados (Brasil) |
| **GDPR** | General Data Protection Regulation (EU) |
| **MFA/TOTP** | Autenticação multi-fator com código temporal |
| **Webhook** | Callback HTTP para eventos assíncronos |
| **Fallback** | Estratégia alternativa quando a principal falha |
| **Prompt Injection** | Tentativa de manipular comportamento de IA via input malicioso |
| **DOMPurify** | Biblioteca de sanitização de HTML |

---

## 11. Referências

- Documentação: `docs/`
- Schema do banco: `prisma/schema.prisma`
- API endpoints: `app/api/`
- Testes: `tests/`
- Security Audit: `docs/security-audit-2026-06-17.md`
- Code Review: `docs/code-review-2026-06-17.md`

---

## 12. Testes de Segurança

### 12.1 Suite de Testes

O projeto inclui uma suite completa de testes de segurança:

```
tests/
├── unit/
│   └── security-validation.test.ts  # 12 testes unitários
└── e2e/
    ├── security-xss.spec.ts         # 12 testes E2E
    └── playwright.security.config.ts
```

### 12.2 Comandos

```bash
# Rodar todos os testes
npm test

# Testes de segurança E2E
npx playwright test --config=tests/playwright.security.config.ts
```

### 12.3 Coverage de Vulnerabilidades

| Vulnerabilidade | Testes | Status |
|-----------------|--------|--------|
| FR-01: Prompt Injection | Unit + E2E | ✅ |
| FR-02: Prompt Injection | Unit | ✅ |
| FR-03: XSS | E2E | ✅ |
| FR-04: CSP Fraco | E2E | ✅ |
| FR-05: CORS | E2E | ✅ |
| FR-06: Rate Limiting | E2E | ✅ |
| FR-07: AI Validation | Unit | ✅ |
| FR-08: Summary Validation | Unit | ✅ |
| FR-09: File Upload | Unit | ✅ |
| FR-10: HTML Sanitization | Unit | ✅ |
| FR-12: Path Traversal | Unit | ✅ |
| FR-15: Query Params | Unit | ✅ |

---

*Documento atualizado em: 2026-06-17*
