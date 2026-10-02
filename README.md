# ATRION / CVForge

Plataforma SaaS para criação de currículos, personalização visual e apoio à candidatura com inteligência artificial. O produto reúne editor de currículo, análise ATS, adaptação a vagas, auditoria de LinkedIn, busca de vagas e cobrança por planos.

> Estado da documentação: atualizado a partir do código existente em outubro de 2026. Os documentos em `docs/roadmap/` e itens marcados como planejados não representam funcionalidades disponíveis hoje.

## Capacidades implementadas

- Editor de currículo com autosave, preview em tempo real, tela cheia e exportação/impressão em PDF pelo navegador.
- 18 modelos de currículo, com controle de cor, tipografia, espaçamento e ordem das seções.
- Importação de currículo em PDF ou DOCX, com estruturação assistida por IA.
- Análise ATS, melhoria de resumo e adaptação de currículo a uma descrição de vaga.
- Auditoria de LinkedIn a partir de texto, URL ou PDF extraído.
- Busca de vagas no Brasil por meio da API Adzuna.
- Autenticação pelo Clerk, planos Stripe, portal do cliente, exportação e exclusão de dados pessoais.

## Stack atual

| Área | Tecnologia |
|---|---|
| Aplicação | Next.js 16, React 18 e TypeScript 6 |
| Interface | Tailwind CSS, componentes próprios e Lucide |
| Dados | PostgreSQL + Prisma |
| Autenticação | Clerk |
| IA | Gemini nativo e OpenRouter (com modelos Gemini/GPT) |
| Arquivos | Cloudflare R2 via SDK S3 |
| Cobrança | Stripe Checkout, Portal e Webhooks |
| Limites | Upstash Redis ou Redis compatível |
| Observabilidade | PostHog e OpenTelemetry |
| Testes | Vitest e Playwright |

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Crie o arquivo `.env.local` a partir de `.env.example` e configure, no mínimo, banco de dados, Clerk e um provedor de IA. As integrações de Stripe, R2, Adzuna, Redis e PostHog são opcionais para partes específicas da aplicação.

Comandos úteis:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Estrutura

```text
app/          páginas, layouts, server actions e rotas HTTP
components/   editor, templates, layout e componentes de interface
lib/          regras de negócio e clientes de serviços externos
prisma/       schema, migration e cliente Prisma
tests/        testes unitários e E2E
docs/         documentação técnica e de produto
```

## Documentação

Comece por [docs/README.md](docs/README.md), que separa a documentação da implementação atual do planejamento histórico.

## Licença

Projeto privado.