# Tecnologias e integrações

Este catálogo complementa `architecture/tech-stack.md` e mantém apenas dependências e serviços presentes no repositório atual.

| Área | Tecnologia | Finalidade |
|---|---|---|
| Runtime | Node.js 20+ | Requisito definido em `package.json` |
| Web | Next.js 16 / React 18 | Aplicação e rotas HTTP |
| Linguagem | TypeScript 6 | Tipagem estrita |
| Dados | PostgreSQL / Prisma 5 | Persistência |
| Sessão | Clerk | Login e gerenciamento de identidade |
| IA | Google GenAI / OpenRouter | Funções assistidas por LLM |
| Arquivos | Cloudflare R2 / AWS SDK S3 | Fotos de perfil |
| Pagamentos | Stripe | Checkout, portal e webhook |
| Limites | Redis, Upstash Ratelimit | Proteção de API |
| Observabilidade | PostHog, OpenTelemetry, Traceloop | Eventos e traces |
| Testes | Vitest, Playwright | Qualidade |

As dependências instaladas que ainda não são chamadas diretamente pelo código devem ser tratadas como candidatas a remoção ou implementação, não como capacidade do produto.