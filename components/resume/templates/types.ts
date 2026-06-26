import type { ResumeContent } from '@/lib/validations/resume';

export type ResumeStyle = {
  fontFamily: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | number | string;
  lineHeight: 'tight' | 'normal' | 'relaxed' | number | string;
  letterSpacing: 'tight' | 'normal' | 'wide';
  primaryColor: string;
  sectionSpacing: 'compact' | 'normal' | 'relaxed' | number | string;
};

export const DEFAULT_STYLE: ResumeStyle = {
  fontFamily: 'Inter',
  fontSize: 14,
  lineHeight: 1.5,
  letterSpacing: 'normal',
  primaryColor: '#1e40af',
  sectionSpacing: 24,
};

export type LayoutProps = {
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
