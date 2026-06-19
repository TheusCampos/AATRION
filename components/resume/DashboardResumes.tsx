'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Plus, Star, Download, MoreHorizontal, PenLine } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { calculateCompleteness } from '@/lib/completeness';
import type { ResumeContent } from '@/lib/validations/resume';
import { DeleteResumeButton } from './DeleteResumeButton';
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
  const reduce = useReducedMotion();

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
        const isMain = index === 0; // Exemplo: o primeiro é o principal

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
                    <p className="text-sm text-slate-500 mb-1">Importado de PDF</p>
                    <p className="text-sm text-slate-500">
                      Atualizado em {new Date(resume.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <DeleteResumeButton resumeId={resume.id} title={resume.title} />
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
                  <Button variant="secondary" className="flex-1 sm:flex-none h-10 rounded-xl font-semibold gap-2 text-slate-600">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                  <Button variant="secondary" className="h-10 w-10 rounded-xl text-slate-600 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
