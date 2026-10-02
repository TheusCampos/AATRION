import { ResumePreview, DEFAULT_STYLE } from '@/components/resume/ResumePreview';
import type { ResumeContent } from '@/lib/validations/resume';
import { cn } from '@/lib/utils';

type Props = {
  content: ResumeContent | null;
  templateId?: string | null;
  colorScheme?: string | null;
  className?: string;
};

export function ResumeCardPreview({ content, templateId, colorScheme, className }: Props) {
  if (!content) {
    return (
      <div className={cn("relative flex h-48 w-full items-center justify-center bg-muted/30 border-b border-border/40", className)}>
        <div className="h-32 w-24 rounded border border-dashed border-border/60 bg-background/50" />
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-48 w-full justify-center items-start overflow-hidden bg-slate-50/80 border-b border-slate-100", className)}>
      {/* O currículo escalado e centralizado */}
      <div className="relative mt-3 flex justify-center" style={{ width: '222px', height: '315px' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[210mm] origin-top transform-gpu scale-[0.28] shadow-sm ring-1 ring-border/50 transition-transform duration-500 ease-out group-hover:scale-[0.30]">
          <div 
            className="overflow-hidden bg-white text-left"
            style={{ width: '210mm', minHeight: '297mm' }}
          >
            {(() => {
              try {
                let parsedStyle = DEFAULT_STYLE;
                if (colorScheme && colorScheme.startsWith('{')) {
                  try {
                    parsedStyle = {
                      ...DEFAULT_STYLE,
                      ...JSON.parse(colorScheme),
                    };
                  } catch {}
                } else if (colorScheme) {
                  parsedStyle = {
                    ...DEFAULT_STYLE,
                    primaryColor: colorScheme,
                  };
                }
                return (
                  <ResumePreview
                    content={content}
                    templateId={templateId || 'classic'}
                    style={parsedStyle}
                  />
                );
              } catch (e) {
                console.error('[ResumeCardPreview] Falha ao renderizar miniatura:', e);
                return (
                  <div className="flex h-64 w-full items-center justify-center p-4 text-xs text-slate-400">
                    Miniatura indisponível
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>
      
      {/* Gradiente de fade no rodapé para integrar suavemente com o card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
    </div>
  );
}
