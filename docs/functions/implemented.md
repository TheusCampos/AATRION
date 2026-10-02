# Módulos principais implementados

| Local | Responsabilidade |
|---|---|
| `lib/auth.ts` | Sessão Clerk e sincronização do usuário local |
| `lib/prisma.ts` | Singleton Prisma |
| `lib/ai.ts` e `lib/openrouter.ts` | Provedores de IA e parse defensivo de JSON |
| `lib/plan.ts` | Planos, cotas e consumo atômico de IA |
| `lib/rate-limit.ts` | Janelas de limitação por usuário |
| `lib/sanitize.ts` | Sanitização de prompt e detecção de injection |
| `lib/validations/*` | Contratos Zod |
| `components/resume/ResumeEditor.tsx` | Editor, autosave, preview e exportação |
| `components/resume/templates/*` | Modelos de currículo |
| `app/api/resumes/*` | CRUD, importação e ações de IA |
| `app/api/linkedin/*` | Auditoria e extração de PDF |
| `app/api/stripe/*` e `app/api/webhooks/stripe` | Cobrança, portal e idempotência |
| `app/api/user/*` | Preferências e operações LGPD |

Consulte `docs/api/endpoints.md` para o mapa de handlers HTTP.