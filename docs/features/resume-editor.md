# Editor de Currículo

> O coração do ATRION. Editor em 7 steps com **preview em tempo real** e
> **autosave** a cada 2 segundos.

## Visão Geral

| Aspecto | Detalhe |
|---|---|
| **Tela** | `app/(app)/editor/[id]/page.tsx` |
| **Componentes** | `components/editor/` |
| **Estado** | Zustand + React Query + localStorage |
| **Rota API** | `PATCH /api/resumes/:id` (autosave) |
| **Schema DB** | `Resume.content` (JSONB) + `Resume.completeness` |

## Estrutura Visual

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  "Meu CV — Desenvolvedor Pleno"  [Salvando...] [PDF] │
├─────────────────────────────────────────────────────────────┤
│ ● Dados pessoais  ● Experiência  ● Formação  ○ Habilidades │
│   100%             80%             60%          0%            │
├─────────────────────────────────┬───────────────────────────┤
│                                 │ [Classic] [Modern] [Min] │
│  Step atual (formulário)        │ Cor: ●●●●●  Zoom: ──●──  │
│  (campos + validação + IA)      ├───────────────────────────┤
│                                 │                           │
│                                 │  ┌─────────────────────┐  │
│                                 │  │                     │  │
│                                 │  │   Preview do CV     │  │
│                                 │  │   (atualiza a cada  │  │
│                                 │  │    keystroke)       │  │
│                                 │  │                     │  │
│                                 │  └─────────────────────┘  │
├─────────────────────────────────┴───────────────────────────┤
│ [← Voltar]                              [Pular]  [Próximo →]│
│ Sidebar: ATS Score: 78/100   [+ Melhorar com IA] (Pro)     │
└─────────────────────────────────────────────────────────────┘
```

## Os 7 Steps

### Step 1 — Dados Pessoais
| Campo | Obrigatório | Observação |
|---|---|---|
| Nome completo | ✅ | — |
| Email | ✅ | Validado com Zod |
| Telefone | ❌ | Máscara BR `(11) 99999-9999` |
| Cidade/Estado | ❌ | — |
| Cargo pretendido | ✅ | Usado para ATS Score |
| LinkedIn URL | ❌ | Validado como URL do linkedin.com |
| GitHub URL | ❌ | — |
| Website | ❌ | — |
| Resumo profissional | ❌ | **IA sugere reescrita com base no cargo pretendido** (Pro) |
| Foto de perfil | ❌ | Upload para R2, max 2MB |

**IA Helper:** botão "✨ Sugerir resumo" → chama `POST /api/ai/improve` → preenche campo.

### Step 2 — Experiência
- Lista dinâmica (adicionar/remover/reordenar)
- Cada item: empresa, cargo, período (início/fim ou checkbox "atual"), descrição, conquistas (lista)
- **IA Helper:** para cada experiência, botão "✨ Sugerir verbos de ação e métricas"
- Mínimo 1 item para avançar (ou botão "Pular")

### Step 3 — Formação
- Instituição, curso, nível (`TECH` | `GRAD` | `POS` | `MBA` | `PHD`), período, descrição
- **IA Helper:** destaca cursos relevantes para o cargo pretendido

### Step 4 — Habilidades
- Tags com autocomplete por área
- Cada skill: nome + nível (`basic` | `intermediate` | `advanced`)
- Mínimo 5 habilidades
- **IA Helper:** "✨ Sugerir habilidades faltantes" com base em cargo e experiências

### Step 5 — Projetos (opcional)
- Nome, descrição, tecnologias, URL, GitHub
- **IA Helper:** reformula descrição para maior impacto

### Step 6 — Idiomas (opcional)
- Idioma (select) + nível (`basic` | `intermediate` | `advanced` | `native`)

### Step 7 — Certificações (opcional)
- Nome, emissor, data, URL de verificação
- **IA Helper:** lista certificações valorizadas para o cargo pretendido

## Autosave

```ts
// Lógica de debounce
const debouncedSave = useDebouncedCallback(async (content) => {
  setStatus('saving');
  await fetch(`/api/resumes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
  setStatus('saved');
}, 2000);
```

| Status do indicador | Quando |
|---|---|
| `idle` (nuvem) | Sem mudanças pendentes |
| `saving` (spinner) | Após 2s de inatividade, durante o fetch |
| `saved` (checkmark verde) | 200 OK do servidor (mostra por 2s) |
| `error` (X vermelho) | Falha no fetch → retry automático em 5s |

## Validação (Zod)

```ts
const resumeContentSchema = z.object({
  personal: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
    // ...
  }),
  experience: z.array(experienceItemSchema).default([]),
  // ...
});
```

## Preview em Tempo Real

- Estado Zustand atualizado a **cada keystroke** (sem debounce para o preview)
- Template renderizado em React com os dados atuais
- Troca de template/cor atualiza o preview instantaneamente

## Métricas de Completude

`completeness` (0–100) é calculado por:

| Critério | Peso |
|---|---|
| Nome preenchido | 5 |
| Email preenchido | 5 |
| Cargo pretendido | 5 |
| Resumo profissional (≥ 50 chars) | 10 |
| ≥ 1 experiência | 15 |
| ≥ 1 formação | 10 |
| ≥ 5 habilidades | 10 |
| ≥ 1 projeto | 5 |
| ≥ 1 idioma | 5 |
| Foto | 5 |
| LinkedIn | 5 |
| Telefone | 5 |
| Site/GitHub | 5 |
| ≥ 1 certificação | 5 |
| Resumo ≥ 200 chars | 5 |
| **Total** | **100** |

## Permissões

| Ação | Free | Pro |
|---|:---:|:---:|
| Criar currículo | ✅ até 3 | ✅ ilimitado |
| Editar currículo | ✅ | ✅ |
| Duplicar currículo | ✅ | ✅ |
| Deletar currículo | ✅ | ✅ |
| Marcar como público (link) | ❌ | ✅ |

## Edge Cases

1. **Currículo sem conteúdo** → draft, completeness 0, mas conta para o limite
2. **Currículo público sem Pro** → automaticamente `isPublic = false` no save
3. **Conflito de save** (2 abas abertas) → `If-Match: etag` → 412 se divergente, recarrega
4. **Foto inválida** (> 2MB ou tipo não permitido) → erro inline, upload bloqueado
5. **Mudança de template quebra layout** → fallback para template Classic com aviso
