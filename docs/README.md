# 📚 Documentação do ATRION

Bem-vindo à documentação oficial do **ATRION** — plataforma SaaS de currículos profissionais com IA + auditoria de LinkedIn.

> 📌 Toda a documentação está em **Markdown**, versionada junto com o código, e
> organizada por **domínio** (não por tipo de documento). Cada arquivo é pequeno,
> navegável e atualizado sempre que a feature correspondente muda.

## 🗂️ Índice

### 🏛️ [`architecture/`](./architecture/)
Documentos sobre **como o sistema é construído**.
- [`overview.md`](./architecture/overview.md) — Visão geral da arquitetura, princípios e diagrama de camadas
- [`tech-stack.md`](./architecture/tech-stack.md) — Stack tecnológica completa
- [`database-schema.md`](./architecture/database-schema.md) — Schema do banco (Prisma)
- [`security.md`](./architecture/security.md) — Segurança, criptografia, LGPD
- [`folder-structure.md`](./architecture/folder-structure.md) — Estrutura de pastas e convenções
- [`design-system.md`](./architecture/design-system.md) — Design tokens, componentes e estados de UI

### 🧩 [`features/`](./features/)
Documentação de **cada funcionalidade do produto**, separada por módulo.
- [`resume-editor.md`](./features/resume-editor.md) — Editor de currículo (7 steps + preview)
- [`templates.md`](./features/templates.md) — Catálogo de templates (Free e Pro)
- [`ats-score.md`](./features/ats-score.md) — Análise ATS (6 dimensões, 0–100)
- [`job-adapter.md`](./features/job-adapter.md) — Adaptação automática por vaga
- [`cover-letter.md`](./features/cover-letter.md) — Carta de apresentação com IA
- [`recruiter-simulator.md`](./features/recruiter-simulator.md) — Simulador de visão do recrutador
- [`linkedin-auditor.md`](./features/linkedin-auditor.md) — Auditoria de perfil LinkedIn
- [`application-tracker.md`](./features/application-tracker.md) — Tracker de candidaturas (Kanban)
- [`public-resume.md`](./features/public-resume.md) — Link público do currículo
- [`billing.md`](./features/billing.md) — Planos, checkout e webhooks Stripe
- [`authentication.md`](./features/authentication.md) — Login, OAuth, MFA, sessão

### 🔄 [`flows/`](./flows/)
**Fluxos completos** de usuário e processos internos, com diagramas Mermaid.
- [`README.md`](./flows/README.md) — Índice de fluxos
- [`user-onboarding.md`](./flows/user-onboarding.md) — Primeiro acesso
- [`resume-creation.md`](./flows/resume-creation.md) — Criar currículo do zero
- [`pdf-export.md`](./flows/pdf-export.md) — Exportar PDF
- [`job-adaptation.md`](./flows/job-adaptation.md) — Adaptar CV para vaga
- [`linkedin-audit.md`](./flows/linkedin-audit.md) — Auditar LinkedIn
- [`upgrade-flow.md`](./flows/upgrade-flow.md) — Free → Pro
- [`diagrams/`](./flows/diagrams/) — Diagramas reutilizáveis

### ⚙️ [`functions/`](./functions/)
Catálogo de **funções** (componentes, helpers, server actions, API handlers).
- [`README.md`](./functions/README.md) — Índice
- [`implemented.md`](./functions/implemented.md) — Funções implementadas (atualizado a cada release)
- [`to-implement.md`](./functions/to-implement.md) — Backlog de funções por versão

### 🛠️ [`technologies/`](./technologies/)
Tecnologias selecionadas com **versões** e **finalidade**.
- [`tech-stack.md`](./technologies/tech-stack.md) — Stack completo (frontend, backend, serviços)

### 🛣️ [`roadmap/`](./roadmap/)
Planejamento por **versão** e sprints detalhadas.
- [`README.md`](./roadmap/README.md) — Visão geral do roadmap
- [`v1-mvp.md`](./roadmap/v1-mvp.md) — V1 MVP (4 sprints, 30 dias)
- [`v1.1-polish.md`](./roadmap/v1.1-polish.md) — V1.1 Polimento
- [`v2-differential.md`](./roadmap/v2-differential.md) — V2 Diferencial competitivo
- [`v3-scale.md`](./roadmap/v3-scale.md) — V3 Escala e retenção
- [`v4-expansion.md`](./roadmap/v4-expansion.md) — V4 Expansão

### 🔌 [`api/`](./api/)
Especificação dos endpoints da API.
- [`README.md`](./api/README.md) — Visão geral
- [`endpoints.md`](./api/endpoints.md) — Tabela de endpoints
- [`authentication.md`](./api/authentication.md) — Auth e autorização
- [`rate-limiting.md`](./api/rate-limiting.md) — Rate limiting por endpoint

---

## 🧭 Como usar esta documentação

| Se você é... | Comece por... |
|---|---|
| **Desenvolvedor novo no projeto** | [`README.md`](../../README.md) → [`architecture/overview.md`](./architecture/overview.md) → [`architecture/folder-structure.md`](./architecture/folder-structure.md) |
| **Vai implementar uma feature nova** | [`features/`](./features/) da feature específica → [`flows/`](./flows/) → [`roadmap/`](./roadmap/) da versão |
| **Vai criar um endpoint** | [`api/endpoints.md`](./api/endpoints.md) + [`functions/to-implement.md`](./functions/to-implement.md) |
| **Vai mexer em schema/banco** | [`architecture/database-schema.md`](./architecture/database-schema.md) |
| **Vai mexer em UI/design** | [`architecture/design-system.md`](./architecture/design-system.md) + `features/...` correspondente |
| **Product Manager / Stakeholder** | [`features/`](./features/) + [`roadmap/`](./roadmap/) |

---

## 📐 Convenções

- Toda documentação é em **português (pt-BR)**.
- Diagramas complexos usam **Mermaid** (renderiza no GitHub, GitLab, VS Code).
- Tabelas com `| ... |` são preferidas a listas para dados estruturados.
- Código inline em ``` `backticks` ```, blocos em ``` ```lang ```.
- Mudanças em feature **exigem** atualizar o `features/`, `flows/` e o `CHANGELOG.md` da raiz.
