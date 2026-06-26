import React from 'react';
import { Mail, MapPin, Phone, Linkedin, Github, Globe } from 'lucide-react';
import type { ResumeContent } from '@/lib/validations/resume';
import type { ResumeStyle } from './types';

export const FONT_MAP: Record<string, string> = {
  Inter: "'Inter', sans-serif",
  Georgia: "'Georgia', serif",
  Roboto: "'Roboto', sans-serif",
  Lato: "'Lato', sans-serif",
  Merriweather: "'Merriweather', serif",
  Courier: "'Courier New', monospace",
  Poppins: "'Poppins', sans-serif",
  Montserrat: "'Montserrat', sans-serif",
};

export const FONT_SIZE_MAP: Record<ResumeStyle['fontSize'], string> = {
  sm: '0.75rem',
  md: '0.875rem',
  lg: '1rem',
  xl: '1.125rem',
};

export const LINE_HEIGHT_MAP: Record<ResumeStyle['lineHeight'], string> = {
  tight: '1.3',
  normal: '1.5',
  relaxed: '1.75',
};

export const LETTER_SPACING_MAP: Record<ResumeStyle['letterSpacing'], string> = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.05em',
};

export const SPACING_MAP: Record<ResumeStyle['sectionSpacing'], string> = {
  compact: '1rem',
  normal: '1.5rem',
  relaxed: '2rem',
};

export function ContactItems({ personal }: { personal: ResumeContent['personal'] }) {
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

interface ResumeAvatarProps {
  photo?: string;
  name?: string;
  size?: string;
  borderColor?: string;
}

export function ResumeAvatar({ photo, name, size = '90px', borderColor }: ResumeAvatarProps) {
  if (!photo) return null;

  return (
    <div
      className="relative overflow-hidden rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: borderColor ? `2px solid ${borderColor}` : '2px solid #e2e8f0',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={name || 'Foto de perfil'}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
      />
    </div>
  );
}
