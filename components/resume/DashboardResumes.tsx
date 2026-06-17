'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText, Plus, Sparkles, Wand2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { calculateCompleteness } from '@/lib/completeness';
import type { ResumeContent } from '@/lib/validations/resume';
import { DeleteResumeButton } from './DeleteResumeButton';
import { ResumeCardPreview } from './ResumeCardPreview';
import { fadeUp, fadeIn, hoverLift, staggerContainer } from '@/lib/animations';

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
      <motion.div {...(reduce ? {} : { initial: 'hidden', animate: 'visible', variants: scaleIn })}>
        <Card className="flex flex-col items-center justify-center border-dashed py-20 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold tracking-tight">
            Você ainda não tem currículos
          </h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Crie seu primeiro currículo profissional em menos de 10 minutos — com IA, templates modernos e exportação em PDF.
          </p>
          <Link
            href="/resumes/new"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-shadow hover:shadow-lg hover:shadow-indigo-500/30"
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
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {resumes.map((resume) => {
        let content: ResumeContent | null = null;
        try {
          const parsed = JSON.parse(resume.content);
          if (parsed?.personal) content = parsed;
        } catch {}
        const completeness = content ? calculateCompleteness(content) : 0;

        return (
          <motion.div key={resume.id} variants={fadeUp} {...hoverLift} className="h-full">
            <Card className="group relative flex h-full flex-col overflow-hidden">
              <div className="mb-4 -mx-6 -mt-6 overflow-hidden">
                <ResumeCardPreview
                  content={content}
                  templateId={resume.templateId}
                  colorScheme={resume.colorScheme}
                />
              </div>

              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold tracking-tight">{resume.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Atualizado em{' '}
                    {new Date(resume.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <DeleteResumeButton resumeId={resume.id} title={resume.title} />
              </div>

              <div className="mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completude</span>
                  <span className="font-semibold">{completeness}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {resume.atsScore !== null && resume.atsScore !== undefined && (
                <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  ATS Score: {resume.atsScore}/100
                </div>
              )}

              <Link
                href={`/editor/${resume.id}`}
                className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Wand2 className="h-3.5 w-3.5" /> Editar currículo
              </Link>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

const scaleIn = fadeIn;
