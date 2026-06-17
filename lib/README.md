# Pasta `lib/`

Camada de infraestrutura: clientes, helpers e regras de negócio compartilhadas
entre o app, API routes e workers.

## Estrutura prevista

```
lib/
├── auth.ts                   # Configuração do Better Auth
├── prisma.ts                 # Singleton do PrismaClient
├── openai.ts                 # Cliente OpenAI + helpers (ATS, adapt, cover, ...)
├── r2.ts                     # Cloudflare R2 / S3
├── stripe.ts                 # Stripe + webhooks
├── resend.ts                 # Email transacional
├── crypto.ts                 # AES-256-GCM encrypt/decrypt
├── ats.ts                    # Lógica de scoring ATS
├── linkedin-parser.ts        # Extração de dados do LinkedIn
├── rate-limit.ts             # Upstash helpers
├── audit.ts                  # Log de auditoria (AuditAction)
├── pdf/
│   ├── client.ts             # Cliente HTTP do worker Puppeteer
│   └── queue.ts              # BullMQ / QStash
├── validations/              # Schemas Zod por domínio
│   ├── resume.ts
│   ├── auth.ts
│   ├── linkedin.ts
│   └── billing.ts
├── utils/                    # Funções puras (cn, formatCurrency, ...)
└── constants.ts
```

> Toda regra de negócio que **não é UI** mora aqui. Componentes importam de `lib/`,
> nunca o contrário.
