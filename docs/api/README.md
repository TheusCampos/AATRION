# 🔌 API Reference

> Especificação dos endpoints HTTP do ATRION. Todos sob `/api/`.

## Índice

- 📋 [**Visão Geral**](./endpoints.md) — Tabela de todos os endpoints
- 🔐 [**Autenticação**](./authentication.md) — Como autenticar (sessão + Bearer)
- 🚦 [**Rate Limiting**](./rate-limiting.md) — Limites por endpoint

## Convenções

- **Base URL:** `https://cvforge.com.br/api` (produção) / `http://localhost:3000/api` (dev)
- **Formato:** JSON em request e response
- **Versionamento:** header `X-API-Version` (futuro)
- **Datas:** ISO 8601 (`2026-06-12T14:32:00Z`)
- **Erros:** sempre `{ error: { code, message, details? } }` com status HTTP apropriado

## Estrutura de Erro Padrão

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email inválido",
    "details": {
      "field": "email",
      "rule": "email"
    }
  }
}
```

| Status | Quando |
|---|---|
| 200 | Sucesso |
| 201 | Criado |
| 202 | Aceito (processamento assíncrono) |
| 400 | Validação falhou |
| 401 | Não autenticado |
| 403 | Autenticado mas sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 422 | Entidade não processável (regra de negócio) |
| 429 | Rate limit excedido |
| 500 | Erro interno |

## Códigos de Erro da Aplicação

| Código | HTTP | Descrição |
|---|---|---|
| `UNAUTHORIZED` | 401 | Sessão ausente ou inválida |
| `FORBIDDEN` | 403 | Usuário sem permissão (ex: Free tentando feature Pro) |
| `NOT_FOUND` | 404 | Recurso não existe ou não pertence ao usuário |
| `VALIDATION_ERROR` | 400 | Input inválido (Zod) |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de uso atingido |
| `PLAN_LIMIT_EXCEEDED` | 403 | Limite do plano Free atingido (ex: 4º currículo) |
| `EMAIL_NOT_VERIFIED` | 403 | Email precisa ser verificado |
| `MFA_REQUIRED` | 403 | MFA precisa ser validado |
| `MFA_INVALID` | 401 | Código TOTP inválido |
| `AI_LIMIT_EXCEEDED` | 429 | Limite mensal de IA excedido |
| `PDF_GENERATION_FAILED` | 500 | Worker Puppeteer falhou |
| `STRIPE_ERROR` | 502 | Erro de comunicação com Stripe |
| `INTERNAL_ERROR` | 500 | Erro genérico |

## Versionamento

| Versão | Status | Estável desde |
|---|---|---|
| `v1` | ✅ Atual | V1 |
| `v0` | ⚠️ Beta interno | Pré-V1 |

> Mudanças breaking serão versionadas em `/api/v2/`. Endpoints atuais
> permanecem estáveis por 6 meses após deprecação.

## Headers Importantes

| Header | Enviado por | Descrição |
|---|---|---|
| `Authorization: Bearer ...` | Cliente (API) | Token de sessão (futuro) |
| `Cookie: better-auth.session_token=...` | Navegador | Cookie de sessão |
| `X-Request-Id` | Gerado pelo middleware | ID único da request (debug) |
| `X-RateLimit-Limit` | API | Limite do endpoint |
| `X-RateLimit-Remaining` | API | Restantes |
| `X-RateLimit-Reset` | API | Quando o limite reseta (epoch) |
| `Retry-After` | API (em 429) | Segundos até poder tentar de novo |
| `Stripe-Signature` | Stripe | Webhook signature |

## Padrão de Resposta de Coleção

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 134,
    "totalPages": 7
  }
}
```

## Padrão de Resposta de Recurso

```json
{
  "data": { ... }
}
```

## Webhooks Recebidos

- **Stripe** — `POST /api/stripe/webhook` (ver [billing.md](../../features/billing.md))
