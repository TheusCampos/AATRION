# Estrutura de pastas

```text
app/
  (app)/              área autenticada: dashboard, editor, vagas, LinkedIn e configurações
  (auth)/             páginas de login e cadastro fornecidas pelo Clerk
  admin/              painel administrativo
  api/                Route Handlers HTTP
  actions/            Server Actions
  layout.tsx          providers globais, metadados e Clerk
components/
  resume/             editor, formulários, preview e templates
  dashboard/          cards e ações do dashboard
  layout/             cabeçalho e menus
  pricing/            cartões de plano
  ui/                 Button, Card, Input e loader
lib/
  validations/        schemas Zod por domínio
  ai.ts               seleção de provedor e parse de JSON de IA
  auth.ts             sessão Clerk e espelhamento no banco
  plan.ts             planos e cotas mensais
  prisma.ts           singleton Prisma
  r2.ts, stripe.ts    integrações externas
prisma/               schema e migrations
tests/                testes unitários, E2E e configuração de segurança
docs/                 documentação
```

## Convenções úteis

- Rotas HTTP autenticam o usuário no próprio handler com `getCurrentUser()`; middleware é uma camada adicional, não a única proteção.
- Componentes que usam estado/eventos são Client Components; páginas e consultas iniciais são preferencialmente server-side.
- `lib/` não deve depender de componentes de interface.
- Alterações no formato de currículo precisam alinhar `lib/validations/resume.ts`, formulários, preview/templates e testes.