import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { ExperienceItem } from '@/lib/validations/resume';
import { Field } from './Field';

export function ExperienceList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ExperienceItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Experiência Profissional</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma experiência adicionada. Clique em &quot;+ Adicionar&quot; para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.role || 'Novo cargo'} {item.company && `· ${item.company}`}
                </p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cargo">
                  <Input
                    value={item.role}
                    onChange={(e) => onUpdate(item.id, { role: e.target.value })}
                    placeholder="Tech Lead"
                  />
                </Field>
                <Field label="Empresa">
                  <Input
                    value={item.company}
                    onChange={(e) => onUpdate(item.id, { company: e.target.value })}
                    placeholder="Empresa X"
                  />
                </Field>
                <Field label="Início">
                  <Input
                    type="month"
                    value={item.start}
                    onChange={(e) => onUpdate(item.id, { start: e.target.value })}
                  />
                </Field>
                <Field label="Fim">
                  <Input
                    type="month"
                    value={item.end}
                    onChange={(e) => onUpdate(item.id, { end: e.target.value })}
                    disabled={item.current}
                    placeholder={item.current ? 'Atual' : ''}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => onUpdate(item.id, { current: e.target.checked, end: '' })}
                  className="h-4 w-4 rounded border-border"
                />
                Trabalho atual
              </label>
              <Field label="Descrição">
                <Textarea
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="Descreva suas responsabilidades e conquistas. Use verbos de ação e métricas."
                  rows={4}
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
