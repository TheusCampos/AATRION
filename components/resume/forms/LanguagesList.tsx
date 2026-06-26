import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { LanguageItem } from '@/lib/validations/resume';

export function LanguagesList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: LanguageItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<LanguageItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Idiomas</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhum idioma adicionado.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.language}
                onChange={(e) => onUpdate(item.id, { language: e.target.value })}
                placeholder="Inglês"
                className="flex-1"
              />
              <select
                value={item.level}
                onChange={(e) =>
                  onUpdate(item.id, { level: e.target.value as LanguageItem['level'] })
                }
                className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="basic">Básico</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
                <option value="native">Nativo</option>
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
