import React from 'react';
import type { ResumeContent } from '@/lib/validations/resume';
import { Mail, MapPin, Phone, Linkedin, Github, Globe } from 'lucide-react';

import type { PlanCode } from '@/lib/plan';

export type ResumeStyle = {
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  lineHeight: 'tight' | 'normal' | 'relaxed';
  letterSpacing: 'tight' | 'normal' | 'wide';
  primaryColor: string;
  sectionSpacing: 'compact' | 'normal' | 'relaxed';
};

export const DEFAULT_STYLE: ResumeStyle = {
  fontFamily: 'Inter',
  fontSize: 'md',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  primaryColor: '#1e40af',
  sectionSpacing: 'normal',
};

const FONT_MAP: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Georgia: "'Georgia', serif",
  Roboto: "'Roboto', sans-serif",
  Lato: "'Lato', sans-serif",
  Merriweather: "'Merriweather', serif",
  Courier: "'Courier New', monospace",
  Poppins: "'Poppins', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
};

const FONT_SIZE_MAP: Record<ResumeStyle['fontSize'], string> = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
  xl: '1.125rem',
};

const LINE_HEIGHT_MAP: Record<ResumeStyle['lineHeight'], string> = {
  tight: '1.3',
  normal: '1.5',
  relaxed: '1.75',
};

const LETTER_SPACING_MAP: Record<ResumeStyle['letterSpacing'], string> = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.05em',
};

const SPACING_MAP: Record<ResumeStyle['sectionSpacing'], string> = {
  compact: '1rem',
  normal: '1.5rem',
  relaxed: '2rem',
};

type Props = {
  content: ResumeContent;
  templateId?: string;
  style?: ResumeStyle;
  fullscreen?: boolean;
  userPlan?: PlanCode;
};

export function ResumePreview({ content, templateId = 'classic', style = DEFAULT_STYLE, fullscreen = false, userPlan }: Props) {
  const { personal, experience, education, skills, projects, languages, certifications } = content;

  const fontFamily = FONT_MAP[style.fontFamily] || FONT_MAP.Inter;
  const fontSize = FONT_SIZE_MAP[style.fontSize];
  const lineHeight = LINE_HEIGHT_MAP[style.lineHeight];
  const letterSpacing = LETTER_SPACING_MAP[style.letterSpacing];
  const sectionSpacing = SPACING_MAP[style.sectionSpacing];
  const primary = style.primaryColor;

  const isFree = userPlan === 'FREE';
  const overlayColor = templateId === 'tech' ? 'rgba(15, 23, 42, 0.93)' : 'rgba(255, 255, 255, 0.93)';
  const watermarkStyle: React.CSSProperties = isFree ? {
    backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url('/Logo-atrion-fundo.png')`,
    backgroundSize: '210mm 297mm',
    backgroundRepeat: 'repeat-y',
    backgroundPosition: 'center top',
  } : {};

  const containerClass = fullscreen
    ? 'w-full bg-white overflow-hidden flex flex-col break-words'
    : 'w-full max-w-[210mm] mx-auto bg-white shadow-lg overflow-hidden flex flex-col break-words';
  const containerStyle = fullscreen
    ? { fontFamily, fontSize, lineHeight, letterSpacing, color: '#1e293b', minHeight: '297mm', ...watermarkStyle }
    : { fontFamily, fontSize, lineHeight, letterSpacing, color: '#1e293b', aspectRatio: '210/297', ...watermarkStyle };

  // Renderização condicional por template
  if (templateId === 'modern') {
    return <ModernLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'classic-photo') {
    return <ClassicPhotoLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'modern-photo') {
    return <ModernPhotoLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'creative-photo') {
    return <CreativePhotoLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'minimalist') {
    return <MinimalistLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'creative') {
    return <CreativeLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'executive') {
    return <ExecutiveLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  if (templateId === 'tech') {
    return <TechLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
  }
  // Default: classic
  return <ClassicLayout containerClass={containerClass} containerStyle={containerStyle} primary={primary} sectionSpacing={sectionSpacing} personal={personal} experience={experience} education={education} skills={skills} projects={projects} languages={languages} certifications={certifications} />;
}

type LayoutProps = {
  containerClass: string;
  containerStyle: React.CSSProperties;
  primary: string;
  sectionSpacing: string;
  personal: ResumeContent['personal'];
  experience: ResumeContent['experience'];
  education: ResumeContent['education'];
  skills: ResumeContent['skills'];
  projects: ResumeContent['projects'];
  languages: ResumeContent['languages'];
  certifications: ResumeContent['certifications'];
};

function ContactItems({ personal }: { personal: ResumeContent['personal'] }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-600">
      {personal.email && (<span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personal.email}</span>)}
      {personal.phone && (<span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personal.phone}</span>)}
      {personal.location && (<span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personal.location}</span>)}
      {personal.linkedin && (<span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {personal.linkedin}</span>)}
      {personal.github && (<span className="flex items-center gap-1"><Github className="w-3 h-3" /> {personal.github}</span>)}
      {personal.website && (<span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {personal.website}</span>)}
    </div>
  );
}

// ============== CLASSIC ==============
function ClassicLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 p-8 overflow-y-auto print:overflow-visible" style={{ display: 'flex', flexDirection: 'column', gap: p.sectionSpacing }}>
        <header className="border-b border-slate-300 pb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: p.primary }}>{p.personal.name || 'Seu Nome Completo'}</h1>
          {p.personal.jobTitle && (<p className="text-lg font-medium text-slate-600 mt-1">{p.personal.jobTitle}</p>)}
          <ContactItems personal={p.personal} />
        </header>

        {p.personal.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Resumo Profissional</h2>
            <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
          </section>
        )}

        {p.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Experiência Profissional</h2>
            <div className="space-y-4">
              {p.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap">{exp.role || 'Cargo'}</h3>
                      <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{exp.company || 'Empresa'}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{exp.start || 'Início'} — {exp.current ? 'Atual' : (exp.end || 'Fim')}</span>
                  </div>
                  {exp.description && (<p className="text-slate-700 whitespace-pre-wrap mt-1">{exp.description}</p>)}
                </div>
              ))}
            </div>
          </section>
        )}

        {p.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Formação Acadêmica</h2>
            <div className="space-y-3">
              {p.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 whitespace-pre-wrap">{edu.course || 'Curso'} {edu.level && `- ${edu.level}`}</h3>
                    <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{edu.institution || 'Instituição'}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{edu.start || 'Início'} — {edu.end || 'Fim'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {p.skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Habilidades</h2>
              <ul className="flex flex-wrap gap-2">
                {p.skills.map((skill) => (<li key={skill.id} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-700">{skill.name || 'Habilidade'}</li>))}
              </ul>
            </section>
          )}
          {p.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Idiomas</h2>
              <ul className="space-y-1">
                {p.languages.map((lang) => (
                  <li key={lang.id} className="text-xs text-slate-700 flex justify-between"><span className="font-medium">{lang.language || 'Idioma'}</span><span className="text-slate-500 capitalize">{lang.level || 'Nível'}</span></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {p.projects.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Projetos</h2>
              <div className="space-y-3">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-slate-800 text-xs">{proj.name || 'Projeto'}</h3>
                      {proj.url && <a href={proj.url} className="text-[10px] text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                    </div>
                    {proj.description && <p className="text-[11px] text-slate-700 leading-tight mb-1 whitespace-pre-wrap">{proj.description}</p>}
                    {proj.tech.length > 0 && <p className="text-[10px] text-slate-500 italic">Tecnologias: {proj.tech.join(', ')}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.certifications.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Certificações</h2>
              <div className="space-y-2">
                {p.certifications.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <h3 className="font-semibold text-slate-800">{cert.name || 'Certificação'}</h3>
                    <div className="flex justify-between text-slate-600"><span>{cert.issuer || 'Instituição'}</span><span>{cert.date || 'Data'}</span></div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== MODERN ==============
function ModernLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <header className="p-8 text-white" style={{ backgroundColor: p.primary }}>
          <h1 className="text-4xl font-extrabold tracking-tight">{p.personal.name || 'Seu Nome Completo'}</h1>
          {p.personal.jobTitle && <p className="text-xl font-light mt-1 opacity-90">{p.personal.jobTitle}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-95">
            {p.personal.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.personal.email}</span>}
            {p.personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.personal.phone}</span>}
            {p.personal.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.personal.location}</span>}
            {p.personal.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> {p.personal.linkedin}</span>}
            {p.personal.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" /> {p.personal.github}</span>}
          </div>
        </header>

        <div className="p-8 grid md:grid-cols-3 gap-8" style={{ gap: p.sectionSpacing }}>
          <div className="md:col-span-2 flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.personal.summary && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Sobre</h2>
                <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
              </section>
            )}
            {p.experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: p.primary }}>Experiência</h2>
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: p.primary }}>
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap break-words">{exp.role || 'Cargo'}</h3>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap break-words">{exp.company || 'Empresa'} • {exp.start || 'Início'} — {exp.current ? 'Atual' : (exp.end || 'Fim')}</p>
                      {exp.description && <p className="text-slate-700 whitespace-pre-wrap break-words mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.projects.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: p.primary }}>Projetos</h2>
                <div className="space-y-3">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-semibold text-slate-800 text-xs">{proj.name || 'Projeto'}</h3>
                      {proj.description && <p className="text-[11px] text-slate-700 leading-tight mt-0.5 whitespace-pre-wrap">{proj.description}</p>}
                      {proj.tech.length > 0 && <p className="text-[10px] text-slate-500 italic mt-0.5">{proj.tech.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.education.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Formação</h2>
                <div className="space-y-2">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-slate-800">{edu.course || 'Curso'}</h3>
                      <p className="text-xs text-slate-600">{edu.institution || 'Instituição'}</p>
                      <p className="text-[10px] text-slate-500">{edu.start} — {edu.end}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.skills.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Skills</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {p.skills.map((skill) => (<li key={skill.id} className="text-xs font-medium px-2 py-1 rounded text-white" style={{ backgroundColor: p.primary }}>{skill.name}</li>))}
                </ul>
              </section>
            )}
            {p.languages.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Idiomas</h2>
                <ul className="space-y-1 text-xs">
                  {p.languages.map((lang) => (<li key={lang.id} className="text-slate-700 flex justify-between"><span>{lang.language}</span><span className="text-slate-500 capitalize">{lang.level}</span></li>))}
                </ul>
              </section>
            )}
            {p.certifications.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Certificações</h2>
                <div className="space-y-1.5 text-xs">
                  {p.certifications.map((cert) => (<div key={cert.id}><p className="font-semibold text-slate-800">{cert.name}</p><p className="text-slate-500">{cert.issuer} • {cert.date}</p></div>))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== MINIMALIST ==============
function MinimalistLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 p-10 overflow-y-auto print:overflow-visible" style={{ display: 'flex', flexDirection: 'column', gap: p.sectionSpacing }}>
        <header className="text-left">
          <h1 className="text-4xl font-light tracking-tight text-slate-900">{p.personal.name || 'Seu Nome Completo'}</h1>
          {p.personal.jobTitle && <p className="text-sm font-light text-slate-500 uppercase tracking-widest mt-2">{p.personal.jobTitle}</p>}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {p.personal.email && <span>{p.personal.email}</span>}
            {p.personal.phone && <span>{p.personal.phone}</span>}
            {p.personal.location && <span>{p.personal.location}</span>}
            {p.personal.linkedin && <span>{p.personal.linkedin}</span>}
            {p.personal.github && <span>{p.personal.github}</span>}
          </div>
        </header>

        <hr className="border-slate-200" />

        {p.personal.summary && (
          <section>
            <p className="whitespace-pre-wrap text-slate-600 italic">{p.personal.summary}</p>
          </section>
        )}

        {p.experience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Experiência</h2>
            <div className="space-y-5">
              {p.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-slate-800 whitespace-pre-wrap">{exp.role || 'Cargo'}</h3>
                    <span className="text-xs text-slate-400">{exp.start} — {exp.current ? 'Atual' : exp.end}</span>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-pre-wrap">{exp.company}</p>
                  {exp.description && <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1.5 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {p.education.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Formação</h2>
            <div className="space-y-3">
              {p.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-medium text-slate-800 whitespace-pre-wrap">{edu.course}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-slate-400">{edu.start} — {edu.end}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {p.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Habilidades</h2>
              <p className="text-sm text-slate-600">{p.skills.map((s) => s.name).filter(Boolean).join(' • ')}</p>
            </section>
          )}
          {p.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Idiomas</h2>
              <p className="text-sm text-slate-600">{p.languages.map((l) => `${l.language} (${l.level})`).join(' • ')}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== CREATIVE ==============
function CreativeLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible grid md:grid-cols-12">
        <aside className="md:col-span-4 p-8 text-white" style={{ backgroundColor: p.primary }}>
          <h1 className="text-3xl font-extrabold leading-tight">{p.personal.name || 'Seu Nome'}</h1>
          {p.personal.jobTitle && <p className="text-sm font-light opacity-90 mt-2 uppercase tracking-widest">{p.personal.jobTitle}</p>}

          <div className="mt-8 space-y-3 text-xs">
            {p.personal.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {p.personal.email}</div>}
            {p.personal.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {p.personal.phone}</div>}
            {p.personal.location && <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {p.personal.location}</div>}
            {p.personal.linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3 h-3" /> {p.personal.linkedin}</div>}
            {p.personal.github && <div className="flex items-center gap-2"><Github className="w-3 h-3" /> {p.personal.github}</div>}
          </div>

          {p.skills.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90">Habilidades</h2>
              <ul className="space-y-1 text-xs">
                {p.skills.map((skill) => (<li key={skill.id} className="bg-white/10 px-2 py-1 rounded">{skill.name}</li>))}
              </ul>
            </div>
          )}

          {p.languages.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90">Idiomas</h2>
              <ul className="space-y-1 text-xs">
                {p.languages.map((lang) => (<li key={lang.id} className="flex justify-between"><span>{lang.language}</span><span className="opacity-75">{lang.level}</span></li>))}
              </ul>
            </div>
          )}
        </aside>

        <main className="md:col-span-8 p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-2" style={{ color: p.primary }}>Perfil</h2>
              <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-4" style={{ color: p.primary }}>Trajetória</h2>
              <div className="space-y-4">
                {p.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: p.primary }}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">{exp.role}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{exp.company} • {exp.start} — {exp.current ? 'Atual' : exp.end}</p>
                    {exp.description && <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.education.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: p.primary }}>Formação</h2>
              <div className="space-y-2">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">{edu.course}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{edu.institution} • {edu.start} — {edu.end}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.projects.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: p.primary }}>Projetos</h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                    {proj.description && <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

// ============== EXECUTIVE ==============
function ExecutiveLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <header className="p-8 border-b-4" style={{ borderColor: p.primary }}>
          <h1 className="text-4xl font-serif font-bold tracking-tight" style={{ color: p.primary }}>{p.personal.name || 'Seu Nome'}</h1>
          {p.personal.jobTitle && <p className="text-lg font-serif italic text-slate-600 mt-1">{p.personal.jobTitle}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {p.personal.email && <span>{p.personal.email}</span>}
            {p.personal.phone && <span>{p.personal.phone}</span>}
            {p.personal.location && <span>{p.personal.location}</span>}
            {p.personal.linkedin && <span>{p.personal.linkedin}</span>}
          </div>
        </header>

        <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2 className="font-serif text-base font-bold mb-2" style={{ color: p.primary }}>Resumo Executivo</h2>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{p.personal.summary}</p>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2 className="font-serif text-base font-bold mb-4" style={{ color: p.primary }}>Trajetória Profissional</h2>
              <div className="space-y-5">
                {p.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-slate-800 whitespace-pre-wrap">{exp.role}</h3>
                      <span className="text-xs text-slate-500 italic">{exp.start} — {exp.current ? 'Atual' : exp.end}</span>
                    </div>
                    <p className="text-sm italic whitespace-pre-wrap" style={{ color: p.primary }}>{exp.company}</p>
                    {exp.description && <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1.5 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className="grid grid-cols-2 gap-8">
            {p.education.length > 0 && (
              <section>
                <h2 className="font-serif text-base font-bold mb-3" style={{ color: p.primary }}>Educação</h2>
                <div className="space-y-2">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-slate-800">{edu.course}</h3>
                      <p className="text-xs text-slate-600 italic">{edu.institution} • {edu.start} — {edu.end}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.certifications.length > 0 && (
              <section>
                <h2 className="font-serif text-base font-bold mb-3" style={{ color: p.primary }}>Certificações</h2>
                <div className="space-y-1.5">
                  {p.certifications.map((cert) => (<div key={cert.id} className="text-sm"><span className="font-semibold text-slate-800">{cert.name}</span> <span className="text-xs text-slate-500">— {cert.issuer} ({cert.date})</span></div>))}
                </div>
              </section>
            )}
          </div>
          {p.skills.length > 0 && (
            <section>
              <h2 className="font-serif text-base font-bold mb-2" style={{ color: p.primary }}>Competências</h2>
              <p className="text-sm text-slate-700">{p.skills.map((s) => s.name).filter(Boolean).join(' • ')}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== TECH ==============
function TechLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={{ ...p.containerStyle, backgroundColor: '#0f172a', color: '#e2e8f0' }}>
      <div className="flex-1 overflow-y-auto print:overflow-visible" style={{ fontFamily: "'Courier New', monospace" }}>
        <header className="p-8 border-b" style={{ borderColor: p.primary }}>
          <div className="flex items-center gap-2 text-xs mb-2 opacity-70">
            <span style={{ color: p.primary }}>$</span>
            <span>cat profile.json</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: p.primary }}>{p.personal.name || 'seu_nome'}</h1>
          {p.personal.jobTitle && <p className="text-sm opacity-80 mt-1">{`//`} {p.personal.jobTitle}</p>}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {p.personal.email && <span style={{ color: p.primary }}>email:</span>}
            {p.personal.email && <span>{p.personal.email}</span>}
            {p.personal.phone && <span style={{ color: p.primary }}>tel:</span>}
            {p.personal.phone && <span>{p.personal.phone}</span>}
            {p.personal.github && <span style={{ color: p.primary }}>github:</span>}
            {p.personal.github && <span>{p.personal.github}</span>}
            {p.personal.linkedin && <span style={{ color: p.primary }}>linkedin:</span>}
            {p.personal.linkedin && <span>{p.personal.linkedin}</span>}
          </div>
        </header>

        <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: p.primary }}>{'>'} resumo</h2>
              <p className="whitespace-pre-wrap text-sm opacity-90 leading-relaxed">{p.personal.summary}</p>
            </section>
          )}
          {p.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: p.primary }}>{'>'} stack</h2>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map((skill) => (<span key={skill.id} className="text-xs px-2 py-1 rounded border" style={{ borderColor: p.primary, color: p.primary }}>{skill.name}</span>))}
              </div>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: p.primary }}>{'>'} experience.log</h2>
              <div className="space-y-3">
                {p.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: p.primary }}>
                    <p className="text-xs opacity-60">[{exp.start} → {exp.current ? 'atual' : exp.end}]</p>
                    <h3 className="font-bold text-sm whitespace-pre-wrap" style={{ color: p.primary }}>{exp.role} <span className="opacity-70 font-normal whitespace-pre-wrap">@ {exp.company}</span></h3>
                    {exp.description && <p className="text-xs opacity-90 whitespace-pre-wrap mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: p.primary }}>{'>'} projects/</h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-sm" style={{ color: p.primary }}>./{proj.name}</h3>
                    {proj.description && <p className="text-xs opacity-90 mt-0.5 whitespace-pre-wrap">{proj.description}</p>}
                    {proj.tech.length > 0 && <p className="text-[10px] opacity-60 mt-0.5">$ deps: {proj.tech.join(' ')}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: p.primary }}>{'>'} education</h2>
              <div className="space-y-1.5 text-sm">
                {p.education.map((edu) => (<p key={edu.id}><span style={{ color: p.primary }}>▸</span> {edu.course} — {edu.institution} ({edu.start}–{edu.end})</p>))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== COMPONENTE AVATAR ==============
interface ResumeAvatarProps {
  photo?: string;
  name?: string;
  size?: string;
  borderColor?: string;
}

function ResumeAvatar({ photo, name, size = '90px', borderColor }: ResumeAvatarProps) {
  if (photo) {
    return (
      <div
        className="relative overflow-hidden rounded-full flex-shrink-0"
        style={{
          width: size,
          height: size,
          border: borderColor ? `2px solid ${borderColor}` : '2px solid #e2e8f0',
        }}
      >
        <img
          src={photo}
          alt={name || 'Foto de perfil'}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0 bg-slate-200 text-slate-700 font-semibold"
      style={{
        width: size,
        height: size,
        border: borderColor ? `2px solid ${borderColor}` : '2px solid #e2e8f0',
        fontSize: `calc(${size} * 0.38)`,
      }}
    >
      {initials}
    </div>
  );
}

// ============== CLASSIC WITH PHOTO ==============
function ClassicPhotoLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 p-8 overflow-y-auto print:overflow-visible" style={{ display: 'flex', flexDirection: 'column', gap: p.sectionSpacing }}>
        <header className="border-b border-slate-300 pb-4 flex items-center justify-between gap-6">
          <div className="flex-1 text-left">
            <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: p.primary }}>{p.personal.name || 'Seu Nome Completo'}</h1>
            {p.personal.jobTitle && (<p className="text-lg font-medium text-slate-600 mt-1">{p.personal.jobTitle}</p>)}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
              {p.personal.email && (<span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {p.personal.email}</span>)}
              {p.personal.phone && (<span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.personal.phone}</span>)}
              {p.personal.location && (<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.personal.location}</span>)}
              {p.personal.linkedin && (<span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5 text-slate-400" /> {p.personal.linkedin}</span>)}
              {p.personal.github && (<span className="flex items-center gap-1"><Github className="w-3.5 h-3.5 text-slate-400" /> {p.personal.github}</span>)}
              {p.personal.website && (<span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-400" /> {p.personal.website}</span>)}
            </div>
          </div>
          <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="95px" borderColor={p.primary} />
        </header>

        {p.personal.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Resumo Profissional</h2>
            <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
          </section>
        )}

        {p.experience.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Experiência Profissional</h2>
            <div className="space-y-4">
              {p.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap">{exp.role || 'Cargo'}</h3>
                      <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{exp.company || 'Empresa'}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{exp.start || 'Início'} — {exp.current ? 'Atual' : (exp.end || 'Fim')}</span>
                  </div>
                  {exp.description && (<p className="text-slate-700 whitespace-pre-wrap mt-1">{exp.description}</p>)}
                </div>
              ))}
            </div>
          </section>
        )}

        {p.education.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Formação Acadêmica</h2>
            <div className="space-y-3">
              {p.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 whitespace-pre-wrap">{edu.course || 'Curso'} {edu.level && `- ${edu.level}`}</h3>
                    <p className="text-xs font-medium text-slate-600 whitespace-pre-wrap">{edu.institution || 'Instituição'}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{edu.start || 'Início'} — {edu.end || 'Fim'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {p.skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Habilidades</h2>
              <ul className="flex flex-wrap gap-2">
                {p.skills.map((skill) => (<li key={skill.id} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-700">{skill.name || 'Habilidade'}</li>))}
              </ul>
            </section>
          )}
          {p.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Idiomas</h2>
              <ul className="space-y-1">
                {p.languages.map((lang) => (
                  <li key={lang.id} className="text-xs text-slate-700 flex justify-between"><span className="font-medium">{lang.language || 'Idioma'}</span><span className="text-slate-500 capitalize">{lang.level || 'Nível'}</span></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {p.projects.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Projetos</h2>
              <div className="space-y-3">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-semibold text-slate-800 text-xs">{proj.name || 'Projeto'}</h3>
                      {proj.url && <a href={proj.url} className="text-[10px] text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                    </div>
                    {proj.description && <p className="text-[11px] text-slate-700 leading-tight mb-1 whitespace-pre-wrap">{proj.description}</p>}
                    {proj.tech.length > 0 && <p className="text-[10px] text-slate-500 italic">Tecnologias: {proj.tech.join(', ')}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.certifications.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-slate-200 pb-1" style={{ color: p.primary }}>Certificações</h2>
              <div className="space-y-2">
                {p.certifications.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <h3 className="font-semibold text-slate-800">{cert.name || 'Certificação'}</h3>
                    <div className="flex justify-between text-slate-600"><span>{cert.issuer || 'Instituição'}</span><span>{cert.date || 'Data'}</span></div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ============== MODERN WITH PHOTO ==============
function ModernPhotoLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <header className="p-8 text-white flex items-center justify-between gap-6" style={{ backgroundColor: p.primary }}>
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight">{p.personal.name || 'Seu Nome Completo'}</h1>
            {p.personal.jobTitle && <p className="text-xl font-light mt-1 opacity-90">{p.personal.jobTitle}</p>}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-95">
              {p.personal.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p.personal.email}</span>}
              {p.personal.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {p.personal.phone}</span>}
              {p.personal.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.personal.location}</span>}
              {p.personal.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> {p.personal.linkedin}</span>}
              {p.personal.github && <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5" /> {p.personal.github}</span>}
            </div>
          </div>
          <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="95px" borderColor="#ffffff" />
        </header>

        <div className="p-8 grid md:grid-cols-3 gap-8" style={{ gap: p.sectionSpacing }}>
          <div className="md:col-span-2 flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.personal.summary && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Sobre</h2>
                <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
              </section>
            )}
            {p.experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: p.primary }}>Experiência</h2>
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: p.primary }}>
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap break-words">{exp.role || 'Cargo'}</h3>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap break-words">{exp.company || 'Empresa'} • {exp.start || 'Início'} — {exp.current ? 'Atual' : (exp.end || 'Fim')}</p>
                      {exp.description && <p className="text-slate-700 whitespace-pre-wrap break-words mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.projects.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: p.primary }}>Projetos</h2>
                <div className="space-y-3">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-semibold text-slate-800 text-xs">{proj.name || 'Projeto'}</h3>
                      {proj.description && <p className="text-[11px] text-slate-700 leading-tight mt-0.5 whitespace-pre-wrap">{proj.description}</p>}
                      {proj.tech.length > 0 && <p className="text-[10px] text-slate-500 italic mt-0.5">{proj.tech.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.education.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Formação</h2>
                <div className="space-y-2">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-slate-800">{edu.course || 'Curso'}</h3>
                      <p className="text-xs text-slate-600">{edu.institution || 'Instituição'}</p>
                      <p className="text-[10px] text-slate-500">{edu.start} — {edu.end}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.skills.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Skills</h2>
                <ul className="flex flex-wrap gap-1.5">
                  {p.skills.map((skill) => (<li key={skill.id} className="text-xs font-medium px-2 py-1 rounded text-white" style={{ backgroundColor: p.primary }}>{skill.name}</li>))}
                </ul>
              </section>
            )}
            {p.languages.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Idiomas</h2>
                <ul className="space-y-1 text-xs">
                  {p.languages.map((lang) => (<li key={lang.id} className="text-slate-700 flex justify-between"><span>{lang.language}</span><span className="text-slate-500 capitalize">{lang.level}</span></li>))}
                </ul>
              </section>
            )}
            {p.certifications.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: p.primary }}>Certificações</h2>
                <div className="space-y-1.5 text-xs">
                  {p.certifications.map((cert) => (<div key={cert.id}><p className="font-semibold text-slate-800">{cert.name}</p><p className="text-slate-500">{cert.issuer} • {cert.date}</p></div>))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== CREATIVE WITH PHOTO ==============
function CreativePhotoLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible grid md:grid-cols-12">
        <aside className="md:col-span-4 p-8 text-white flex flex-col items-center text-center" style={{ backgroundColor: p.primary }}>
          <div className="mb-6 flex justify-center">
            <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="105px" borderColor="rgba(255,255,255,0.25)" />
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-white">{p.personal.name || 'Seu Nome'}</h1>
          {p.personal.jobTitle && <p className="text-xs font-light opacity-90 mt-2 uppercase tracking-widest text-slate-100">{p.personal.jobTitle}</p>}

          <div className="mt-8 space-y-3 text-xs w-full text-left">
            {p.personal.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 opacity-85 flex-shrink-0" /> <span className="truncate">{p.personal.email}</span></div>}
            {p.personal.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 opacity-85 flex-shrink-0" /> <span>{p.personal.phone}</span></div>}
            {p.personal.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-85 flex-shrink-0" /> <span>{p.personal.location}</span></div>}
            {p.personal.linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5 opacity-85 flex-shrink-0" /> <span className="truncate">{p.personal.linkedin}</span></div>}
            {p.personal.github && <div className="flex items-center gap-2"><Github className="w-3.5 h-3.5 opacity-85 flex-shrink-0" /> <span className="truncate">{p.personal.github}</span></div>}
          </div>

          {p.skills.length > 0 && (
            <div className="mt-10 w-full text-left">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90 border-b border-white/20 pb-1">Habilidades</h2>
              <ul className="flex flex-wrap gap-1.5 text-xs">
                {p.skills.map((skill) => (<li key={skill.id} className="bg-white/10 px-2 py-0.5 rounded text-white text-[11px]">{skill.name}</li>))}
              </ul>
            </div>
          )}

          {p.languages.length > 0 && (
            <div className="mt-8 w-full text-left">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-90 border-b border-white/20 pb-1">Idiomas</h2>
              <ul className="space-y-1.5 text-xs">
                {p.languages.map((lang) => (<li key={lang.id} className="flex justify-between text-[11px]"><span>{lang.language}</span><span className="opacity-75">{lang.level}</span></li>))}
              </ul>
            </div>
          )}
        </aside>

        <main className="md:col-span-8 p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-2" style={{ color: p.primary }}>Perfil</h2>
              <p className="whitespace-pre-wrap text-slate-700">{p.personal.summary}</p>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-4" style={{ color: p.primary }}>Trajetória</h2>
              <div className="space-y-4">
                {p.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: p.primary }}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">{exp.role}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{exp.company} • {exp.start} — {exp.current ? 'Atual' : exp.end}</p>
                    {exp.description && <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.education.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: p.primary }}>Formação</h2>
              <div className="space-y-2">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">{edu.course}</h3>
                    <p className="text-xs text-slate-500 whitespace-pre-wrap">{edu.institution} • {edu.start} — {edu.end}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.projects.length > 0 && (
            <section>
              <h2 className="text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: p.primary }}>Projetos</h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                    {proj.description && <p className="text-xs text-slate-600 mt-0.5">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
