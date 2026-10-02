# Planos e cobrança

A cobrança usa Stripe Checkout, Customer Portal e webhook assinado. A página pública de preços direciona para `GET /api/stripe/checkout?plan=...`.

## Limites normalizados

| Plano | Currículos | Análises/mês | Adaptações/mês | Auditorias/mês |
|---|---:|---:|---:|---:|
| FREE | 1 | 1 | 0 | 0 |
| PRO | 10 | 10 | 10 | 3 |
| MAX | 30 | 50 | 30 | 10 |

O webhook atual também reconhece produtos únicos `UNIC` e `PC_PRO`, enquanto `lib/plan.ts` normaliza limites apenas para FREE, PRO e MAX. Antes de comercializar produtos únicos, essa diferença deve ser resolvida no domínio de planos.

No cancelamento, estorno ou exclusão de conta, o plano retorna a FREE ou a assinatura é cancelada conforme o evento aplicável.