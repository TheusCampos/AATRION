# Análise ATS

A análise é solicitada em `POST /api/resumes/[id]/analyze`. O endpoint recupera o currículo do usuário, aplica validação e proteções para IA, gera um resultado estruturado e persiste apenas o score numérico mais recente em `Resume.atsScore`.

O resultado exibido no editor inclui nota geral, dimensões de leitura/qualidade/aderência, pontos fortes, melhorias, correções, palavras-chave ausentes e matriz de requisitos quando há vaga alvo.

A análise é limitada por plano e por janela de requisições. Não há histórico persistido de análises no schema atual.