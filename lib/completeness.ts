import type { ResumeContent } from './validations/resume';

/**
 * Calcula a completude de um currículo (0–100) com base em quão preenchidos estão os campos.
 * Usado no dashboard e no editor para feedback visual.
 */
export function calculateCompleteness(content: ResumeContent): number {
  let score = 0;
  if (!content) return 0;
  
  const personal = content.personal || {};
  const experience = content.experience || [];
  const education = content.education || [];
  const skills = content.skills || [];
  const projects = content.projects || [];
  const languages = content.languages || [];
  const certifications = content.certifications || [];

  if (personal.name) score += 5;
  if (personal.email) score += 5;
  if (personal.jobTitle) score += 5;
  if (personal.summary && personal.summary.length >= 50) score += 10;
  if (experience.length >= 1) score += 15;
  if (education.length >= 1) score += 10;
  if (skills.length >= 5) score += 10;
  if (projects.length >= 1) score += 5;
  if (languages.length >= 1) score += 5;
  if (personal.phone) score += 5;
  if (personal.linkedin) score += 5;
  if (personal.website || personal.github) score += 5;
  if (certifications.length >= 1) score += 5;
  if (personal.summary && personal.summary.length >= 200) score += 5;
  if (experience.length >= 2) score += 5;

  return Math.min(score, 100);
}
