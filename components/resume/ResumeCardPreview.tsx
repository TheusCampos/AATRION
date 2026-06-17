import { ResumePreview, DEFAULT_STYLE } from '@/components/resume/ResumePreview';
import type { ResumeContent } from '@/lib/validations/resume';

type Props = {
  content: ResumeContent | null;
  templateId?: string | null;
  colorScheme?: string | null;
};

export function ResumeCardPreview({ content, templateId, colorScheme }: Props) {
  if (!content) {
    return (
      <div className="relative flex h-48 w-full items-center justify-center bg-muted/30 border-b border-border/40">
        <div className="h-32 w-24 rounded border border-dashed border-border/60 bg-background/50" />
      </div>
    );
  }

  return (
    <div className="relative flex h-48 w-full justify-center overflow-hidden bg-muted/30 border-b border-border/40">
      {/* O currículo escalado e centralizado no topo */}
      <div className="absolute top-4 origin-top transform-gpu scale-[0.30] shadow-sm ring-1 ring-border/50 transition-transform duration-500 ease-out group-hover:scale-[0.32]">
        <div 
          className="overflow-hidden bg-white"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <ResumePreview
            content={content}
            templateId={templateId || 'classic'}
            style={{
              ...DEFAULT_STYLE,
              primaryColor: colorScheme || DEFAULT_STYLE.primaryColor,
            }}
          />
        </div>
      </div>
      
      {/* Gradiente de fade no rodapé para integrar suavemente com o card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}
