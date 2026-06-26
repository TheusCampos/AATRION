# Fluxo: Criação de Currículo do Zero

> O fluxo principal do produto: usuário cria, edita, preenche, escolhe template
> e exporta o currículo.

## Diagrama Macro

```mermaid
flowchart TB
    Start([Dashboard]) --> New[Click Novo currículo]
    New --> Modal{Modal}
    Modal -->|Criar do zero| Create[POST /api/resumes]
    Modal -->|Importar PDF Pro| Upload[Upload PDF]
    Upload --> Parse[pdf-parse]
    Parse --> AI[IA estrutura conteúdo]
    AI --> Editor
    Create --> Editor[Editor /editor/id]
    Editor --> Fill[Preencher 7 steps]
    Fill --> Autosave[Autosave 2s]
    Fill --> Template[Selecionar template]
    Template --> Color[Escolher cor]
    Color --> ATS[Gerar ATS Score]
    ATS --> Adapt[Adaptar para vaga Pro]
    Adapt --> Export[Exportar PDF]
    ATS --> Export
    Export --> Done([Download PDF])
    Done --> Back[Volta ao dashboard]
```

## Diagrama Detalhado (Editor)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant E as Editor
    participant Z as Zustand
    participant LS as localStorage
    participant API as /api/resumes
    participant DB as Neon
    participant S as Supabase Realtime<br/>(opcional V2)

    U->>E: Abre /editor/[id]
    E->>API: GET /api/resumes/[id]
    API->>DB: SELECT * FROM resumes WHERE id=?
    DB-->>API: Resume
    API-->>E: { content, templateId, colorScheme }
    E->>Z: Hidrata estado inicial

    loop Enquanto usuário edita
        U->>E: Digita em campo
        E->>Z: setField(path, value)
        Z-->>E: Estado novo
        E->>E: Preview re-renderiza<br/>(sem debounce)
        E->>LS: Persiste estado (backup)
        Note over E: Debounce 2s
        E->>API: PATCH /api/resumes/[id] { content }
        API->>DB: UPDATE resumes SET content=?, updatedAt=NOW()
        DB-->>API: OK
        API-->>E: 200 OK
        E->>E: Indicador: "Salvo ✓"
    end

    U->>E: Avança para próximo step
    E->>Z: setStep(current + 1)
    E->>E: Valida campos obrigatórios
    E->>E: Calcula completeness

    U->>E: Seleciona template
    E->>API: PATCH /api/resumes/[id] { templateId }
    E->>Z: setTemplateId

    U->>E: Clica "Exportar PDF"
    E->>API: POST /api/pdf/generate { resumeId }
    Note over E,API: Ver /docs/flows/pdf-export.md
```

## Estados da Validação

```mermaid
stateDiagram-v2
    [*] --> Step1: Carrega editor
    Step1 --> Step1: Validação inline<br/>(campos obrigatórios)
    Step1 --> Step2: Nome + Email + Cargo OK
    Step2 --> Step3: ≥ 1 experiência
    Step2 --> Step2: 0 experiências (aviso)<br/>Botão "Pular" disponível
    Step3 --> Step4: ≥ 1 formação
    Step4 --> Step5: ≥ 5 habilidades
    Step4 --> Step4: < 5 habilidades (aviso)
    Step5 --> Step6: Opcional
    Step6 --> Step7: Opcional
    Step7 --> Complete: completeness ≥ 80
    Complete --> Export: Disponível
```

## Comportamento do Autosave

```mermaid
flowchart LR
    Input[Input change] --> Z[Zustand setState]
    Z --> LS[Persist localStorage]
    Z --> Debounce[Debounce 2s]
    Debounce --> Status1[Salvando...]
    Debounce --> API[PATCH /api/resumes]
    API -->|200| Status2[Salvo ✓]
    API -->|Erro| Retry[Retry 5s]
    Retry --> API
    API -->|Falha 3x| Status3[Erro — clique para tentar]
```

**Indicador visual (canto superior direito):**

| Estado | Ícone | Cor | Duração |
|---|---|---|---|
| `idle` | Nuvem | Cinza | Até próxima mudança |
| `saving` | Spinner | Azul | ~500ms típico |
| `saved` | Checkmark | Verde | 2s, depois volta a `idle` |
| `error` | X | Vermelho | Até usuário clicar para retry |

## Lógica do Completeness

```ts
function calculateCompleteness(content: ResumeContent): number {
  let score = 0;
  const { personal, experience, education, skills, projects, languages, certifications } = content;

  if (personal.name) score += 5;
  if (personal.email) score += 5;
  if (personal.jobTitle) score += 5;
  if (personal.summary && personal.summary.length >= 50) score += 10;
  if (experience.length >= 1) score += 15;
  if (education.length >= 1) score += 10;
  if (skills.length >= 5) score += 10;
  if (projects.length >= 1) score += 5;
  if (languages.length >= 1) score += 5;
  if (personal.photoUrl) score += 5;
  if (personal.linkedin) score += 5;
  if (personal.phone) score += 5;
  if (personal.website || personal.github) score += 5;
  if (certifications.length >= 1) score += 5;
  if (personal.summary && personal.summary.length >= 200) score += 5;

  return Math.min(score, 100);
}
```

## Preview em Tempo Real

- Renderizado no painel direito (desktop) ou em modal (mobile)
- Atualiza a **cada keystroke** (sem debounce — performance vem do React)
- Troca de template/cor também atualiza instantaneamente

## Sugestões da IA no Editor

| Step | IA Disponível | Feature Gate |
|---|---|---|
| 1 — Pessoal | "Sugerir resumo" | Pro |
| 2 — Experiência | "Sugerir verbos e métricas" | Pro |
| 3 — Formação | "Destacar cursos relevantes" | Pro |
| 4 — Habilidades | "Sugerir habilidades faltantes" | Pro |
| 5 — Projetos | "Reformular descrição" | Pro |
| 7 — Certificações | "Listar certificações valorizadas" | Pro |

> Free vê os botões desabilitados com tooltip "Pro".

## Transição entre Steps

```ts
// Validação por step
const stepValidations = {
  1: (c) => c.personal.name && c.personal.email && c.personal.jobTitle,
  2: (c) => c.experience.length >= 1, // ou permitir skip
  3: (c) => c.education.length >= 1,
  4: (c) => c.skills.length >= 5,
  5: () => true, // opcional
  6: () => true, // opcional
  7: () => true, // opcional
};

function canAdvance(currentStep: number, content: ResumeContent): boolean {
  if (currentStep === 2) {
    return stepValidations[2](content) || confirm('Pular sem experiência?');
  }
  return stepValidations[currentStep]?.(content) ?? true;
}
```

## Confirmação ao Sair

Se há mudanças não salvas (indicador ainda em "Salvando..."):

```ts
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (saveStatus === 'saving') {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [saveStatus]);
```

## Métricas

| Métrica | Meta |
|---|:---:|
| % de cadastros que criam ≥ 1 CV | > 80% |
| Tempo médio para completeness 80 | < 12min |
| % de CVs que atingem completeness 100 | > 40% |
| Taxa de uso do autosave (vs save manual) | > 95% |

## Edge Cases

| Situação | Tratamento |
|---|---|
| Conteúdo corrompido no localStorage | Fallback para estado do servidor |
| 2 abas abertas editando mesmo CV | `If-Match: etag` → 412 se conflito |
| Foto > 2MB | Rejeitar antes do upload |
| Resumo > 2000 chars | Avisar + oferecer truncar |
| Step sem campos obrigatórios | Botão "Pular" + aviso visual |
| Sessão expirada durante edição | Tentar refresh; se falhar, salvar no LS e pedir login |
| Rede instável | Retry exponencial até 3x, depois erro visual + opção de continuar offline |
