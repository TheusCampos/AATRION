# Auditoria Técnica e de Segurança — CVForge (Gerador-curriculo-2.0)
Data: 2026-06-17  
Escopo: análise estática do repositório local em `m:\DEV\DESENVOLVIMENTO\Gerador-curriculo-2.0`

## 1) Metodologia (Estruturada)

### 1.1 Inventário e mapeamento (camadas)
- **Frontend:** Next.js App Router (`app/`), componentes React em `components/`.
- **Backend/API:** rotas `app/api/**/route.ts` (Next.js Route Handlers).
- **Auth:** Clerk (`middleware.ts`, `@clerk/nextjs`, `lib/auth.ts`).
- **Dados:** Prisma + SQLite (desenvolvimento) (`prisma/schema.prisma`, `prisma/dev.db`).
- **Integrações:** Adzuna (vagas), Gemini/OpenRouter (IA).

### 1.2 Varredura estática (padrões críticos)
- Injeções: XSS (`dangerouslySetInnerHTML`), SQL (raw queries), command injection (`exec/spawn/eval`).
- Credenciais/segredos: `.env`, chaves API, tokens.
- Tratamento de erros: vazamento de detalhes internos.
- Configurações: CORS/CSRF, headers de segurança, sessões.

### 1.3 Supply chain
- `npm audit --audit-level=high` e inspeção de dependências e lockfile.

### 1.4 Limitações
- **Não há diretório `.git` no workspace**, então não foi possível auditar histórico de commits (ex.: `git log -S ...`). Mesmo assim, o conteúdo atual já contém segredos e artefatos que indicam vazamento.

## 2) Resumo Executivo (Prioridade por risco)

### Críticas/Altas (Tier 1)
- **SFR-001 (CRÍTICA):** Segredos/credenciais commitados em `.env`.
- **SFR-002 (CRÍTICA):** Supply chain com múltiplas vulnerabilidades HIGH/CRITICAL (`npm audit`).
- **SFR-003 (ALTA):** XSS no frontend por uso de `dangerouslySetInnerHTML` com conteúdo externo (Adzuna).
- **SFR-004 (ALTA):** Envio de PII (currículo/LinkedIn) para provedores de IA sem controles explícitos (LGPD/GDPR).

### Médias/Baixas (Tier 2 — Hardening)
- Arquivos locais/artefatos sensíveis versionados (DB SQLite, logs, build `.next`, docs internas).
- Ausência de headers de segurança (CSP/HSTS/XFO/etc).
- Falta de rate limiting por IP/usuário em endpoints caros.
- Exposição de detalhes de erro ao cliente em rota de importação.
- Endpoints state-changing sem proteção explícita contra CSRF (dependente de comportamento de cookies do provedor de auth).

## 3) Findings — Tier 1 (SFR)

### SFR-001 — Segredos e credenciais commitados no repositório

## Classificação
- **Severidade:** Crítica
- **CVSS v3.1 (estimado):** 9.8 (Vetor: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- **Categoria:** OWASP A02:2021 (Cryptographic Failures) / A05:2021 (Security Misconfiguration)
- **Camada:** 0 (Supply Chain & Repo) / 5 (Config)

## Descrição
O arquivo `.env` está presente no repositório contendo chaves e segredos válidos (ex.: Gemini, OpenRouter, Adzuna, Clerk). Isso permite comprometimento direto das integrações (abuso de APIs, fraude de billing, bypass/abuso de auth dependendo do segredo), além de facilitar ataques de pivô em ambientes onde as mesmas credenciais foram reutilizadas.

## Localização
- [`.env`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/.env#L6-L44)

## Impacto
- Uso indevido de APIs de IA (custos, vazamento de dados enviados, abuso de quota).
- Comprometimento de integrações externas (Adzuna/Clerk) e potencial comprometimento de usuários/sessões dependendo do escopo dos tokens.
- Incidente de segurança e compliance (LGPD/GDPR) por exposição de segredos e potencial de acesso a dados.

## Recomendação de correção (detalhada)
- **Rotação imediata:** revogar/rotacionar todas as chaves expostas (Gemini, OpenRouter, Adzuna, Clerk e quaisquer outras).
- **Remoção do repositório:** garantir que `.env` nunca seja versionado (manter apenas `.env.example`).
- **Varredura automatizada:** habilitar secret scanning (ex.: gitleaks/trufflehog em CI) e pre-commit hooks.
- **Separação de ambientes:** chaves distintas por ambiente (dev/staging/prod) + políticas de menor privilégio.
- **Purge de histórico:** quando houver Git, reescrever histórico removendo segredos (ex.: `git filter-repo`) e invalidar caches/artefatos.

---

### SFR-002 — Dependências com vulnerabilidades HIGH/CRITICAL (Supply Chain)

## Classificação
- **Severidade:** Crítica
- **CVSS v3.1 (estimado):** 9.0 (Vetor: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- **Categoria:** OWASP A06:2021 (Vulnerable and Outdated Components)
- **Camada:** 0 (Supply Chain & CI/CD)

## Evidência (scan)
O comando `npm audit --audit-level=high` reportou:
- **26 vulnerabilidades** (incluindo **4 critical**, **14 high**).
- Principais pacotes/linhas: `next`, `happy-dom`, `@clerk/*`, `form-data`, `ws`, `glob`, `@babel/core`, `postcss`, `prismjs`.

## Localização
- Raiz do projeto: [package.json](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/package.json)

## Impacto
- Exploração de CVEs/Advisories em runtime/SSR (Next.js) pode resultar em DoS, SSRF, vazamento de código/dados e, dependendo do advisory, impacto severo.
- Em CI/testes, dependências como `happy-dom` com advisory de **escape de VM/RCE** aumentam risco de comprometimento do pipeline e do ambiente de build.

## Recomendação de correção (detalhada)
- **Atualização controlada:** atualizar dependências para versões corrigidas (priorizar `next`, `@clerk/*`, `happy-dom`, `ws`).
- **Estratégia:** não aplicar `--force` diretamente em produção; usar branch de hardening + testes (`npm test`, `npm run typecheck`, `npm run lint`).
- **Política:** travar versões (sem ranges muito permissivos quando necessário) e habilitar dependabot/renovate.
- **CI:** falhar build quando `npm audit --audit-level=high` retornar não-zero.

---

### SFR-003 — XSS por `dangerouslySetInnerHTML` com dados externos (Adzuna)

## Classificação
- **Severidade:** Alta
- **CVSS v3.1 (estimado):** 6.1 (Vetor: CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)
- **Categoria:** OWASP A03:2021 (Injection) / A07:2021 (Identification and Authentication Failures — impacto indireto via sessão)
- **Camada:** 1 (Frontend)

## Descrição
O frontend injeta HTML retornado pela API de vagas (conteúdo externo) diretamente no DOM via `dangerouslySetInnerHTML`, sem sanitização. Se o provedor externo retornar HTML malicioso (ou for comprometido), isso permite execução de script no navegador do usuário.

## Localização
- [jobs/page.tsx](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/(app)/jobs/page.tsx#L132-L165)
  - `job.title` em `dangerouslySetInnerHTML` ([jobs/page.tsx:L136](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/(app)/jobs/page.tsx#L136))
  - `job.description` em `dangerouslySetInnerHTML` ([jobs/page.tsx:L154](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/(app)/jobs/page.tsx#L154))

## Impacto
- Roubo de sessão/tokens acessíveis ao frontend (dependendo do modelo de auth e cookies).
- Phishing inline, alteração de UI (defacement), redirecionamentos e exfiltração de dados exibidos.

## Recomendação de correção (detalhada)
- **Preferencial:** renderizar como texto (sem HTML) quando possível.
- **Se HTML for necessário:** sanitizar com allowlist estrita (ex.: DOMPurify) antes de renderizar.
- **Defesa adicional:** implementar CSP (ex.: `script-src 'self'`) e evitar `unsafe-inline` sempre que possível.

---

### SFR-004 — Risco LGPD/GDPR: envio de PII para provedores de IA sem controles explícitos

## Classificação
- **Severidade:** Alta
- **Categoria:** OWASP A02/A05 (exposição e governança de dados) + compliance (LGPD/GDPR)
- **Camada:** 2 (Backend) / 5 (Config) / 6 (Dependências/Integrações)

## Descrição
O sistema envia conteúdo de currículo (inclui e-mail/telefone/localização/experiências) e texto de perfil do LinkedIn para provedores externos (Gemini/OpenRouter) para análise/extração/adaptação. Não há evidência no código de:
- consentimento explícito e granular;
- minimização/mascaramento de dados;
- política/controle de retenção;
- segregação por ambiente e DPA/contratos (fora do código, mas deve existir no processo).

## Localização (principais pontos)
- [resumes/import/route.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/api/resumes/import/route.ts#L187-L226)
- [resumes/[id]/analyze/route.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/api/resumes/%5Bid%5D/analyze/route.ts#L167-L226)
- [resumes/[id]/adapt/route.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/api/resumes/%5Bid%5D/adapt/route.ts#L193-L305)
- [linkedin/audit/route.ts](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/api/linkedin/audit/route.ts#L64-L154)

## Impacto
- Exposição indevida de dados pessoais a terceiros (inclusive dados sensíveis dependendo do currículo).
- Risco legal/regulatório (LGPD/GDPR), risco reputacional e obrigação de notificação em incidentes.

## Recomendação de correção (detalhada)
- **Consentimento:** UI/termos com opt-in explícito para “processamento por IA”, separado por finalidade (importação, análise, auditoria).
- **Minimização:** remover/mascarar e-mail, telefone e outros identificadores antes do envio quando não necessários.
- **Config de retenção:** definir e aplicar retenção/expurgo de `profileText` e conteúdo bruto; armazenar apenas derivativos necessários.
- **Governança:** manter DPA com provedores, mapear sub-processadores, e registrar base legal + finalidade (LGPD Art. 7).
- **Auditoria:** adicionar logs de auditoria (quem enviou o quê, quando, para qual provedor), sem armazenar payload bruto em logs.

## 4) Findings — Tier 2 (Hardening Report)

### HR-01 — Arquivos/artefatos locais e dados persistidos versionados (exposição e risco operacional)
- **Severidade:** Alta (quando contém dados), Média (quando é “apenas” artefato)
- **Evidências:**
  - `.next/` presente (build cache/artefatos) — [`.next/`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/.next/)
  - DBs SQLite em `prisma/` — [`prisma/dev.db`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/prisma/dev.db) e [`prisma/prisma/dev.db`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/prisma/prisma/dev.db)
  - logs locais versionados — [`dev-server.log`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/dev-server.log), [`debug.log`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/debug.log), [`prisma/debug.log`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/prisma/debug.log)
  - pasta `.projeto/` com documentação interna — [`.projeto/`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/.projeto/)
- **Impacto:** vazamento de dados locais (potencial PII), vazamento de paths internos e metadados; bloat do repositório; risco de publicar artefatos por engano.
- **Correção:** remover do versionamento (manter apenas fontes), reforçar `.gitignore` (já contém entradas) e aplicar “clean” do repositório; adicionar guardrails (pre-commit/CI) para bloquear DB/log/build.

### HR-02 — Ausência de headers de segurança (CSP/HSTS/XFO/etc)
- **Severidade:** Média
- **Localização:** [next.config.mjs](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/next.config.mjs#L1-L27)
- **Impacto:** aumenta superfície para XSS, clickjacking, MIME sniffing e downgrade de transporte.
- **Correção:** adicionar headers globais: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

### HR-03 — Rate limiting ausente em endpoints caros (IA, importação)
- **Severidade:** Média
- **Evidência:** dependência `@upstash/ratelimit` existe, mas não é usada no código de `app/api/**`.
- **Impacto:** abuso por automação (DoS/custos), mesmo com quota mensal por usuário.
- **Correção:** aplicar rate limit por IP + usuário em rotas de IA e importação (ex.: 5 req/min por usuário + burst control).

### HR-04 — Exposição de detalhes internos de erro para o cliente (importação)
- **Severidade:** Média
- **Localização:** [`resumes/import/route.ts`](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/app/api/resumes/import/route.ts#L161-L173)
- **Impacto:** leakage de mensagens internas e detalhes de bibliotecas/stack; facilita exploração e recon.
- **Correção:** retornar mensagens genéricas ao cliente e registrar detalhes somente em logs server-side (com redaction).

### HR-05 — CSRF: rotas state-changing sem proteção explícita
- **Severidade:** Média
- **Evidência:** rotas POST/PUT/DELETE em `app/api/**` não validam token CSRF.
- **Impacto:** dependendo do modo de cookie/sessão do Clerk (SameSite/3rd-party), pode permitir ações não intencionais sob sessão válida.
- **Correção:** adotar proteção CSRF (token duplo / header + cookie) para rotas com efeitos (import, create/update/delete, audit).

### HR-06 — CORS e preflight incompletos para `/api/*`
- **Severidade:** Baixa/Média
- **Localização:** [next.config.mjs](file:///m:/DEV/DESENVOLVIMENTO/Gerador-curriculo-2.0/next.config.mjs#L15-L26)
- **Impacto:** comportamento inconsistente em browsers; ausência de `Vary: Origin`; risco de má configuração futura.
- **Correção:** responder adequadamente a `OPTIONS`, adicionar `Vary: Origin` e alinhar `Access-Control-Allow-Credentials` se necessário (sem `*`).

## 5) Plano de Ação Priorizado (por risco)

### Imediato (CRÍTICO)
1) **Rotacionar/revogar todas as chaves expostas** e tratar como incidente (SFR-001).
2) **Remover `.env` e outros artefatos sensíveis** do repositório e bloquear reincidência (pre-commit/CI) (SFR-001 + HR-01).
3) **Atualizar dependências vulneráveis HIGH/CRITICAL** com validação via testes e regressão (SFR-002).

### Curto prazo (ALTO)
4) **Corrigir XSS** removendo `dangerouslySetInnerHTML` ou sanitizando estritamente (SFR-003).
5) **Implementar governança de dados para IA** (consentimento, minimização, retenção, auditoria) (SFR-004).

### Médio prazo (MÉDIO)
6) **Adicionar headers de segurança** (CSP/HSTS/XFO/etc) e revisar CORS/preflight (HR-02/HR-06).
7) **Aplicar rate limiting** em endpoints caros e sensíveis (HR-03).
8) **Padronizar tratamento de erros** (sem detalhes ao cliente; redaction; IDs de correlação) (HR-04).
9) **Adicionar CSRF protection** para rotas state-changing se aplicável ao modelo de sessão (HR-05).

### Manutenção contínua
10) Automatizar: `npm audit` em CI, dependabot/renovate, secret scanning, e revisões periódicas (mensais) de segurança.
