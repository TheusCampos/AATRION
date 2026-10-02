# Rate limiting

`lib/rate-limit.ts` aplica janelas deslizantes por identificador do usuário. Redis convencional (`REDIS_URL`) tem prioridade; Upstash REST é usado como alternativa. Sem ambos, há fallback em memória por processo.

| Constante | Limite | Usos atuais |
|---|---:|---|
| `RATE_LIMITS.ai` | 5/min | análise, adaptação, melhoria e auditoria LinkedIn |
| `RATE_LIMITS.upload` | 10/min | upload de foto e importação de currículo |
| `RATE_LIMITS.jobs` | 30/min | busca no Adzuna |
| `RATE_LIMITS.checkout` | 3/min | checkout Stripe |
| `RATE_LIMITS.general` | 30/min | configurações e leitura de arquivos |

Ao exceder o limite, a API retorna 429 com `Retry-After`, `X-RateLimit-Limit` e `X-RateLimit-Remaining`. Se o limitador falhar, a resposta é 503 para evitar liberar rotas sensíveis sem proteção.

Rate limiting não substitui as cotas mensais de IA. As cotas de plano são aplicadas por `lib/plan.ts` e retornam 403 quando o consumo permitido já foi atingido.