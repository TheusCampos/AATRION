import React from "react";
import { Mail, MapPin, Phone, Linkedin, Github } from "lucide-react";
import type { LayoutProps } from "./types";
import {  ResumeAvatar , LANGUAGE_LEVEL_MAP } from "./shared";

// ============== MODERN ==============
export function ModernLayout(p: LayoutProps) {
  return (
    <div className={p.containerClass} style={p.containerStyle}>
      <div className="flex-1 overflow-y-auto print:overflow-visible">
        <header
          className="p-8 text-white"
          style={{ backgroundColor: p.primary }}
        >
          <h1 className="text-[2.5em] font-extrabold tracking-tight">
            {p.personal.name || "Seu Nome Completo"}
          </h1>
          {p.personal.jobTitle && (
            <p className="text-[1.5em] font-light mt-[calc(var(--resume-section-spacing)*0.25)] opacity-90">
              {p.personal.jobTitle}
            </p>
          )}
          <div className="mt-[var(--resume-section-spacing)] flex flex-wrap gap-x-4 gap-y-2 text-[1em] opacity-95">
            {p.personal.email && (
              <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                <Mail className="w-3 h-3 flex-shrink-0" /> {p.personal.email}
              </span>
            )}
            {p.personal.phone && (
              <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                <Phone className="w-3 h-3 flex-shrink-0" /> {p.personal.phone}
              </span>
            )}
            {p.personal.location && (
              <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                <MapPin className="w-3 h-3 flex-shrink-0" />{" "}
                {p.personal.location}
              </span>
            )}
            {p.personal.linkedin && (
              <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                <Linkedin className="w-3 h-3 flex-shrink-0" />{" "}
                {p.personal.linkedin}
              </span>
            )}
            {p.personal.github && (
              <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                <Github className="w-3 h-3 flex-shrink-0" /> {p.personal.github}
              </span>
            )}
          </div>
        </header>

        <div
          className="p-8 grid md:grid-cols-3 gap-[calc(var(--resume-section-spacing)*2)]"
          style={{ gap: p.sectionSpacing }}
        >
          <div
            className="md:col-span-2 flex flex-col"
            style={{ gap: p.sectionSpacing }}
          >
            {p.personal.summary && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Sobre
                </h2>
                <p className="whitespace-pre-wrap text-slate-700">
                  {p.personal.summary}
                </p>
              </section>
            )}
            {p.experience.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.75)]"
                  style={{ color: p.primary }}
                >
                  Experiência
                </h2>
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 pl-4"
                      style={{ borderColor: p.primary }}
                    >
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap break-words">
                        {exp.role || "Cargo"}
                      </h3>
                      <p className="text-[0.85em] text-slate-600 whitespace-pre-wrap break-words">
                        {exp.company || "Empresa"} • {exp.start || "Início"} —{" "}
                        {exp.current ? "Atual" : exp.end || "Fim"}
                      </p>
                      {exp.description && (
                        <p className="text-slate-700 whitespace-pre-wrap break-words mt-[calc(var(--resume-section-spacing)*0.25)]">
                          {exp.description}
                        </p>
                      )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.85em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
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
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.75)]"
                  style={{ color: p.primary }}
                >
                  Projetos
                </h2>
                <div className="space-y-3">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-semibold text-slate-800 text-[0.85em]">
                        {proj.name || "Projeto"}
                      </h3>
                      {proj.description && (
                        <p className="text-[0.75em] text-slate-700 mt-0.5 whitespace-pre-wrap">
                          {proj.description}
                        </p>
                      )}
                    {proj.achievements && proj.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.75em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {proj.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    )}
                      {proj.tech.length > 0 && (
                        <p className="text-[0.7em] text-slate-500 italic mt-0.5">
                          {proj.tech.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.education.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Formação
                </h2>
                <div className="space-y-2">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-slate-800">
                        {edu.course || "Curso"}
                      </h3>
                      <p className="text-[0.85em] text-slate-600">
                        {edu.institution || "Instituição"}
                      </p>
                      <p className="text-[0.7em] text-slate-500">
                        {edu.start} — {edu.end}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.skills.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Skills
                </h2>
                <ul className="flex flex-wrap gap-[calc(var(--resume-section-spacing)*0.25)]">
                  {p.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="text-[0.85em] font-medium px-2 py-1 rounded text-white"
                      style={{ backgroundColor: p.primary }}
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.languages.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Idiomas
                </h2>
                <ul className="space-y-1 text-[0.85em]">
                  {p.languages.map((lang) => (
                    <li
                      key={lang.id}
                      className="text-slate-700 flex justify-between"
                    >
                      <span>{lang.language}</span>
                      <span className="text-slate-500 capitalize">
                        {LANGUAGE_LEVEL_MAP[lang.level] || lang.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.certifications.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Certificações
                </h2>
                <div className="space-y-1.5 text-[0.85em]">
                  {p.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold text-slate-800">
                        {cert.name}
                      </p>
                      <p className="text-slate-500">
                        {cert.issuer} • {cert.date}
                      </p>
                    </div>
                  ))}
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
        <header
          className="p-8 text-white flex items-center justify-between gap-[calc(var(--resume-section-spacing)*1.5)]"
          style={{ backgroundColor: p.primary }}
        >
          <div className="flex-1">
            <h1 className="text-[2.5em] font-extrabold tracking-tight">
              {p.personal.name || "Seu Nome Completo"}
            </h1>
            {p.personal.jobTitle && (
              <p className="text-[1.5em] font-light mt-[calc(var(--resume-section-spacing)*0.25)] opacity-90">
                {p.personal.jobTitle}
              </p>
            )}
            <div className="mt-[var(--resume-section-spacing)] flex flex-wrap gap-x-4 gap-y-2 text-[1em] opacity-95">
              {p.personal.email && (
                <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {p.personal.email}
                </span>
              )}
              {p.personal.phone && (
                <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {p.personal.phone}
                </span>
              )}
              {p.personal.location && (
                <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {p.personal.location}
                </span>
              )}
              {p.personal.linkedin && (
                <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                  <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {p.personal.linkedin}
                </span>
              )}
              {p.personal.github && (
                <span className="flex items-center leading-none gap-[calc(var(--resume-section-spacing)*0.25)]">
                  <Github className="w-3.5 h-3.5 flex-shrink-0" />{" "}
                  {p.personal.github}
                </span>
              )}
            </div>
          </div>
          <ResumeAvatar
            photo={p.personal.photo}
            name={p.personal.name}
            size="95px"
            borderColor="#ffffff"
          />
        </header>

        <div
          className="p-8 grid md:grid-cols-3 gap-[calc(var(--resume-section-spacing)*2)]"
          style={{ gap: p.sectionSpacing }}
        >
          <div
            className="md:col-span-2 flex flex-col"
            style={{ gap: p.sectionSpacing }}
          >
            {p.personal.summary && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Sobre
                </h2>
                <p className="whitespace-pre-wrap text-slate-700">
                  {p.personal.summary}
                </p>
              </section>
            )}
            {p.experience.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.75)]"
                  style={{ color: p.primary }}
                >
                  Experiência
                </h2>
                <div className="space-y-4">
                  {p.experience.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 pl-4"
                      style={{ borderColor: p.primary }}
                    >
                      <h3 className="font-semibold text-slate-800 whitespace-pre-wrap break-words">
                        {exp.role || "Cargo"}
                      </h3>
                      <p className="text-[0.85em] text-slate-600 whitespace-pre-wrap break-words">
                        {exp.company || "Empresa"} • {exp.start || "Início"} —{" "}
                        {exp.current ? "Atual" : exp.end || "Fim"}
                      </p>
                      {exp.description && (
                        <p className="text-slate-700 whitespace-pre-wrap break-words mt-[calc(var(--resume-section-spacing)*0.25)]">
                          {exp.description}
                        </p>
                      )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.85em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
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
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.75)]"
                  style={{ color: p.primary }}
                >
                  Projetos
                </h2>
                <div className="space-y-3">
                  {p.projects.map((proj) => (
                    <div key={proj.id}>
                      <h3 className="font-semibold text-slate-800 text-[0.85em]">
                        {proj.name || "Projeto"}
                      </h3>
                      {proj.description && (
                        <p className="text-[0.75em] text-slate-700 mt-0.5 whitespace-pre-wrap">
                          {proj.description}
                        </p>
                      )}
                    {proj.achievements && proj.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.75em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {proj.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    )}
                      {proj.tech.length > 0 && (
                        <p className="text-[0.7em] text-slate-500 italic mt-0.5">
                          {proj.tech.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col" style={{ gap: p.sectionSpacing }}>
            {p.education.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Formação
                </h2>
                <div className="space-y-2">
                  {p.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-semibold text-slate-800">
                        {edu.course || "Curso"}
                      </h3>
                      <p className="text-[0.85em] text-slate-600">
                        {edu.institution || "Instituição"}
                      </p>
                      <p className="text-[0.7em] text-slate-500">
                        {edu.start} — {edu.end}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {p.skills.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Skills
                </h2>
                <ul className="flex flex-wrap gap-[calc(var(--resume-section-spacing)*0.25)]">
                  {p.skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="text-[0.85em] font-medium px-2 py-1 rounded text-white"
                      style={{ backgroundColor: p.primary }}
                    >
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.languages.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Idiomas
                </h2>
                <ul className="space-y-1 text-[0.85em]">
                  {p.languages.map((lang) => (
                    <li
                      key={lang.id}
                      className="text-slate-700 flex justify-between"
                    >
                      <span>{lang.language}</span>
                      <span className="text-slate-500 capitalize">
                        {LANGUAGE_LEVEL_MAP[lang.level] || lang.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {p.certifications.length > 0 && (
              <section>
                <h2
                  className="text-[1em] font-bold uppercase tracking-wider mb-[calc(var(--resume-section-spacing)*0.5)]"
                  style={{ color: p.primary }}
                >
                  Certificações
                </h2>
                <div className="space-y-1.5 text-[0.85em]">
                  {p.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold text-slate-800">
                        {cert.name}
                      </p>
                      <p className="text-slate-500">
                        {cert.issuer} • {cert.date}
                      </p>
                    </div>
                  ))}
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
    <div
      className={p.containerClass}
      style={{
        ...p.containerStyle,
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <div
        className="flex-1 overflow-y-auto print:overflow-visible"
        style={{ fontFamily: "'Courier New', monospace" }}
      >
        <header className="p-8 border-b" style={{ borderColor: p.primary }}>
          <div className="flex items-center gap-[calc(var(--resume-section-spacing)*0.5)] text-[0.85em] mb-[calc(var(--resume-section-spacing)*0.5)] opacity-70">
            <span style={{ color: p.primary }}>$</span>
            <span>cat profile.json</span>
          </div>
          <h1
            className="text-[2em] font-bold tracking-tight"
            style={{ color: p.primary }}
          >
            {p.personal.name || "seu_nome"}
          </h1>
          {p.personal.jobTitle && (
            <p className="text-[1em] opacity-80 mt-[calc(var(--resume-section-spacing)*0.25)]">
              {`//`} {p.personal.jobTitle}
            </p>
          )}
          <div className="mt-[calc(var(--resume-section-spacing)*0.75)] flex flex-wrap gap-x-3 gap-y-1 text-[0.85em]">
            {p.personal.email && (
              <span style={{ color: p.primary }}>email:</span>
            )}
            {p.personal.email && <span>{p.personal.email}</span>}
            {p.personal.phone && <span style={{ color: p.primary }}>tel:</span>}
            {p.personal.phone && <span>{p.personal.phone}</span>}
            {p.personal.github && (
              <span style={{ color: p.primary }}>github:</span>
            )}
            {p.personal.github && <span>{p.personal.github}</span>}
            {p.personal.linkedin && (
              <span style={{ color: p.primary }}>linkedin:</span>
            )}
            {p.personal.linkedin && <span>{p.personal.linkedin}</span>}
          </div>
        </header>

        <div className="p-8 flex flex-col" style={{ gap: p.sectionSpacing }}>
          {p.personal.summary && (
            <section>
              <h2
                className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.5)]"
                style={{ color: p.primary }}
              >
                {">"} resumo
              </h2>
              <p className="whitespace-pre-wrap text-[1em] opacity-90">
                {p.personal.summary}
              </p>
            </section>
          )}
          {p.skills.length > 0 && (
            <section>
              <h2
                className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                {">"} stack
              </h2>
              <div className="flex flex-wrap gap-[calc(var(--resume-section-spacing)*0.25)]">
                {p.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[0.85em] px-2 py-1 rounded border"
                    style={{ borderColor: p.primary, color: p.primary }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}
          {p.experience.length > 0 && (
            <section>
              <h2
                className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                {">"} experience.log
              </h2>
              <div className="space-y-3">
                {p.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="border-l-2 pl-4"
                    style={{ borderColor: p.primary }}
                  >
                    <p className="text-[0.85em] opacity-60">
                      [{exp.start} → {exp.current ? "atual" : exp.end}]
                    </p>
                    <h3
                      className="font-bold text-[1em] whitespace-pre-wrap"
                      style={{ color: p.primary }}
                    >
                      {exp.role}{" "}
                      <span className="opacity-70 font-normal whitespace-pre-wrap">
                        @ {exp.company}
                      </span>
                    </h3>
                    {exp.description && (
                      <p className="text-[0.85em] opacity-90 whitespace-pre-wrap mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.description}
                      </p>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.85em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {exp.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
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
              <h2
                className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                {">"} projects/
              </h2>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id}>
                    <h3
                      className="font-bold text-[1em]"
                      style={{ color: p.primary }}
                    >
                      ./{proj.name}
                    </h3>
                    {proj.description && (
                      <p className="text-[0.85em] opacity-90 mt-0.5 whitespace-pre-wrap">
                        {proj.description}
                      </p>
                    )}
                    {proj.achievements && proj.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-[0.75em] text-slate-700 mt-[calc(var(--resume-section-spacing)*0.25)]">
                        {proj.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    )}
                    {proj.tech.length > 0 && (
                      <p className="text-[0.7em] opacity-60 mt-0.5">
                        $ deps: {proj.tech.join(" ")}
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
                className="text-[0.85em] font-bold uppercase tracking-widest mb-[calc(var(--resume-section-spacing)*0.75)]"
                style={{ color: p.primary }}
              >
                {">"} education
              </h2>
              <div className="space-y-1.5 text-[1em]">
                {p.education.map((edu) => (
                  <p key={edu.id}>
                    <span style={{ color: p.primary }}>▸</span> {edu.course} —{" "}
                    {edu.institution} ({edu.start}–{edu.end})
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
