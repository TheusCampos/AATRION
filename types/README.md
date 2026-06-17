# Pasta `types/`

Tipagens TypeScript compartilhadas que não cabem em `lib/`.

## Estrutura prevista

```
types/
├── api.ts                    # Tipos de request/response das API Routes
├── resume.ts                 # Estrutura do conteúdo de currículo (JSONB)
├── linkedin.ts               # Tipos do perfil extraído e da auditoria
├── billing.ts                # Tipos de assinatura e checkout
├── events.ts                 # Eventos analytics
└── env.d.ts                  # Extensão de ImportMetaEnv (variáveis públicas)
```

> A maior parte dos tipos virá do **Prisma** (`@prisma/client`) e do **Zod**
> (`z.infer<typeof schema>`). Esta pasta guarda apenas os tipos compartilhados
> que não têm origem nesses pacotes.
