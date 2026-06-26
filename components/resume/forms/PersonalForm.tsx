import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Loader2, Sparkles, User } from 'lucide-react';
import type { ResumeContent } from '@/lib/validations/resume';
import { Field } from './Field';

export function PersonalForm({
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
      const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 400;
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
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('Falha ao comprimir imagem'));
              const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              const newFile = new File([blob], fileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            }, 'image/jpeg', 0.85);
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
        
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 mb-6">
          <div className="relative h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden flex-shrink-0">
            {content.personal.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
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
