# Tabela de Endpoints

> Lista completa dos endpoints HTTP do ATRION.

## Legenda

- 🔓 **Público** — não requer autenticação
- 🔐 **Sessão** — requer cookie de sessão
- 💎 **Pro** — requer plano Pro (Mensal ou Anual)
- 🆓 **Free ok** — disponível para usuários Free (com limites)
- 🚦 **Rate limited** — ver [`rate-limiting.md`](./rate-limiting.md)

## Autenticação (`/api/auth/*`)

> Handled by Better Auth. Customizado em `app/api/auth/[...all]/route.ts`.

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| POST | `/api/auth/sign-up/email` | 🔓 | Cadastro com email/senha |
| POST | `/api/auth/sign-in/email` | 🔓 | Login email/senha |
| POST | `/api/auth/sign-in/social` | 🔓 | OAuth (Google/GitHub) |
| POST | `/api/auth/sign-out` | 🔐 | Logout |
| POST | `/api/auth/forget-password` | 🔓 | Solicita reset |
| POST | `/api/auth/reset-password` | 🔓 | Confirma reset com token |
| POST | `/api/auth/verify-email` | 🔐 | Verifica código 6 dígitos |
| POST | `/api/auth/send-verification-email` | 🔐 | Reenvia código |
| GET | `/api/auth/get-session` | 🔐 | Sessão atual |
| POST | `/api/auth/mfa/enable` | 🔐 | Inicia setup de TOTP |
| POST | `/api/auth/mfa/verify` | 🔐 | Confirma código TOTP |
| POST | `/api/auth/mfa/disable` | 🔐 | Desativa MFA |

## Currículos (`/api/resumes/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/resumes` | 🔐 | 200/min | Lista currículos do usuário |
| POST | `/api/resumes` | 🔐 | — | Cria novo currículo |
| GET | `/api/resumes/[id]` | 🔐 | — | Detalhes de um currículo |
| PUT | `/api/resumes/[id]` | 🔐 | — | Atualiza currículo completo |
| PATCH | `/api/resumes/[id]` | 🔐 | — | Atualiza parcialmente (autosave) |
| DELETE | `/api/resumes/[id]` | 🔐 | — | Exclui currículo |
| POST | `/api/resumes/[id]/duplicate` | 🔐 | — | Duplica currículo |
| GET | `/api/resumes/[id]/versions` | 🔐 | — | Versões adaptadas por vaga |
| POST | `/api/resumes/[id]/versions` | 🔐 💎 | — | Cria nova versão (adaptação) |
| POST | `/api/resumes/[id]/versions/[jobVersionId]/accept` | 🔐 💎 | — | Aceita versão como currículo |

## ATS Score (`/api/ats/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/ats/analyze` | 🔐 🆓 | 3/mês Free, ∞ Pro | Análise ATS (geral ou por vaga) |
| GET | `/api/ats/history/[resumeId]` | 🔐 | — | Histórico de análises |

## IA (`/api/ai/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/ai/adapt-to-job` | 🔐 💎 | 5/min | Adapta CV para uma vaga |
| POST | `/api/ai/cover-letter` | 🔐 💎 | 5/min | Gera carta de apresentação |
| POST | `/api/ai/simulator` | 🔐 💎 | 5/min | Feedback como recrutador |
| POST | `/api/ai/improve` | 🔐 💎 | 5/min | Sugere melhoria em uma seção |

## LinkedIn (`/api/linkedin/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/linkedin/audit` | 🔐 🆓 | 5/min | Inicia auditoria |
| GET | `/api/linkedin/audit/[id]` | 🔐 | — | Polling de status |
| GET | `/api/linkedin/audits` | 🔐 | — | Histórico de auditorias |
| POST | `/api/linkedin/audit/[id]/share` | 🔐 | — | Compartilhar relatório |

## PDF (`/api/pdf/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/pdf/generate` | 🔐 🆓 | 20/dia | Enfileira geração de PDF |
| GET | `/api/pdf/exports/[id]` | 🔐 | — | Polling de status + download URL |
| GET | `/api/pdf/exports` | 🔐 | — | Histórico de exports |

## Upload (`/api/upload/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/upload/photo` | 🔐 | 10/min | Upload de foto de perfil (R2 signed URL) |
| POST | `/api/upload/resume` | 🔐 💎 | 10/min | Upload de CV existente (PDF) |
| POST | `/api/upload/parse-pdf` | 🔐 💎 | 10/min | Extrai texto de PDF enviado |

## Arquivos (`/api/files/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/files/[...key]` | 🔐 | — | Serve arquivos do R2 (exige propriedade do arquivo) |

## Vagas (`/api/jobs/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/jobs` | 🔐 | 30/min | Busca vagas na Adzuna (texto sem HTML) |

## Stripe (`/api/stripe/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/stripe/checkout` | 🔐 | — | Cria sessão de checkout |
| POST | `/api/stripe/portal` | 🔐 | — | Cria sessão do Customer Portal |
| POST | `/api/stripe/webhook` | 🔐 Stripe | ∞ | Recebe eventos (verifica assinatura) |

## Candidaturas (`/api/applications/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/applications` | 🔐 | — | Lista candidaturas (Kanban) |
| POST | `/api/applications` | 🔐 🆓 | 5 Free, ∞ Pro | Cria candidatura |
| GET | `/api/applications/[id]` | 🔐 | — | Detalhes |
| PATCH | `/api/applications/[id]` | 🔐 | — | Atualiza (status, notas) |
| DELETE | `/api/applications/[id]` | 🔐 | — | Exclui |

## Usuário (`/api/users/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/users/me` | 🔐 | — | Dados do usuário atual |
| PATCH | `/api/users/me` | 🔐 | — | Atualiza perfil (nome, marketing) |
| DELETE | `/api/users/me` | 🔐 | — | Exclui conta (LGPD) |
| GET | `/api/users/me/data` | 🔐 | — | Exporta todos os dados (LGPD) |
| GET | `/api/users/me/billing` | 🔐 | — | Histórico de faturas |
| POST | `/api/users/me/change-email` | 🔐 | — | Inicia troca de email (requer MFA) |

## Públicas (`/api/public/*`)

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/public/resume/[slug]` | 🔓 | 60/min IP | Metadados do CV público |
| GET | `/api/public/templates` | 🔓 | — | Lista templates disponíveis |

## CV Público (`/cv/[slug]`)

> Não é API, mas página renderizada server-side.
> Contador de visualizações é incrementado via `POST /api/public/track-view`.

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| POST | `/api/public/track-view` | 🔓 | 60/min IP | Incrementa viewCount |
| POST | `/api/public/track-download` | 🔓 | 60/min IP | Incrementa downloadCount |

## Health Check

| Método | Endpoint | Auth | Rate | Descrição |
|---|---|---|---|---|
| GET | `/api/health` | 🔓 | — | `{ status: 'ok', version, timestamp }` |

## Resumo de Planos vs Endpoints

| Endpoint | Free | Pro Mensal | Pro Anual |
|---|:---:|:---:|:---:|
| `POST /api/resumes` | ✅ (até 3) | ✅ | ✅ |
| `POST /api/ats/analyze` | 3/mês | ∞ | ∞ |
| `POST /api/ai/adapt-to-job` | ❌ | 20/mês | ∞ |
| `POST /api/ai/cover-letter` | ❌ | 10/mês | ∞ |
| `POST /api/ai/simulator` | ❌ | 5/mês | ∞ |
| `POST /api/linkedin/audit` | 1/mês | 5/mês | ∞ |
| `POST /api/applications` | até 5 | ∞ | ∞ |
| `POST /api/pdf/generate` | 20/dia | 20/dia | 20/dia |
| `POST /api/stripe/checkout` | ✅ | — | — |

> Detalhes de autenticação e rate limit em [`authentication.md`](./authentication.md) e [`rate-limiting.md`](./rate-limiting.md).
