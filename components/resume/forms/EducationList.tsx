import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { EducationItem } from '@/lib/validations/resume';
import { Field } from './Field';

export function EducationList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Formação Acadêmica</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma formação adicionada.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.course || 'Novo curso'} {item.institution && `· ${item.institution}`}
                </p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Instituição">
                  <Input
                    value={item.institution}
                    onChange={(e) => onUpdate(item.id, { institution: e.target.value })}
                    placeholder="USP"
                  />
                </Field>
                <Field label="Curso">
                  <Input
                    value={item.course}
                    onChange={(e) => onUpdate(item.id, { course: e.target.value })}
                    placeholder="Ciência da Computação"
                  />
                </Field>
                <Field label="Nível">
                  <Input
                    value={item.level}
                    onChange={(e) => onUpdate(item.id, { level: e.target.value })}
                    placeholder="Graduação"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
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
                    />
                  </Field>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
