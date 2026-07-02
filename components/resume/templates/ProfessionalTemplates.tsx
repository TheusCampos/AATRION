import React from 'react';
import { Mail, MapPin, Phone, Linkedin, Globe, Github } from 'lucide-react';
import type { LayoutProps } from './types';
import { DEFAULT_STYLE } from './types';
import { ResumeAvatar } from './shared';

// ============== CORPORATE ==============
export function CorporateLayout(p: LayoutProps) {
  const primary = p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : '#2563EB';

  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <header className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: primary }}>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-1">{p.personal.name || 'Nome Completo'}</h1>
              {p.personal.jobTitle && <p className="text-lg font-medium opacity-90">{p.personal.jobTitle}</p>}
            </div>
            {p.personal.photo && (
              <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="85px" shape="square" borderColor="rgba(255,255,255,0.3)" />
            )}
          </div>
          <div className="relative z-10 mt-6 flex flex-wrap gap-4 text-xs font-medium opacity-95">
            {p.personal.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {p.personal.phone}</span>}
            {p.personal.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {p.personal.email}</span>}
            {p.personal.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {p.personal.location}</span>}
            {p.personal.linkedin && <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" /> {p.personal.linkedin}</span>}
          </div>
        </header>

        <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ color: primary, borderColor: primary }}>Resumo Profissional</h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{p.personal.summary}</p>
            </section>
          )}

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
              {p.experience.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Experiência Profissional</h2>
                  <div className="space-y-5">
                    {p.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-slate-800 text-sm">{exp.role}</h3>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{exp.start} — {exp.current ? 'Atual' : exp.end}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 mb-2">{exp.company}</p>
                        {exp.description && (
                          <ul className="text-xs text-slate-700 leading-relaxed list-disc list-inside whitespace-pre-wrap">
                            {exp.description.split('\n').filter(Boolean).map((line, i) => (
                              <li key={i}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {p.projects.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Projetos</h2>
                  <div className="space-y-4">
                    {p.projects.map((proj) => (
                      <div key={proj.id}>
                        <h3 className="font-bold text-slate-800 text-xs mb-1">{proj.name}</h3>
                        {proj.description && <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{proj.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="col-span-4 flex flex-col" style={{ gap: p.sectionSpacing }}>
              {p.skills.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Competências</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills.map((skill) => (
                      <span key={skill.id} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-sm border border-slate-200">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {p.education.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Formação Acadêmica</h2>
                  <div className="space-y-3">
                    {p.education.map((edu) => (
                      <div key={edu.id}>
                        <h3 className="font-bold text-slate-800 text-xs leading-tight mb-0.5">{edu.course}</h3>
                        <p className="text-[11px] text-slate-600 mb-0.5">{edu.institution}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{edu.start} — {edu.end}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {p.languages.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Idiomas</h2>
                  <ul className="space-y-2 text-xs">
                    {p.languages.map((lang) => (
                      <li key={lang.id} className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                        <span className="font-bold text-slate-700">{lang.language}</span>
                        <span className="text-slate-500">{lang.level}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {p.certifications.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-widest border-b-2 pb-1 mb-4" style={{ color: primary, borderColor: primary }}>Certificações</h2>
                  <ul className="space-y-3 text-xs">
                    {p.certifications.map((cert) => (
                      <li key={cert.id}>
                        <p className="font-bold text-slate-800 leading-tight">{cert.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cert.issuer} ({cert.date})</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== EXECUTIVE PRO ==============
export function ExecutiveProLayout(p: LayoutProps) {
  const accent = p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : '#0f172a';

  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 p-10 overflow-y-auto print:overflow-visible flex flex-col" style={{ gap: p.sectionSpacing }}>
        <header className="flex items-start gap-6 border-b-4 pb-6" style={{ borderColor: accent }}>
          {p.personal.photo && (
            <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="100px" shape="square" />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900">{p.personal.name || 'Nome Completo'}</h1>
            {p.personal.jobTitle && <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: accent }}>{p.personal.jobTitle}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-600">
              {p.personal.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" style={{ color: accent }} /> {p.personal.phone}</span>}
              {p.personal.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" style={{ color: accent }} /> {p.personal.email}</span>}
              {p.personal.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" style={{ color: accent }} /> {p.personal.location}</span>}
              {p.personal.linkedin && <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5" style={{ color: accent }} /> {p.personal.linkedin}</span>}
            </div>
          </div>
        </header>

        {p.personal.summary && (
          <section>
            <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{p.personal.summary}</p>
          </section>
        )}

        {p.experience.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap">Experiência Profissional</h2>
              <div className="flex-1 h-px bg-slate-300"></div>
            </div>
            <div className="space-y-6">
              {p.experience.map((exp) => (
                <div key={exp.id} className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 text-right pt-0.5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{exp.start} — {exp.current ? 'Atual' : exp.end}</p>
                  </div>
                  <div className="col-span-9 pl-4 border-l-2" style={{ borderColor: accent }}>
                    <h3 className="font-bold text-slate-900 text-sm">{exp.role}</h3>
                    <p className="text-xs font-bold mb-2" style={{ color: accent }}>{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-10">
          {p.education.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap">Formação</h2>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>
              <div className="space-y-4">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-900 text-xs mb-0.5">{edu.course}</h3>
                    <p className="text-xs font-medium text-slate-600 mb-0.5">{edu.institution}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{edu.start} — {edu.end}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.projects.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 whitespace-nowrap">Projetos</h2>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>
              <div className="space-y-4">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-900 text-xs mb-1">{proj.name}</h3>
                    {proj.description && <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {p.skills.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 text-center">Habilidades</h2>
              <ul className="flex flex-col gap-1.5 items-center text-xs font-medium text-slate-700 text-center">
                {p.skills.map((skill) => (
                  <li key={skill.id}>{skill.name}</li>
                ))}
              </ul>
            </section>
          )}
          {p.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 text-center">Idiomas</h2>
              <ul className="flex flex-col gap-1.5 items-center text-xs font-medium text-slate-700 text-center">
                {p.languages.map((lang) => (
                  <li key={lang.id}>{lang.language} - <span className="text-slate-500">{lang.level}</span></li>
                ))}
              </ul>
            </section>
          )}
          {p.certifications.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-4 text-center">Certificações</h2>
              <ul className="flex flex-col gap-2.5 items-center text-xs font-medium text-slate-700 text-center">
                {p.certifications.map((cert) => (
                  <li key={cert.id}>
                    <span className="font-bold">{cert.name}</span><br />
                    <span className="text-[10px] text-slate-500">{cert.issuer}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
