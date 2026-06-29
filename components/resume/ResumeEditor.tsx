'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Save,
  Settings2,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  type ResumeContent,
  type ExperienceItem,
  type EducationItem,
  type SkillItem,
  type ProjectItem,
  type LanguageItem,
  type CertificationItem,
} from '@/lib/validations/resume';
import { calculateCompleteness } from '@/lib/completeness';
import { ResumePreview, type ResumeStyle, DEFAULT_STYLE } from './ResumePreview';
import { AIResumeActions } from './AIResumeActions';
import { type PlanCode } from '@/lib/plan';

// Novos componentes extraídos
import { EditorSidebar, type TabId } from './EditorSidebar';
import { StylePanel, TEMPLATES } from './EditorStylePanel';
import { PersonalForm } from './forms/PersonalForm';
import { ExperienceList } from './forms/ExperienceList';
import { EducationList } from './forms/EducationList';
import { SkillsList } from './forms/SkillsList';
import { ProjectsList } from './forms/ProjectsList';
import { LanguagesList } from './forms/LanguagesList';
import { CertificationsList } from './forms/CertificationsList';

type Props = {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
  initialTemplateId: string;
  initialColorScheme: string;
  userPlan?: PlanCode;
  initialAction?: string;
};

function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

export function ResumeEditor({
  resumeId,
  initialTitle,
  initialContent,
  initialTemplateId,
  initialColorScheme,
  userPlan = 'FREE',
  initialAction,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [tab, setTab] = useState<TabId>('personal');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [templateId, setTemplateId] = useState<string>(initialTemplateId || 'classic');
  const [style, setStyle] = useState<ResumeStyle>(() => {
    if (initialColorScheme && initialColorScheme.startsWith('{')) {
      try {
        const parsed = JSON.parse(initialColorScheme);
        return {
          ...DEFAULT_STYLE,
          ...parsed,
        };
      } catch (e) {
        console.error('Failed to parse initialColorScheme:', e);
      }
    }
    return {
      ...DEFAULT_STYLE,
      primaryColor: initialColorScheme || DEFAULT_STYLE.primaryColor,
    };
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfInstance, setPdfInstance] = useState<any | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(100);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const printFrameTitleRef = useRef<string | null>(null);

  const completeness = calculateCompleteness(content);

  const save = useCallback(
    async (payload: { title: string; content: ResumeContent; templateId?: string; colorScheme?: string }) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Erro ao salvar');
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [resumeId]
  );

  async function handleManualSave() {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    await save({ title, content, templateId, colorScheme: JSON.stringify(style) });
    router.refresh();
  }

  async function handleDownloadPdf() {
    if (typeof window === 'undefined') return;
    printFrameTitleRef.current = title || 'curriculo';
    setIsExportingPdf(true);

    try {
      const target = (document.querySelector('.resume-export-root') ||
        document.querySelector('.resume-print-root')) as HTMLElement | null;

      if (!target) {
        throw new Error('Preview do curriculo nao encontrada para exportacao.');
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        logging: false,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let remainingHeight = imageHeight;
      let yPosition = 0;

      pdf.addImage(imageData, 'PNG', 0, yPosition, imageWidth, imageHeight, undefined, 'FAST');
      remainingHeight -= pageHeight;

      while (remainingHeight > 5) {
        yPosition = remainingHeight - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, yPosition, imageWidth, imageHeight, undefined, 'FAST');
        remainingHeight -= pageHeight;
      }

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      setPdfPreviewUrl(blobUrl);
      setPdfInstance(pdf);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('[ATRION] Falha ao gerar PDF do curriculo', error);
      setSaveStatus('error');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  }

  const handleSavePdf = () => {
    if (pdfInstance) {
      const safeTitle = (title || 'curriculo')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
      pdfInstance.save(`${safeTitle || 'curriculo'}.pdf`);
      closePreviewModal();
    }
  };

  const handlePrintPdf = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement | null;
    if (iframe) {
      iframe.contentWindow?.print();
    } else if (pdfPreviewUrl) {
      window.open(pdfPreviewUrl)?.print();
    }
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    setPdfInstance(null);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save({ title, content, templateId, colorScheme: JSON.stringify(style) });
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, templateId, style, save]);

  useEffect(() => {
    const serialized = JSON.stringify(style);
    if (serialized !== initialColorScheme) {
      setContent((c) => ({ ...c } as ResumeContent));
    }
  }, [style, initialColorScheme]);

  function updatePersonal<K extends keyof ResumeContent['personal']>(
    key: K,
    value: ResumeContent['personal'][K]
  ) {
    setContent((c) => ({ ...c, personal: { ...c.personal, [key]: value } }));
  }

  function addExperience() {
    const item: ExperienceItem = {
      id: generateId(),
      company: '',
      role: '',
      start: '',
      end: '',
      current: false,
      description: '',
    };
    setContent((c) => ({ ...c, experience: [...c.experience, item] }));
  }

  function updateExperience(id: string, patch: Partial<ExperienceItem>) {
    setContent((c) => ({
      ...c,
      experience: c.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeExperience(id: string) {
    setContent((c) => ({ ...c, experience: c.experience.filter((e) => e.id !== id) }));
  }

  function addEducation() {
    const item: EducationItem = {
      id: generateId(),
      institution: '',
      course: '',
      level: '',
      start: '',
      end: '',
    };
    setContent((c) => ({ ...c, education: [...c.education, item] }));
  }

  function updateEducation(id: string, patch: Partial<EducationItem>) {
    setContent((c) => ({
      ...c,
      education: c.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeEducation(id: string) {
    setContent((c) => ({ ...c, education: c.education.filter((e) => e.id !== id) }));
  }

  function addSkill() {
    const item: SkillItem = { id: generateId(), name: '', level: 'intermediate' };
    setContent((c) => ({ ...c, skills: [...c.skills, item] }));
  }

  function updateSkill(id: string, patch: Partial<SkillItem>) {
    setContent((c) => ({
      ...c,
      skills: c.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function removeSkill(id: string) {
    setContent((c) => ({ ...c, skills: c.skills.filter((s) => s.id !== id) }));
  }

  function addProject() {
    const item: ProjectItem = {
      id: generateId(),
      name: '',
      description: '',
      tech: [],
      url: '',
    };
    setContent((c) => ({ ...c, projects: [...c.projects, item] }));
  }

  function updateProject(id: string, patch: Partial<ProjectItem>) {
    setContent((c) => ({
      ...c,
      projects: c.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }

  function removeProject(id: string) {
    setContent((c) => ({ ...c, projects: c.projects.filter((p) => p.id !== id) }));
  }

  function addLanguage() {
    const item: LanguageItem = { id: generateId(), language: '', level: 'intermediate' };
    setContent((c) => ({ ...c, languages: [...c.languages, item] }));
  }

  function updateLanguage(id: string, patch: Partial<LanguageItem>) {
    setContent((c) => ({
      ...c,
      languages: c.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function removeLanguage(id: string) {
    setContent((c) => ({ ...c, languages: c.languages.filter((l) => l.id !== id) }));
  }

  function addCertification() {
    const item: CertificationItem = { id: generateId(), name: '', issuer: '', date: '' };
    setContent((c) => ({ ...c, certifications: [...c.certifications, item] }));
  }

  function updateCertification(id: string, patch: Partial<CertificationItem>) {
    setContent((c) => ({
      ...c,
      certifications: c.certifications.map((c2) =>
        c2.id === id ? { ...c2, ...patch } : c2
      ),
    }));
  }

  function removeCertification(id: string) {
    setContent((c) => ({ ...c, certifications: c.certifications.filter((c2) => c2.id !== id) }));
  }

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col print:bg-white">
        <div className="resume-editor-toolbar flex items-center justify-between bg-white/95 border-b border-slate-200 px-6 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Modo Tela Cheia — {title || 'Currículo'}</span>
            <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>
          <div className="flex items-center gap-2">
            <AIResumeActions
              resumeId={resumeId}
              content={content}
              onApplyAdapted={(next) => setContent(next)}
              initialAction={initialAction}
              userPlan={userPlan}
            />
            <Button variant="secondary" size="sm" onClick={handleManualSave}>
              <Save className="h-4 w-4" /> Salvar
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownloadPdf} isLoading={isExportingPdf}>
              <Download className="h-4 w-4" /> Baixar PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowStylePanel((v) => !v)}>
              <Settings2 className="h-4 w-4" /> Estilo
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setFullscreen(false)}>
              <Minimize2 className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
        {showStylePanel && (
          <StylePanel
            templateId={templateId}
            setTemplateId={setTemplateId}
            style={style}
            setStyle={setStyle}
            onClose={() => setShowStylePanel(false)}
            userPlan={userPlan}
            onUpgradeRequired={(msg) => {
              setModalMessage(msg);
              setShowUpgradeModal(true);
            }}
          />
        )}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
          <div
            className="resume-print-root bg-white shadow-2xl"
            style={{ width: '210mm', minHeight: '297mm' }}
            data-resume-title={printFrameTitleRef.current || title || 'curriculo'}
          >
            <ResumePreview content={content} templateId={templateId} style={style} fullscreen userPlan={userPlan} />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="resume-export-root pointer-events-none fixed -left-[10000px] top-0 bg-white"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <ResumePreview content={content} templateId={templateId} style={style} fullscreen userPlan={userPlan} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="resume-editor-toolbar sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 border-transparent bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            />
            <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Completude: <strong className="text-foreground">{completeness}%</strong>
          </span>
          <AIResumeActions
            resumeId={resumeId}
            content={content}
            onApplyAdapted={(next) => setContent(next)}
            initialAction={initialAction}
            userPlan={userPlan}
          />
          <Button variant="secondary" size="sm" onClick={handleManualSave}>
            <Save className="h-4 w-4" /> Salvar
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownloadPdf} isLoading={isExportingPdf}>
            <Download className="h-4 w-4" /> Baixar PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowStylePanel((v) => !v)}>
            <Settings2 className="h-4 w-4" /> Estilo
          </Button>
          <Button variant="primary" size="sm" onClick={() => setFullscreen(true)}>
            <Maximize2 className="h-4 w-4" /> Tela cheia
          </Button>
        </div>
      </div>

      {showStylePanel && (
        <StylePanel
          templateId={templateId}
          setTemplateId={setTemplateId}
          style={style}
          setStyle={setStyle}
          onClose={() => setShowStylePanel(false)}
          userPlan={userPlan}
          onUpgradeRequired={(msg) => {
            setModalMessage(msg);
            setShowUpgradeModal(true);
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_minmax(380px,1fr)_minmax(450px,1.2fr)] 2xl:grid-cols-[260px_minmax(450px,1fr)_minmax(600px,1.2fr)] w-full items-start pb-20 xl:pb-0">
        {/* Esquerda: Tabs e Qualidade */}
        <EditorSidebar content={content} tab={tab} setTab={setTab} completeness={completeness} />

        {/* Formulário do step */}
        <div className="flex flex-col min-h-0 h-full">
          <Card className="flex-1 overflow-y-auto rounded-3xl border-none bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-4 xl:h-[calc(100vh-140px)]">
            <div className="p-4 sm:p-6">
            {tab === 'personal' && (
              <PersonalForm content={content} onChange={updatePersonal} resumeId={resumeId} />
            )}
            {tab === 'experience' && (
              <ExperienceList
                items={content.experience}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            )}
            {tab === 'education' && (
              <EducationList
                items={content.education}
                onAdd={addEducation}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            )}
            {tab === 'skills' && (
              <SkillsList
                items={content.skills}
                onAdd={addSkill}
                onUpdate={updateSkill}
                onRemove={removeSkill}
              />
            )}
            {tab === 'projects' && (
              <ProjectsList
                items={content.projects}
                onAdd={addProject}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            )}
            {tab === 'languages' && (
              <LanguagesList
                items={content.languages}
                onAdd={addLanguage}
                onUpdate={updateLanguage}
                onRemove={removeLanguage}
              />
            )}
            {tab === 'certifications' && (
              <CertificationsList
                items={content.certifications}
                onAdd={addCertification}
                onUpdate={updateCertification}
                onRemove={removeCertification}
              />
            )}
            </div>
          </Card>
        </div>

        {/* Direita: Preview do Currículo */}
        <div className="hidden xl:flex min-h-0 flex-col rounded-[32px] border border-slate-100 bg-[radial-gradient(circle_at_top,#eff6ff,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-2 shadow-[0_24px_60px_rgba(15,23,42,0.06)] h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-sm font-semibold text-slate-700">Preview</span>
            
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur">
              <button 
                onClick={() => setPreviewScale(s => Math.max(50, s - 10))}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-xs font-semibold text-slate-700">{previewScale}%</span>
              <button 
                onClick={() => setPreviewScale(s => Math.min(150, s + 10))}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Estilo</span>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="h-9 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {TEMPLATES.map((t, index) => {
                  const isLocked = userPlan === 'FREE' && index >= 3;
                  return (
                    <option key={t.id} value={t.id} disabled={isLocked}>
                      {t.name} {isLocked ? '🔒 (PRO)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-[28px] border border-slate-200/50 bg-slate-200/50 p-6 flex justify-center items-start">
            <div
              className="resume-print-root bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-transform origin-top"
              style={{ width: '210mm', minHeight: '297mm', transform: `scale(${previewScale / 100})`, marginBottom: `${(previewScale / 100 - 1) * 297}mm` }}
              data-resume-title={printFrameTitleRef.current || title || 'curriculo'}
            >
              <ResumePreview content={content} templateId={templateId} style={style} userPlan={userPlan} />
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="resume-export-root pointer-events-none fixed -left-[10000px] top-0 bg-white"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <ResumePreview content={content} templateId={templateId} style={style} fullscreen userPlan={userPlan} />
      </div>

      {/* Preview PDF Modal */}
      {isPreviewModalOpen && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Visualização do PDF</h3>
                <p className="text-xs text-slate-500">Revise seu currículo antes de baixar ou imprimir</p>
              </div>
              <button
                onClick={closePreviewModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-slate-50 p-6 flex justify-center items-center">
              <iframe
                id="pdf-preview-iframe"
                src={pdfPreviewUrl}
                className="w-full h-[60vh] rounded-xl border border-slate-200 bg-white shadow-inner"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button variant="secondary" onClick={closePreviewModal}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handlePrintPdf}>
                  Imprimir
                </Button>
                <Button variant="primary" onClick={handleSavePdf}>
                  Baixar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
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
                <h3 className="text-lg font-bold text-slate-900">Upgrade do Plano</h3>
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
      {/* Floating Action Button for Mobile/Tablet Preview */}
      <button
        onClick={() => setFullscreen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 flex h-14 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 font-bold text-white shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95"
      >
        <Maximize2 className="h-5 w-5" />
        Visualizar Currículo
      </button>
    </div>
  );
}

function SaveStatus({
  status,
  lastSavedAt,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
}) {
  if (status === 'saving')
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
      </p>
    );
  if (status === 'saved')
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-green-600" /> Salvo
        {lastSavedAt && ` · ${lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
      </p>
    );
  if (status === 'error')
    return <p className="text-xs text-destructive">Erro ao salvar — tentando novamente...</p>;
  return lastSavedAt ? (
    <p className="text-xs text-muted-foreground">
      Último save: {lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </p>
  ) : null;
}
