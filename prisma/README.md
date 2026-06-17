# Pasta `prisma/`

Schema do banco de dados, migrações e seeds.

## Estrutura prevista

```
prisma/
├── schema.prisma             # Schema principal (User, Resume, JobVersion, ...)
├── migrations/               # Migrações versionadas (geradas por prisma migrate)
├── seed.ts                   # Dados iniciais (templates, planos, etc.)
└── client.ts                 # Re-export do @prisma/client (se necessário)
```

## Modelos previstos (referência)

- `User` — conta, plano, MFA, OAuth
- `Resume` — currículo base, conteúdo JSONB, ATS score, slug público
- `JobVersion` — versão adaptada para uma vaga específica
- `AtsAnalysis` — histórico de análises ATS
- `LinkedInAudit` — auditoria completa do LinkedIn
- `Subscription` — assinatura Stripe
- `Application` — vaga no tracker Kanban
- `AIUsage` — controle de uso e custo da IA por usuário
- `AuditLog` — trilha de auditoria de ações críticas
- `CoverLetter` — carta de apresentação gerada por IA

> Detalhes completos em [`/docs/architecture/database-schema.md`](../docs/architecture/database-schema.md).
