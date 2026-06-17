# 🛣️ Roadmap

> Planejamento por versão e sprints detalhadas. Cada versão tem meta comercial
> clara e **gate** de saída (próxima versão só inicia com meta da anterior
> atingida).

## Visão Geral

| Versão | Período | Foco | Meta Comercial | Gate de Saída |
|---|---|---|---|---|
| **V1** — MVP | Semanas 1–4 | Produto funcional com pagamento | 1° pagante | 5 usuários Pro |
| **V1.1** — Polimento | Semanas 5–6 | Bugs, onboarding, primeiros feedbacks | 10 usuários Pro | NPS > 30 |
| **V2** — Diferencial | Semanas 7–12 | ATS por vaga, LinkedIn Audit Pro, Tracker | 50 Pro | churn < 12% |
| **V3** — Escala | Semanas 13–20 | SEO, retenção, plano anual, referral | 200 Pro | MRR R$ 10.000 |
| **V4** — Expansão | Mês 5+ | Novos produtos, i18n, times | 1.000 Pro | MRR R$ 50.000 |

## Princípio Fundamental

> **Cada versão deve gerar receita suficiente para pagar o custo da próxima.**
> Nunca investir em V2 sem validar V1 comercialmente.

## Detalhes por Versão

- 📍 [**V1 — MVP**](./v1-mvp.md) — 4 sprints para o primeiro pagante
- 🎨 [**V1.1 — Polimento**](./v1.1-polish.md) — Qualidade após feedback real
- 🚀 [**V2 — Diferencial**](./v2-differential.md) — Features que ninguém tem
- 📈 [**V3 — Escala**](./v3-scale.md) — Crescimento sustentável
- 🌍 [**V4 — Expansão**](./v4-expansion.md) — Novos mercados e produtos

## Métricas North Star

| Métrica | Por quê |
|---|---|
| **Gerador de CV:** Nº de usuários que geraram ATS Score por vaga E exportaram o PDF adaptado | Captura o fluxo completo de valor |
| **LinkedIn Audit:** Nº de usuários que receberam auditoria E implementaram ≥ 1 sugestão em 30 dias | Mede impacto real, não apenas consumo |

## Marcos Financeiros

| Marco | Projeção | Significado |
|---|---|---|
| Primeiro pagante | Semana 4 | Validação comercial |
| Break-even | Mês 2 | MRR cobre custos |
| MRR R$ 5.000 | Mês 6 | Produto validado |
| MRR R$ 10.000 | Mês 8 | Renda principal solo dev |
| MRR R$ 20.000 | Mês 11 | Justifica 1º funcionário |
| ARR R$ 200.000 | Mês 12 | Base para captação |

## Premissas de Modelagem

- Conversão Free → Pro: 3–5%
- Churn mensal Pro: 10%
- Churn anual Pro Anual: 30%
- Custo OpenAI por Pro: US$ 0,15–0,40/mês
- CAC orgânico: R$ 0–15

> Premissas podem ser ajustadas conforme dados reais chegam.

## Riscos Top 5 (versão executiva)

| Risco | Mitigação |
|---|---|
| Ninguém pagar no V1 | Lançar em 30 dias, validar, pivotar |
| LinkedIn scraping bloqueado | 3 camadas: manual → Proxycurl → API oficial |
| Custo de IA escalar | Interface `aiClient` abstrai provedor |
| Puppeteer instável | Fila + retry + fallback para react-pdf |
| Churn alto | Tracker cria hábito diário; auditoria periódica |
