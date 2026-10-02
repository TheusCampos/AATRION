# Referência da API

A API é interna à aplicação Next.js e não possui versionamento público. Os handlers ficam em `app/api/`. O formato de erro não é completamente uniforme: em geral os endpoints retornam `{ "error": "mensagem" }`, e erros de validação podem incluir `details`.

## Autenticação

Quase todas as rotas exigem uma sessão Clerk válida, verificada também no servidor com `getCurrentUser()`. Não existe endpoint próprio `/api/auth/*`; login, cadastro e sessão são geridos pelos componentes e infraestrutura do Clerk.

## Referências

- [Endpoints implementados](endpoints.md)
- [Autenticação e autorização](authentication.md)
- [Rate limiting](rate-limiting.md)

## Convenções

- Corpo JSON é usado nas rotas de criação/atualização, exceto uploads multipart.
- Datas retornadas pelo Prisma são serializadas em ISO 8601 pelo Next.js.
- Rotas que fazem chamadas caras ou externas aplicam rate limit e, para IA, cotas mensais por plano.
- `GET /api/stripe/checkout` e `POST /api/webhooks/stripe` têm contratos específicos: o primeiro redireciona e o segundo recebe o payload bruto da Stripe.