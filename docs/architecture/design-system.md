# Design system atual

A interface usa Tailwind CSS e componentes locais em `components/ui/`. Não há uma biblioteca shadcn/Radix instalada como dependência direta nem um arquivo separado de tokens CSS.

## Componentes base

| Componente | Local | Responsabilidade |
|---|---|---|
| `Button` | `components/ui/Button.tsx` | variantes, tamanho e estado de carregamento |
| `Input` e `Label` | `components/ui/Input.tsx` | entrada de texto e rótulo |
| `Card` | `components/ui/Card.tsx` | agrupamento visual |
| `AILoader` | `components/ui/AILoader.tsx` | feedback de operações de IA |

## Padrões da aplicação

- Paleta neutra baseada em Slate e Indigo, com Tailwind para espaçamento e responsividade.
- Ícones vêm de `lucide-react`.
- O editor usa três áreas em telas largas: navegação de seções, formulário e preview. Em telas menores, as áreas se empilham.
- Templates de currículo controlam a apresentação do documento. O painel de estilo expõe cor, tipografia, espaçamento e organização de seções.
- Modais do editor usam portal, fechamento por `Escape` e bloqueio temporário do scroll do body.

Acessibilidade e consistência visual devem ser avaliadas junto às alterações de componente; não há uma suíte automatizada específica de design system no repositório atual.