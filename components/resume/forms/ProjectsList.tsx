import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { ProjectItem } from '@/lib/validations/resume';
import { Field } from './Field';

export function ProjectsList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projetos</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhum projeto adicionado.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">{item.name || 'Novo projeto'}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <Field label="Nome">
                <Input
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  placeholder="Nome do projeto"
                />
              </Field>
              <Field label="Descrição">
                <Textarea
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="O que o projeto faz e qual foi seu papel"
                  rows={3}
                />
              </Field>
              <Field label="Tecnologias (separadas por vírgula)">
                <Input
                  value={item.tech.join(', ')}
                  onChange={(e) =>
                    onUpdate(item.id, { tech: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  placeholder="React, Node.js, PostgreSQL"
                />
              </Field>
              <Field label="URL">
                <Input
                  value={item.url}
                  onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                  placeholder="https://github.com/seu-user/projeto"
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
