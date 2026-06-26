# V4 — Expansão (Mês 5+)

> **Objetivo:** **MRR R$ 50.000**. Expansão de mercado e novas verticais.
> Validar que o ATRION pode ser uma plataforma de carreira completa.

## Meta de Saída

- ✅ 1.000 usuários Pro
- ✅ MRR R$ 50.000
- ✅ Presença multi-país (PT-BR + EN + ES)

---

## Áreas de Foco

### 1. Novos Produtos

| # | Produto | Descrição | Dependência |
|---|---|---|---|
| 1 | **LinkedIn Optimizer Chat** | Conversa em tempo real com IA para melhorar perfil | 1000+ usuários |
| 2 | **Simulador de Entrevista com Voz** | Web Speech API, feedback de IA | 200k+ usuários |
| 3 | **Portfólio Online** | Mini-site pessoal em `cvforge.com.br/nome` | 1000+ Pro |
| 4 | **Link Rastreável** | Notificação quando recrutador abre o CV | — |
| 5 | **Career Coach IA** | Chat personalizado de carreira | 1000+ Pro com histórico |
| 6 | **Salary Benchmark** | Estima faixa salarial para negociação | Dataset de vagas |
| 7 | **Job Match IA** | Recomenda vagas compatíveis (parceria com job boards) | APIs de vagas |
| 8 | **ATRION for Teams** | Plano empresarial para RH padronizar templates | 500+ Pro individuais |

### 2. Internacionalização

| # | Tarefa |
|---|---|
| 9 | i18n com `next-intl` (PT-BR / EN / ES) |
| 10 | Tradução de todos os templates (EN) |
| 11 | Preços em USD e EUR (mantendo BRL principal) |
| 12 | Conformidade GDPR (mercado europeu) |

### 3. Integrações

| # | Tarefa |
|---|---|
| 13 | LinkedIn API oficial (após aprovação) |
| 14 | Importação de currículo do LinkedIn (1-click) |
| 15 | Publicação direta no LinkedIn (post sugerido → LinkedIn) |
| 16 | Webhooks para parceiros (ATS externos) |
| 17 | API pública para desenvolvedores (plano Pro+ ou Enterprise) |

### 4. Escala Técnica

| # | Tarefa | Quando |
|---|---|---|
| 18 | Migrar para Postgres cluster (Neon Scale) | > 10k usuários |
| 19 | CDN agressivo para templates | > 50k usuários |
| 20 | Workers Puppeteer em pool (3–5 instâncias) | > 100 PDFs/dia |
| 21 | Cache de prompts comuns (Redis) | Quando custo IA > 30% da receita |
| 22 | Backup automatizado R2 → S3 Glacier | Sempre |
| 23 | Plano de disaster recovery documentado | V4.1 |

### 5. Novos Modelos de Negócio

| # | Modelo | Descrição |
|---|---|---|
| 24 | **ATRION for Teams** | R$ 99/usuário/mês. RH padroniza templates, audita candidatos. |
| 25 | **API Pública** | Pay-per-use. Integração com job boards, edtechs, etc. |
| 26 | **Marketplace de Templates** | Designers vendem templates premium (ATRION fica com 30%) |
| 27 | **White-label** | Para empresas de RH e universidades |

## Visão de Longo Prazo (3 Anos)

> Ser a **plataforma de posicionamento profissional líder no Brasil**, com
> mais de 500.000 usuários e presença em toda a América Latina. O produto
> evoluiu de "gerador de CV" para **"copiloto de carreira"** — acompanhando o
> profissional do currículo à contratação.

## Fosso Competitivo (Moat) a Construir

1. **Dados proprietários:** análise de CVs e perfis LinkedIn acumula dataset
   de habilidades mais valorizadas por área — vantagem que cresce com o tempo.
2. **Efeito de rede:** programa de referral + conteúdo gerado por usuários
   (templates criados por profissionais da área).
3. **SEO composto:** centenas de páginas indexáveis (CV por cargo, guias de
   LinkedIn por área) geram tráfego orgânico crescente.
4. **Switching cost:** usuário com 5+ currículos, histórico de auditorias e
   tracker de candidaturas no ATRION tem custo alto de migração.

## Métricas de Validação

| Métrica | Meta V4 final |
|---|:---:|
| Usuários totais | 60.000 |
| Usuários Pro | 1.400 |
| MRR | R$ 50.000 |
| ARR | R$ 600.000 |
| Auditorias LinkedIn/mês | 6.000 |
| CAC médio | R$ 18 |
| LTV médio Pro | R$ 260 |
| NPS | > 60 |

## Riscos da V4

| Risco | Mitigação |
|---|---|
| Concorrente grande copiar | Velocidade de execução + base instalada |
| Custo de IA crescer | Interface abstrai provedor, múltiplos LLMs |
| LinkedIn bloquear scraping | Já tem Proxycurl + estratégia em 3 camadas |
| Internacionalização travar qualidade | i18n desde o início, não retrofit |
| Times desviar foco do core | Times é produto separado, equipe dedicada |
