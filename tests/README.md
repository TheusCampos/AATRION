# Pasta `tests/`

Suíte de testes automatizados.

## Estrutura prevista

```
tests/
├── unit/                     # Vitest — funções puras, validações, utilitários
│   ├── lib/
│   └── utils/
├── integration/              # Vitest — fluxos com banco (Neon test branch)
│   ├── api/
│   └── services/
├── e2e/                      # Playwright — fluxos completos do usuário
│   ├── auth.spec.ts
│   ├── resume-creation.spec.ts
│   ├── pdf-export.spec.ts
│   ├── stripe-checkout.spec.ts
│   └── linkedin-audit.spec.ts
└── fixtures/                 # Dados de teste, mocks
```

## Comandos (npm ou bun)

```bash
npm test              # ou: bun test
npm run test:watch    # ou: bun run test:watch
npm run test:e2e      # ou: bun run test:e2e
npm run test:e2e:ui   # ou: bun run test:e2e:ui
```

> Os testes E2E rodam contra o ambiente de **preview na Vercel** (não produção).
