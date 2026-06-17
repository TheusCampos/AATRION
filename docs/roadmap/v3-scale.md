# V3 — Escala e Retenção (Semanas 13–20)

> **Objetivo:** **MRR R$ 10.000**. Foco em **retenção** (churn < 8%) e
> **aquisição orgânica** (SEO).

## Meta de Saída

- ✅ 200 usuários Pro
- ✅ MRR R$ 10.000
- ✅ Churn mensal < 8%

---

## Áreas de Foco

### 1. SEO — Aquisição Orgânica

| # | Tarefa | Impacto |
|---|---|---|
| 1 | Blog com MDX (2 posts/semana) | Tráfego orgânico crescente |
| 2 | Páginas de templates indexáveis (`/templates/[cargo]`) | Long-tail SEO |
| 3 | Programmatic SEO: páginas por área (TI, Saúde, Direito, Engenharia) | Escala |
| 4 | Schema.org (FAQPage, CreativeWork, Organization) | Rich snippets |
| 5 | Sitemap dinâmico e robots.txt | Indexação |
| 6 | Open Graph images dinâmicas (geração por template) | CTR social |

**URLs prioritárias (já validadas no Doc 5):**
- `/curriculo-online` (22k/mês)
- `/templates/desenvolvedor` (3.4k/mês)
- `/templates/engenheiro` (2.9k/mês)
- `/blog/como-passar-no-ats` (1.2k/mês)
- `/blog/linkedin-para-dev` (2.1k/mês)
- `/blog/curriculo-primeiro-emprego` (4.8k/mês)

### 2. Retenção — Manter Usuários Engajados

| # | Tarefa | Impacto |
|---|---|---|
| 7 | Link público do currículo com analytics | Visibilidade, orgulho |
| 8 | Histórico de auditorias LinkedIn + gráfico de evolução | Retorno periódico |
| 9 | Email sequence de reengajamento (Resend) | Reduzir churn |
| 10 | Onboarding guiado (checklist de 5 tarefas) | Ativação |
| 11 | Tracker de candidaturas integrado (uso diário) | Hábito |
| 12 | Auditoria LinkedIn periódica como "ritual mensal" | Retorno |

### 3. Aquisição — Crescer Base

| # | Tarefa | Impacto |
|---|---|---|
| 13 | Programa de referral (1 mês grátis por indicação) | Viralidade |
| 14 | Plano anual com destaque (32% off) | LTV maior |
| 15 | Templates por área de atuação | Nicho + SEO |
| 16 | TikTok/Reels: 3 posts/semana | Audiência jovem |
| 17 | LinkedIn orgânico (conta do fundador) | Audiência tech |

### 4. Segurança Avançada

| # | Tarefa | Quando |
|---|---|---|
| 18 | MFA obrigatório para Pro (configurável por feature) | V3.1 |
| 19 | Penetration test básico (OWASP ZAP) | V3.2 |
| 20 | DPO definido + política de privacidade revisada | Lançamento |

### 5. Operações

| # | Tarefa | Quando |
|---|---|---|
| 21 | Upgrade para Neon Pro (US$ 19/mês) | Quando > 5GB storage |
| 22 | Upgrade para Vercel Pro (US$ 20/mês) | Quando > 100k funcs/mês |
| 23 | 2º worker Puppeteer no Fly.io (load balancing) | Quando > 50 PDFs/dia |
| 24 | Observabilidade: traces (Sentry Performance) | V3.1 |

## Email Sequence de Ciclo de Vida

| Email | Trigger | Assunto | Meta |
|---|---|---|---|
| Boas-vindas | Cadastro confirmado | "Seu currículo profissional começa agora" | Ativar |
| Ativação IA | 24h sem ATS | "Seu CV tem uma nota. Você quer saber?" | Mostrar diferencial |
| LinkedIn Nudge | 48h sem audit | "Recrutadores buscaram seu perfil hoje" | Mostrar exclusivo |
| CV incompleto | 72h completeness < 60% | "Seu currículo está quase pronto" | Reativar |
| Upsell ATS | Tenta feature Pro | "Desbloqueie o ATS Score por vaga — R$29/mês" | Converter |
| Upsell Anual | 30d Pro Mensal | "Você já investiu R$29. Por R$197 = 1 ano" | Migrar |
| Reengajamento | 7d sem login | "Seu perfil LinkedIn pode estar perdendo visibilidade" | Trazer de volta |
| Cancelamento | Cancelou | "Antes de ir: 3 meses por R$49?" | Salvar churn |
| NPS | 30d Pro | "De 0 a 10, qual a chance de recomendar?" | Medir |

## Métricas de Validação

| Métrica | Meta V3 |
|---|:---:|
| Visitantes únicos/mês | > 50.000 |
| Cadastros/semana | > 200 |
| Conversão Free → Pro | > 5% |
| Churn mensal Pro | < 8% |
| MRR | R$ 10.000 |
| Pro Anual / Pro total | > 30% |
| NPS | > 50 |
| Tráfego orgânico | > 40% do total |

## Critérios de Saída para V4

- [ ] MRR R$ 10.000+ por 2 meses consecutivos
- [ ] 200+ Pro ativos
- [ ] Tráfego orgânico > 40%
- [ ] LTV médio > R$ 220
- [ ] CAC médio < R$ 30
