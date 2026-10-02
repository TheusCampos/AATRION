# Autenticação

O ATRION usa Clerk para login e cadastro. As rotas de interface são `/login` e `/register`, ambas compostas pelos componentes do provedor.

Após a autenticação, `getCurrentUser()` sincroniza a identidade do Clerk com a tabela local `User`. O registro local armazena dados de produto que não pertencem ao Clerk: plano, papel, preferências, contadores de IA e referências Stripe.

Não há Better Auth, endpoints próprios de autenticação ou MFA customizado no código atual.