# ⚙️ Catálogo de Funções

> Inventário de **todas as funções** (componentes, helpers, server actions, API
> handlers) do ATRION, divididas em **implementadas** e **a implementar** por
> versão.

## Índice

- [📋 Funções Implementadas](./implemented.md) — Atualizado a cada release
- [🚧 Funções a Implementar](./to-implement.md) — Backlog por versão (V1, V1.1, V2, V3, V4)
- [📐 Convenções](#convenções) — Padrões de nomenclatura e assinatura

## Convenções

### Nomenclatura de Arquivos

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componente React | PascalCase.tsx | `ResumePreview.tsx` |
| Hook | camelCase com prefixo `use` | `useAutosave.ts` |
| Helper/Util | camelCase.ts | `calculateCompleteness.ts` |
| API route | `route.ts` em pasta | `app/api/resumes/[id]/route.ts` |
| Server action | camelCase com suffix `Action` | `createResumeAction.ts` |
| Schema Zod | camelCase.ts com sufixo `Schema` | `resumeContentSchema.ts` |
| Tipo TS | camelCase.ts | `resume.ts` |
| Constante | UPPER_SNAKE_CASE | `MAX_FREE_RESUMES = 3` |

### Assinatura Padrão de Helpers

```ts
// Puro, sem side effects
export function functionName(input: InputType): OutputType {
  // ...
}

// Async
export async function asyncHelper(input: InputType): Promise<OutputType> {
  // ...
}

// Com injeção de dependências
export async function makeService({ prisma, redis, openai }: Deps) {
  return {
    methodA: (input: Input) => Promise<Output>,
    methodB: (input: Input) => Promise<Output>,
  };
}
```

### Componentes

```tsx
// Sempre exportar tipo das props
export type ResumePreviewProps = {
  content: ResumeContent;
  templateId: TemplateId;
  colorScheme: ColorScheme;
  className?: string;
};

export function ResumePreview({ content, templateId, colorScheme, className }: ResumePreviewProps) {
  // ...
}
```

### API Routes

```ts
// Sempre:
// 1. Validar sessão
// 2. Validar input (Zod)
// 3. Rate limit
// 4. Lógica
// 5. Audit log (se crítico)
// 6. Response padronizado
```

### Status das Funções

| Status | Significado |
|---|---|
| ✅ Implementada | Em produção, testada |
| 🟡 Parcial | Implementação básica, melhorias pendentes |
| 🔨 Em desenvolvimento | Em sprint atual |
| ⏳ Planejada | No backlog, versão definida |
| ❌ Fora de escopo | Não será implementado nesta versão |

---

> Ver [`implemented.md`](./implemented.md) para a lista atual de funções prontas
> e [`to-implement.md`](./to-implement.md) para o backlog completo.
