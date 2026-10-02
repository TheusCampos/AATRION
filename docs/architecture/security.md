# Segurança e privacidade

Este documento descreve controles presentes no código. Ele não substitui uma auditoria independente nem declara uma nota de segurança.

## Autenticação e autorização

- Clerk fornece a sessão e os fluxos de login/cadastro.
- `middleware.ts` exige sessão nas páginas autenticadas.
- Os Route Handlers usam `getCurrentUser()` antes de acessar dados privados.
- Currículos e auditorias são consultados com o `userId` do usuário autenticado, reduzindo exposição por IDOR.
- A área `/admin` depende tanto da sessão quanto da verificação do papel `ADMIN` no banco.

## Validação e IA

- Entradas de currículo, configurações, auditoria LinkedIn e ações de IA são validadas com Zod.
- `sanitizeForAI` limita tamanho e normaliza conteúdo enviado aos provedores.
- `hasPromptInjection` bloqueia padrões conhecidos de injeção de prompt em endpoints de IA.
- A resposta da IA é parseada defensivamente. Novos fluxos devem validar também o objeto retornado antes de persistir ou aplicar alterações.

## Upload e arquivos

- Upload aceita somente JPG, PNG e WebP de até 2 MB.
- O handler confere MIME type e magic bytes antes de gravar no R2.
- Arquivos são gravados com nome aleatório e organizados sob `photos/{userId}/...`.
- A leitura em `/api/files/[...key]` exige sessão e impede acesso a fotos de outro usuário.

## Rate limiting

| Grupo | Limite atual |
|---|---|
| IA | 5 requisições/minuto por usuário |
| Upload | 10/minuto por usuário |
| Vagas | 30/minuto por usuário |
| Checkout | 3/minuto por usuário |
| Geral | 30/minuto por usuário |

O sistema usa Redis/Upstash quando configurado. Sem Redis, usa memória do processo; isso é suficiente somente para desenvolvimento ou uma instância única. Falhas no limitador retornam 503 (fail-closed).

## Headers HTTP

`next.config.mjs` aplica `nosniff`, `DENY` para frames, HSTS, política de referência, permissões restritivas, COOP/CORP e CSP. A CSP ainda contém `unsafe-inline` e `unsafe-eval` por compatibilidade com integrações atuais; reduzi-los deve ser uma tarefa de segurança futura.

## Stripe e LGPD

- O webhook exige `stripe-signature` e valida o corpo com `STRIPE_WEBHOOK_SECRET`.
- Eventos já tratados ficam em `ProcessedEvent` para idempotência.
- `GET /api/user/export` exporta dados do usuário autenticado em JSON.
- `DELETE /api/user/delete` cancela assinatura Stripe quando existente, remove o usuário local (com cascades) e tenta removê-lo no Clerk.
- O cron de limpeza remove currículos FREE sem atualização por dois anos, além de logs e eventos Stripe com mais de 90 dias. A rota exige `Authorization: Bearer <CRON_SECRET>`.

## Operação responsável

Mantenha variáveis secretas fora do repositório, revise alterações em handlers de API e execute `npm run typecheck` e a suíte de testes antes de publicar. A presença de `.env` no diretório de trabalho não significa que seus valores possam ser copiados para documentação ou commits.