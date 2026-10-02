# Autenticação e autorização da API

A aplicação usa Clerk. As páginas `/login` e `/register` renderizam os componentes oficiais do provedor; não há API local para cadastro, login, MFA ou redefinição de senha.

## Proteção de páginas

O middleware protege dashboard, editor/currículos, LinkedIn, configurações e administração. Rotas fora dessa lista são públicas por padrão.

## Proteção de dados

Handlers privados chamam `getCurrentUser()` em `lib/auth.ts`. A função recupera a identidade Clerk e encontra ou sincroniza o registro correspondente na tabela `User` por `clerkId`.

Para recursos de usuário, a consulta deve sempre incorporar `userId` ou um filtro equivalente. Exemplos atuais:

- Currículo: `where: { id, userId: user.id }`.
- Auditoria LinkedIn: `where: { id, userId: user.id }`.
- Arquivo R2: a chave `photos/{userId}/...` precisa corresponder ao usuário autenticado.

## Administração

O papel é persistido em `User.role`. A sessão não transforma automaticamente alguém em administrador: páginas e handlers administrativos precisam validar `role === 'ADMIN'` no servidor.