# Endpoints implementados

Todos os handlers abaixo estão sob `/api/`. Salvo indicação contrária, exigem sessão Clerk e retornam JSON.

| Método | Rota | Descrição |
|---|---|---|
| GET, POST | `/api/resumes` | Lista e cria currículos do usuário |
| GET, PUT, DELETE | `/api/resumes/[id]` | Lê, atualiza ou exclui um currículo próprio |
| POST | `/api/resumes/[id]/analyze` | Gera análise ATS e atualiza a última nota |
| POST | `/api/resumes/[id]/adapt` | Sugere adaptação a uma vaga |
| POST | `/api/resumes/[id]/enhance` | Melhora o resumo profissional |
| POST | `/api/resumes/import` | Importa PDF/DOCX e cria currículo estruturado |
| GET, POST | `/api/linkedin/audit` | Lista ou cria auditorias LinkedIn |
| GET, DELETE | `/api/linkedin/audit/[id]` | Lê ou exclui uma auditoria própria |
| POST | `/api/linkedin/extract-pdf` | Extrai conteúdo de PDF para o fluxo LinkedIn |
| GET | `/api/jobs` | Busca vagas na Adzuna (`q`, `location`, `page`) |
| POST | `/api/upload` | Envia foto JPG, PNG ou WebP para R2 |
| GET | `/api/files/[...key]` | Recupera arquivo R2 autorizado |
| GET | `/api/stripe/checkout?plan=...` | Redireciona para Checkout Stripe |
| POST | `/api/stripe/portal` | Cria sessão do Customer Portal |
| POST | `/api/webhooks/stripe` | Recebe eventos Stripe assinados |
| GET, PUT | `/api/user/settings` | Lê e atualiza perfil, preferências e plano |
| GET | `/api/user/export` | Baixa exportação LGPD em JSON |
| DELETE | `/api/user/delete` | Exclui conta, dados locais e usuário Clerk |
| GET | `/api/health` | Health check público |
| GET | `/api/cron/cleanup` | Limpeza programada protegida por bearer secret |
| POST | `/api/posthog-ai-test` | Rota interna de teste de telemetria/IA |

## Contratos mais usados

### Criar currículo

`POST /api/resumes`

```json
{ "title": "Currículo de Ana", "templateId": "classic" }
```

### Atualizar currículo

`PUT /api/resumes/[id]` aceita `title`, `content`, `templateId` e `colorScheme`. O objeto `content` contém `personal`, `experience`, `education`, `skills`, `projects`, `languages` e `certifications`.

### Analisar ou adaptar

- `POST /api/resumes/[id]/analyze`: `{ "targetJob": "opcional, até 200 caracteres" }`
- `POST /api/resumes/[id]/adapt`: `{ "jobDescription": "mínimo 20 caracteres", "jobTitle": "opcional", "company": "opcional" }`

### Auditoria LinkedIn

`POST /api/linkedin/audit` exige `profileText` entre 100 e 40.000 caracteres. `profileUrl`, `area` e `targetJob` são opcionais.

> As rotas listadas em documentos antigos para tracker, currículo público, carta, simulador, versões de currículo ou `/api/auth/*` não existem no repositório atual.