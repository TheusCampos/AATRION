import React from "react";
import { Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";
import type { LayoutProps } from "./types";
import { DEFAULT_STYLE } from "./types";
import { ResumeAvatar } from "./shared";

// ============== CREATIVE ==============
export function CreativeLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible grid md:grid-cols-12">
        <aside
          className="md:col-span-4 p-8 text-white"
          style={{ backgroundColor: p.primary }}
        >
          <h1 className="text-[2em] font-extrabold">
            {p.personal.name || "Seu Nome"}
          </h1>
          {p.personal.jobTitle && (
            <p className="text-[1em] font-light opacity-90 mt-[calc(var(--resume-section-spacing)*0.5)] uppercase tracking-widest">
              {p.personal.jobTitle}
            </p>
          )}

          <div className="mt-[calc(var(--resume-section-spacing)*2)] space-y-3 text-[0.85em]">
            {p.personal.email && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Mail className="w-3 h-3 flex-shrink-0" /> {p.personal.email}
              </div>
            )}
            {p.personal.phone && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Phone className="w-3 h-3 flex-shrink-0" /> {p.personal.phone}
              </div>
            )}
            {p.personal.location && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <MapPin className="w-3 h-3 flex-shrink-0" />{" "}
                {p.personal.location}
              </div>
            )}
            {p.personal.linkedin && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Linkedin className="w-3 h-3 flex-shrink-0" />{" "}
                {p.personal.linkedin}
              </div>
            )}
            {p.personal.github && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Github className="w-3 h-3 flex-shrink-0" /> {p.personal.github}
              </div>
            )}
          </div>

          {p.skills.length > 0 && (
            <div className="mt-10">
              <h2 className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)] opacity-90">
                Habilidades
              </h2>
              <ul className="space-y-1 text-[0.85em]">
                {p.skills.map((skill) => (
                  <li key={skill.id} className="bg-white/10 px-2 py-1 rounded">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.languages.length > 0 && (
            <div className="mt-[calc(var(--resume-section-spacing)*2)]">
              <h2 className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)] opacity-90">
                Idiomas
              </h2>
              <ul className="space-y-1 text-[0.85em]">
                {p.languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between">
                    <span>{lang.language}</span>
                    <span className="opacity-75">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main
          className="md:col-span-8 p-8 flex flex-col"
          style={{ gap: p.sectionSpacing }}
        >
          {p.personal.summary && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.5)]"
                style={{ color: p.primary }}
              >
                Perfil
              </h2>
              <p className="whitespace-pre-wrap text-slate-700">
                {p.personal.summary}
              </p>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[var(--resume-section-spacing)]"
                style={{ color: p.primary }}
              >
                Trajetória
              </h2>
              <div className="space-y-4">
                {p.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-4 border-l-2"
                    style={{ borderColor: p.primary }}
                  >
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">
                      {exp.role}
                    </h3>
                    <p className="text-[0.85em] text-slate-500 whitespace-pre-wrap">
                      {exp.company} • {exp.start} —{" "}
                      {exp.current ? "Atual" : exp.end}
                    </p>
                    {exp.description && (
                      <p className="text-[1em] text-slate-700 whitespace-pre-wrap mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.education.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                Formação
              </h2>
              <div className="space-y-2">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">
                      {edu.course}
                    </h3>
                    <p className="text-[0.85em] text-slate-500 whitespace-pre-wrap">
                      {edu.institution} • {edu.start} — {edu.end}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.projects.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                Projetos
              </h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                    {proj.description && (
                      <p className="text-[0.85em] text-slate-600 mt-0.5">
                        {proj.description}
                      </p>
                    )}
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

// ============== CREATIVE WITH PHOTO ==============
export function CreativePhotoLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible grid md:grid-cols-12">
        <aside
          className="md:col-span-4 p-8 text-white flex flex-col items-center text-center"
          style={{ backgroundColor: p.primary }}
        >
          {p.personal.photo && (
            <div className="mb-[calc(var(--resume-section-spacing)*1.5)] flex justify-center">
              <ResumeAvatar
                photo={p.personal.photo}
                name={p.personal.name}
                size="105px"
                borderColor="rgba(255,255,255,0.25)"
              />
            </div>
          )}

          <h1 className="text-[1.75em] font-extrabold text-white">
            {p.personal.name || "Seu Nome"}
          </h1>
          {p.personal.jobTitle && (
            <p className="text-[0.85em] font-light opacity-90 mt-[calc(var(--resume-section-spacing)*0.5)] uppercase tracking-widest text-slate-100">
              {p.personal.jobTitle}
            </p>
          )}

          <div className="mt-[calc(var(--resume-section-spacing)*2)] space-y-3 text-[0.85em] w-full text-left">
            {p.personal.email && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Mail className="w-3.5 h-3.5 opacity-85 flex-shrink-0" />{" "}
                <span className="truncate">{p.personal.email}</span>
              </div>
            )}
            {p.personal.phone && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Phone className="w-3.5 h-3.5 opacity-85 flex-shrink-0" />{" "}
                <span>{p.personal.phone}</span>
              </div>
            )}
            {p.personal.location && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <MapPin className="w-3.5 h-3.5 opacity-85 flex-shrink-0" />{" "}
                <span>{p.personal.location}</span>
              </div>
            )}
            {p.personal.linkedin && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Linkedin className="w-3.5 h-3.5 opacity-85 flex-shrink-0" />{" "}
                <span className="truncate">{p.personal.linkedin}</span>
              </div>
            )}
            {p.personal.github && (
              <div className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.5)]">
                <Github className="w-3.5 h-3.5 opacity-85 flex-shrink-0" />{" "}
                <span className="truncate">{p.personal.github}</span>
              </div>
            )}
          </div>

          {p.skills.length > 0 && (
            <div className="mt-10 w-full text-left">
              <h2 className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)] opacity-90 border-b border-white/20 pb-[calc(var(--resume-section-spacing)*0.25)]">
                Habilidades
              </h2>
              <ul className="flex flex-wrap gap-[calc(var(--resume-section-spacing)*0.25)] text-[0.85em]">
                {p.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="bg-white/10 px-2 py-0.5 rounded text-white text-[0.75em]"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.languages.length > 0 && (
            <div className="mt-[calc(var(--resume-section-spacing)*2)] w-full text-left">
              <h2 className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)] opacity-90 border-b border-white/20 pb-[calc(var(--resume-section-spacing)*0.25)]">
                Idiomas
              </h2>
              <ul className="space-y-1.5 text-[0.85em]">
                {p.languages.map((lang) => (
                  <li
                    key={lang.id}
                    className="flex justify-between text-[0.75em]"
                  >
                    <span>{lang.language}</span>
                    <span className="opacity-75">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main
          className="md:col-span-8 p-8 flex flex-col"
          style={{ gap: p.sectionSpacing }}
        >
          {p.personal.summary && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.5)]"
                style={{ color: p.primary }}
              >
                Perfil
              </h2>
              <p className="whitespace-pre-wrap text-slate-700">
                {p.personal.summary}
              </p>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[var(--resume-section-spacing)]"
                style={{ color: p.primary }}
              >
                Trajetória
              </h2>
              <div className="space-y-4">
                {p.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="relative pl-4 border-l-2"
                    style={{ borderColor: p.primary }}
                  >
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">
                      {exp.role}
                    </h3>
                    <p className="text-[0.85em] text-slate-500 whitespace-pre-wrap">
                      {exp.company} • {exp.start} —{" "}
                      {exp.current ? "Atual" : exp.end}
                    </p>
                    {exp.description && (
                      <p className="text-[1em] text-slate-700 whitespace-pre-wrap mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.education.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                Formação
              </h2>
              <div className="space-y-2">
                {p.education.map((edu) => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-800 whitespace-pre-wrap">
                      {edu.course}
                    </h3>
                    <p className="text-[0.85em] text-slate-500 whitespace-pre-wrap">
                      {edu.institution} • {edu.start} — {edu.end}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {p.projects.length > 0 && (
            <section>
              <h2
                className="text-[1em] font-extrabold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                Projetos
              </h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                    {proj.description && (
                      <p className="text-[0.85em] text-slate-600 mt-0.5">
                        {proj.description}
                      </p>
                    )}
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
// ============== YELLOW HEADER ==============
export function YellowHeaderLayout(p: LayoutProps) {
  const accent =
    p.primary !== DEFAULT_STYLE.primaryColor ? p.primary : "#D99A1A";
  const sidebarBg = "#F6EDD9";

  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 flex overflow-y-auto print:overflow-visible">
        {/* Left Column */}
        <aside className="w-[35%] flex flex-col">
          {/* Top Photo Area (White/Full) */}
          <div className="bg-white flex justify-center items-center overflow-hidden aspect-square w-full">
            {p.personal.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.personal.photo}
                alt={p.personal.name || "Foto"}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : null}
          </div>

          {/* Bottom Sidebar Area (Beige) */}
          <div
            className="flex-1 p-6 text-slate-800 flex flex-col"
            style={{ backgroundColor: sidebarBg, gap: p.sectionSpacing }}
          >
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]">
                Contato
              </h2>
              <div className="space-y-3 text-[0.85em] font-medium">
                {p.personal.location && (
                  <div className="flex items-center gap-[calc(var(--resume-section-spacing)*0.75)]">
                    <div className="bg-slate-800 text-white p-1.5 rounded-md">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className="truncate">{p.personal.location}</span>
                  </div>
                )}
                {p.personal.phone && (
                  <div className="flex items-center gap-[calc(var(--resume-section-spacing)*0.75)]">
                    <div className="bg-slate-800 text-white p-1.5 rounded-md">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className="truncate">{p.personal.phone}</span>
                  </div>
                )}
                {p.personal.email && (
                  <div className="flex items-center gap-[calc(var(--resume-section-spacing)*0.75)]">
                    <div className="bg-slate-800 text-white p-1.5 rounded-md">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className="truncate">{p.personal.email}</span>
                  </div>
                )}
                {p.personal.linkedin && (
                  <div className="flex items-center gap-[calc(var(--resume-section-spacing)*0.75)]">
                    <div className="bg-slate-800 text-white p-1.5 rounded-md">
                      <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                    </div>
                    <span className="truncate">{p.personal.linkedin}</span>
                  </div>
                )}
              </div>
            </section>

            {p.education.length > 0 && (
              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]">
                  Formação Acadêmica
                </h2>
                <div className="space-y-4 text-[0.85em]">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-bold text-slate-800 italic mb-[calc(var(--resume-section-spacing)*0.25)]">
                        {edu.institution}
                      </h3>
                      <p className="text-[0.7em] text-slate-600 mb-[calc(var(--resume-section-spacing)*0.25)]">
                        {edu.start} — {edu.end}
                      </p>
                      <p className="font-bold underline decoration-2 underline-offset-2">
                        {edu.course}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {p.skills.length > 0 && (
              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]">
                  Habilidades
                </h2>
                <ul className="space-y-2 text-[0.85em]">
                  {p.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-start gap-[calc(var(--resume-section-spacing)*0.5)]"
                    >
                      <span className="mt-[calc(var(--resume-section-spacing)*0.25)] font-bold text-slate-500">
                        •
                      </span>
                      <span>{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.languages.length > 0 && (
              <section>
                <h2 className="text-[13px] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]">
                  Idiomas
                </h2>
                <div className="space-y-3 text-[0.85em]">
                  {p.languages.map((lang) => (
                    <div key={lang.id}>
                      <div className="flex justify-between mb-[calc(var(--resume-section-spacing)*0.25)]">
                        <span className="font-bold">{lang.language}:</span>
                        <span>{lang.level}</span>
                      </div>
                      <div className="w-full bg-slate-300 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: accent,
                            width:
                              lang.level.toLowerCase() === "nativo"
                                ? "100%"
                                : lang.level.toLowerCase() === "fluente"
                                  ? "80%"
                                  : lang.level.toLowerCase() === "avançado"
                                    ? "60%"
                                    : "40%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* Right Column */}
        <main className="w-[65%] flex flex-col bg-white">
          {/* Header Area (Yellow) */}
          <header
            className="p-8 text-white flex flex-col justify-center"
            style={{ backgroundColor: accent, minHeight: "220px" }}
          >
            <h1 className="text-[2.5em] font-serif font-bold tracking-tight">
              {p.personal.name || "Nome Completo"}
            </h1>
            {p.personal.summary && (
              <p className="mt-[var(--resume-section-spacing)] text-[0.85em] font-medium text-white/95 whitespace-pre-wrap">
                {p.personal.summary}
              </p>
            )}
          </header>

          {/* Main Content Area */}
          <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.experience.length > 0 && (
              <section>
                <h2 className="text-[1em] font-bold uppercase tracking-widest mb-[var(--resume-section-spacing)] text-slate-700">
                  Experiência Profissional
                </h2>
                <div className="space-y-5">
                  {p.experience.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-bold text-slate-800 text-[0.85em] italic">
                        {exp.company}{" "}
                        <span className="font-normal not-italic">
                          — {exp.role}
                        </span>
                      </h3>
                      <p className="text-[0.7em] text-slate-500 mb-[calc(var(--resume-section-spacing)*0.5)] mt-0.5">
                        {exp.start} — {exp.current ? "Atual" : exp.end}
                      </p>
                      {exp.description && (
                        <ul className="text-[0.85em] text-slate-700 list-disc list-inside whitespace-pre-wrap">
                          {exp.description
                            .split("\n")
                            .filter(Boolean)
                            .map((line, i) => (
                              <li key={i}>{line.replace(/^[•\-\*]\s*/, "")}</li>
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
                <h2 className="text-[1em] font-bold uppercase tracking-widest mb-[var(--resume-section-spacing)] text-slate-700">
                  Projetos
                </h2>
                <div className="space-y-4">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-bold text-slate-800 text-[0.85em] italic">
                        {proj.name}
                      </h3>
                      {proj.description && (
                        <p className="text-[0.85em] text-slate-700 whitespace-pre-wrap mt-[calc(var(--resume-section-spacing)*0.25)]">
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
                <h2 className="text-[1em] font-bold uppercase tracking-widest mb-[var(--resume-section-spacing)] text-slate-700">
                  Certificações
                </h2>
                <ul className="space-y-2 text-[0.85em] text-slate-700">
                  {p.certifications.map((cert) => (
                    <li
                      key={cert.id}
                      className="flex items-start gap-[calc(var(--resume-section-spacing)*0.5)]"
                    >
                      <span
                        className="mt-[calc(var(--resume-section-spacing)*0.25)]"
                        style={{ color: accent }}
                      >
                        •
                      </span>
                      <span>
                        <span className="font-bold">{cert.name}</span> —{" "}
                        {cert.issuer} ({cert.date})
                      </span>
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
