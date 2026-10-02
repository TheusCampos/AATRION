# Adaptação por vaga

A adaptação está em `POST /api/resumes/[id]/adapt`. O usuário informa descrição da vaga (obrigatória), cargo e empresa opcionais. A IA propõe alterações para resumo, experiências e habilidades sem aplicar automaticamente ao currículo.

A interface mostra um diff e exige que o usuário aceite a sugestão antes de o estado do editor ser atualizado e salvo. O endpoint aplica cota mensal e rate limit; no plano FREE, a cota de adaptação é zero.

A melhoria de resumo usa o endpoint relacionado `/api/resumes/[id]/enhance` e também consome a cota de análise.