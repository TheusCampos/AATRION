'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Wand2,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Target,
  FileCheck2,
  Briefcase,
  Save,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea, Label, Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { ResumeContent } from '@/lib/validations/resume';
import Link from 'next/link';
import { AILoader } from '@/components/ui/AILoader';

const ANALYZE_STEPS = [
  'Extraindo seções do currículo...',
  'Avaliando regras de legibilidade ATS...',
  'Medindo alinhamento de palavras-chave da vaga...',
  'Calculando pontuação e formulando melhorias...',
];

const ADAPT_STEPS = [
  'Lendo descrição da vaga pretendida...',
  'Identificando habilidades e palavras-chave ausentes...',
  'Reescrevendo resumo profissional com IA...',
  'Otimizando descrições de experiências relevantes...',
];

type Props = {
  resumeId: string;
  content: ResumeContent;
  onApplyAdapted: (next: ResumeContent) => void;
  initialAction?: string;
  userPlan?: 'FREE' | 'PRO' | 'MAX';
};

type AnalyzeResult = {
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  corrections: Array<{ area: string; before?: string; after: string; reason: string }>;
  examples: Array<{ area: string; from: string; to: string; rationale: string }>;
  keywordGaps: string[];
  atsTips: string[];
};

export function AIResumeActions({ resumeId, content, onApplyAdapted, initialAction, userPlan = 'FREE' }: Props) {
  const canAdapt = userPlan === 'PRO' || userPlan === 'MAX';
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [adaptOpen, setAdaptOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Abre os modais automaticamente se especificado na inicialização
  useEffect(() => {
    if (initialAction === 'analyze') {
      setAnalyzeOpen(true);
    } else if (initialAction === 'adapt') {
      if (canAdapt) {
        setAdaptOpen(true);
      } else {
        setModalMessage('O recurso de adaptação de currículo para vagas está disponível apenas nos planos Pro e Max. Faça upgrade para usar essa funcionalidade!');
        setShowUpgradeModal(true);
      }
    }
  }, [initialAction, canAdapt]);

  // Analyze state
  const [analyzeTarget, setAnalyzeTarget] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null);

  // Adapt state
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [adaptedContent, setAdaptedContent] = useState<ResumeContent | null>(null);
  const [adaptedChanges, setAdaptedChanges] = useState<string[]>([]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetJob: analyzeTarget || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao analisar');
      }
      setAnalyzeResult(data.result);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao analisar o currículo.';
      if (msg.includes('plano') || msg.includes('limite') || msg.includes('Limite')) {
        setModalMessage(msg);
        setShowUpgradeModal(true);
      } else {
        alert(msg);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAdapt() {
    if (jobDescription.trim().length < 20) {
      alert('Cole a descrição da vaga (mínimo 20 caracteres).');
      return;
    }
    setAdapting(true);
    setAdaptedContent(null);
    setAdaptedChanges([]);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          jobTitle: jobTitle || undefined,
          company: company || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao adaptar');
      }
      setAdaptedContent(data.content as ResumeContent);
      setAdaptedChanges(data.changesLog || []);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Erro ao adaptar o currículo.';
      if (msg.includes('plano') || msg.includes('limite') || msg.includes('Limite')) {
        setModalMessage(msg);
        setShowUpgradeModal(true);
      } else {
        alert(msg);
      }
    } finally {
      setAdapting(false);
    }
  }

  function applyAdapted() {
    if (!adaptedContent) return;
    onApplyAdapted(adaptedContent);
    setAdaptOpen(false);
    setAdaptedContent(null);
    setJobDescription('');
  }

  const scoreColor =
    analyzeResult && analyzeResult.overallScore >= 75
      ? 'text-emerald-600'
      : analyzeResult && analyzeResult.overallScore >= 50
        ? 'text-amber-600'
        : 'text-rose-600';

  return (
    <>
      {userPlan !== 'FREE' && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAnalyzeOpen(true)}
          title="Analisar com IA"
        >
          <Sparkles className="h-4 w-4" /> Analisar com IA
        </Button>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          if (!canAdapt) {
            setModalMessage('O recurso de adaptação de currículo para vagas está disponível apenas nos planos Pro e Max. Faça upgrade para desbloquear essa funcionalidade!');
            setShowUpgradeModal(true);
          } else {
            setAdaptOpen(true);
          }
        }}
        title={canAdapt ? 'Adaptar para uma vaga' : 'Disponível no plano Pro'}
        className={!canAdapt ? 'opacity-70' : ''}
      >
        <Wand2 className="h-4 w-4" /> Adaptar para vaga
        {!canAdapt && <Lock className="h-3 w-3 ml-1" />}
      </Button>

      {/* === Modal: Analisar === */}
      {analyzeOpen && (
        <ModalShell onClose={() => setAnalyzeOpen(false)} title="Analise com IA">
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Vaga alvo (opcional)</Label>
              <Input
                value={analyzeTarget}
                onChange={(e) => setAnalyzeTarget(e.target.value)}
                placeholder="Ex: Desenvolvedor Frontend Pleno"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Se informar a vaga, a IA prioriza palavras-chave e requisitos especificos.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAnalyze} isLoading={analyzing} disabled={analyzing}>
                <Sparkles className="h-4 w-4" /> {analyzing ? 'Analisando...' : 'Analisar agora'}
              </Button>
            </div>

            {analyzeResult && (
              <div className="space-y-4 pt-2">
                <Card className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Nota geral
                    </p>
                    <p className="text-sm text-slate-700 mt-1">{analyzeResult.summary}</p>
                  </div>
                  <div className={`text-5xl font-extrabold ${scoreColor}`}>
                    {analyzeResult.overallScore}
                    <span className="text-base font-medium text-muted-foreground">/100</span>
                  </div>
                </Card>

                <Section icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} title="Pontos fortes">
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {analyzeResult.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section icon={<TrendingUp className="h-4 w-4 text-amber-600" />} title="Melhorias prioritarias">
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    {analyzeResult.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {analyzeResult.corrections.length > 0 && (
                  <Section icon={<Wand2 className="h-4 w-4 text-indigo-600" />} title="Correcoes sugeridas">
                    <div className="space-y-3">
                      {analyzeResult.corrections.map((c, i) => (
                        <div key={i} className="rounded-md border border-indigo-100 bg-indigo-50/40 p-3 text-sm">
                          <p className="font-medium text-slate-800">{c.area}</p>
                          {c.before && (
                            <p className="mt-1 text-xs text-rose-700 line-through">{c.before}</p>
                          )}
                          <p className="mt-1 text-sm text-emerald-800">{c.after}</p>
                          <p className="mt-1 text-xs text-muted-foreground italic">{c.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {analyzeResult.examples.length > 0 && (
                  <Section icon={<FileCheck2 className="h-4 w-4 text-blue-600" />} title="Exemplos de ajustes">
                    <div className="space-y-3">
                      {analyzeResult.examples.map((ex, i) => (
                        <div key={i} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                          <p className="text-xs font-semibold uppercase text-slate-500">{ex.area}</p>
                          <p className="mt-1 text-rose-700 line-through text-sm">{ex.from}</p>
                          <p className="mt-1 text-emerald-700 text-sm font-medium">{ex.to}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{ex.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {analyzeResult.keywordGaps.length > 0 && (
                  <Section icon={<Target className="h-4 w-4 text-rose-600" />} title="Palavras-chave que faltam">
                    <div className="flex flex-wrap gap-1.5">
                      {analyzeResult.keywordGaps.map((k, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 text-xs"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {analyzeResult.atsTips.length > 0 && (
                  <Section icon={<Lightbulb className="h-4 w-4 text-yellow-600" />} title="Dicas de ATS">
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {analyzeResult.atsTips.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            )}
          </div>
        </ModalShell>
      )}

      {/* === Modal: Adaptar === */}
      {adaptOpen && (
        <ModalShell onClose={() => setAdaptOpen(false)} title="Adaptar curriculo para uma vaga">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Cargo (opcional)</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Backend Senior"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Empresa (opcional)</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Nubank"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">
                Descricao da vaga <span className="text-rose-600">*</span>
              </Label>
              <Textarea
                rows={10}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Cole aqui a descricao completa da vaga: responsabilidades, requisitos, diferenciais..."
              />
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                A IA NAO inventara experiencias. Apenas reescreve descricoes com verbos fortes, palavras-chave da vaga e adiciona skills relevantes.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAdaptOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdapt} isLoading={adapting} disabled={adapting}>
                <Briefcase className="h-4 w-4" /> {adapting ? 'Adaptando...' : 'Adaptar com IA'}
              </Button>
            </div>

            {adaptedContent && (
              <div className="space-y-3 pt-2">
                <Card className="border-emerald-200 bg-emerald-50/40 p-3 text-sm">
                  <p className="font-medium text-emerald-800">
                    <CheckCircle2 className="inline h-4 w-4 mr-1" />
                    Adaptacao pronta! Revise no preview e clique em &quot;Aplicar ao curriculo&quot; para aceitar.
                  </p>
                </Card>

                {adaptedChanges.length > 0 && (
                  <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      O que foi ajustado
                    </p>
                    <ul className="space-y-1.5 text-slate-700">
                      {adaptedChanges.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-indigo-600">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <AdaptDiff original={content} adapted={adaptedContent} />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setAdaptedContent(null)}>
                    Rejeitar
                  </Button>
                  <Button onClick={applyAdapted}>
                    <Save className="h-4 w-4" /> Aplicar ao curriculo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalShell>
      )}
      {/* Upgrade Limit Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Limite de Plano Atingido</h3>
                <p className="text-xs text-slate-500">Aproveite o máximo do ATRION</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {modalMessage}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowUpgradeModal(false)}>
                Depois
              </Button>
              <Link href="/pricing" onClick={() => setShowUpgradeModal(false)}>
                <Button variant="primary">
                  Ver Planos de Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <AILoader
        isOpen={analyzing}
        title="Analisando Currículo"
        steps={ANALYZE_STEPS}
      />

      <AILoader
        isOpen={adapting}
        title="Adaptando para Vaga"
        steps={ADAPT_STEPS}
      />
    </>
  );
}

function ModalShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia scroll do body enquanto o modal esta aberto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!mounted) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 2147483647 }}
      className="flex items-start justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" /> {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

function AdaptDiff({ original, adapted }: { original: ResumeContent; adapted: ResumeContent }) {
  const changes: Array<{ area: string; before: string; after: string }> = [];

  if (original.personal.summary !== adapted.personal.summary) {
    changes.push({
      area: 'Resumo profissional',
      before: original.personal.summary,
      after: adapted.personal.summary,
    });
  }
  if (original.personal.jobTitle !== adapted.personal.jobTitle) {
    changes.push({
      area: 'Cargo pretendido',
      before: original.personal.jobTitle,
      after: adapted.personal.jobTitle,
    });
  }
  original.experience.forEach((oExp) => {
    const aExp = adapted.experience.find((e) => e.id === oExp.id);
    if (aExp && oExp.description !== aExp.description) {
      changes.push({
        area: `Experiencia: ${oExp.role} @ ${oExp.company}`,
        before: oExp.description,
        after: aExp.description,
      });
    }
  });
  const newSkills = adapted.skills.filter(
    (s) => !original.skills.some((o) => o.name.trim().toLowerCase() === s.name.trim().toLowerCase())
  );
  if (newSkills.length) {
    changes.push({
      area: 'Habilidades adicionadas',
      before: '(nenhuma)',
      after: newSkills.map((s) => s.name).join(', '),
    });
  }

  if (changes.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50/40 p-3 text-sm text-amber-800">
        A IA nao retornou alteracoes para esta vaga. Tente uma descricao mais detalhada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diff sugerido</p>
      {changes.map((c, i) => (
        <div key={i} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">{c.area}</p>
          {c.before && <p className="mt-1 text-rose-700 line-through whitespace-pre-wrap">{c.before}</p>}
          <p className="mt-1 text-emerald-800 whitespace-pre-wrap">{c.after}</p>
        </div>
      ))}
    </div>
  );
}
