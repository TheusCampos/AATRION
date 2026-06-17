# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- Estrutura inicial de diretórios do projeto
- Documentação organizada em `/docs` (arquitetura, features, fluxos, funções, tecnologias, roadmap, API)
- README principal com quick start e visão geral
- Arquivos de configuração: `.gitignore`, `.env.example`, `tsconfig.json`, `package.json`
- Suporte a **npm** e **bun** como gerenciadores de pacotes
- Schemas Zod pendentes de implementação em `lib/validations/`
- Definição das tabelas Prisma (modelos `User`, `Resume`, `JobVersion`, `AtsAnalysis`, `LinkedInAudit`, `Subscription`, `Application`, `AIUsage`, `AuditLog`, `CoverLetter`)

### Mudado
- `package.json` agora declara `"packageManager": "bun@1.1.0"` mas **aceita npm** sem `engine-strict` (compatível com CI/CD padrão)
- Lockfiles suportados: `package-lock.json` (npm) e `bun.lock`/`bun.lockb` (Bun)
- `bun.lockb` adicionado ao `.gitignore` (Bun 1.1 gera binário; Bun 1.2+ gera texto)

### Planejado
- **V1** — Login (Google + email/senha), Dashboard + CRUD currículos, Editor steps 1–4 com preview, 3 templates (Classic, Modern, Minimal), exportação PDF (Puppeteer), Stripe Checkout, Landing page, ATS Score básico, LinkedIn Audit (input manual)

## [0.0.0] - 2026-06-12

### Adicionado
- Bootstrap do projeto: extração de documentos `.docx` de planejamento para texto puro em `.projeto_extracted/`
- Documentos de origem preservados em `.projeto/` (ATRION_Doc1 a Doc7 + Planejamento)
