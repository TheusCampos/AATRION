import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { SkillItem } from '@/lib/validations/resume';

export function SkillsList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: SkillItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<SkillItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Habilidades</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma habilidade adicionada. Adicione pelo menos 5.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.name}
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                placeholder="React, TypeScript, AWS..."
                className="flex-1"
              />
              <select
                value={item.level}
                onChange={(e) => onUpdate(item.id, { level: e.target.value as SkillItem['level'] })}
                className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="basic">Básico</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
              <button
                onClick={() => onRemove(item.id)}
                className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remover"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
