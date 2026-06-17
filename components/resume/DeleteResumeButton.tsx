'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DeleteResumeButton({
  resumeId,
  title,
}: {
  resumeId: string;
  title: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}`, { method: 'DELETE' });
      if (res.ok) {
        setShowConfirm(false);
        router.refresh();
      } else {
        alert('Erro ao excluir currículo');
      }
    } catch {
      alert('Erro de rede');
    } finally {
      setLoading(false);
    }
  }

  const modal = mounted && showConfirm ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Excluir Currículo</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              Tem certeza que deseja excluir <strong>&quot;{title}&quot;</strong>? Esta ação é definitiva e não poderá ser desfeita.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setShowConfirm(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            isLoading={loading}
          >
            Sim, excluir
          </Button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        title="Excluir"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {modal}
    </>
  );
}
