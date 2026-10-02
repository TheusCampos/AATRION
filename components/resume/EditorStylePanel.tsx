import React, { useState } from "react";
import { Label } from "@/components/ui/Input";
import {
  Lock,
  Eye,
  EyeOff,
  Palette,
  ArrowLeft,
  Check,
  LayoutTemplate,
  Type,
  Sliders,
  Sparkles,
} from "lucide-react";
import type { ResumeStyle } from "./ResumePreview";
import type { PlanCode } from "@/lib/plan";

const TEMPLATES = [
  // Essencial
  { id: "classic", name: "Essencial", desc: "Uma coluna, claro e objetivo", category: "essential" },
  { id: "minimalist", name: "Essencial Limpo", desc: "Clean, direto e minimalista", category: "essential" },
  { id: "minimal-grey", name: "Essencial Cinza", desc: "Focado em texto e legibilidade", category: "essential" },

  // Primeiro Emprego & Transição
  { id: "modern", name: "Primeiro Emprego", desc: "Destaque para formação e atividades", category: "transition" },
  { id: "modern-blocks", name: "Transição de Carreira", desc: "Foco em competências transferíveis", category: "transition" },

  // Tecnologia
  { id: "tech", name: "Tecnologia", desc: "Estilo dev/code com foco em projetos", category: "tech" },
  { id: "impact", name: "Tech Impact", desc: "Brutalismo leve, tipografia pesada", category: "tech" },

  // Profissional Experiente
  { id: "executive", name: "Experiente", desc: "Serifado elegante para trajetórias longas", category: "pro" },
  { id: "corporate", name: "Corporativo", desc: "Estruturado e altamente profissional", category: "pro" },
  { id: "executive-pro", name: "Executivo Pro", desc: "Minimalista, focado em resultados", category: "pro" },
  { id: "brown-sidebar", name: "Sênior", desc: "Elegante com sidebar suave", category: "pro" },

  // Apresentação Visual (Com Foto / Criativos)
  { id: "classic-photo", name: "Visual Clássico", desc: "Tradicional com foto de perfil", category: "visual" },
  { id: "creative-photo", name: "Visual Criativo", desc: "Mais personalidade para compartilhamento", category: "visual" },
  { id: "yellow-header", name: "Visual Destaque", desc: "Cabeçalho vibrante com foto", category: "visual" },
  { id: "blue-right-sidebar", name: "Portfólio Azul", desc: "Elegante com sidebar na direita", category: "visual" },
  { id: "elegant", name: "Portfólio Elegante", desc: "Barra lateral decorativa com foto flutuante", category: "visual" },
  { id: "creative", name: "Criativo Sidebar", desc: "Sidebar colorida sem foto", category: "visual" },
  { id: "modern-photo", name: "Moderno com Foto", desc: "Colorido com foto de perfil", category: "visual" },
] as const;

export { TEMPLATES };

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "essential", label: "Essencial" },
  { id: "transition", label: "Entrada & Transição" },
  { id: "tech", label: "Tecnologia" },
  { id: "pro", label: "Executivo & Sênior" },
  { id: "visual", label: "Visual & Com Foto" },
] as const;

const FONT_OPTIONS = [
  { name: "Inter", desc: "Moderna, neutra e altamente legível" },
  { name: "Roboto", desc: "Geométrica e padrão da indústria tech" },
  { name: "Lato", desc: "Calorosa e equilibrada para negócios" },
  { name: "Poppins", desc: "Arredondada, amigável e contemporânea" },
  { name: "Montserrat", desc: "Sofisticada com forte presença de títulos" },
  { name: "Georgia", desc: "Serifada clássica e executiva tradicional" },
  { name: "Merriweather", desc: "Serifada moderna ideal para leitura longa" },
  { name: "Courier", desc: "Monoespaçada com visual técnico/terminal" },
];

const COLOR_PRESETS = [
  { color: "#1e40af", name: "Azul Corporativo" },
  { color: "#0f172a", name: "Slate Elegante" },
  { color: "#7c3aed", name: "Roxo Criativo" },
  { color: "#dc2626", name: "Vermelho Rubi" },
  { color: "#059669", name: "Verde Esmeralda" },
  { color: "#ea580c", name: "Laranja Dinâmico" },
  { color: "#0891b2", name: "Ciano Tecnológico" },
  { color: "#db2777", name: "Rosa Moderno" },
];

type StyleTabId = "templates" | "typography" | "colors" | "layout";

const STYLE_TABS: { id: StyleTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "templates", label: "Modelos", icon: LayoutTemplate },
  { id: "typography", label: "Tipografia & Espaço", icon: Type },
  { id: "colors", label: "Cores & Tema", icon: Palette },
  { id: "layout", label: "Layout & Seções", icon: Sliders },
];

export function StylePanel({
  templateId,
  setTemplateId,
  style,
  setStyle,
  onClose,
  userPlan = "FREE",
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
  const [activeTab, setActiveTab] = useState<StyleTabId>("templates");
  const [templateCategory, setTemplateCategory] = useState<string>("all");

  let fontSizeVal = 14;
  if (typeof style.fontSize === "number") {
    fontSizeVal = style.fontSize;
  } else if (style.fontSize === "sm") {
    fontSizeVal = 12;
  } else if (style.fontSize === "md") {
    fontSizeVal = 14;
  } else if (style.fontSize === "lg") {
    fontSizeVal = 16;
  } else if (style.fontSize === "xl") {
    fontSizeVal = 18;
  } else if (style.fontSize && !isNaN(Number(style.fontSize))) {
    fontSizeVal = Number(style.fontSize);
  }

  let lineHeightVal = 1.5;
  if (typeof style.lineHeight === "number") {
    lineHeightVal = style.lineHeight;
  } else if (style.lineHeight === "tight") {
    lineHeightVal = 1.3;
  } else if (style.lineHeight === "normal") {
    lineHeightVal = 1.5;
  } else if (style.lineHeight === "relaxed") {
    lineHeightVal = 1.75;
  } else if (style.lineHeight && !isNaN(Number(style.lineHeight))) {
    lineHeightVal = Number(style.lineHeight);
  }

  let sectionSpacingVal = 24;
  if (typeof style.sectionSpacing === "number") {
    sectionSpacingVal = style.sectionSpacing;
  } else if (style.sectionSpacing === "compact") {
    sectionSpacingVal = 16;
  } else if (style.sectionSpacing === "normal") {
    sectionSpacingVal = 24;
  } else if (style.sectionSpacing === "relaxed") {
    sectionSpacingVal = 32;
  } else if (style.sectionSpacing && !isNaN(Number(style.sectionSpacing))) {
    sectionSpacingVal = Number(style.sectionSpacing);
  }

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (templateCategory === "all") return true;
    return t.category === templateCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header do Painel */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Estilo & Personalização</h2>
              <p className="text-xs text-slate-500">
                Ajuste o visual do seu currículo com atualização imediata no preview ao lado.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition-all shadow-sm active:scale-95"
          title="Voltar ao formulário de dados"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Formulário</span>
        </button>
      </div>

      {/* Navegação de Abas do Estilo */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
        {STYLE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/70"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba 1: MODELOS */}
      {activeTab === "templates" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filtro de Categorias de Modelos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isCatActive = templateCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setTemplateCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isCatActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Grid de Modelos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTemplates.map((t) => {
              const originalIndex = TEMPLATES.findIndex((item) => item.id === t.id);
              const isLocked = userPlan === "FREE" && originalIndex >= 3;
              const isSelected = templateId === t.id;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      onUpgradeRequired(
                        "Este modelo de currículo está disponível apenas nos planos Pro e Max. Faça o upgrade agora para ter acesso a todos os modelos e recursos!",
                      );
                      return;
                    }
                    setTemplateId(t.id);
                  }}
                  className={`text-left rounded-2xl border p-4 text-xs transition-all relative flex flex-col justify-between min-h-[92px] ${
                    isLocked
                      ? "opacity-75 bg-slate-50 border-slate-200 hover:border-amber-300"
                      : isSelected
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/30 shadow-md"
                        : "border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center justify-between gap-1 text-slate-800 text-sm">
                      <span className="truncate">{t.name}</span>
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          <Lock className="h-3 w-3" /> PRO
                        </span>
                      ) : isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                          <Check className="h-3 w-3" /> Selecionado
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: TIPOGRAFIA E ESPAÇAMENTO */}
      {activeTab === "typography" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Seletor de Fontes */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-800">Família da Fonte</Label>
              <span className="text-xs text-indigo-600 font-semibold">{style.fontFamily || "Inter"}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FONT_OPTIONS.map((f) => {
                const isFontSelected = (style.fontFamily || "Inter") === f.name;
                return (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => setStyle({ ...style, fontFamily: f.name })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isFontSelected
                        ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold text-slate-800 text-sm" style={{ fontFamily: f.name }}>
                      {f.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {f.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders de Ajuste Fino */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slider Tamanho da Fonte */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Tamanho da Fonte</Label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-lg">
                  {fontSizeVal}px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="20"
                step="1"
                value={fontSizeVal}
                onChange={(e) => setStyle({ ...style, fontSize: Number(e.target.value) })}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>10px (Compacto)</span>
                <span>20px (Grande)</span>
              </div>
            </div>

            {/* Slider Altura da Linha */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Entrelinhas</Label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-lg">
                  {lineHeightVal}x
                </span>
              </div>
              <input
                type="range"
                min="1.1"
                max="2.2"
                step="0.05"
                value={lineHeightVal}
                onChange={(e) => setStyle({ ...style, lineHeight: Number(e.target.value) })}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1.1x (Junto)</span>
                <span>2.2x (Arejado)</span>
              </div>
            </div>

            {/* Slider Espaçamento entre Seções */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Espaço entre Seções</Label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-lg">
                  {sectionSpacingVal}px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="48"
                step="2"
                value={sectionSpacingVal}
                onChange={(e) => setStyle({ ...style, sectionSpacing: Number(e.target.value) })}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>8px (Mínimo)</span>
                <span>48px (Espaçoso)</span>
              </div>
            </div>
          </div>

          {/* Prévia da Tipografia */}
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm"
            style={{ fontFamily: style.fontFamily || "Inter" }}
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Amostra de Texto
            </span>
            <h4 className="text-lg font-bold text-slate-900" style={{ fontSize: `${fontSizeVal + 4}px` }}>
              João da Silva — Desenvolvedor Full Stack
            </h4>
            <p
              className="text-slate-600"
              style={{
                fontSize: `${fontSizeVal}px`,
                lineHeight: lineHeightVal,
              }}
            >
              Profissional com mais de 7 anos de experiência no desenvolvimento de sistemas web de alta
              escalabilidade, especializado em TypeScript, React, Next.js e arquiteturas orientadas a microsserviços.
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: CORES E TEMA */}
      {activeTab === "colors" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Paleta de Cores Recomendadas */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
            <div>
              <Label className="text-sm font-bold text-slate-800">Cores Recomendadas</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Cores curadas para máxima legibilidade e conformidade com sistemas de recrutamento ATS.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_PRESETS.map((c) => {
                const isSelected = style.primaryColor?.toLowerCase() === c.color.toLowerCase();
                return (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setStyle({ ...style, primaryColor: c.color })}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800/20 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <span
                      className="h-8 w-8 rounded-full border border-black/10 flex-shrink-0 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: c.color }}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white drop-shadow" />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.color}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor Customizado HEX */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
            <Label className="text-xs font-bold text-slate-800">Cor Personalizada (Qualquer Código HEX)</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={style.primaryColor || "#1e40af"}
                onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                className="h-11 w-14 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shadow-sm"
              />
              <div className="flex-1 max-w-xs">
                <input
                  type="text"
                  value={style.primaryColor || "#1e40af"}
                  onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                  placeholder="#1e40af"
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 4: LAYOUT & SEÇÕES */}
      {activeTab === "layout" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Formato da Página & Foto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tamanho da Página */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
              <Label className="text-xs font-bold text-slate-800">Formato da Página</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStyle({ ...style, paperSize: "a4" })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    (style.paperSize || "a4") === "a4"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-700 ring-2 ring-indigo-600/20 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm">A4</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">210 × 297 mm</div>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle({ ...style, paperSize: "letter" })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    style.paperSize === "letter"
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-700 ring-2 ring-indigo-600/20 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm">Carta (Letter)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">8.5 × 11 pol</div>
                </button>
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
              <Label className="text-xs font-bold text-slate-800">Foto de Perfil</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStyle({ ...style, showPhoto: true })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    style.showPhoto !== false
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-700 ring-2 ring-indigo-600/20 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm">Exibir Foto</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Com imagem</div>
                </button>
                <button
                  type="button"
                  onClick={() => setStyle({ ...style, showPhoto: false })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    style.showPhoto === false
                      ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-700 ring-2 ring-indigo-600/20 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm">Ocultar Foto</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Padrão ATS</div>
                </button>
              </div>
            </div>
          </div>

          {/* Visibilidade das Seções */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-sm">
            <div>
              <Label className="text-sm font-bold text-slate-800">Visibilidade das Seções</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Ative ou desative seções específicas do currículo de acordo com a vaga pretendida.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { key: "summary", name: "Resumo Profissional" },
                { key: "experience", name: "Experiência Profissional" },
                { key: "education", name: "Formação Acadêmica" },
                { key: "skills", name: "Habilidades & Competências" },
                { key: "projects", name: "Projetos Desenvolvidos" },
                { key: "languages", name: "Idiomas" },
                { key: "certifications", name: "Certificações & Cursos" },
              ].map(({ key, name }) => {
                const isHidden = style.hiddenSections?.includes(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      const currentHidden = style.hiddenSections || [];
                      if (isHidden) {
                        setStyle({ ...style, hiddenSections: currentHidden.filter((s) => s !== key) });
                      } else {
                        setStyle({ ...style, hiddenSections: [...currentHidden, key] });
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                      isHidden
                        ? "border-slate-200 bg-slate-50/70 text-slate-400"
                        : "border-slate-200 bg-white text-slate-800 hover:border-indigo-200 shadow-sm"
                    }`}
                  >
                    <span className={isHidden ? "line-through text-slate-400" : "font-semibold"}>{name}</span>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
                        isHidden
                          ? "bg-slate-200/60 text-slate-500"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <EyeOff className="h-3 w-3" /> Oculto
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Visível
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
