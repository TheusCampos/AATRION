# Auditoria de LinkedIn

O usuário fornece o texto do perfil, com URL, área e vaga alvo opcionais. O texto pode ser obtido a partir de PDF no fluxo de extração. A auditoria é processada de forma síncrona por IA e armazenada em `LinkedInAudit`.

## Resultado

O relatório contém nota geral, resumo executivo, categorias de avaliação, palavras-chave, conteúdo sugerido e plano de ação. Auditorias anteriores podem ser listadas, consultadas e excluídas pelo próprio usuário.

A entrada é limitada entre 100 e 40.000 caracteres e passa por validação, sanitização, detecção de prompt injection, rate limit e cota do plano.