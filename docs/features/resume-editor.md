# Editor de currículo

O editor está em `components/resume/ResumeEditor.tsx` e é exibido em `/editor/[id]`.

## O que o usuário pode fazer

- Editar dados pessoais, experiências, formação, habilidades, projetos, idiomas e certificações.
- Visualizar alterações em tempo real.
- Salvar manualmente ou por autosave com debounce de dois segundos.
- Abrir o preview em tela cheia.
- Alterar template e estilo.
- Usar análise ATS, adaptação por vaga e melhoria de resumo.
- Exportar o preview por impressão do navegador em formato A4.

## Persistência

O editor envia `PUT /api/resumes/[id]`. O currículo é validado por `resumeContentSchema` e armazenado como JSON em `Resume.content`.

## Seções

`personal`, `experience`, `education`, `skills`, `projects`, `languages` e `certifications` são as seções do contrato atual. Mudanças nesse contrato devem atualizar os formulários, preview, templates, validações e testes.