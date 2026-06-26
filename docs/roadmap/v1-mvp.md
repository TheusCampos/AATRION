# V1 — MVP (Semanas 1–4)

> **Objetivo único:** ter um produto funcional com pagamento em 30 dias.
> Nada de perfeito — apenas funcional o suficiente para alguém pagar R$29.

## Meta de Saída

- ✅ 1º pagamento real em até 30 dias do início do desenvolvimento
- ✅ 5 usuários Pro confirmados

## Sprint 1 — Fundação (Semana 1)

**Tema:** Setup, auth, banco, deploy inicial.

| # | Tarefa | Esforço | Prioridade | Status |
|---|---|---|---|---|
| 1 | Setup Next.js 14 + TypeScript + Tailwind + shadcn/ui | 1d | 🔴 Crítico | ⏳ |
| 2 | Configurar Neon (PostgreSQL) + Prisma schema inicial | 1d | 🔴 Crítico | ⏳ |
| 3 | Better Auth: email+senha + Google OAuth | 2d | 🔴 Crítico | ⏳ |
| 4 | Deploy na Vercel com CI/CD via GitHub Actions | 1d | 🔴 Crítico | ⏳ |
| 5 | Variáveis de ambiente com Doppler ou .env documentado | 0.5d | 🔴 Crítico | ⏳ |
| 6 | Cloudflare R2: bucket + cliente configurado | 0.5d | 🔴 Crítico | ⏳ |

## Sprint 2 — Editor e Dashboard (Semana 2)

**Tema:** Núcleo do produto — criar e editar currículo.

| # | Tarefa | Esforço | Prioridade | Status |
|---|---|---|---|---|
| 7 | Dashboard: listagem de currículos + CRUD básico | 1.5d | 🔴 Crítico | ⏳ |
| 8 | Editor: Steps 1 e 2 (Dados Pessoais + Experiência) | 2d | 🔴 Crítico | ⏳ |
| 9 | Preview em tempo real (Zustand state + template Classic) | 1.5d | 🔴 Crítico | ⏳ |
| 10 | Autosave com debounce de 2s | 0.5d | 🔴 Crítico | ⏳ |
| 11 | Upload de foto para R2 (Step 1) | 0.5d | 🟠 Alto | ⏳ |

## Sprint 3 — Templates, PDF e ATS (Semana 3)

**Tema:** Produto diferenciador + exportação.

| # | Tarefa | Esforço | Prioridade | Status |
|---|---|---|---|---|
| 12 | Editor: Steps 3–4 (Formação + Habilidades) | 1d | 🔴 Crítico | ⏳ |
| 13 | Templates Modern e Minimal (+ Classic existente) | 1.5d | 🔴 Crítico | ⏳ |
| 14 | Galeria de templates com seleção de cor | 1d | 🔴 Crítico | ⏳ |
| 15 | Puppeteer no Fly.io: geração de PDF | 1.5d | 🔴 Crítico | ⏳ |
| 16 | ATS Score básico via OpenAI (sem vaga específica) | 1.5d | 🔴 Crítico | ⏳ |

## Sprint 4 — Pagamento e Landing (Semana 4)

**Tema:** Monetização e aquisição.

| # | Tarefa | Esforço | Prioridade | Status |
|---|---|---|---|---|
| 17 | Stripe Checkout: planos Free/Pro mensal/Pro anual | 1.5d | 🔴 Crítico | ⏳ |
| 18 | Webhook Stripe: atualizar plan no banco | 1d | 🔴 Crítico | ⏳ |
| 19 | LinkedIn Audit V1: input manual de texto | 2d | 🟣 Muito Alto | ⏳ |
| 20 | Landing page: hero, pricing, CTA, depoimentos placeholder | 1.5d | 🔴 Crítico | ⏳ |
| 21 | Email: verificação + boas-vindas + upgrade (Resend) | 1d | 🟠 Alto | ⏳ |
| 22 | Completeness score do currículo (0–100) | 0.5d | 🟡 Médio | ⏳ |

**Total V1:** ~27 dias de desenvolvimento para 1 dev experiente com IA assistindo.

## O que NÃO Construir no V1

> Disciplina é a chave do MVP.

- ❌ ATS Score por vaga (V2)
- ❌ Adaptação de CV por vaga (V2)
- ❌ Todos os templates Pro (V2)
- ❌ MFA (V2)
- ❌ Analytics (V2)
- ❌ Tracker de candidaturas (V2)
- ❌ Carta de apresentação e simulador (V2)
- ❌ Link público do currículo (V3)
- ❌ Blog e SEO de templates (V3)

## Definition of Done — V1

- [ ] Usuário consegue se cadastrar, verificar email e logar
- [ ] Usuário consegue criar, editar e salvar um currículo
- [ ] Preview em tempo real reflete mudanças a cada keystroke
- [ ] Autosave funciona a cada 2s sem perder dados
- [ ] Usuário pode escolher entre 3 templates e 3 paletas de cor
- [ ] Usuário consegue exportar PDF (com marca d'água se Free)
- [ ] ATS Score geral retorna score 0–100 com breakdown
- [ ] Usuário Free pode colar texto do LinkedIn e receber auditoria básica
- [ ] Stripe Checkout funciona (testado com `stripe-cli`)
- [ ] Webhook Stripe atualiza `users.plan = 'PRO'`
- [ ] Landing page tem pricing, FAQ e CTA
- [ ] Email de verificação e boas-vindas são enviados
- [ ] Mobile responsivo (dashboard + landing)
- [ ] Security headers configurados
- [ ] HTTPS em produção (Vercel garante)

## Checklist Pré-Lançamento

Veja [`/docs/architecture/security.md`](../architecture/security.md#8-checklist-de-segurança-para-go-live) e [`/docs/roadmap/checklist-lancamento.md`](./checklist-lancamento.md) (a criar).

## Métricas de Validação

| Métrica | Meta V1 |
|---|:---:|
| Visitantes → cadastros | > 5% |
| Cadastros → 1º PDF | > 30% |
| Usuários ativos que usam ATS | > 40% |
| Conversão Free → Pro | > 2% |
| Tempo até 1º pagante | < 30 dias |
| NPS | > 30 |

## Pós-Lançamento (Semana 5+)

- Coletar feedback dos primeiros 5 pagantes
- Priorizar bugs e fricções
- Iniciar V1.1 (polimento)
- Validar hipóteses de uso real

> Detalhes em [`v1.1-polish.md`](./v1.1-polish.md).
