# V2 — Diferencial Competitivo (Semanas 7–12)

> **Objetivo:** ativar as **features que nenhum concorrente tem**.
> Cada uma deve ser medida individualmente para saber o que converte mais.

## Meta de Saída

- ✅ 50 usuários Pro
- ✅ Churn mensal < 12%

---

## Sprint V2-A — ATS Avançado + Adaptar (Semanas 7–8)

> **Feature de maior conversão do produto.** A IA adapta o CV para a vaga
> e mostra antes/depois.

| # | Tarefa | Esforço | Prioridade |
|---|---|---|---|
| 1 | ATS Score por vaga: parsing da descrição + keyword matching | 2d | 🔴 Crítico |
| 2 | Painel ATS Score: gauge animado, breakdown por categoria, issues | 2d | 🔴 Crítico |
| 3 | Adaptar CV para vaga: IA reescreve resumo + reordena habilidades | 2d | 🔴 Crítico |
| 4 | ATS Score antes/depois da adaptação | 1d | 🟠 Alto |
| 5 | Versões do CV por vaga: salvar e nomear versões | 1d | 🟠 Alto |

**Schema novo:**
- `JobVersion` (currículo adaptado)
- `AtsAnalysis` (histórico de scores)

## Sprint V2-B — LinkedIn Audit Pro + Tracker (Semanas 9–10)

> **Diferencial exclusivo + retenção.**

| # | Tarefa | Esforço | Prioridade |
|---|---|---|---|
| 6 | Proxycurl API: integrar para scraping de perfil LinkedIn | 1.5d | 🔴 Crítico |
| 7 | LinkedIn Audit: análise completa de 8 seções com notas | 2d | 🔴 Crítico |
| 8 | Ideias de posts LinkedIn personalizadas por IA | 1.5d | 🟠 Alto |
| 9 | Histórico de auditorias (salvar e comparar ao longo do tempo) | 1d | 🟠 Alto |
| 10 | Tracker de candidaturas: board Kanban com drag-and-drop | 2d | 🟠 Alto |

**Schema novo:**
- `Application` (tracker Kanban)
- `LinkedInAudit` (expandido com 8 seções + ideias de post)

## Sprint V2-C — IA Avançada + Templates (Semanas 11–12)

> **Completar a proposta de valor Pro.**

| # | Tarefa | Esforço | Prioridade |
|---|---|---|---|
| 11 | Carta de apresentação gerada por IA (por vaga) | 1.5d | 🟠 Alto |
| 12 | Simulador de recrutador: IA dá feedback como RH | 1.5d | 🟠 Alto |
| 13 | Upload de PDF existente + reescrita com IA | 2d | 🟠 Alto |
| 14 | 4 templates Pro adicionais (Creative, Tech, Sales, Academic) | 2d | 🟡 Médio |
| 15 | Consistência LinkedIn × CV: análise cruzada automática | 1d | 🟠 Alto |
| 16 | MFA (TOTP) + criptografia AES-256 + audit log | 2d | 🟠 Alto |

**Schema novo:**
- `CoverLetter`
- `AuditLog`
- Campos `mfaEnabled`, `mfaSecret_enc` em `User`

## Métricas de Validação por Feature

| Feature | Métrica principal | Meta |
|---|---|:---:|
| ATS por vaga | % de Pro que usam em 30d | > 70% |
| Adaptação por vaga | % de geração → aceitação | > 75% |
| Carta de apresentação | % de Pro que usam/mês | > 30% |
| Simulador de recrutador | NPS isolado da feature | > 60 |
| LinkedIn Audit Pro | Conversão após usar | > 15% |
| Tracker Kanban | DAU/MAU do tracker | > 25% |
| MFA | % de Pro que ativam | > 20% |

## Critérios de Saída para V3

- [ ] 50+ Pro ativos
- [ ] Churn mensal < 12%
- [ ] Pelo menos 3 features Pro com uso > 50% entre pagantes
- [ ] Custo de IA por Pro < US$ 0,50/mês (margem saudável)
- [ ] NPS > 45
