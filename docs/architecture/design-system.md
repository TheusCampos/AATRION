# Design System

> Sistema de design tokens, componentes e estados de UI. Espelha o **Doc 6 —
> Design System e UX v3.0** do planejamento, com adaptações para o componente
> shadcn/ui.

## 1. Princípios

1. **Clareza acima de tudo** — o usuário nunca deve se perguntar o que fazer a seguir
2. **Feedback imediato** — toda ação tem resposta visual (loading, success, error)
3. **Progressive disclosure** — funcionalidades avançadas aparecem quando o usuário está pronto
4. **Mobile-first no consumo, desktop-first no editor** — editor split-screen só em desktop
5. **Tokens everywhere** — nunca usar valores hardcoded (hex, px, ms) no código

## 2. Design Tokens

### 2.1 Cores

```css
:root {
  /* Brand — Primary (azul confiança) */
  --color-primary-50:  #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-900: #1E3A5F;

  /* Semânticas */
  --color-success-500: #10B981;  /* ATS Score alto (80+) */
  --color-warning-500: #F59E0B;  /* ATS Score médio (50–79) */
  --color-error-500:   #EF4444;  /* ATS Score baixo (<50) */
  --color-linkedin:    #0A66C2;  /* Botões e elementos da seção LinkedIn */

  /* Neutros */
  --color-gray-50:  #F9FAFB;  /* Background da aplicação */
  --color-gray-100: #F3F4F6;  /* Background de cards, linhas alternadas */
  --color-gray-200: #E5E7EB;  /* Bordas, separadores */
  --color-gray-500: #6B7280;  /* Texto secundário */
  --color-gray-700: #374151;  /* Texto principal */
  --color-gray-900: #111827;  /* Headings */
  --color-surface:  #FFFFFF;  /* Cards, modais */
}
```

### 2.2 Tipografia

Família base: **Inter** (Google Fonts, com `font-display: swap`).

| Token | Tamanho | Peso | Line Height | Uso |
|---|---|---|---|---|
| `--text-xs` | 12px | 400 | 1.5 | Labels, badges |
| `--text-sm` | 14px | 400 | 1.5 | Texto de apoio |
| `--text-base` | 16px | 400 | 1.6 | Corpo principal |
| `--text-lg` | 18px | 500 | 1.5 | Subtítulos |
| `--text-xl` | 20px | 600 | 1.4 | Títulos de card |
| `--text-2xl` | 24px | 700 | 1.3 | Headings h3 |
| `--text-3xl` | 30px | 700 | 1.2 | Headings h2 |
| `--text-4xl` | 36px | 800 | 1.1 | Headings h1 |
| `--text-hero` | 48–64px | 800 | 1.0 | Landing page hero |
| `--text-score` | 64px | 900 | 1.0 | ATS Score gauge |

Mono: **JetBrains Mono** para scores numéricos e código.

### 2.3 Espaçamento e Layout

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Gap mínimo inline |
| `--space-2` | 8px | Padding de badges |
| `--space-3` | 12px | Gap ícone + texto |
| `--space-4` | 16px | Padding de botões |
| `--space-6` | 24px | Padding de cards pequenos |
| `--space-8` | 32px | Padding de cards médios |
| `--space-12` | 48px | Padding de painéis |
| `--space-16` | 64px | Seções da landing |

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 6px | Badges, chips, inputs |
| `--radius-md` | 8px | Botões, cards pequenos |
| `--radius-lg` | 12px | Cards principais, modais |
| `--radius-xl` | 16px | Paineis laterais, preview |
| `--radius-full` | 9999px | Avatares, gauge |

### 2.4 Sombras

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.08);  /* Cards em repouso */
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.12); /* Cards hover, dropdowns */
--shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.16); /* Modais, painéis */
--shadow-glow-blue: 0 0 20px rgba(37, 99, 235, 0.25); /* ATS Score gauge */
```

### 2.5 Animações

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 150ms | Hover de botões, focus de inputs |
| `--duration-normal` | 300ms | Transições de página, modais |
| `--duration-slow` | 500ms | ATS Score gauge, page transitions |
| `--duration-score` | 1.200ms | Animação gauge 0 → valor final |

| Token | Valor | Uso |
|---|---|---|
| `--ease-default` | cubic-bezier(0.4, 0, 0.2, 1) | Padrão |
| `--ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Entrada de modais |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Saída de elementos |

## 3. Componentes Base

### 3.1 Botões

| Variante | Aparência | Hover | Disabled |
|---|---|---|---|
| **Primary** | `bg-primary-700` texto branco | `bg-primary-800` + shadow-md | `opacity-40` |
| **Secondary** | borda `primary-700` texto primary | `bg-primary-50` | `opacity-40` |
| **Ghost** | texto cinza, transparente | `bg-gray-100` | `opacity-40` |
| **Destructive** | `bg-red-600` texto branco | `bg-red-700` | `opacity-40` |
| **Pro Badge** | `bg-amber-500` texto branco uppercase | — | — |
| **Loading** | Primary com spinner inline | — | `cursor-not-allowed` |

### 3.2 Inputs

| Tipo | Comportamento | Validação Visual |
|---|---|---|
| **Text Input** | Label flutuante on focus/filled | Borda verde + check em válido / Borda vermelha + mensagem inline em erro |
| **Textarea** | Auto-resize em altura (min 3 linhas) | Contador de chars perto do limite |
| **Select** | shadcn/ui Select com busca inline | Mesma lógica do input |
| **Tags Input** | Chips removíveis, Enter/vírgula para adicionar | Chip vermelho se duplicado |
| **File Upload** | Drag-and-drop com preview inline | Erro se tipo/tamanho inválido |
| **Slider** | Visual com labels nos extremos | — |

### 3.3 Cards

| Tipo | Conteúdo | Interação |
|---|---|---|
| **Resume Card** | Thumbnail + título + data + ATS Score badge + % completude + menu 3 pontos | Hover: shadow elevada. Click: editor. |
| **Template Card** | Preview do template + nome + tag Pro/Free + paleta | Hover: overlay "Selecionar". Click: seleção. |
| **Application Card** | Favicon + cargo + data + ATS Score + próximo passo | Drag & drop entre colunas. |
| **LinkedIn Section Card** | Ícone da seção + nota X/10 + barra de progresso + issues count | Click: expandir. |
| **ATS Issue Card** | Severidade + categoria + descrição + fix | Click: expandir. Botão "Aplicar". |
| **Post Idea Card** | Hook + estrutura colapsada + hashtags + horário | Click: expandir outline. |

## 4. Páginas-Chave

### 4.1 Editor de Currículo — Split-Screen (Desktop ≥ 1280px)

```
┌──────────────────────────────────────────────────────┐
│ Header fixo: logo + título CV + autosave + Exportar  │
├──────────────────────────────────────────────────────┤
│ Progress bar: 7 steps com ícone + nome + %           │
├──────────────────────────────┬───────────────────────┤
│                              │ Seletor template + cor │
│     Formulário do step       │     + zoom slider      │
│         (50% width)          ├───────────────────────┤
│                              │                       │
│                              │   Preview do CV        │
│                              │   (atualiza real-time) │
├──────────────────────────────┴───────────────────────┤
│ Footer: Voltar | Próximo step | Pular                 │
│ Sidebar direita: ATS Score resumido + "Melhorar IA" │
└──────────────────────────────────────────────────────┘
```

**Mobile (< 768px):** form fullscreen, preview em sheet/modal flutuante.

### 4.2 Painel ATS Score

- Gauge circular central, animação 0 → score (1.2s), cor dinâmica
- Grid 3x2 com 6 cards de dimensão (keywords 25%, estrutura 20%, ...)
- Seção "Issues" agrupada por severidade (Crítico → Alerta → Info)
- Seção "Palavras-chave" em 3 colunas (Presentes / Faltantes / Recomendadas)
- Botão fixo: "Adaptar CV para esta vaga" (Pro)

### 4.3 LinkedIn Audit

- Header: foto + nome + headline atual + URL + data
- Score geral: gauge roxo (cor LinkedIn) "Perfil Score"
- Comparativo benchmark: radar com 8 dimensões vs. top 10% da área
- Accordion por seção: 8 seções (foto, capa, headline, about, exp, hab, rec, atividade)
- Seção "Consistência com CV" (se usuário tem CV no ATRION)
- Grid de cards com 5–10 ideias de post
- Botão "Exportar Relatório PDF"

### 4.4 Tracker Kanban

- 6 colunas fixas: Salvo → Aplicado → Em análise → Entrevista → Oferta → Encerrado
- Cards: drag & drop (@dnd-kit) com shadow elevada
- Click no card: drawer lateral com detalhes
- Quick add: input inline no topo de cada coluna
- Auto-detect: colar URL da vaga → extrai empresa e cargo

## 5. Estados de UI

### 5.1 Loading States

| Situação | Loading | Duração Típica |
|---|---|---|
| Dashboard | Skeleton cards com pulse | 100–500ms |
| ATS Score | Spinner no botão + "Analisando..." + progress | 3–8s |
| LinkedIn Audit | Stepper animado ("Acessando perfil... Analisando foto...") | 20–60s |
| PDF | Botão loading + "Gerando PDF..." + preview dimmed | 2–6s |
| Adaptar CV | Animação "reescrevendo" com streaming | 5–15s |
| Carta apresentação | Streaming de texto (estilo ChatGPT) | 3–8s |

### 5.2 Feedback de Sucesso/Erro

| Ação | Sucesso | Erro |
|---|---|---|
| Autosave | Ícone nuvem → checkmark verde (2s) | Toast vermelho "Erro ao salvar. Tentando novamente..." |
| Exportar PDF | Toast verde "PDF gerado!" + confetti sutil | Toast vermelho + opção de retry |
| ATS Score | Score anima para valor + confetti se > 80 | Toast explicativo |
| LinkedIn Audit | Email + notificação in-app | Email com erro + botão "Tentar novamente" |
| Pagamento Pro | Página de sucesso + animação de desbloqueio | Redirect Stripe com mensagem específica |
| Conta excluída | Redirect landing + toast "Até logo!" | — |

### 5.3 Empty States

| Página | Ilustração + CTA |
|---|---|
| Dashboard sem CVs | "Você ainda não tem currículos" → "Criar meu primeiro currículo" |
| Tracker sem vagas | "Comece a organizar suas candidaturas" → "Adicionar primeira vaga" |
| Sem auditorias | "Descubra como seu perfil aparece para recrutadores" → "Auditar LinkedIn agora" |
| Versões sem versões | "Ainda não há versões adaptadas para vagas" → "Adaptar para uma vaga" |

## 6. Responsividade

| Breakpoint | Min Width | Editor | Dashboard | Audit |
|---|---|---|---|---|
| **Mobile** | 0px | Form fullscreen, preview em sheet | Lista 1 col. | Accordion, gauge menor |
| **Tablet** | 768px | Abas: Form / Preview | Grid 2 col. | Gauge + seções lado a lado |
| **Desktop** | 1280px | Split 50/50 fixo | Grid 3 col. | Layout completo |
| **Wide** | 1536px | Split 45/55 (mais preview) | Grid 4 col. | Comparativo benchmark visível |

**Otimizações mobile:**
- Botões com altura mínima **48px** (toque adequado)
- Inputs com font-size mínimo **16px** (evita zoom no iOS)
- Kanban: scroll horizontal com snap points
- Preview do CV: fullscreen modal no mobile
- ATS Score gauge: 200px (vs 320px desktop)

## 7. Acessibilidade

- **Contraste mínimo AA** (4.5:1 texto, 3:1 componentes)
- **Navegação por teclado** em todos os fluxos (Tab, Enter, Esc, setas)
- **ARIA labels** em ícones puros (Lucide)
- **Foco visível** com outline `primary-500` 2px
- **Sem informação apenas por cor** (ícones + texto)
- **Animações respeitam `prefers-reduced-motion`**

## 8. Referências

- [Doc 6 — Design System e UX v3.0](../../.projeto_extracted/ATRION_Doc6_Design_System_UX.txt) (planejamento original)
- Tokens em CSS → `styles/tokens.css`
- Componentes base → `components/ui/`
