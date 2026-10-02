# Documentação do ATRION

Esta documentação descreve a implementação presente no repositório. O código é a fonte de verdade quando houver conflito. Arquivos em `roadmap/`, `PRD.md` e especificações de recursos ainda não implementados são planejamento histórico.

## Comece aqui

- [Visão de arquitetura](architecture/overview.md)
- [Stack e integrações](architecture/tech-stack.md)
- [Estrutura de pastas](architecture/folder-structure.md)
- [Modelo de dados](architecture/database-schema.md)
- [Segurança e privacidade](architecture/security.md)
- [Referência de API](api/README.md)

## Produto implementado

- [Funcionalidades](features/README.md): editor, templates, IA, LinkedIn, vagas, conta e billing.
- [Fluxos](flows/README.md): criação/importação, IA, LinkedIn, pagamentos e LGPD.
- [Funções e módulos](functions/implemented.md): mapa dos principais módulos de código.

## Planejamento

- [Roadmap](roadmap/README.md)
- [PRD](PRD.md)
- Documentos de recursos que não aparecem na tabela de funcionalidades implementadas.

## Manutenção

Ao alterar uma funcionalidade, atualize a página correspondente em `features/`, o fluxo em `flows/` quando houver mudança no processo do usuário, e `api/endpoints.md` quando houver alteração de rota, método ou contrato.