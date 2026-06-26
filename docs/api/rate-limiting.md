# Rate Limiting

> Proteção contra abuso, controle de custos de infraestrutura e garantia de disponibilidade.
> Implementado globalmente com **@upstash/ratelimit** + Upstash Redis serverless.

## Regras de Rate Limit Implementadas

O sistema aplica limites granulares baseados no tipo de endpoint e recurso exigido (IA, uploads, banco de dados). Os limites usam a chave do usuário (`userId`) ou IP onde aplicável. O algoritmo padrão utilizado é o `slidingWindow` para uma distribuição mais suave.

| Categoria | Limite | Intervalo | Alvo (Chave) | Justificativa |
|---|---|---|---|---|
| **IA (Analyze, Adapt, Enhance, LinkedIn, Import)** | 5 req | 1 minuto | `ai:{userId}` | Endpoints caros. Usam OpenAI e geram alto custo por requisição. |
| **Upload de Arquivos** | 10 req | 1 minuto | `upload:{userId}` | Evita spam de arquivos no Cloudflare R2 e processamentos pesados de PDF. |
| **Busca de Vagas (Adzuna)** | 30 req | 1 minuto | `jobs:{userId}` | Evita esgotamento da cota da API da Adzuna (Job search). |
| **Stripe Checkout / Portal** | 3 req | 1 minuto | `checkout:{userId}` | Previne spam de criação de sessões do Stripe. |
| **Geral / CRUD** | 30 req | 1 minuto | `general:{userId}` | Limite genérico para leituras e atualizações no banco de dados. |

## Resposta 429 (Too Many Requests)

Quando um limite é excedido, a API retorna um HTTP 429 com a seguinte estrutura:

```json
{
  "error": "Muitas requisições. Tente novamente em alguns instantes.",
  "retryAfter": 15
}
```

**Headers:**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
Retry-After: 15
```

## Fallback para Desenvolvimento

A biblioteca de rate limit (`lib/rate-limit.ts`) é configurada para realizar _fail-open_ ou funcionar em modo permissivo (noop) durante o desenvolvimento local. Se as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` não estiverem configuradas no `.env`, todas as requisições são permitidas, garantindo que o desenvolvimento não seja bloqueado por ausência de credenciais do Redis. Se o Redis falhar em produção, as rotas continuarão funcionando (_fail-open_) para evitar inatividade.
