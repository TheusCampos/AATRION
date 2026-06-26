# Tracker de Candidaturas

> Board **Kanban** integrado onde o usuário organiza todas as vagas em que se
> candidatou, vinculando a versão do currículo enviada para cada uma. Cria
> **hábito diário** de uso do produto.

## Visão Geral

| Aspecto | Detalhe |
|---|---|
| **Tela** | `app/(app)/applications/page.tsx` |
| **Componente** | `components/applications/KanbanBoard.tsx` |
| **API** | `GET/POST/PUT/DELETE /api/applications` |
| **Schema DB** | `Application` |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` |
| **Free / Pro** | 5 vagas / Ilimitado |

## Colunas do Kanban

| Coluna | Descrição | Ações disponíveis |
|---|---|---|
| **Salvo** | Vaga encontrada, ainda não aplicou | Gerar CV adaptado, ver ATS Score, editar |
| **Aplicado** | Candidatura enviada | Registrar data, anotar CV enviado, contato RH |
| **Em análise** | RH está analisando | Registrar data limite de retorno |
| **Entrevista** | Entrevista agendada | Registrar data/hora, preparar com simulador |
| **Oferta** | Proposta recebida | Valor, benefícios, prazo para resposta |
| **Encerrado** | Rejeitado ou desistência | Arquivar, motivo, lição aprendida |

## Card de Candidatura — Campos

```ts
interface Application {
  id: string;
  userId: string;
  resumeId?: string;            // FK → Resume (versão enviada)
  company: string;
  role: string;
  jobUrl?: string;
  status: 'SAVED' | 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'CLOSED';
  appliedAt?: Date;
  salary?: string;
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  nextStep?: string;
  nextStepAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  📌 Minhas Candidaturas (12 vagas)    [🔍 Buscar] [+ Nova vaga]     │
├─────────────────────────────────────────────────────────────────────┤
│  Salvo (3)  │ Aplicado (4) │ Em análise (2) │ Entrevista (2) │ ... │
├──────────────┼──────────────┼─────────────────┼─────────────────┼───┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐   │ ┌──────────┐  │   │
│ │ ⭐ Emp X │ │ │ 💼 Emp Y │ │ │ 🏢 Emp Z │   │ │ 🚀 Emp W │  │   │
│ │ Dev Pleno│ │ │ Senior PM│ │ │ Designer │   │ │ SRE      │  │   │
│ │ ATS: 87  │ │ │ ATS: 79  │ │ │ ATS: 72  │   │ │ ATS: 91  │  │   │
│ │ 12/06    │ │ │ 10/06    │ │ │ 08/06    │   │ │ 05/06    │  │   │
│ │ [+ not.] │ │ │ ⏰ seg   │ │ │ ⏰ hoje  │   │ │ ⏰ qui   │  │   │
│ └──────────┘ │ └──────────┘ │ └──────────┘   │ └──────────┘  │   │
│ ┌──────────┐ │ ┌──────────┐ │                │ ┌──────────┐  │   │
│ │ Emp A    │ │ │ Emp B    │ │                │ │ Emp C    │  │   │
│ │ ...      │ │ │ ...      │ │                │ │ ...      │  │   │
│ └──────────┘ │ └──────────┘ │                │ └──────────┘  │   │
│              │ ┌──────────┐ │                │               │   │
│              │ │ Emp D    │ │                │               │   │
│              │ └──────────┘ │                │               │   │
└──────────────┴──────────────┴────────────────┴───────────────┴───┘
```

## Quick Add

- Botão "+" no topo de cada coluna
- Botão "Nova vaga" global com modal
- **Auto-detect:** ao colar URL da vaga, sistema usa Puppeteer/Open Graph para extrair `empresa` e `cargo` automaticamente

```ts
// Auto-detect via Open Graph
async function extractJobFromUrl(url: string) {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);
  return {
    company: $('meta[property="og:site_name"]').attr('content'),
    role: $('meta[property="og:title"]').attr('content'),
    jobUrl: url,
  };
}
```

## Drawer Lateral (Detalhes)

Click no card → drawer com todos os campos + histórico de mudanças de status:

```
┌──────────────────────────────────────────────┐
│  Empresa X — Desenvolvedor Pleno          [X] │
├──────────────────────────────────────────────┤
│  Status: [Em análise ▾]                       │
│  URL: https://...                             │
│  Aplicado em: 10/06/2026                      │
│  Currículo enviado: "CV - Empresa X" (v1)    │
│  ATS Score na época: 87/100                   │
│                                              │
│  Contato RH                                  │
│  Nome: Maria Souza                            │
│  Email: maria@empresax.com                    │
│                                              │
│  Próximo passo                               │
│  [Retorno esperado até 15/06    ] 📅          │
│                                              │
│  Notas                                       │
│  [textarea livre...]                          │
│                                              │
│  Histórico                                   │
│  • 10/06 — Salvo → Aplicado                  │
│  • 12/06 — Aplicado → Em análise             │
│                                              │
│              [Salvar]   [Excluir]            │
└──────────────────────────────────────────────┘
```

## Drag & Drop

```tsx
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function KanbanBoard() {
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    const newStatus = over.id as AppStatus;
    await fetch(`/api/applications/${active.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    // Atualizar estado local otimisticamente
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {/* colunas + cards */}
    </DndContext>
  );
}
```

## Permissões e Limites

| Plano | Limite |
|---|:---:|
| Free | 5 vagas ativas |
| Pro | ∞ |

> Vagas em "Encerrado" **não** contam no limite. Mas é permitido reabri-las.

## Métricas de Uso

| Métrica | Meta |
|---|:---:|
| % de Pro que usam tracker semanalmente | > 60% |
| Média de vagas por usuário ativo | > 8 |
| DAU/MAU do tracker | > 25% |
| Retenção 30d de quem usa tracker | > 70% |

> O tracker é a principal **feature de retenção** — uso diário cria hábito.
