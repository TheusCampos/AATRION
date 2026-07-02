'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Star, Download, MoreHorizontal, PenLine, Copy, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateCompleteness } from '@/lib/completeness';
import type { ResumeContent } from '@/lib/validations/resume';
import { ResumeCardPreview } from './ResumeCardPreview';
import { fadeUp, fadeIn, staggerContainer } from '@/lib/animations';

export type ResumeListItem = {
  id: string;
  title: string;
  templateId: string;
  colorScheme: string;
  atsScore: number | null;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function DashboardResumes({ resumes }: { resumes: ResumeListItem[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renamingResume, setRenamingResume] = useState<{ id: string; title: string } | null>(null);
  const [deletingResume, setDeletingResume] = useState<{ id: string; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<'rename' | 'duplicate' | 'delete' | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleDuplicate(resume: ResumeListItem) {
    if (actionLoading) return;
    setActionLoading('duplicate');
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${resume.title} (Cópia)`,
          templateId: resume.templateId,
          content: resume.content,
          colorScheme: resume.colorScheme,
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao duplicar currículo');
      }
    } catch {
      alert('Erro de conexão ao duplicar');
    } finally {
      setActionLoading(null);
      setActiveDropdown(null);
    }
  }

  async function handleRename(id: string, newTitle: string) {
    if (!newTitle.trim() || actionLoading) return;
    setActionLoading('rename');
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setRenamingResume(null);
        router.refresh();
      } else {
        alert('Erro ao renomear currículo');
      }
    } catch {
      alert('Erro de conexão ao renomear');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (actionLoading) return;
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingResume(null);
        router.refresh();
      } else {
        alert('Erro ao excluir currículo');
      }
    } catch {
      alert('Erro de conexão ao excluir');
    } finally {
      setActionLoading(null);
    }
  }

  if (resumes.length === 0) {
    return (
      <motion.div {...(reduce ? {} : { initial: 'hidden', animate: 'visible', variants: fadeIn })}>
        <Card className="flex flex-col items-center justify-center rounded-3xl border-dashed border-border/60 bg-card/50 py-16 text-center shadow-sm">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-display text-xl font-bold tracking-tight text-slate-900">
            Você ainda não tem currículos
          </h2>
          <p className="mb-6 max-w-sm text-sm text-slate-500">
            Crie seu primeiro currículo profissional em menos de 10 minutos — com IA, templates modernos e exportação em PDF.
          </p>
          <Link
            href="/resumes/new"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Criar meu primeiro currículo
          </Link>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...(reduce ? {} : { initial: 'hidden', animate: 'visible', variants: staggerContainer(0.07, 0.1) })}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Meus currículos</h2>
      </div>

      {resumes.map((resume, index) => {
        let content: ResumeContent | null = null;
        try {
          const parsed = JSON.parse(resume.content);
          if (parsed?.personal) content = parsed;
        } catch {}
        const completeness = content ? calculateCompleteness(content) : 0;
        const isMain = index === 0;

        return (
          <motion.div key={resume.id} variants={fadeUp} className="w-full">
            <Card className="group flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-border/60 bg-white p-4 backdrop-blur shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-500/30">
              
              {/* Preview Thumbnail */}
              <div className="sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden border border-border/50 bg-slate-50">
                <ResumeCardPreview
                  content={content}
                  templateId={resume.templateId}
                  colorScheme={resume.colorScheme}
                  className="h-40 sm:h-56 w-full border-b-0"
                />
              </div>

              {/* Detalhes */}
              <div className="flex flex-1 flex-col justify-center sm:pl-6 pt-4 sm:pt-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isMain && (
                        <div className="inline-flex items-center justify-center rounded-full bg-indigo-100 p-1 text-indigo-600">
                          <Star className="h-4 w-4 fill-indigo-600" />
                        </div>
                      )}
                      <h3 className="font-bold text-lg tracking-tight text-slate-900">{resume.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 mb-1">
                      <span>Importado de PDF</span>
                      <span>•</span>
                      <span>Atualizado em {new Date(resume.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          resume.atsScore !== null
                            ? resume.atsScore >= 75
                              ? 'bg-emerald-500'
                              : resume.atsScore >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            : 'bg-slate-300'
                        }`} />
                        <span className="font-medium">
                          ATS: {resume.atsScore !== null ? `${resume.atsScore}%` : 'Não analisado'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">Completude</span>
                    <span className="font-bold text-slate-900">{completeness}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Link href={`/editor/${resume.id}`} className="flex-1 sm:flex-none">
                    <Button variant="secondary" className="w-full sm:w-auto h-10 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold gap-2">
                      <PenLine className="h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/editor/${resume.id}?download=true`} className="flex-1 sm:flex-none">
                    <Button variant="secondary" className="w-full sm:w-auto h-10 rounded-xl font-semibold gap-2 text-slate-600 hover:bg-slate-100">
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </Button>
                  </Link>
                  
                  {/* Menu Dropdown de Ações */}
                  <div className="relative" ref={activeDropdown === resume.id ? dropdownRef : null}>
                    <Button
                      variant="secondary"
                      onClick={() => setActiveDropdown(activeDropdown === resume.id ? null : resume.id)}
                      className="h-10 w-10 rounded-xl text-slate-600 p-0 hover:bg-slate-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    <AnimatePresence>
                      {activeDropdown === resume.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 bottom-12 z-50 w-48 rounded-2xl border border-border/80 bg-white p-2 shadow-xl backdrop-blur-md"
                        >
                          <button
                            onClick={() => {
                              setRenamingResume({ id: resume.id, title: resume.title });
                              setActiveDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <PenLine className="h-4 w-4 text-slate-500" />
                            Renomear
                          </button>
                          <button
                            onClick={() => handleDuplicate(resume)}
                            disabled={actionLoading !== null}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === 'duplicate' && activeDropdown === resume.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-500" />
                            )}
                            Duplicar
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => {
                              setDeletingResume({ id: resume.id, title: resume.title });
                              setActiveDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </Card>
          </motion.div>
        );
      })}

      {/* Modal de Renomear */}
      {renamingResume && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Renomear Currículo</h3>
            <input
              type="text"
              defaultValue={renamingResume.title}
              id="rename-input"
              placeholder="Nome do currículo"
              className="w-full h-11 px-4 rounded-xl border border-border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-6"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setRenamingResume(null)}
                disabled={actionLoading !== null}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const input = document.getElementById('rename-input') as HTMLInputElement | null;
                  if (input) handleRename(renamingResume.id, input.value);
                }}
                isLoading={actionLoading === 'rename'}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Excluir */}
      {deletingResume && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Excluir Currículo</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                  Tem certeza que deseja excluir <strong>&quot;{deletingResume.title}&quot;</strong>? Esta ação é definitiva e não poderá ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingResume(null)}
                disabled={actionLoading !== null}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deletingResume.id)}
                isLoading={actionLoading === 'delete'}
              >
                Sim, excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
