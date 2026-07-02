# ATRION — Gerador de Currículos Profissionais com IA

<img src="./public/Logo-atrion-fundo.png" alt="Logo do ATRION" width="250" height="250" style="border-radius: 50%; align: center;">

O **ATRION** é um SaaS completo e inteligente projetado para alavancar a recolocação profissional e o desenvolvimento de carreira. A plataforma permite criar currículos profissionais de alta conversão, analisá-los contra sistemas de triagem (ATS), adaptá-los cirurgicamente para vagas de emprego usando inteligência artificial, auditar perfis do LinkedIn e buscar vagas reais integradas.

---

## 🚀 1. O que é o Sistema?

O ATRION é um ecossistema completo para candidatos que buscam se destacar no mercado de trabalho. Ele resolve as principais dores de quem está se candidatando a vagas:
- **Criação Rápida e Customizada**: Editor intuitivo e dinâmico com diversos templates profissionais.
- **Adaptação Estratégica**: Reescreve e otimiza seções do currículo com base nos requisitos e palavras-chave de uma vaga específica usando IA (Gemini & OpenRouter), sem inventar dados falsos.
- **Análise ATS Avançada**: Avalia o currículo, atribui uma nota de 0 a 100 e aponta pontos fortes, gaps de palavras-chave e melhorias de escrita necessárias.
- **Auditoria de LinkedIn**: Analisa a estrutura e o conteúdo do perfil para aumentar o alcance orgânico e a atratividade para recrutadores.
- **Busca de Vagas Integrada**: Painel para buscar vagas reais do mercado em tempo real via API da Adzuna.

---

## 🛠️ 2. Como o Sistema Funciona?

O ATRION é estruturado como uma aplicação moderna em **Next.js 14** utilizando as melhores práticas do mercado:

### Arquitetura e Fluxo de Dados
1. **Autenticação Segura e Controle de Acesso**: Gerenciada pelo **Clerk**, assegurando o login social (Google) e tradicional de forma robusta. O middleware protege as rotas privadas. Existe uma hierarquia de acesso (`role`) suportando perfis de `USER` e `ADMIN`.
2. **Camada de Banco de Dados**: Utiliza o **Prisma ORM** conectado a um banco de dados **PostgreSQL (NeonDB)** em produção/desenvolvimento.
3. **Mecanismo de IA**: O wrapper dinâmico em `lib/ai.ts` processa as solicitações através da API oficial do **Google Gemini** (padrão) e possui fallback automático para o **OpenRouter** (modelos grátis) em caso de instabilidade. Se ambos falharem, há um sistema de regras heurísticas locais para análise básica.
4. **Exportação de PDF**: Realizada diretamente no navegador do cliente usando `html2canvas` para renderizar o layout do currículo em alta definição e `jsPDF` para gerar o documento A4 sem perdas de formatação ou problemas de quebra de página.
5. **Integração de Pagamento Segura**: O **Stripe** processa assinaturas com Webhooks validados, incluindo verificação de **idempotência** local para evitar duplicidade.
6. **Privacidade (LGPD)**: Quando o usuário exclui a conta, seus dados são expurgados do banco, do Clerk e **a assinatura do Stripe é automaticamente cancelada**, garantindo que nenhuma cobrança indevida ocorra.

---

## 💻 3. Como Usar o Sistema?

### Pré-requisitos
- Node.js (versão 18 ou superior) ou Bun
- Uma conta no Clerk para as chaves de autenticação
- Chaves de API do Google Gemini ou OpenRouter
- Chaves de API do Stripe (Modo de Testes)

### 3.1 Instalação e Configuração Local

1. **Clone o repositório** e acesse a pasta do projeto.
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto (use o arquivo `.env.example` como referência) e preencha as chaves:
   ```env
   # Banco de Dados (PostgreSQL)
   DATABASE_URL="postgresql://..."
   DATABASE_URL_UNPOOLED="postgresql://..."

   # Autenticação (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

   # Inteligência Artificial
   OPENROUTER_API_KEY=sk-or-v1-...
   # (Gemini usa as credenciais via SDK ou OpenRouter)

   # API de Busca de Vagas (Adzuna)
   ADZUNA_APP_ID=...
   ADZUNA_APP_KEY=...

   # Pagamentos (Stripe)
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_PRO=price_...
   STRIPE_PRICE_ID_MAX=price_...
   STRIPE_PRICE_ID_UNIC=price_...
   STRIPE_PRICE_ID_PC_PRO=price_...

   # URL da Aplicação
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Prepare o banco de dados** rodando as migrações do Prisma:
   ```bash
   npx prisma db push
   ```
5. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação em `http://localhost:3000`.

---

## 💳 4. Modelos de Planos e Acesso

O ATRION conta com restrições automáticas de recursos baseadas no nível do plano do usuário:

| Recurso | Plano FREE | Plano Semanal (R$ 9,90) | Plano PC Max Semanal (R$ 14,90) | Plano PRO Mensal (R$ 19,90) | Plano MAX Mensal (R$ 39,90) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Limites de Currículos** | 1 currículo ativo | Recursos completos por 7 dias | Recursos completos por 7 dias | Até 10 currículos | Até 30 currículos |
| **Templates Liberados** | Primeiros 3 modelos | Todos (7 dias) | Todos (7 dias) | Todos os modelos | Todos os modelos |
| **Análise com IA** | Básica | 1 Auditoria completa | 1 Adaptação de vaga + ATS | 10 análises/mês | 50 análises/mês |
| **Adaptação com IA** | Bloqueado | Bloqueado | Liberado | 10 adaptações/mês | 30 adaptações/mês |
| **Auditoria LinkedIn** | Bloqueado | 1 Auditoria completa | Bloqueado | 3 auditorias/mês | 10 auditorias/mês |
| **Remoção de Marca d'água**| Não | Sim (7 dias) | Sim (7 dias) | Sim | Sim |
| **Tipo de Cobrança** | Grátis vitalício | Pagamento Único | Pagamento Único | Assinatura Mensal | Assinatura Mensal |

---

## 📁 5. Estrutura de Pastas

```
app/
  (app)/                    # Área autenticada da aplicação
    admin/                  # Painel restrito a administradores (`role === 'ADMIN'`)
    dashboard/              # Painel do usuário e lista de currículos
    editor/[id]/            # Editor de currículo dinâmico, Preview e IA
    jobs/                   # Busca de vagas em tempo real (Adzuna)
    linkedin/               # Auditoria de perfil profissional LinkedIn
    settings/               # Perfil, consumo de IA e dados cadastrais
  (auth)/                   # Páginas de login e registro via Clerk
  api/                      # Endpoints HTTP da API do sistema
    stripe/checkout/        # Criação de sessões de checkout de pagamento
    webhooks/stripe/        # Recebimento de notificações de pagamento do Stripe
    resumes/                # CRUD de currículos e endpoints de IA
    user/settings/          # Leitura e gravação de preferências do usuário
  pricing/                  # Página de planos e contratação pública
components/
  resume/                   # Componentes específicos do editor de currículos
  ui/                       # Design System do ATRION (Cards, Botões, inputs)
lib/
  ai.ts                     # Wrapper das APIs de LLM (Gemini e OpenRouter)
  auth.ts                   # Lógica para obter usuário logado enriquecido
  plan.ts                   # Centralizador de cotas e regras de negócios
prisma/
  schema.prisma             # Modelagem de dados da aplicação
```

---

## 🧪 6. Testes Rápidos e Validação

Para certificar-se de que o sistema está íntegro localmente, você pode executar:
```bash
# Executar verificação de tipos estáticos do TypeScript
npx tsc --noEmit

# Validar o healthcheck da API
curl http://localhost:3000/api/health
# -> {"status":"ok","name":"atrion",...}
```