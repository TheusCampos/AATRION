import { z } from 'zod';

const strField = z.preprocess((v) => (v === null || v === undefined ? '' : v), z.string());
const boolField = z.preprocess((v) => (v === null || v === undefined ? false : v), z.boolean());

export const personalInfoSchema = z.object({
  name: strField,
  email: strField,
  phone: strField,
  location: strField,
  jobTitle: strField,
  linkedin: strField,
  github: strField,
  website: strField,
  summary: strField,
  photo: strField,
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: strField,
  role: strField,
  start: strField,
  end: strField,
  current: boolField,
  description: strField,
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: strField,
  course: strField,
  level: strField,
  start: strField,
  end: strField,
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: strField,
  level: z.preprocess((v) => {
    if (v === null || v === undefined) return 'intermediate';
    if (v === 'beginner') return 'basic'; // Mapeia 'beginner' para 'basic'
    return v;
  }, z.enum(['basic', 'intermediate', 'advanced'])),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: strField,
  description: strField,
  tech: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(z.string())),
  url: strField,
});

export const languageItemSchema = z.object({
  id: z.string(),
  language: strField,
  level: z.preprocess((v) => {
    if (v === null || v === undefined) return 'intermediate';
    if (v === 'beginner') return 'basic'; // Mapeia 'beginner' para 'basic'
    if (v === 'fluent') return 'native'; // Mapeia 'fluent' para 'native'
    return v;
  }, z.enum(['basic', 'intermediate', 'advanced', 'native'])),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: strField,
  issuer: strField,
  date: strField,
});

export const resumeContentSchema = z.object({
  personal: personalInfoSchema,
  experience: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(experienceItemSchema)),
  education: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(educationItemSchema)),
  skills: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(skillItemSchema)),
  projects: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(projectItemSchema)),
  languages: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(languageItemSchema)),
  certifications: z.preprocess((v) => (v === null || v === undefined ? [] : v), z.array(certificationItemSchema)),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillItem = z.infer<typeof skillItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type LanguageItem = z.infer<typeof languageItemSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const updateResumeSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: resumeContentSchema.optional(),
  templateId: z.string().optional(),
  colorScheme: z.string().optional(),
});

export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;

export function emptyResumeContent(): ResumeContent {
  return {
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
      jobTitle: '',
      linkedin: '',
      github: '',
      website: '',
      summary: '',
      photo: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: [],
  };
}
