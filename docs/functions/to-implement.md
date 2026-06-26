# 🚧 Funções a Implementar

> Backlog completo de funções por **versão** e **sprint**, conforme planejado
> no [`/docs/roadmap/`](../roadmap/). Atualizado sempre que uma sprint é
> iniciada.

---

## V1 — MVP de Validação (Semanas 1–4)

> Meta: **primeiro pagante em 30 dias**.

### Sprint 1 — Fundação (Semana 1)
- ⏳ `app/layout.tsx` (root layout + providers)
- ⏳ `lib/prisma.ts` (singleton client)
- ⏳ `prisma/schema.prisma` (modelos User, Resume, Session, Account, Verification, Subscription, PdfExport, AIUsage, AuditLog básicos)
- ⏳ `lib/auth.ts` (Better Auth config — email/senha + Google + GitHub OAuth)
- ⏳ `app/api/auth/[...all]/route.ts` (handler Better Auth)
- ⏳ `app/(auth)/register/page.tsx` (form de cadastro com Turnstile)
- ⏳ `app/(auth)/login/page.tsx`
- ⏳ `app/(auth)/verify-email/page.tsx`
- ⏳ `lib/resend.ts` + `emails/verify-email.tsx` (template React Email)
- ⏳ `lib/r2.ts` (Cloudflare R2 client)
- ⏳ `lib/rate-limit.ts` (Upstash helpers)
- ⏳ `middleware.ts` (security headers + auth check)
- ⏳ CI/CD: `.github/workflows/ci.yml` (lint + typecheck + test)

### Sprint 2 — Editor e Dashboard (Semana 2)
- ⏳ `app/(app)/dashboard/page.tsx`
- ⏳ `app/api/resumes/route.ts` (GET list, POST create)
- ⏳ `app/api/resumes/[id]/route.ts` (GET, PUT, DELETE)
- ⏳ `components/editor/StepNav.tsx`
- ⏳ `components/editor/steps/PersonalStep.tsx`
- ⏳ `components/editor/steps/ExperienceStep.tsx`
- ⏳ `lib/validations/resume.ts` (Zod schemas)
- ⏳ `lib/utils/completeness.ts` (cálculo de completude)
- ⏳ `app/(app)/editor/[id]/page.tsx`
- ⏳ `components/editor/ResumePreview.tsx` (preview reativo)
- ⏳ `components/resume-templates/Classic/index.tsx` (template inicial)
- ⏳ `lib/hooks/useAutosave.ts` (debounce 2s + estado Zustand)
- ⏳ `components/upload/PhotoUpload.tsx`
- ⏳ `app/api/upload/route.ts` (signed URL para R2)

### Sprint 3 — Templates, PDF e ATS (Semana 3)
- ⏳ `components/resume-templates/Modern/index.tsx`
- ⏳ `components/resume-templates/Minimal/index.tsx`
- ⏳ `app/(app)/templates/page.tsx` (galeria com seleção de cor)
- ⏳ `lib/ats.ts` (scoring local — pré-filtro)
- ⏳ `app/api/ats/analyze/route.ts`
- ⏳ `components/ats/ATSScorePanel.tsx` (gauge animado)
- ⏳ `app/(app)/ats/[id]/page.tsx`
- ⏳ `lib/openai.ts` (cliente + helpers)
- ⏳ `lib/pdf/client.ts` (cliente HTTP do worker)
- ⏳ `worker/src/index.ts` (worker Puppeteer no Fly.io)
- ⏳ `worker/src/templates/*.ts` (renderizadores HTML)
- ⏳ `app/api/pdf/generate/route.ts`
- ⏳ `app/api/pdf/callback/route.ts`
- ⏳ `app/api/pdf/exports/[id]/route.ts` (polling)

### Sprint 4 — Pagamento e Landing (Semana 4)
- ⏳ `lib/stripe.ts` (cliente + helpers)
- ⏳ `app/api/stripe/checkout/route.ts`
- ⏳ `app/api/stripe/webhook/route.ts`
- ⏳ `app/api/stripe/portal/route.ts`
- ⏳ `app/(marketing)/page.tsx` (landing page)
- ⏳ `app/(marketing)/pricing/page.tsx`
- ⏳ `app/(app)/linkedin/page.tsx` (input URL ou texto)
- ⏳ `app/api/linkedin/audit/route.ts` (versão manual V1)
- ⏳ `app/api/linkedin/audit/[id]/route.ts` (polling)
- ⏳ `app/(app)/linkedin/[auditId]/page.tsx` (relatório)
- ⏳ `lib/utils/parseLinkedInText.ts` (parser local)
- ⏳ `lib/utils/completeness.ts` (score de completude do CV)
- ⏳ `emails/welcome.tsx`, `emails/subscription-welcome.tsx`
- ⏳ `prisma/seed.ts` (templates, planos, exemplos)

**Total V1:** ~50 funções/módulos críticos.

---

## V1.1 — Polimento (Semanas 5–6)

> Meta: **corrigir o que o feedback dos primeiros usuários apontar**.

- ⏳ `components/editor/steps/EducationStep.tsx`
- ⏳ `components/editor/steps/SkillsStep.tsx`
- ⏳ `components/editor/steps/ProjectsStep.tsx`
- ⏳ `components/editor/steps/LanguagesStep.tsx`
- ⏳ `components/editor/steps/CertificationsStep.tsx`
- ⏳ `components/resume-templates/Executive/index.tsx` (1º template Pro)
- ⏳ `components/onboarding/WelcomeModal.tsx`
- ⏳ `components/onboarding/ActivationChecklist.tsx`
- ⏳ `lib/sentry.ts` (inicialização Sentry)
- ⏳ `app/sitemap.ts` + `app/robots.ts` (SEO básico)
- ⏳ Páginas legais: `/privacy`, `/terms`
- ⏳ `app/api/users/me/route.ts` (DELETE conta, GET dados)
- ⏳ Testes E2E Playwright para fluxo principal

---

## V2 — Diferencial Competitivo (Semanas 7–12)

> Meta: **50 usuários Pro**. Só iniciar após ter 10+ pagantes no V1.

### V2-A — ATS Avançado + Adaptar (Semanas 7–8)
- ⏳ `components/ats/ATSScoreBreakdown.tsx`
- ⏳ `components/ats/KeywordsPanel.tsx`
- ⏳ `app/api/ai/adapt-to-job/route.ts`
- ⏳ `components/editor/JobAdaptationModal.tsx`
- ⏳ `components/editor/AdaptationDiff.tsx` (antes/depois)
- ⏳ `app/(app)/editor/[id]/versions/page.tsx`
- ⏳ `app/api/resumes/[id]/versions/route.ts`
- ⏳ `app/api/resumes/[id]/versions/[jobVersionId]/accept/route.ts`
- ⏳ `prisma/schema.prisma` (adicionar `JobVersion` + `AtsAnalysis`)

### V2-B — LinkedIn Audit Pro + Tracker (Semanas 9–10)
- ⏳ `lib/proxycurl.ts` (integração Proxycurl)
- ⏳ Refatorar `app/api/linkedin/audit/route.ts` (suporte a URL)
- ⏳ `lib/linkedin-parser.ts` (extração estruturada)
- ⏳ `components/linkedin/AuditReport.tsx`
- ⏳ `components/linkedin/SectionAccordion.tsx`
- ⏳ `components/linkedin/PostIdeasGrid.tsx`
- ⏳ `components/applications/KanbanBoard.tsx` (drag & drop)
- ⏳ `app/api/applications/route.ts`
- ⏳ `app/api/applications/[id]/route.ts`
- ⏳ `prisma/schema.prisma` (adicionar `Application`, `LinkedInAudit` com campos expandidos)

### V2-C — IA Avançada + Templates Pro (Semanas 11–12)
- ⏳ `app/api/ai/cover-letter/route.ts`
- ⏳ `app/api/ai/simulator/route.ts`
- ⏳ `app/api/ai/improve/route.ts`
- ⏳ `components/ai/AIPanel.tsx`
- ⏳ `components/resume-templates/Creative/index.tsx`
- ⏳ `components/resume-templates/Tech/index.tsx`
- ⏳ `components/resume-templates/Sales/index.tsx`
- ⏳ `components/resume-templates/Academic/index.tsx`
- ⏳ `lib/mfa.ts` (otplib + qrcode)
- ⏳ `app/(app)/profile/security/page.tsx` (MFA setup)
- ⏳ `lib/crypto.ts` (AES-256-GCM)
- ⏳ `lib/audit.ts` (helper de audit log)
- ⏳ `prisma/schema.prisma` (adicionar `CoverLetter`, `AuditLog`)

---

## V3 — Escala e Retenção (Semanas 13–20)

> Meta: **MRR R$ 10.000**. Foco em retenção e aquisição orgânica.

- ⏳ `app/(marketing)/blog/[slug]/page.tsx` (MDX)
- ⏳ `app/(marketing)/templates/[id]/page.tsx` (SEO indexável)
- ⏳ `app/(app)/profile/analytics/page.tsx` (analytics do link público)
- ⏳ `app/cv/[slug]/page.tsx` (página pública do currículo)
- ⏳ `app/api/cv/[slug]/route.ts`
- ⏳ `lib/seo/og-image.ts` (geração de OG image dinâmica)
- ⏳ Programa de referral (coupons Stripe)
- ⏳ Email sequence: 8 emails de ciclo de vida (Resend)
- ⏳ Histórico de auditorias LinkedIn + gráfico de evolução
- ⏳ Plano anual com destaque + discount
- ⏳ Templates por área (TI, Saúde, Direito, Engenharia)
- ⏳ MFA obrigatório para Pro (configurável por feature)

---

## V4 — Expansão (Mês 5+)

> Meta: **MRR R$ 50.000**. Expansão de mercado.

- ⏳ LinkedIn Optimizer Chat (conversa em tempo real)
- ⏳ Simulador de entrevista com voz (Web Speech API)
- ⏳ Portfólio online (mini-site pessoal)
- ⏳ Link rastreável com notificação de abertura
- ⏳ Integração direta com LinkedIn API
- ⏳ API pública para parceiros
- ⏳ Internacionalização (PT-BR / EN / ES)
- ⏳ Plano Times (RH/recrutadores)
- ⏳ Career Coach IA (chat personalizado)
- ⏳ Salary Benchmark (baseado em CV + LinkedIn)

---

## Legenda

| Status | Significado |
|---|---|
| ⏳ Planejada | No backlog, versão definida |
| 🔨 Em desenvolvimento | Em sprint atual |
| ✅ Implementada | Em produção, testada |
| ❌ Fora de escopo | Não será implementado nesta versão |
