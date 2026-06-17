'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, UploadCloud, Check, ArrowLeft, FileOutput } from 'lucide-react';
import Link from 'next/link';
import { ResumeCardPreview } from '@/components/resume/ResumeCardPreview';
import type { ResumeContent } from '@/lib/validations/resume';

const DUMMY_CONTENT: ResumeContent = {
  personal: {
    name: "Nome Completo",
    jobTitle: "Cargo Profissional",
    email: "email@exemplo.com",
    phone: "(11) 99999-9999",
    location: "São Paulo, SP",
    linkedin: "linkedin.com/in/nome",
    github: "",
    website: "",
    summary: "Resumo profissional direto ao ponto destacando suas principais habilidades, experiências relevantes e objetivos de carreira. Ideal para causar uma boa primeira impressão.",
  },
  experience: [
    {
      id: "1",
      company: "Empresa Exemplo S.A.",
      role: "Cargo Principal",
      start: "2021-01",
      end: "",
      current: true,
      description: "• Liderança e execução de projetos estratégicos.\n• Colaboração em equipes multidisciplinares.\n• Foco em entrega de resultados e qualidade.",
    },
    {
      id: "2",
      company: "Tech Corp",
      role: "Cargo Anterior",
      start: "2018-03",
      end: "2020-12",
      current: false,
      description: "• Desenvolvimento de soluções e melhoria de processos.\n• Aumento de eficiência em 30% no setor.",
    }
  ],
  education: [
    {
      id: "1",
      institution: "Universidade Global",
      course: "Bacharelado Completo",
      level: "Graduação",
      start: "2014-02",
      end: "2017-12",
    }
  ],
  skills: [
    { id: "1", name: "Habilidade Técnica 1", level: "advanced" },
    { id: "2", name: "Habilidade Técnica 2", level: "advanced" },
    { id: "3", name: "Liderança", level: "intermediate" }
  ],
  projects: [],
  languages: [],
  certifications: []
};

const TEMPLATES = [
  { id: 'classic', name: 'Clássico', desc: 'Tradicional e seguro para vagas corporativas' },
  { id: 'modern', name: 'Moderno', desc: 'Design atual com foco em leitura dinâmica' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Limpo e direto ao ponto' },
  { id: 'creative', name: 'Criativo', desc: 'Para áreas de design, marketing e comunicação' },
  { id: 'executive', name: 'Executivo', desc: 'Foco em resultados e liderança' },
  { id: 'tech', name: 'Tech', desc: 'Estrutura otimizada para desenvolvedores e TI' },
];

export default function NewResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'scratch' | 'import'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function handleCreateFromScratch() {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Meu novo currículo',
          templateId: selectedTemplate,
        }),
      });
      if (res.ok) {
        const { resume } = await res.json();
        router.push(`/editor/${resume.id}`);
      } else {
        alert('Erro ao criar currículo');
      }
    } catch {
      alert('Erro de rede');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImport() {
    if (!file) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);

    // Controller de timeout: o import pode demorar (PDF grande + chamada de IA)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    try {
      const res = await fetch('/api/resumes/import', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const { resume } = await res.json();
        router.push(`/editor/${resume.id}`);
        return;
      }

      // Tenta extrair mensagem útil do servidor
      let message = 'Erro ao importar currículo.';
      try {
        const data = await res.json();
        message = data.error || data.message || message;
      } catch {
        // resposta não era JSON
        if (res.status === 413) {
          message = 'Arquivo muito grande. Limite: 5MB.';
        } else if (res.status >= 500) {
          message = 'Erro interno no servidor. Tente novamente em alguns instantes.';
        }
      }
      alert(message);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        alert('A importação demorou demais. Tente com um arquivo menor ou mais simples.');
      } else if (err instanceof TypeError) {
        alert('Erro de rede. Verifique sua conexão e tente novamente.');
      } else {
        alert('Erro inesperado ao importar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === 'select') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Criar Currículo</h1>
            <p className="text-muted-foreground mt-1">Como você prefere começar?</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setMode('scratch')}
            className="text-left group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
              Criar do zero
            </h2>
            <p className="text-sm text-muted-foreground">
              Comece com um documento em branco. Escolha um dos nossos 6 templates profissionais
              e preencha suas informações passo a passo.
            </p>
          </button>

          <button
            onClick={() => setMode('import')}
            className="text-left group rounded-xl border border-border bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-md"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-xl font-semibold group-hover:text-blue-600 transition-colors">
              Importar arquivo
            </h2>
            <p className="text-sm text-muted-foreground">
              Faça upload do seu currículo atual (PDF ou DOCX). A inteligência artificial 
              vai ler e preencher os campos automaticamente para você.
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'scratch') {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('select')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Escolha um Template</h1>
              <p className="text-muted-foreground mt-1">Você pode trocar o template depois se quiser.</p>
            </div>
          </div>
          <Button onClick={handleCreateFromScratch} isLoading={isSubmitting} disabled={isSubmitting}>
            Continuar com {TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((tpl) => (
            <Card
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className={`cursor-pointer overflow-hidden transition-all group ${
                selectedTemplate === tpl.id
                  ? 'ring-2 ring-primary border-transparent'
                  : 'hover:border-primary/50'
              }`}
            >
              <ResumeCardPreview content={DUMMY_CONTENT} templateId={tpl.id} />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.desc}</p>
                </div>
                {selectedTemplate === tpl.id && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'import') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMode('select');
              setFile(null);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Importar Currículo</h1>
            <p className="text-muted-foreground mt-1">Faça upload de um arquivo PDF ou DOCX</p>
          </div>
        </div>

        <Card className="p-10 border-dashed border-2 flex flex-col items-center justify-center text-center bg-secondary/20">
          <FileOutput className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Arraste seu arquivo ou clique para buscar</h3>
          <p className="text-sm text-muted-foreground mb-6">Suporta PDF e DOCX (Máx. 5MB)</p>
          
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            id="file-upload"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          
          {file ? (
            <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border w-full max-w-sm">
              <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-xs text-destructive hover:underline">
                Remover
              </button>
            </div>
          ) : (
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Selecionar arquivo
            </label>
          )}
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleImport} disabled={!file || isSubmitting} isLoading={isSubmitting}>
            Extrair dados e continuar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}