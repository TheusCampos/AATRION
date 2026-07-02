# Segurança

> Nível de **produção comercial**. Cobre autenticação, autorização, criptografia,
> rate limiting, headers HTTP, auditoria, backup e conformidade LGPD.

## 1. Autenticação e Controle de Acesso (Clerk)

| Camada | Implementação | Detalhe |
|---|---|---|
| **Senha** | Gerenciada pelo Clerk | Hash seguro na infra do provedor, sem contato direto com nosso DB |
| **Sessão** | Clerk Middleware | Protege rotas sensíveis e APIs. Injeção de `userId` nos requests |
| **OAuth** | Google | Delegado ao provider |
| **Roles** | Implementação local (DB) | Coluna `role` no banco (`USER` ou `ADMIN`), validada no servidor |
| **Verificação** | Email/Senhas OTP via Clerk | Sem complexidade local, garantido pelo provedor de Auth |

### Fluxo de Controle Admin

Somente usuários com o campo `role` definido como `ADMIN` no banco de dados podem acessar rotas em `app/admin`. O Clerk bloqueia usuários não autenticados, e nosso código verifica a permissão logo em seguida.

## 2. Anti-Bot (Cloudflare Turnstile)

Substitui reCAPTCHA: sem fricção para o usuário, mais eficaz contra bots, **gratuito sem limites**.

Aplicado em:
- Cadastro de conta
- Login
- Reset de senha
- Formulário de contato
- Auditoria LinkedIn (V2+)

## 3. Rate Limiting Granular (Upstash Redis)

| Endpoint | Algoritmo | Limite | Penalidade |
|---|---|---|---|
| `POST /api/ai/*` | Sliding Window | Limite ajustável | HTTP 429 + `Retry-After` |
| `POST /api/upload/*` | Sliding Window | Limite ajustável | HTTP 429 |
| `POST /api/stripe/webhook`| Idempotência local | Ilimitado | Validação de Assinatura e Eventos Únicos (`ProcessedEvent`) |

## 4. Headers HTTP de Segurança

Aplicados em **todas** as rotas via `next.config.mjs`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src` / `style-src`: Permite `unsafe-inline`, `js.stripe.com`, `clerk.accounts.dev`
  - `img-src`: Permite blob, data, Cloudflare R2, LinkedIn media, Clerk.
  - `connect-src`: Stripe, Clerk, Adzuna, OpenRouter AI.
  - `frame-src`: Stripe, Clerk.

## 4.1. Prevenção de XSS e Vazamentos

- Renderização de conteúdo de terceiros passa por sanitização.
- Erros internos detalhados gerados por libs não são expostos em JSON no ambiente de produção.
- Rotas de visualização de arquivos via R2 (`/api/files/[...key]`) validam a autenticação da sessão e propriedade conferindo se a URL `/photos/{userId}/` pertence ao usuário logado.
- Os webhooks da Stripe garantem **Idempotência**, impedindo execução duplicada de atualizações de conta via tabela `ProcessedEvent`.

## 5. Criptografia de Dados Pessoais

```ts
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, encrypted, tag].map(b => b.toString('hex')).join(':');
}

export function decrypt(payload: string): string {
  const [ivHex, encHex, tagHex] = payload.split(':');
  const decipher = createDecipheriv('aes-256-gcm', KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final()
  ]).toString('utf8');
}
```

> Rotação de chave possível via **double-encryption** durante migração
> (criptografa com chave nova + mantém criptografia antiga por janela de transição).

### Mascaramento de PII em Prompts

Todos os envios de currículo para modelos de IA através da API (como Análise ou Adaptação) realizam mascaramento de Identificadores Pessoais (PII). Campos sensíveis, como E-mail e Telefone, são previamente omitidos pelo backend para evitar vazamento em logs de provedores (ex: OpenRouter / OpenAI).

## 6. Trilha de Auditoria

Todas as ações críticas registradas em `audit_logs`:

```prisma
model AuditLog {
  id        String     @id @default(cuid())
  userId    String?
  event     AuditEvent
  metadata  Json?
  ip        String?
  userAgent String?
  success   Boolean    @default(true)
  createdAt DateTime   @default(now())
}
```

Eventos rastreados:
- `LOGIN_OK`, `LOGIN_FAIL`, `LOGOUT`
- `PWD_CHANGE`, `MFA_ON`, `MFA_OFF`
- `RESUME_EXPORT`, `RESUME_DELETE`, `ACCOUNT_DELETE`
- `SUB_UPGRADE`, `SUB_CANCEL`
- `AI_CALL`, `PDF_GENERATE`, `LINKEDIN_AUDIT`

## 7. Estratégia de Backup

| Recurso | Frequência | Retenção | Ferramenta |
|---|---|---|---|
| PostgreSQL (Neon) | Automático contínuo (PITR) | 7 dias Free / 30 dias Pro | Neon built-in |
| PostgreSQL (manual) | pg_dump semanal via cron | 4 semanas em R2 (bucket separado) | Fly.io cron job |
| Cloudflare R2 (PDFs) | Sincronização semanal | 30 dias em bucket de backup | rclone sync |
| Código-fonte | Push contínuo | Histórico completo | GitHub (privado) |
| Variáveis de ambiente | A cada alteração | Versão em Vault | Doppler ou 1Password |

## 8. Checklist de Segurança para Go-Live

| Item | Versão alvo | Status |
|---|---|---|
| HTTPS em todos os endpoints | V1 | ✅ Vercel garante |
| Security headers (CSP, HSTS, ...) | V1 | ✅ Aplicado no `next.config.mjs` |
| Rate limiting por endpoint | V1 | ✅ Aplicado via Upstash Redis |
| Validação de input (Zod) em toda API | V1 | ✅ Implementado |
| Cloudflare Turnstile anti-bot | V1 | ✅ Integrado quando necessário |
| Auth seguro via provedor | V1 | ✅ Clerk integrado |
| Idempotência e validação webhook | V1 | ✅ Implementado com Tabela ProcessedEvent |
| Controle de Acesso Administrativo | V1 | ✅ Modelagem de Role no BD e rotas restritas |
| Criptografia AES-256 dados pessoais | V2 | ⏳ Para features futuras |
| Backup diário do banco | V2 | ✅ Neon built-in + pg_dump se configurado |
| Penetration test básico | V3 | ⏳ OWASP ZAP ou similar |
| LGPD: Exclusão com Cancelamento | V1 | ✅ Exclui dados + cancela Sub da Stripe |
| LGPD: consentimento explícito marketing | Lançamento | ⏳ Checkbox no cadastro |

## 9. Resposta a Incidentes

> Processo a documentar antes do lançamento público.

1. **Detecção** — Sentry alerta + rate de erros anômalo
2. **Contenção** — Desabilitar feature / bloquear IPs / revogar tokens
3. **Erradicação** — Patch + rotação de chaves afetadas
4. **Recuperação** — Restore de backup Neon / R2
5. **Notificação** — ANPD em até **72h** (LGPD Art. 48) + comunicação aos usuários afetados
6. **Post-mortem** — Documento público + melhorias implementadas

## 10. Referências

- [LGPD — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- ADR-001 → ADR-005 em [`overview.md`](./overview.md)
