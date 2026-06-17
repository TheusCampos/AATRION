# Pasta `scripts/`

Scripts utilitários executados via `npm run <script>`, `bun run <script>` ou diretamente com Node.

## Scripts previstos

- `extract-docx.mjs` — extrai texto dos documentos `.docx` em `.projeto/` para arquivos `.txt` em `.projeto_extracted/`
- `seed-templates.ts` — popula o banco com templates de currículo
- `migrate-stripe-products.ts` — sincroniza produtos/preços no Stripe
- `backup-db.sh` — `pg_dump` agendado para R2
- `sync-r2-backup.sh` — sincroniza bucket principal → bucket de backup

> Scripts shell devem ser compatíveis com **bash** (executados em CI/CD e Fly.io).
> Scripts Node devem ser `.mjs` ou `.ts` (executados com `tsx`).
