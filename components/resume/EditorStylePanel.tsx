import React from 'react';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Input';
import { X, Lock } from 'lucide-react';
import type { ResumeStyle } from './ResumePreview';
import type { PlanCode } from '@/lib/plan';

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
  { id: 'corporate', name: 'Corporativo (Elegante)', desc: 'Design estruturado e altamente profissional' },
  { id: 'executive-pro', name: 'Executivo Pro', desc: 'Minimalista e focado na trajetória executiva' },
] as const;

export { TEMPLATES };

const FONT_OPTIONS = ['Inter', 'Georgia', 'Roboto', 'Lato', 'Merriweather', 'Courier', 'Poppins', 'Montserrat'];
const COLOR_PRESETS = ['#1e40af', '#0f172a', '#7c3aed', '#dc2626', '#059669', '#ea580c', '#0891b2', '#db2777'];

export function StylePanel({
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
  let fontSizeVal = 14;
  if (typeof style.fontSize === 'number') {
    fontSizeVal = style.fontSize;
  } else if (style.fontSize === 'sm') {
    fontSizeVal = 12;
  } else if (style.fontSize === 'md') {
    fontSizeVal = 14;
  } else if (style.fontSize === 'lg') {
    fontSizeVal = 16;
  } else if (style.fontSize === 'xl') {
    fontSizeVal = 18;
  } else if (style.fontSize && !isNaN(Number(style.fontSize))) {
    fontSizeVal = Number(style.fontSize);
  }

  let lineHeightVal = 1.5;
  if (typeof style.lineHeight === 'number') {
    lineHeightVal = style.lineHeight;
  } else if (style.lineHeight === 'tight') {
    lineHeightVal = 1.3;
  } else if (style.lineHeight === 'normal') {
    lineHeightVal = 1.5;
  } else if (style.lineHeight === 'relaxed') {
    lineHeightVal = 1.75;
  } else if (style.lineHeight && !isNaN(Number(style.lineHeight))) {
    lineHeightVal = Number(style.lineHeight);
  }

  let sectionSpacingVal = 24;
  if (typeof style.sectionSpacing === 'number') {
    sectionSpacingVal = style.sectionSpacing;
  } else if (style.sectionSpacing === 'compact') {
    sectionSpacingVal = 16;
  } else if (style.sectionSpacing === 'normal') {
    sectionSpacingVal = 24;
  } else if (style.sectionSpacing === 'relaxed') {
    sectionSpacingVal = 32;
  } else if (style.sectionSpacing && !isNaN(Number(style.sectionSpacing))) {
    sectionSpacingVal = Number(style.sectionSpacing);
  }

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
                  className={`text-left rounded-md border p-2 text-xs transition-all relative ${isLocked
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
        <div className="space-y-4">
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

          <div className="space-y-3.5">
            {/* Slider Tamanho */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Tamanho da fonte</Label>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/80 border px-1.5 py-0.5 rounded shadow-sm">{fontSizeVal}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="20"
                step="1"
                value={fontSizeVal}
                onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Altura */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Altura da linha (Entrelinhas)</Label>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/80 border px-1.5 py-0.5 rounded shadow-sm">{lineHeightVal}</span>
              </div>
              <input
                type="range"
                min="1.1"
                max="2.2"
                step="0.05"
                value={lineHeightVal}
                onChange={(e) => setStyle({ ...style, lineHeight: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Slider Espaço */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-semibold">Espaçamento entre seções</Label>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/80 border px-1.5 py-0.5 rounded shadow-sm">{sectionSpacingVal}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="48"
                step="2"
                value={sectionSpacingVal}
                onChange={(e) => setStyle({ ...style, sectionSpacing: Number(e.target.value) })}
                className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Cor principal</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ ...style, primaryColor: c })}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${style.primaryColor === c ? 'border-foreground scale-110' : 'border-transparent'
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
