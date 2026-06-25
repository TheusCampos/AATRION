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
  User,
  Briefcase,
  GraduationCap,
  Code,
  Folder,
  Globe,
  Flag,
  ZoomIn,
  ZoomOut,
  Sparkles,
  CheckCircle2,
  Circle,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
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

type Props = {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
  initialTemplateId: string;
  initialColorScheme: string;
  userPlan?: PlanCode;
  initialAction?: string;
};

const TEMPLATES = [
  { id: 'classic', name: 'Clássico', desc: 'Tradicional corporativo' },
  { id: 'classic-photo', name: 'Clássico com Foto', desc: 'Corporativo com foto de perfil' },
  { id: 'modern', name: 'Moderno', desc: 'Cabeçalho colorido' },
  { id: 'modern-photo', name: 'Moderno com Foto', desc: 'Colorido com foto de perfil' },
  { id: 'creative-photo', name: 'Criativo com Foto', desc: 'Com foto de perfil e sidebar' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Clean e direto' },
  { id: 'creative', name: 'Criativo', desc: 'Sidebar colorida' },
  { id: 'executive', name: 'Executivo', desc: 'Serifado elegante' },
  { id: 'tech', name: 'Tech', desc: 'Estilo terminal/code' },
  { id: 'brown-sidebar', name: 'Marrom Executivo', desc: 'Sidebar bege claro e título marrom' },
  { id: 'minimal-grey', name: 'Cinza Minimalista', desc: 'Clean, focado em texto e separadores' },
  { id: 'yellow-header', name: 'Amarelo Criativo', desc: 'Destaque no cabeçalho amarelo com foto' },
  { id: 'blue-right-sidebar', name: 'Azul Profissional', desc: 'Elegante com sidebar na direita' },
] as const;

const FONT_OPTIONS = ['Inter', 'Georgia', 'Roboto', 'Lato', 'Merriweather', 'Courier', 'Poppins', 'Montserrat'];
const COLOR_PRESETS = ['#1e40af', '#0f172a', '#7c3aed', '#dc2626', '#059669', '#ea580c', '#0891b2', '#db2777'];

const TABS = [
  { id: 'personal', label: 'Dados pessoais', icon: User },
  { id: 'experience', label: 'Experiência', icon: Briefcase },
  { id: 'education', label: 'Formação', icon: GraduationCap },
  { id: 'skills', label: 'Habilidades', icon: Code },
  { id: 'projects', label: 'Projetos', icon: Folder },
  { id: 'languages', label: 'Idiomas', icon: Globe },
  { id: 'certifications', label: 'Certificações', icon: Flag },
] as const;

type TabId = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'certifications';

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
  const [style, setStyle] = useState<ResumeStyle>({
    ...DEFAULT_STYLE,
    primaryColor: initialColorScheme || DEFAULT_STYLE.primaryColor,
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

  // Autosave com debounce de 2s
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
    await save({ title, content, templateId, colorScheme: style.primaryColor });
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
      // Fallback para impressao nativa do navegador caso o cliente nao
      // consiga gerar PDF (politicas CSP, fonts nao carregadas, etc).
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
      save({ title, content, templateId, colorScheme: style.primaryColor });
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, templateId, style.primaryColor, save]);

  // Persistir style no content via colorScheme
  useEffect(() => {
    if (style.primaryColor !== initialColorScheme) {
      setContent((c) => ({ ...c } as ResumeContent));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style.primaryColor]);

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

  // Fullscreen overlay
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

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_minmax(450px,1fr)_minmax(600px,1.2fr)] w-full items-start">
        {/* Esquerda: Tabs e Qualidade */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col overflow-hidden rounded-2xl border-border/80 bg-white shadow-sm">
            <div className="flex flex-col p-2 space-y-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                let isComplete = false;
                if (t.id === 'personal') isComplete = !!(content.personal.name && content.personal.email && content.personal.jobTitle);
                else if (t.id === 'experience') isComplete = content.experience.length > 0;
                else if (t.id === 'education') isComplete = content.education.length > 0;
                else if (t.id === 'skills') isComplete = content.skills.length > 0;
                else if (t.id === 'projects') isComplete = content.projects.length > 0;
                else if (t.id === 'languages') isComplete = content.languages.length > 0;
                else if (t.id === 'certifications') isComplete = content.certifications.length > 0;

                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{t.label}</span>
                    </div>
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="flex flex-col rounded-2xl border-border/80 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-foreground">Qualidade do currículo</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary text-primary font-bold">
                {completeness}%
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground">
                  {completeness >= 90 ? 'Excelente!' : completeness >= 70 ? 'Muito bom!' : 'Pode melhorar'}
                </span>
                <span className="text-xs text-muted-foreground">Seu currículo está {completeness >= 90 ? 'quase pronto' : 'sendo construído'}.</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${content.personal.name && content.personal.email ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                <span className={content.personal.name ? 'text-foreground' : 'text-muted-foreground'}>Dados completos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${content.experience.length > 0 ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                <span className={content.experience.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>Experiência adicionada</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${content.education.length > 0 ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                <span className={content.education.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>Formação preenchida</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="h-4 w-4 text-muted-foreground/30" />
                <span className="text-muted-foreground">Palavras-chave da vaga</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulário do step */}
        <div className="flex flex-col min-h-0 h-full">
          <Card className="flex-1 overflow-y-auto rounded-2xl border-border/80 bg-white p-1 shadow-sm sm:p-3 xl:h-[calc(100vh-140px)]">
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
        <div className="hidden xl:flex min-h-0 flex-col rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#eff6ff,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)] h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Preview</span>
            
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 p-1 shadow-sm">
              <button 
                onClick={() => setPreviewScale(s => Math.max(50, s - 10))}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200 text-slate-600"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-center text-xs font-medium text-slate-700">{previewScale}%</span>
              <button 
                onClick={() => setPreviewScale(s => Math.min(150, s + 10))}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-200 text-slate-600"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Estilo</span>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none"
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

          <div className="flex-1 overflow-auto rounded-[24px] border border-slate-200 bg-slate-200/70 p-5 flex justify-center items-start">
            <div
              className="resume-print-root bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-transform origin-top"
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
    </div>
  );
}

function StylePanel({
  templateId,
  setTemplateId,
  style,
  setStyle,
  onClose,
  userPlan = 'FREE',
  onUpgradeRequired,
}: {
  templateId: string;
  setTemplateId: (id: string) => void;
  style: ResumeStyle;
  setStyle: (s: ResumeStyle) => void;
  onClose: () => void;
  userPlan?: PlanCode;
  onUpgradeRequired: (msg: string) => void;
}) {
  return (
    <Card className="p-4 bg-secondary/20 border-dashed">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Personalizar visual</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Templates */}
        <div>
          <Label className="text-xs mb-2 block">Modelo</Label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t, index) => {
              const isLocked = userPlan === 'FREE' && index >= 3;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isLocked) {
                      onUpgradeRequired('Este modelo de currículo está disponível apenas nos planos Pro e Max. Faça o upgrade agora para ter acesso a todos os modelos e recursos!');
                      return;
                    }
                    setTemplateId(t.id);
                  }}
                  className={`text-left rounded-md border p-2 text-xs transition-all relative ${
                    isLocked
                      ? 'opacity-60 bg-secondary/10 border-border cursor-not-allowed'
                      : templateId === t.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium flex items-center gap-1 justify-between">
                    <span>{t.name}</span>
                    {isLocked && <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style controls */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs mb-1.5 block">Fonte</Label>
            <select
              value={style.fontFamily}
              onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-card px-2 text-sm"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs mb-1.5 block">Tamanho</Label>
              <select
                value={style.fontSize}
                onChange={(e) => setStyle({ ...style, fontSize: e.target.value as ResumeStyle['fontSize'] })}
                className="w-full h-9 rounded-md border border-border bg-card px-2 text-sm"
              >
                <option value="sm">Pequeno</option>
                <option value="md">Médio</option>
                <option value="lg">Grande</option>
                <option value="xl">Gigante</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Altura</Label>
              <select
                value={style.lineHeight}
                onChange={(e) => setStyle({ ...style, lineHeight: e.target.value as ResumeStyle['lineHeight'] })}
                className="w-full h-9 rounded-md border border-border bg-card px-2 text-sm"
              >
                <option value="tight">Compacta</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Confortável</option>
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Espaço</Label>
              <select
                value={style.sectionSpacing}
                onChange={(e) => setStyle({ ...style, sectionSpacing: e.target.value as ResumeStyle['sectionSpacing'] })}
                className="w-full h-9 rounded-md border border-border bg-card px-2 text-sm"
              >
                <option value="compact">Compacto</option>
                <option value="normal">Normal</option>
                <option value="relaxed">Amplo</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Cor principal</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, primaryColor: c })}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    style.primaryColor === c ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
              <input
                type="color"
                value={style.primaryColor}
                onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                className="h-7 w-9 rounded border border-border cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
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

function PersonalForm({
  content,
  onChange,
  resumeId,
}: {
  content: ResumeContent;
  onChange: <K extends keyof ResumeContent['personal']>(
    key: K,
    value: ResumeContent['personal'][K]
  ) => void;
  resumeId: string;
}) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem original é muito grande. O limite máximo é 5MB antes de redimensionar.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Formato de arquivo inválido. Apenas JPG, JPEG, PNG e WEBP são permitidos.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Redimensionar e comprimir a imagem no lado do cliente
      const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 400; // Tamanho máximo de 400x400 para foto de perfil
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height = Math.round(height * (MAX_SIZE / width));
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width = Math.round(width * (MAX_SIZE / height));
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas não suportado'));
            
            // Fundo branco caso seja um PNG transparente e estejamos salvando como JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('Falha ao comprimir imagem'));
              // Mantém a extensão original ou troca pra jpg
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const newFile = new File([blob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            }, 'image/jpeg', 0.85); // 85% de qualidade (ótima para foto de perfil)
          };
          img.onerror = reject;
        });
      };

      const compressedFile = await resizeImage(file);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('userName', content.personal.name || 'usuario');
      formData.append('resumeId', resumeId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro no upload');
      }

      const { url } = await res.json();
      onChange('photo', url);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Falha ao fazer upload da imagem.';
      alert(errMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    onChange('photo', '');
  };

  const handleEnhanceSummary = async () => {
    if (!content.personal.summary) {
      alert("Por favor, preencha o resumo profissional com pelo menos algumas palavras para que a IA possa melhorar.");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: content.personal.summary }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao melhorar resumo');
      }
      const { summary } = await res.json();
      onChange('summary', summary);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Falha ao melhorar com IA');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-6 text-2xl font-bold text-slate-800">Dados Pessoais</h2>
        
        {/* Upload de foto de perfil */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 mb-6">
          <div className="relative h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden flex-shrink-0">
            {content.personal.photo ? (
              <img
                src={content.personal.photo}
                alt={content.personal.name || 'Foto'}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-slate-400" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-center sm:items-start">
            <h4 className="font-semibold text-slate-700 text-sm">Foto do perfil</h4>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Formatos JPG, PNG ou WEBP. Máximo 2MB.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadPhoto}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Escolher imagem
              </Button>
              {content.personal.photo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Remover
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Informações básicas</h3>
          <Field label="Nome completo" required>
            <Input
              value={content.personal.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="João da Silva"
            />
          </Field>
          
          <Field label="Cargo pretendido" required>
            <Input
              value={content.personal.jobTitle}
              onChange={(e) => onChange('jobTitle', e.target.value)}
              placeholder="Desenvolvedor Full Stack"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Contato</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" required>
            <Input
              type="email"
              value={content.personal.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="seu@email.com"
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={content.personal.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </Field>
        </div>
        <Field label="Localização">
          <Input
            value={content.personal.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="São Paulo, SP"
          />
        </Field>
      </div>

      <div className="space-y-5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Links</h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="LinkedIn">
            <Input
              value={content.personal.linkedin}
              onChange={(e) => onChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/seu-perfil"
            />
          </Field>
          <Field label="GitHub">
            <Input
              value={content.personal.github}
              onChange={(e) => onChange('github', e.target.value)}
              placeholder="github.com/seu-user"
            />
          </Field>
          <Field label="Website">
            <Input
              value={content.personal.website}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="seusite.com.br"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between mb-1">
          <Label className="font-medium">Resumo profissional</Label>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleEnhanceSummary}
            disabled={isEnhancing}
            className="h-7 text-xs gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {isEnhancing ? 'Melhorando...' : 'Melhorar com IA'}
          </Button>
        </div>
        <Textarea
          value={content.personal.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          placeholder="3-6 linhas contando quem você é, sua experiência principal e o que você busca."
          rows={6}
          className="resize-none bg-slate-50"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function ExperienceList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ExperienceItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ExperienceItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Experiência Profissional</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma experiência adicionada. Clique em &quot;+ Adicionar&quot; para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.role || 'Novo cargo'} {item.company && `· ${item.company}`}
                </p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cargo">
                  <Input
                    value={item.role}
                    onChange={(e) => onUpdate(item.id, { role: e.target.value })}
                    placeholder="Tech Lead"
                  />
                </Field>
                <Field label="Empresa">
                  <Input
                    value={item.company}
                    onChange={(e) => onUpdate(item.id, { company: e.target.value })}
                    placeholder="Empresa X"
                  />
                </Field>
                <Field label="Início">
                  <Input
                    type="month"
                    value={item.start}
                    onChange={(e) => onUpdate(item.id, { start: e.target.value })}
                  />
                </Field>
                <Field label="Fim">
                  <Input
                    type="month"
                    value={item.end}
                    onChange={(e) => onUpdate(item.id, { end: e.target.value })}
                    disabled={item.current}
                    placeholder={item.current ? 'Atual' : ''}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => onUpdate(item.id, { current: e.target.checked, end: '' })}
                  className="h-4 w-4 rounded border-border"
                />
                Trabalho atual
              </label>
              <Field label="Descrição">
                <Textarea
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="Descreva suas responsabilidades e conquistas. Use verbos de ação e métricas."
                  rows={4}
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: EducationItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<EducationItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Formação Acadêmica</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhuma formação adicionada.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.course || 'Novo curso'} {item.institution && `· ${item.institution}`}
                </p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Instituição">
                  <Input
                    value={item.institution}
                    onChange={(e) => onUpdate(item.id, { institution: e.target.value })}
                    placeholder="USP"
                  />
                </Field>
                <Field label="Curso">
                  <Input
                    value={item.course}
                    onChange={(e) => onUpdate(item.id, { course: e.target.value })}
                    placeholder="Ciência da Computação"
                  />
                </Field>
                <Field label="Nível">
                  <Input
                    value={item.level}
                    onChange={(e) => onUpdate(item.id, { level: e.target.value })}
                    placeholder="Graduação"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Início">
                    <Input
                      type="month"
                      value={item.start}
                      onChange={(e) => onUpdate(item.id, { start: e.target.value })}
                    />
                  </Field>
                  <Field label="Fim">
                    <Input
                      type="month"
                      value={item.end}
                      onChange={(e) => onUpdate(item.id, { end: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillsList({
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

function ProjectsList({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: ProjectItem[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ProjectItem>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projetos</h2>
        <Button onClick={onAdd} size="sm" variant="secondary">
          + Adicionar
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          Nenhum projeto adicionado.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="space-y-3 bg-secondary/20 p-4">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">{item.name || 'Novo projeto'}</p>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remover
                </button>
              </div>
              <Field label="Nome">
                <Input
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  placeholder="Nome do projeto"
                />
              </Field>
              <Field label="Descrição">
                <Textarea
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, { description: e.target.value })}
                  placeholder="O que o projeto faz e qual foi seu papel"
                  rows={3}
                />
              </Field>
              <Field label="Tecnologias (separadas por vírgula)">
                <Input
                  value={item.tech.join(', ')}
                  onChange={(e) =>
                    onUpdate(item.id, { tech: e.target.value.split(',').map((s) => s.trim()) })
                  }
                  placeholder="React, Node.js, PostgreSQL"
                />
              </Field>
              <Field label="URL">
                <Input
                  value={item.url}
                  onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                  placeholder="https://github.com/seu-user/projeto"
                />
              </Field>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LanguagesList({
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

function CertificationsList({
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
