import React from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, Circle, User, Briefcase, GraduationCap, Code, Folder, Globe, Flag } from 'lucide-react';
import type { ResumeContent } from '@/lib/validations/resume';

export const TABS = [
  { id: 'personal', label: 'Dados pessoais', icon: User },
  { id: 'experience', label: 'Experiência', icon: Briefcase },
  { id: 'education', label: 'Formação', icon: GraduationCap },
  { id: 'skills', label: 'Habilidades', icon: Code },
  { id: 'projects', label: 'Projetos', icon: Folder },
  { id: 'languages', label: 'Idiomas', icon: Globe },
  { id: 'certifications', label: 'Certificações', icon: Flag },
] as const;

export type TabId = typeof TABS[number]['id'];

interface EditorSidebarProps {
  content: ResumeContent;
  tab: TabId;
  setTab: (tab: TabId) => void;
  completeness: number;
}

export function EditorSidebar({ content, tab, setTab, completeness }: EditorSidebarProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Cards Tabs */}
      <Card className="flex flex-col overflow-hidden rounded-2xl border-none bg-slate-50/50 p-3 shadow-none">
        <div className="flex flex-col space-y-1">
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
                className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{t.label}</span>
                </div>
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Card Qualidade */}
      <Card className="flex flex-col rounded-2xl border-none bg-slate-50/50 p-5 shadow-none">
        <h3 className="mb-4 font-bold text-slate-800">Qualidade do currículo</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-600 text-indigo-700 font-bold bg-white shadow-sm">
            {completeness}%
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-lg">
              {completeness >= 90 ? 'Excelente!' : completeness >= 70 ? 'Muito bom!' : 'Pode melhorar'}
            </span>
            <span className="text-sm text-slate-500 leading-tight mt-0.5">
              Seu currículo está {completeness >= 90 ? 'quase pronto' : 'sendo construído'}.
            </span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${content.personal.name && content.personal.email ? 'text-emerald-500' : 'text-slate-300'}`} />
            <span className={content.personal.name ? 'text-slate-700' : 'text-slate-500'}>Dados completos</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${content.experience.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
            <span className={content.experience.length > 0 ? 'text-slate-700' : 'text-slate-500'}>Experiência adicionada</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${content.education.length > 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
            <span className={content.education.length > 0 ? 'text-slate-700' : 'text-slate-500'}>Formação preenchida</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Circle className="h-4 w-4 flex-shrink-0 text-slate-300" />
            <span className="text-slate-500">Palavras-chave da vaga</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
