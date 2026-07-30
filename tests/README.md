# Pasta `tests/`

Suíte de testes automatizados incluindo testes de segurança.

## Estrutura

```
tests/
├── unit/                     # Vitest — funções puras, validações, utilitários
│   ├── lib/
│   ├── utils/
│   └── security-validation.test.ts  # Testes de validação de segurança
├── integration/              # Vitest — fluxos com banco
│   ├── api/
│   └── services/
├── e2e/                      # Playwright — fluxos completos do usuário
│   ├── auth.spec.ts
│   ├── resume-creation.spec.ts
│   ├── pdf-export.spec.ts
│   ├── stripe-checkout.spec.ts
│   ├── linkedin-audit.spec.ts
│   └── security-xss.spec.ts          # Testes E2E de segurança
└── fixtures/                 # Dados de teste, mocks
```

## Comandos

```bash
# Unit tests
npm test                    # ou: bun test
npm run test:watch         # ou: bun run test:watch

# E2E tests
npm run test:e2e           # ou: bun run test:e2e
npm run test:e2e:ui        # ou: bun run test:e2e:ui

# Security tests only
npx playwright test --config=tests/playwright.security.config.ts
```

## Testes de Segurança

Os testes de segurança são executados em duas camadas:

### 1. Unit Tests (`tests/unit/security-validation.test.ts`)

Testam funções de validação:
- **FR-01/FR-02**: Detecção de prompt injection
- **FR-07**: Validação de resposta da IA
- **FR-09**: Validação de upload de arquivos
- **FR-10**: Sanitização de HTML
- **FR-12**: Prevenção de path traversal
- **FR-15**: Validação de query params

### 2. E2E Tests (`tests/e2e/security-xss.spec.ts`)

Testam comportamento de segurança E2E:
- **FR-03**: XSS em jobs page
- **FR-04**: CSP headers
- **FR-05**: CORS configuration
- **FR-06**: Rate limiting

## Coverage de Findings

| Finding | Tipo de Test | Status |
|---------|--------------|--------|
| FR-01 Prompt Injection | Unit | ✅ Implementado |
| FR-02 Prompt Injection | Unit | ✅ Implementado |
| FR-03 XSS | E2E | ✅ Implementado |
| FR-04 CSP | E2E | ✅ Implementado |
| FR-05 CORS | E2E | ✅ Implementado |
| FR-06 Rate Limiting | E2E | ✅ Implementado |
| FR-07 AI Validation | Unit | ✅ Implementado |
| FR-08 Summary Validation | Unit | ✅ Implementado |
| FR-09 File Upload | Unit | ✅ Implementado |
| FR-10 HTML Sanitization | Unit | ✅ Implementado |
| FR-12 Path Traversal | Unit | ✅ Implementado |
| FR-15 Query Params | Unit | ✅ Implementado |

## Requisitos

```bash
# Instalar dependências de teste
npm install

# Configurar Playwright (primeira vez)
npx playwright install chromium

# Verificar se o servidor está rodando
npm run dev
```

## CI/CD

Adicione ao seu workflow:

```yaml
- name: Run Security Tests
  run: |
    npm run test
    npx playwright test --config=tests/playwright.security.config.ts
```

> Os testes E2E rodam contra o ambiente de **preview na Vercel** (não produção) em CI.
