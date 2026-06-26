import React from 'react';
import { Mail, MapPin, Phone, Linkedin } from 'lucide-react';
import type { LayoutProps } from './types';
import { DEFAULT_STYLE } from './types';
import { ResumeAvatar } from './shared';

// ============== BROWN SIDEBAR ==============
export function BrownSidebarLayout(p: LayoutProps) {
  // Use primary color for the header background, or fallback to the brown from the image
  const headerBg = p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : '#8B7A66';
  const sidebarBg = '#EFECE5';

  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 flex overflow-y-auto print:overflow-visible">
        {/* Left Sidebar */}
        <aside className="w-[32%] p-6 text-slate-800 flex flex-col gap-6" style={{ backgroundColor: sidebarBg }}>
          {p.personal.photo && (
             <div className="mb-2">
               <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="120px" borderColor={headerBg} />
             </div>
          )}

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: headerBg }}>Contato</h2>
            <div className="space-y-2 text-xs font-medium">
              {p.personal.phone && <div className="flex items-center gap-2 bg-slate-800 text-white px-2 py-1 rounded w-fit"><Phone className="w-3 h-3" /> {p.personal.phone}</div>}
              {p.personal.email && <div className="flex items-center gap-2 bg-slate-800 text-white px-2 py-1 rounded w-fit"><Mail className="w-3 h-3" /> {p.personal.email}</div>}
              {p.personal.location && <div className="flex items-center gap-2 text-slate-700 mt-2"><MapPin className="w-3 h-3" /> {p.personal.location}</div>}
              {p.personal.linkedin && <div className="flex items-center gap-2 text-slate-700"><Linkedin className="w-3 h-3" /> {p.personal.linkedin}</div>}
            </div>
          </section>

          {p.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-300 pb-1" style={{ color: headerBg }}>Formação Acadêmica</h2>
              <div className="space-y-3">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 text-xs italic">{edu.institution}</h3>
                    <p className="text-[10px] text-slate-600 mb-0.5">| {edu.start} — {edu.end}</p>
                    <p className="font-bold text-xs underline decoration-2 underline-offset-2">{edu.course}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-300 pb-1" style={{ color: headerBg }}>Habilidades</h2>
              <ul className="space-y-2 text-xs">
                {p.skills.map((skill) => (
                  <li key={skill.id} className="flex items-start gap-2">
                    <span className="mt-1" style={{ color: headerBg }}>•</span>
                    <span className="leading-tight">{skill.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-slate-300 pb-1" style={{ color: headerBg }}>Idiomas</h2>
              <ul className="space-y-1 text-xs">
                {p.languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between">
                    <span className="font-bold">{lang.language}</span>
                    <span>{lang.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Right Main Content */}
        <main className="w-[68%] flex flex-col bg-white">
          <header className="px-8 py-10 text-white" style={{ backgroundColor: headerBg }}>
            <h1 className="text-4xl font-serif font-bold tracking-tight">{p.personal.name || 'Nome Completo'}</h1>
            {p.personal.summary && (
              <p className="mt-4 text-sm leading-relaxed font-medium text-white/90 whitespace-pre-wrap">{p.personal.summary}</p>
            )}
          </header>

          <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: headerBg }}>Histórico Profissional</h2>
                <div className="space-y-5">
                  {p.experience.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-bold text-slate-800 text-sm">
                        <span className="italic">{exp.company}</span> — {exp.role}
                      </h3>
                      <p className="text-xs text-slate-600 mb-2">
                        {p.personal.location ? `${p.personal.location} | ` : ''}{exp.start} — {exp.current ? 'Atual' : exp.end}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-3 border-l" style={{ borderColor: headerBg }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {p.projects.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: headerBg }}>Projetos</h2>
                <div className="space-y-4">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-bold text-slate-800 text-sm">{proj.name}</h3>
                      {proj.description && (
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mt-1 pl-3 border-l" style={{ borderColor: headerBg }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {p.certifications.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: headerBg }}>Certificações</h2>
                <ul className="space-y-2 text-xs text-slate-700">
                  {p.certifications.map((cert) => (
                    <li key={cert.id} className="flex items-start gap-2">
                      <span className="mt-1" style={{ color: headerBg }}>•</span>
                      <span><span className="font-bold">{cert.name}</span> — {cert.issuer} ({cert.date})</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============== BLUE RIGHT SIDEBAR ==============
export function BlueRightSidebarLayout(p: LayoutProps) {
  const sidebarBg = p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : '#0f172a'; // Dark slate blue
  
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 flex overflow-y-auto print:overflow-visible">
        
        {/* Left Main Content (White) */}
        <main className="w-[65%] p-8 flex flex-col bg-white">
          <header className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
            {p.personal.photo && (
              <ResumeAvatar photo={p.personal.photo} name={p.personal.name} size="70px" />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{p.personal.name || 'Nome Completo'}</h1>
              {p.personal.jobTitle && <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">{p.personal.jobTitle}</p>}
            </div>
          </header>

          <div className="flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.personal.summary && (
              <section>
                <h2 className="text-sm font-bold text-slate-900 mb-2">Resumo Profissional</h2>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{p.personal.summary}</p>
              </section>
            )}

            {p.experience.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Experiência Profissional</h2>
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-bold text-slate-800 text-xs">
                        {exp.role}{exp.company ? `, ${exp.company}` : ''}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 mt-0.5">
                        {exp.start} — {exp.current ? 'ATUAL' : exp.end}
                      </p>
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

            {p.education.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Formação</h2>
                <div className="space-y-3">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-bold text-slate-800 text-xs">
                        {edu.course}{edu.institution ? `, ${edu.institution}` : ''}
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        {edu.start} — {edu.end}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {p.projects.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Projetos</h2>
                <div className="space-y-4">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-bold text-slate-800 text-xs">{proj.name}</h3>
                      {proj.description && (
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap mt-1">
                          {proj.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Right Sidebar Area (Dark Blue) */}
        <aside className="w-[35%] p-8 text-white flex flex-col" style={{ backgroundColor: sidebarBg, gap: p.sectionSpacing }}>
          
          <section>
            <h2 className="text-xs font-semibold mb-4 text-white/90">Dados Pessoais</h2>
            <div className="space-y-2 text-[11px] font-light text-white/80">
              {p.personal.location && <div>{p.personal.location}</div>}
              {p.personal.phone && <div>{p.personal.phone}</div>}
              {p.personal.email && <div className="break-words">{p.personal.email}</div>}
              {p.personal.linkedin && <div className="break-words">{p.personal.linkedin}</div>}
            </div>
          </section>

          {p.skills.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold mb-4 text-white/90">Competências</h2>
              <div className="space-y-3">
                {p.skills.map((skill, index) => {
                  // Simulate different levels just for visuals, since we only have names
                  const levels = ['w-full', 'w-[85%]', 'w-[90%]', 'w-[75%]', 'w-[80%]'];
                  const levelClass = levels[index % levels.length];
                  
                  return (
                    <div key={skill.id} className="text-[11px] text-white/90">
                      <div className="mb-1">{skill.name}</div>
                      <div className="w-full bg-white/20 h-0.5 rounded-full">
                        <div className={`bg-white h-full rounded-full ${levelClass}`}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {p.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold mb-4 text-white/90">Idiomas</h2>
              <ul className="space-y-2 text-[11px] text-white/80">
                {p.languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between">
                    <span>{lang.language}</span>
                    <span className="font-semibold text-white/90">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold mb-4 text-white/90">Certificações</h2>
              <ul className="space-y-3 text-[11px] text-white/80">
                {p.certifications.map((cert) => (
                  <li key={cert.id}>
                    <p className="font-semibold text-white/90">{cert.name}</p>
                    <p className="mt-0.5">{cert.issuer}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </aside>

      </div>
    </div>
  );
}
