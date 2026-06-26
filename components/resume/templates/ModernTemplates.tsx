import React from 'react';
import { Mail, MapPin, Phone, Linkedin, Github } from 'lucide-react';
import type { LayoutProps } from './types';
import { ResumeAvatar } from './shared';

// ============== MODERN ==============
export function ModernLayout(p: LayoutProps) {
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

// ============== MODERN WITH PHOTO ==============
export function ModernPhotoLayout(p: LayoutProps) {
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

// ============== TECH ==============
export function TechLayout(p: LayoutProps) {
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

