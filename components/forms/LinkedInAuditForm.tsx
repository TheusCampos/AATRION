'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ClipboardPaste, Linkedin, Link as LinkIcon, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea, FieldError } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { fetchLinkedInPublicData } from '@/app/actions/linkedin';
import { cleanLinkedInGarbage } from '@/lib/linkedin-analyzer';

type Props = {
  defaultProfileText?: string;
  defaultProfileUrl?: string;
  defaultArea?: string;
  defaultTargetJob?: string;
};

const MAX_PROFILE_LENGTH = 40000;

export function LinkedInAuditForm({
  defaultProfileText = '',
  defaultProfileUrl = '',
  defaultArea = '',
  defaultTargetJob = '',
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'url' | 'text' | 'pdf'>('text');
  
  const [profileText, setProfileText] = useState(defaultProfileText);
  const [profileUrl, setProfileUrl] = useState(defaultProfileUrl);
  const [area, setArea] = useState(defaultArea);
  const [targetJob, setTargetJob] = useState(defaultTargetJob);
  const [charCount, setCharCount] = useState(defaultProfileText.length);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    let finalProfileText = profileText;

    if (activeTab === 'url') {
      if (!profileUrl.includes('linkedin.com/in/')) {
        setError('Por favor, insira uma URL válida de perfil do LinkedIn.');
        return;
      }
      
      const fetchResult = await fetchLinkedInPublicData(profileUrl);
      
      if (!fetchResult.success) {
        setError(fetchResult.message || 'Falha ao buscar URL.');
        setActiveTab('text');
        return;
      }
      
      finalProfileText = fetchResult.text || '';
    } else if (activeTab === 'pdf') {
      if (!pdfFile) {
        setError('Por favor, selecione um arquivo PDF.');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', pdfFile);
      
      const fetchResult = await fetch('/api/linkedin/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!fetchResult.ok) {
        const data = await fetchResult.json().catch(() => ({}));
        setError(data.error || 'Falha ao extrair texto do PDF.');
        return;
      }
      
      const data = await fetchResult.json();
      finalProfileText = data.text || '';
    }

    const cleanedText = cleanLinkedInGarbage(finalProfileText);

    if (cleanedText.length < 100) {
      setError('Texto do perfil muito curto após a limpeza (mínimo 100 caracteres).');
      return;
    }

    if (cleanedText.length > MAX_PROFILE_LENGTH) {
      setError(`O texto excede o limite de ${MAX_PROFILE_LENGTH.toLocaleString('pt-BR')} caracteres.`);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/linkedin/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileText: cleanedText,
            profileUrl: profileUrl || undefined,
            area: area || undefined,
            targetJob: targetJob || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          let errorMessage = data.error || 'Erro ao criar auditoria.';
          
          if (data.details && data.details.fieldErrors) {
            const fields = Object.keys(data.details.fieldErrors);
            if (fields.length > 0) {
              const firstField = fields[0];
              const firstError = data.details.fieldErrors[firstField][0];
              errorMessage = `${firstError} (Campo: ${firstField})`;
            }
          }
          
          setError(errorMessage);
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
      <Card className="overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-border bg-muted/30">
          <button
            type="button"
            onClick={() => { setActiveTab('text'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              activeTab === 'text' 
                ? 'bg-background text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            Colar Texto
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
              activeTab === 'url' 
                ? 'bg-background text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            URL do LinkedIn
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('pdf'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors border-l border-border/50 ${
              activeTab === 'pdf' 
                ? 'bg-background text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload de PDF
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Linkedin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nova Auditoria com IA</h2>
              <p className="text-sm text-muted-foreground">
                Nossa IA atua como um Headhunter Senior para analisar seu perfil e propor melhorias.
              </p>
            </div>
          </div>

          {activeTab === 'text' ? (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="profileText" required>
                  Texto Completo do Perfil
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
              <p className="text-xs text-muted-foreground mb-2">
                Acesse seu LinkedIn, pressione <kbd className="px-1 py-0.5 bg-muted rounded border">Ctrl+A</kbd> e depois <kbd className="px-1 py-0.5 bg-muted rounded border">Ctrl+C</kbd>. Cole tudo aqui embaixo. A IA fará a limpeza automática do lixo.
              </p>
              <Textarea
                id="profileText"
                value={profileText}
                onChange={(e) => {
                  setProfileText(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder="Cole aqui todo o conteúdo do seu perfil do LinkedIn..."
                rows={12}
                required={activeTab === 'text'}
                className="font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {charCount.toLocaleString('pt-BR')} caracteres · máximo {MAX_PROFILE_LENGTH.toLocaleString('pt-BR')}
                </span>
                {charCount > 0 && charCount < 100 && (
                  <span className="text-amber-600">Muito curto</span>
                )}
              </div>
            </div>
          ) : activeTab === 'url' ? (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label htmlFor="profileUrl" required>Link público do LinkedIn</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Vamos tentar ler as informações públicas do seu perfil. Devido à segurança do LinkedIn, isso pode falhar.
              </p>
              <Input
                id="profileUrl"
                type="url"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                required={activeTab === 'url'}
              />
            </div>
          ) : activeTab === 'pdf' ? (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label htmlFor="pdfFile" required>Currículo em PDF do LinkedIn</Label>
              <p className="text-xs text-muted-foreground mb-4">
                Vá no seu perfil do LinkedIn, clique em &quot;Mais&quot; e depois em &quot;Salvar como PDF&quot;. Faça o upload desse arquivo aqui.
              </p>
              
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="pdfFile"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 transition-colors ${
                    pdfFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-8 h-8 mb-3 ${pdfFile ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">PDF (Máx. 5MB)</p>
                  </div>
                  <input 
                    id="pdfFile" 
                    type="file" 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setPdfFile(e.target.files[0]);
                        setError(null);
                      }
                    }}
                  />
                </label>
              </div>
              
              {pdfFile && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md flex items-center justify-between border border-border">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{pdfFile.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="area">Sua área principal</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Desenvolvedor Frontend Senior"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetJob">Vaga-alvo desejada (opcional)</Label>
              <Input
                id="targetJob"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="Cole aqui a descrição ou título da vaga..."
              />
            </div>
          </div>

          {error && <FieldError>{error}</FieldError>}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Sua análise será gerada em aproximadamente 15 segundos.
            </p>
            <Button type="submit" disabled={isPending} isLoading={isPending} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Auditar Perfil
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading Modal */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl shadow-xl space-y-4 max-w-sm text-center animate-in zoom-in-95 duration-200">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground">A IA está analisando seu perfil...</h3>
            <p className="text-sm text-muted-foreground">
              Isso pode levar até 30 segundos. Por favor, aguarde enquanto cruzamos seus dados com as melhores práticas do mercado.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}