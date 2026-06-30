import React from 'react';
import { Mail, MapPin, Phone, Linkedin, Github, Globe } from 'lucide-react';
import type { LayoutProps } from './types';
import { DEFAULT_STYLE } from './types';
import { ContactItems, ResumeAvatar } from './shared';

// ============== CLASSIC ==============
export function ClassicLayout(p: LayoutProps) {
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

// ============== CLASSIC WITH PHOTO ==============
export function ClassicPhotoLayout(p: LayoutProps) {
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

// ============== EXECUTIVE ==============
export function ExecutiveLayout(p: LayoutProps) {
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

// ============== MINIMALIST ==============
export function MinimalistLayout(p: LayoutProps) {
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

// ============== MINIMAL GREY ==============
export function MinimalGreyLayout(p: LayoutProps) {
  const accent = p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : '#333333';
  const greyBar = '#e5e7eb';

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-3">
      <h2 className="text-sm font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: accent }}>{title}</h2>
      <div className="flex-1 h-3" style={{ backgroundColor: greyBar }}></div>
    </div>
  );

  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 p-8 overflow-y-auto print:overflow-visible text-slate-800">
        <div className="w-full h-8 mb-6" style={{ backgroundColor: accent }}></div>

        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tighter" style={{ color: accent }}>{p.personal.name || 'Nome Completo'}</h1>
            {p.personal.jobTitle && <p className="text-sm uppercase tracking-widest mt-1 text-slate-600 font-semibold">{p.personal.jobTitle}</p>}
          </div>
          {p.personal.photo && (
            <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="80px" borderColor={greyBar} />
          )}
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="col-span-7 flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.personal.summary && (
              <section>
                <SectionHeader title="Sobre Mim" />
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{p.personal.summary}</p>
              </section>
            )}

            {p.experience.length > 0 && (
              <section>
                <SectionHeader title="Experiência" />
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-bold text-slate-800 text-xs">
                        {exp.role} <span className="font-normal text-slate-500">— {exp.start} a {exp.current ? 'Atual' : exp.end}</span>
                      </h3>
                      <p className="font-bold text-slate-800 text-xs mb-1">{exp.company}</p>
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
                <SectionHeader title="Projetos" />
                <div className="space-y-3">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-bold text-slate-800 text-xs">{proj.name}</h3>
                      {proj.description && (
                        <ul className="text-xs text-slate-700 leading-relaxed list-disc list-inside whitespace-pre-wrap mt-0.5">
                          {proj.description.split('\n').filter(Boolean).map((line, i) => (
                            <li key={i}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="col-span-5 flex flex-col" style={{ gap: p.sectionSpacing }}>
            <section>
              <SectionHeader title="Contato" />
              <div className="space-y-2 text-xs text-slate-700">
                {p.personal.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {p.personal.phone}</div>}
                {p.personal.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {p.personal.email}</div>}
                {p.personal.location && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {p.personal.location}</div>}
                {p.personal.linkedin && <div className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" /> {p.personal.linkedin}</div>}
              </div>
            </section>

            {p.education.length > 0 && (
              <section>
                <SectionHeader title="Educação" />
                <div className="space-y-3">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <p className="text-[10px] text-slate-600 font-bold mb-0.5">{edu.course}, {edu.start} — {edu.end}</p>
                      <h3 className="font-bold text-slate-800 text-xs">{edu.institution}</h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {p.skills.length > 0 && (
              <section>
                <SectionHeader title="Habilidades" />
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {p.skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </section>
            )}

            {p.languages.length > 0 && (
              <section>
                <SectionHeader title="Idiomas" />
                <ul className="space-y-1 text-xs text-slate-700">
                  {p.languages.map((lang) => (
                    <li key={lang.id} className="flex justify-between">
                      <span className="font-bold">{lang.language}</span>
                      <span>{lang.level}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.certifications.length > 0 && (
              <section>
                <SectionHeader title="Certificações" />
                <ul className="space-y-2 text-xs text-slate-700">
                  {p.certifications.map((cert) => (
                    <li key={cert.id}>
                      <p className="font-bold text-slate-800">{cert.name}</p>
                      <p className="text-[10px] text-slate-500">{cert.issuer} ({cert.date})</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

