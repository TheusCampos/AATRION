# Templates e personalização

Os templates são renderizados por componentes em `components/resume/templates/`. O painel `EditorStylePanel.tsx` expõe 18 modelos, agrupados em essencial, transição, tecnologia, profissional e visual.

## Personalização atual

- Cor principal por presets ou valor customizado.
- Tipografia.
- Tamanho de fonte, altura de linha e espaçamento.
- Ordem e visibilidade de seções.
- Controle por plano para modelos premium.

O `templateId` é salvo no currículo; o estilo é serializado no campo `colorScheme` por compatibilidade com o schema atual.