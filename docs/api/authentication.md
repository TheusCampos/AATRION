# Autenticação da API

> O ATRION usa **autenticação por sessão** (cookie httpOnly) para o app web.
> Para integrações server-to-server futuras, há também **API tokens** (V4+).

## Visão Geral

| Método | Uso | Implementação |
|---|---|---|
| **Sessão (Cookie)** | App web (navegador) | Better Auth + cookie httpOnly |
| **Bearer Token** | API scripts (futuro) | API key + secret |

## Autenticação por Sessão (Web)

### Cookie

```
Nome: better-auth.session_token
HttpOnly: true
Secure: true (produção)
SameSite: Lax
Path: /
Expires: 30 dias
```

### Fluxo

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as API
    participant Auth as Better Auth

    FE->>Auth: POST /api/auth/sign-in/email { email, password }
    Auth-->>FE: Set-Cookie + 200 { user, session }
    FE->>API: GET /api/resumes (Cookie: better-auth.session_token=...)
    API->>Auth: validateSession(cookie)
    Auth-->>API: { user, expiresAt }
    API-->>FE: 200 { data: [...] }
```

### Middleware de Auth

```ts
// lib/auth.ts
export async function getServerSession() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.emailVerified === false) {
    // Bloqueia exceto em /verify-email, /api/auth/*
  }
  return session;
}
```

### Endpoints que Exigem Auth

Todas as rotas `/api/*` **exceto**:
- `/api/auth/*` (Better Auth)
- `/api/health`
- `/api/public/*`
- `/api/stripe/webhook` (autentica via assinatura)

## Bearer Token (API — V4+)

> Não implementado no V1. Planejado para V4 com a API pública.

```http
GET /api/v1/resumes HTTP/1.1
Host: api.cvforge.com.br
Authorization: Bearer cvf_live_xxxxxxxxxxxx
X-API-Version: 2024-01-01
```

**Header esperado:**

| Header | Valor |
|---|---|
| `Authorization` | `Bearer <api_key>` |
| `X-API-Version` | Versão da API (ISO date) |

**Rate limit:** 1.000 req/dia por token (configurável por parceiro).

## MFA

Endpoints sensíveis (definidos em [`/docs/features/authentication.md`](../../features/authentication.md)) exigem MFA ativo + código recente:

```http
POST /api/users/me/change-email HTTP/1.1
Cookie: better-auth.session_token=...
X-MFA-Code: 123456
```

Se `X-MFA-Code` ausente ou inválido:
```json
{
  "error": {
    "code": "MFA_REQUIRED",
    "message": "MFA code required for this action"
  }
}
```
Status 403.

## Permissões por Recurso

| Recurso | Dono | Editor | Leitor |
|---|---|---|---|
| `Resume` (próprio) | ✅ | ✅ (dono) | — |
| `Resume` (público via slug) | ✅ | ✅ | 🔓 (se `isPublic = true`) |
| `LinkedInAudit` | ✅ | ✅ | — |
| `Application` | ✅ | ✅ | — |
| `User` | ✅ | ✅ | — |

> Nenhum recurso do ATRION é compartilhável entre usuários no MVP.
> Colaboração entra no V4 (ATRION for Teams).

## Erros de Autenticação

| Status | `code` | Quando |
|---|---|---|
| 401 | `UNAUTHORIZED` | Sem cookie / cookie inválido |
| 401 | `SESSION_EXPIRED` | Sessão expirou |
| 403 | `EMAIL_NOT_VERIFIED` | Email não verificado |
| 403 | `MFA_REQUIRED` | Ação exige MFA |
| 401 | `MFA_INVALID` | Código TOTP inválido |
| 429 | `MFA_LOCKED` | Muitas tentativas (5/10min) |

## Logout

```http
POST /api/auth/sign-out HTTP/1.1
Cookie: better-auth.session_token=...
```

**Resposta:**
- 200 OK
- `Set-Cookie: better-auth.session_token=; Max-Age=0`

**Server-side:** revoga refresh token no banco.

## Refresh Automático

Sessões têm TTL de 30 dias, mas o cookie tem TTL menor (sessão de browser).
Middleware do Better Auth faz refresh transparente baseado em `currentPeriodEnd`.

## CSRF

Better Auth implementa proteção CSRF por padrão:
- Tokens CSRF em endpoints sensíveis
- SameSite=Lax no cookie (mitigação adicional)

## CORS

| Origem | Permitido |
|---|---|
| `https://cvforge.com.br` | ✅ |
| `https://www.cvforge.com.br` | ✅ |
| `http://localhost:3000` (dev) | ✅ |
| Outros | ❌ |

Configurado no Next.js via `next.config.js`:
```ts
async headers() {
  return [{
    source: '/api/:path*',
    headers: [{
      key: 'Access-Control-Allow-Origin',
      value: 'https://cvforge.com.br',
    }],
  }];
}
```
