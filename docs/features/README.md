# 🧩 Funcionalidades

> Catálogo de **tudo** que o ATRION faz ou fará. Cada funcionalidade tem uma
> página própria com especificação detalhada, regras de negócio, gate de plano
> e onde tocar no código.

## Índice

### Geração de Currículo
- 📝 [**Editor de Currículo**](./resume-editor.md) — 7 steps + preview em tempo real + autosave
- 🎨 [**Templates**](./templates.md) — 10 templates (3 Free + 7 Pro)

### Inteligência Artificial
- 📊 [**ATS Score**](./ats-score.md) — Análise 0–100 com breakdown por 6 dimensões
- 🎯 [**Adaptação por Vaga**](./job-adapter.md) — IA reescreve CV para uma vaga específica
- 💌 [**Carta de Apresentação**](./cover-letter.md) — Geração de carta personalizada
- 👀 [**Simulador de Recrutador**](./recruiter-simulator.md) — Feedback como RH experiente

### LinkedIn
- 🔍 [**Auditor de LinkedIn**](./linkedin-auditor.md) — Análise 0–100 com benchmarking + ideias de post

### Organização
- 📌 [**Tracker de Candidaturas**](./application-tracker.md) — Kanban drag-and-drop
- 🔗 [**Link Público do CV**](./public-resume.md) — Compartilhar currículo via URL

### Conta e Pagamento
- 🔐 [**Autenticação**](./authentication.md) — Email/senha, OAuth (Google + GitHub), MFA TOTP
- 💳 [**Billing**](./billing.md) — Stripe Checkout, webhooks, 3 planos

---

## Matriz de Funcionalidades × Plano

| Funcionalidade | Free | Pro Mensal | Pro Anual |
|---|:---:|:---:|:---:|
| Criar currículo | ✅ Até 3 | ✅ Ilimitado | ✅ Ilimitado |
| Templates básicos (3) | ✅ | ✅ | ✅ |
| Templates Pro (7) | ❌ | ✅ | ✅ |
| Exportar PDF | ⚠️ Com marca d'água | ✅ Sem marca d'água | ✅ |
| ATS Score geral | ✅ 3x/mês | ✅ Ilimitado | ✅ |
| ATS Score por vaga | ❌ | ✅ | ✅ |
| Adaptação de CV por vaga | ❌ | ✅ 20x/mês | ✅ Ilimitado |
| Carta de apresentação | ❌ | ✅ 10x/mês | ✅ |
| Simulador de recrutador | ❌ | ✅ 5x/mês | ✅ |
| Auditoria LinkedIn | ✅ 1x/mês | ✅ 5x/mês | ✅ Ilimitado |
| Ideias de post LinkedIn | ❌ | ✅ 5 por auditoria | ✅ |
| LinkedIn Optimizer Chat | ❌ | ❌ | ✅ Exclusivo |
| Upload de CV existente | ❌ | ✅ | ✅ |
| Tracker de candidaturas | ✅ 5 vagas | ✅ Ilimitado | ✅ |
| Link público do CV | ❌ | ✅ | ✅ |
| MFA (TOTP) | Opcional | Opcional | Opcional |
| Suporte | Comunidade | Email 48h | Email 24h |

---

## Roadmap Resumido

| Versão | Funcionalidades incluídas |
|---|---|
| **V1** (MVP) | Editor (steps 1–4) + 3 templates + PDF + Stripe + Landing + ATS básico + LinkedIn Audit (input manual) |
| **V1.1** | Polimento + Steps 5–7 + 1º template Pro + Sentry + rate limit + LGPD básico |
| **V2** | ATS por vaga + Adaptação por vaga + Carta + Simulador + 4 templates Pro + LinkedIn Audit com Proxycurl + Tracker + MFA |
| **V3** | SEO + Link público + Auditoria com histórico + Referral + Plano anual + Templates por área |
| **V4** | LinkedIn Optimizer Chat + Simulador de entrevista com voz + Portfólio + API pública + i18n |

> Detalhes em [`/docs/roadmap/`](../roadmap/).
