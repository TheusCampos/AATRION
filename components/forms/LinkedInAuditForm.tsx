'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ClipboardPaste, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea, FieldError } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

type Props = {
  defaultProfileText?: string;
  defaultProfileUrl?: string;
  defaultArea?: string;
  defaultTargetJob?: string;
};

const MAX_PROFILE_LENGTH = 20000;

export function LinkedInAuditForm({
  defaultProfileText = '',
  defaultProfileUrl = '',
  defaultArea = '',
  defaultTargetJob = '',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [profileText, setProfileText] = useState(defaultProfileText);
  const [profileUrl, setProfileUrl] = useState(defaultProfileUrl);
  const [area, setArea] = useState(defaultArea);
  const [targetJob, setTargetJob] = useState(defaultTargetJob);
  const [charCount, setCharCount] = useState(defaultProfileText.length);

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('Área de transferência vazia.');
        return;
      }
      setProfileText(text);
      setCharCount(text.length);
      setError(null);
    } catch {
      setError('Não foi possível colar da área de transferência. Cole manualmente (Ctrl+V).');
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (profileText.length < 100) {
      setError('Cole o texto completo do seu perfil (mínimo 100 caracteres).');
      return;
    }

    if (profileText.length > MAX_PROFILE_LENGTH) {
      setError(`O texto excede o limite de ${MAX_PROFILE_LENGTH.toLocaleString('pt-BR')} caracteres.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/linkedin/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileText,
            profileUrl: profileUrl || undefined,
            area: area || undefined,
            targetJob: targetJob || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Erro ao criar auditoria.');
          return;
        }

        const data = await res.json();
        router.push(`/linkedin/${data.audit.id}`);
        router.refresh();
      } catch {
        setError('Erro de rede. Tente novamente.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Linkedin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Como auditar seu LinkedIn</h2>
              <p className="text-sm text-muted-foreground">
                Acesse seu perfil no LinkedIn, selecione todo o conteúdo (Ctrl+A), copie (Ctrl+C)
                e cole abaixo. A análise é feita em heurística na V1 (sem IA).
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profileUrl">URL do perfil (opcional)</Label>
              <Input
                id="profileUrl"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Sua área</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetJob">Vaga-alvo (opcional)</Label>
            <Input
              id="targetJob"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              placeholder="Ex: Senior Frontend Developer (React)"
            />
            <p className="text-xs text-muted-foreground">
              Vamos priorizar palavras-chave alinhadas a essa vaga.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profileText" required>
                Texto do seu perfil
              </Label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Colar da área de transferência
              </button>
            </div>
            <Textarea
              id="profileText"
              value={profileText}
              onChange={(e) => {
                setProfileText(e.target.value);
                setCharCount(e.target.value.length);
              }}
              placeholder="Cole aqui todo o conteúdo do seu perfil do LinkedIn..."
              rows={14}
              required
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {charCount.toLocaleString('pt-BR')} caracteres · mínimo 100, máximo {MAX_PROFILE_LENGTH.toLocaleString('pt-BR')}
              </span>
              {charCount > 0 && charCount < 100 && (
                <span className="text-amber-600">Faltam {100 - charCount} caracteres</span>
              )}
            </div>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Os dados ficam salvos na sua conta e podem ser excluídos a qualquer momento.
            </p>
            <Button type="submit" disabled={isPending} isLoading={isPending}>
              {!isPending && <Sparkles className="mr-2 h-4 w-4" />}
              Auditar perfil
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}