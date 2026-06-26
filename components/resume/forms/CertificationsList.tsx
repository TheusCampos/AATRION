import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { CertificationItem } from '@/lib/validations/resume';
import { Field } from './Field';

export function CertificationsList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: CertificationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<CertificationItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Certificações</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma certificação adicionada.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.name || 'Nova certificação'}
                </p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome">
                  <Input
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                    placeholder="AWS Solutions Architect"
                  />
                </Field>
                <Field label="Emissor">
                  <Input
                    value={item.issuer}
                    onChange={(e) => onUpdate(item.id, { issuer: e.target.value })}
                    placeholder="Amazon Web Services"
                  />
                </Field>
              </div>
              <Field label="Data">
                <Input
                  type="month"
                  value={item.date}
                  onChange={(e) => onUpdate(item.id, { date: e.target.value })}
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
