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

type Props = {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
  initialTemplateId: string;
  initialColorScheme: string;
};

const TEMPLATES = [
  { id: 'classic', name: 'Clássico', desc: 'Tradicional corporativo' },
  { id: 'modern', name: 'Moderno', desc: 'Cabeçalho colorido' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Clean e direto' },
  { id: 'creative', name: 'Criativo', desc: 'Sidebar colorida' },
  { id: 'executive', name: 'Executivo', desc: 'Serifado elegante' },
  { id: 'tech', name: 'Tech', desc: 'Estilo terminal/code' },
] as const;

const FONT_OPTIONS = ['Inter', 'Georgia', 'Roboto', 'Lato', 'Merriweather', 'Courier', 'Poppins', 'Montserrat'];
const COLOR_PRESETS = ['#1e40af', '#0f172a', '#7c3aed', '#dc2626', '#059669', '#ea580c', '#0891b2', '#db2777'];

const TABS = [
  { id: 'personal', label: 'Dados Pessoais' },
  { id: 'experience', label: 'Experiência' },
  { id: 'education', label: 'Formação' },
  { id: 'skills', label: 'Habilidades' },
  { id: 'projects', label: 'Projetos' },
  { id: 'languages', label: 'Idiomas' },
  { id: 'certifications', label: 'Certificações' },
] as const;

type TabId = (typeof TABS)[number]['id'];

function generateId() {
  return Math.random().toString(36).substring(2, 12);
}

export function ResumeEditor({
  resumeId,
  initialTitle,
  initialContent,
  initialTemplateId,
  initialColorScheme,
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const printFrameTitleRef = useRef<string | null>(null);

  const completeness = calculateCompleteness(content);

  // Autosave com debounce de 2s
  const save = useCallback(
    async (payload: { title: string; content: ResumeContent; templateId?: string }) => {
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
    await save({ title, content, templateId });
    router.refresh();
  }

  async function handleDownloadPdf() {
    if (typeof window === 'undefined') return;
    printFrameTitleRef.current = title || 'curriculo';
    setIsExportingPdf(true);

    try {
      // A arvore offscreen `.resume-export-root` e renderizada abaixo no JSX do
      // editor (modo normal e fullscreen). Ela existe mesmo quando o preview
      // visivel esta colapsado no layout, garantindo que html2canvas sempre
      // capture um alvo com dimensoes reais (210mm x 297mm).
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

      while (remainingHeight > 0) {
        yPosition = remainingHeight - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, yPosition, imageWidth, imageHeight, undefined, 'FAST');
        remainingHeight -= pageHeight;
      }

      const safeTitle = (title || 'curriculo')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

      pdf.save(`${safeTitle || 'curriculo'}.pdf`);
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save({ title, content, templateId });
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, content, templateId, save]);

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
          />
        )}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center">
          <div
            className="resume-print-root bg-white shadow-2xl"
            style={{ width: '210mm', minHeight: '297mm' }}
            data-resume-title={printFrameTitleRef.current || title || 'curriculo'}
          >
            <ResumePreview content={content} templateId={templateId} style={style} fullscreen />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="resume-export-root pointer-events-none fixed left-[-10000px] top-0 bg-white"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <ResumePreview content={content} templateId={templateId} style={style} fullscreen />
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
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,0.9fr)_minmax(860px,1.4fr)] w-full max-w-[1600px] mx-auto">
        {/* Esquerda: Tabs e Formulário */}
        <div className="flex min-h-0 flex-col space-y-4">
          {/* Navegação de Tabs (Horizontal) */}
          <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-thin rounded-2xl border border-border bg-white/80 p-2 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Formulário do step */}
          <Card className="flex-1 overflow-y-auto rounded-2xl border border-border/80 bg-white p-3 shadow-sm max-h-[calc(100vh-210px)]">
            {tab === 'personal' && (
              <PersonalForm content={content} onChange={updatePersonal} />
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
          </Card>
        </div>

        {/* Direita: Preview do Currículo */}
        <div className="hidden xl:flex min-h-0 flex-col rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#eff6ff,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Visualizacao imersiva</p>
              <p className="text-sm text-slate-600">
                Edite no painel esquerdo e acompanhe o curriculo em tamanho ampliado.
              </p>
            </div>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200 whitespace-nowrap">
              Preview • {TEMPLATES.find((t) => t.id === templateId)?.name}
            </span>
          </div>
          <div className="flex-1 overflow-auto rounded-[24px] border border-slate-200 bg-slate-200/70 p-5">
            <div
              className="resume-print-root mx-auto bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
              style={{ width: '210mm', minHeight: '297mm' }}
              data-resume-title={printFrameTitleRef.current || title || 'curriculo'}
            >
              <ResumePreview content={content} templateId={templateId} style={style} />
            </div>
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="resume-export-root pointer-events-none fixed left-[-10000px] top-0 bg-white"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        <ResumePreview content={content} templateId={templateId} style={style} fullscreen />
      </div>
    </div>
  );
}

function StylePanel({
  templateId,
  setTemplateId,
  style,
  setStyle,
  onClose,
}: {
  templateId: string;
  setTemplateId: (id: string) => void;
  style: ResumeStyle;
  setStyle: (s: ResumeStyle) => void;
  onClose: () => void;
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
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`text-left rounded-md border p-2 text-xs transition-all ${
                  templateId === t.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </button>
            ))}
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
}: {
  content: ResumeContent;
  onChange: <K extends keyof ResumeContent['personal']>(
    key: K,
    value: ResumeContent['personal'][K]
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="mb-2 text-lg font-semibold">Dados Pessoais</h2>
      <Field label="Nome completo" required>
        <Input
          value={content.personal.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="João da Silva"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <Field label="Cargo pretendido" required>
        <Input
          value={content.personal.jobTitle}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          placeholder="Desenvolvedor Full Stack"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
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
      <Field label="Resumo profissional">
        <Textarea
          value={content.personal.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          placeholder="3-6 linhas contando quem você é, sua experiência principal e o que você busca."
          rows={6}
        />
      </Field>
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
