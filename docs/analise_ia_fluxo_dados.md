# Análise do Fluxo de IA e Armazenamento de Dados

Este documento apresenta uma análise profunda sobre como o sistema gerencia as funcionalidades de Inteligência Artificial (Análise e Adaptação de currículos), como os dados são persistidos e as validações de segurança adotadas para garantir o isolamento das informações de cada usuário.

## 1. Fluxo de Uso dos Usuários em Relação às IAs

### Análise de IA (`/api/resumes/[id]/analyze`)
1. **Requisição**: O usuário, autenticado, solicita a análise de um currículo específico, podendo enviar opcionalmente a descrição/título de uma vaga alvo.
2. **Validações Preliminares**:
   - **Autenticação**: O sistema valida se o usuário está logado usando `getCurrentUser()` (via Clerk).
   - **Rate Limiting e Cota**: Valida os limites de uso contra abusos (Rate Limit) e verifica as cotas do plano ativo do usuário (mensais).
   - **Propriedade**: O sistema busca o currículo no banco e **assegura** que `resume.userId === user.id`.
3. **Processamento**:
   - O conteúdo em JSON do currículo é convertido para texto através da função `buildResumeText`, enviando apenas os dados estritamente necessários para a IA (omite dados sensíveis desnecessários, como e-mail/telefone - SEC-014).
   - Um prompt estruturado e robusto é enviado ao Gemini (ou provedor configurado).
4. **Retorno**: A IA devolve um JSON com melhorias (resumo, pontos fortes, dicas de ATS, falhas, gap de palavras-chave e pontuação geral).
5. **Atualização**: A pontuação `atsScore` é salva automaticamente no banco e a cota de uso do usuário é consumida.

### Adaptação de IA (`/api/resumes/[id]/adapt`)
1. **Requisição**: Semelhante à análise, mas o foco é otimizar o texto das experiências, resumo e habilidades de acordo com uma "vaga alvo".
2. **Segurança e Isolamento**: Mantém as mesmas checagens estritas de ID do usuário, Rate Limit e Cotas de Adaptação (que são processadas independentemente das análises).
3. **Fusão Inteligente (Merge)**: 
   - A IA propõe textos novos para as seções (resumo, descrição de experiências, habilidades).
   - **Crucial**: O sistema usa a função `mergeAdapted()` que **cruza os IDs originais** dos itens (experiência, projetos) com os retornados pela IA. Isso garante que a IA não altere datas, cargos base ou invente dados. Ela apenas aprimora as descrições dos nós que já existiam, mantendo total fidelidade histórica.
4. **Devolução**: O JSON fundido e aprimorado é retornado ao cliente. O salvamento final do currículo completo ocorre de forma tradicional através de um `PUT` na rota `/api/resumes/[id]`.

---

## 2. Como os Dados São Salvos

Os dados seguem um fluxo relacional (PostgreSQL/SQLite via Prisma):

- **Dados do Usuário (`User` model)**: 
  - Salvos no banco de dados e sincronizados via Clerk (`clerkId`).
  - Armazena metadados importantes, como o plano (`plan`), renovação, limites e **contadores de IA** (`aiAnalyzeUsed`, `aiAdaptUsed`, `aiUsagePeriod`). Esses contadores controlam e limitam as interações baseadas no mês corrente.
- **Currículo (`Resume` model)**:
  - O conteúdo de fato (experiências, habilidades, projetos, dados pessoais) é armazenado como um grande objeto JSON na coluna `content` (Serializado como String).
  - O `atsScore` (nota do ATS gerada pela IA) ganha uma coluna própria (`atsScore`) para eventuais métricas, facilitando listagem e dashboards, enquanto o restante vai inteiro dentro de `content`.
- **Rotina de Salvamento**: A rota `PUT /api/resumes/[id]` atualiza o currículo usando serialização `JSON.stringify()`, não expondo o modelo Prisma diretamente à injeções não estruturadas, validando a estrutura via esquemas do `Zod` (ex: `updateResumeSchema`).

---

## 3. Verificação de Isolamento (Mistura de Dados)

Após auditoria do código, **NÃO há risco evidente de mistura de dados entre usuários**. As barreiras encontradas são altamente robustas:

1. **Separação por Contexto de Sessão (Clerk)**:
   - A função `getCurrentUser()` acessa unicamente a sessão servida pelos tokens da requisição. Não há estado global que possa ser "sujado" por requisições concorrentes.
2. **Verificações Rígidas em Query (Ownership Guard)**:
   - Toda busca de currículo nas rotas de IA e edição é condicional: `where: { id: params.id, userId: user.id }`. Mesmo que o usuário "A" descubra o ID do currículo do usuário "B", a query falha e retorna `404 Not Found`.
3. **Imunidade a Alucinações da IA**:
   - A função de *merge* da IA (`mergeAdapted`) atua através de um mapeamento explícito por chaves: `Map(ai.experience.map(e => [e.id, e]))`.
   - Se a IA retornar uma experiência de outra pessoa inventada ou cruzada em cache de modelo, o sistema a ignora, pois o ID não corresponderá a nenhuma experiência presente na árvore original do currículo (`resume.content.experience`).

---

## 4. Melhorias Recomendadas

Apesar de a implementação atual ser extremamente bem-feita, seguem melhorias arquiteturais e operacionais:

1. **Sanitização de Outputs da IA em Produção (Fallback Timeout)**:
   - O uso de `runAI` e `gemini-2.5-flash` pode sofrer picos de latência. O fallback heurístico existe na rota `analyze`, mas na rota `adapt` o código retorna erro 502 se a IA falhar. Seria interessante devolver pelo menos os apontamentos da IA até o erro, usando um streaming response (SSE) para engajamento em tempo real do frontend.
2. **Versioning do Content (Histórico do Currículo)**:
   - Como o `adapt` substitui as informações originais do currículo, e se a versão IA não for satisfatória para o usuário? Aconselha-se implementar um mecanismo de *undo* local ou versionamento (`ResumeVersion` no banco de dados) para evitar a perda das informações originais ao clicar em "Adaptar".
3. **Telemetria dos Prompts**:
   - Guardar o prompt/resultado anonimizado em casos de erro ou de baixa nota da IA. Isso ajudaria a aprimorar o System Instruction futuramente. (Atenção para limpar PII do `content` antes de enviar os logs).

---

## 5. Como Monitorar essas Informações

Para extrair indicadores valiosos do uso e estabilidade das IAs, é recomendado adotar as seguintes métricas de monitoramento:

1. **Dashboard de Uso de Planos (Analytics Interno)**:
   - **Query Sugerida**: `SELECT plan, SUM("aiAnalyzeUsed") as analysis, SUM("aiAdaptUsed") as adaptations FROM "User" WHERE "aiUsagePeriod" = '2026-07' GROUP BY plan;`
   - Isso ajuda a ver quais planos consomem mais tokens de IA.
2. **Métricas de Performance da IA (PostHog/Datadog)**:
   - Enviar eventos customizados sempre que uma IA rodar: `{ event: 'ai_analyzed', properties: { atsScore: 85, provider: 'gemini', plan: 'PRO' } }`.
3. **Log de Exceções**:
   - Monitorar a taxa de fallback (quando `provider === 'heuristic'`). Se estiver muito alta, indica que a IA (Gemini/OpenRouter) está derrubando requisições, excedendo tokens ou falhando no parse de JSON.
4. **Monitoramento do ActivityLog**:
   - O banco já conta com uma tabela `ActivityLog` que pode ser utilizada para rastrear quando um usuário altera o plano, estoura o Rate Limit ou tem adaptações com falha. Expandir o uso desta tabela no catch de erros da IA.
