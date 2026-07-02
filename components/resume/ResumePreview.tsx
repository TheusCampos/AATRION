import React from 'react';
import type { ResumeContent } from '@/lib/validations/resume';
import type { PlanCode } from '@/lib/plan';

import {
  DEFAULT_STYLE,
  FONT_MAP,
  FONT_SIZE_MAP,
  LINE_HEIGHT_MAP,
  LETTER_SPACING_MAP,
  SPACING_MAP,
  ClassicLayout,
  ModernLayout,
  MinimalistLayout,
  CreativeLayout,
  ExecutiveLayout,
  TechLayout,
  ClassicPhotoLayout,
  ModernPhotoLayout,
  CreativePhotoLayout,
  BrownSidebarLayout,
  MinimalGreyLayout,
  YellowHeaderLayout,
  BlueRightSidebarLayout,
  CorporateLayout,
  ExecutiveProLayout,
} from './templates';

export type { ResumeStyle, LayoutProps } from './templates';
export { DEFAULT_STYLE };

type Props = {
  content: ResumeContent;
  templateId?: string;
  style?: import('./templates').ResumeStyle;
  fullscreen?: boolean;
  userPlan?: PlanCode;
};

export function ResumePreview({ content, templateId = 'classic', style = DEFAULT_STYLE, fullscreen = false, userPlan }: Props) {
  const { personal, experience, education, skills, projects, languages, certifications } = content;

  const fontFamily = FONT_MAP[style.fontFamily] || FONT_MAP.Inter;

  const isNumeric = (val: unknown) => typeof val === 'number' || (!isNaN(Number(val)) && val !== '');

  const fontSize = isNumeric(style.fontSize)
    ? `${style.fontSize}px`
    : (FONT_SIZE_MAP[style.fontSize as 'sm' | 'md' | 'lg' | 'xl'] || '14px');

  const lineHeight = isNumeric(style.lineHeight)
    ? String(style.lineHeight)
    : (LINE_HEIGHT_MAP[style.lineHeight as 'tight' | 'normal' | 'relaxed'] || '1.5');

  const letterSpacing = LETTER_SPACING_MAP[style.letterSpacing] || '0';

  const sectionSpacing = isNumeric(style.sectionSpacing)
    ? `${style.sectionSpacing}px`
    : (SPACING_MAP[style.sectionSpacing as 'compact' | 'normal' | 'relaxed'] || '24px');

  const primary = style.primaryColor;

  const isFree = userPlan === 'FREE';
  const overlayColor = templateId === 'tech' ? 'rgba(15, 23, 42, 0.93)' : 'rgba(255, 255, 255, 0.93)';
  const watermarkStyle: React.CSSProperties = isFree ? {
    backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url('/Logo-atrion-fundo.png')`,
    backgroundSize: '210mm 297mm',
    backgroundRepeat: 'repeat-y',
    backgroundPosition: 'center top',
  } : {};

  const containerClass = fullscreen
    ? 'w-full bg-white flex flex-col break-words'
    : 'w-full max-w-[210mm] mx-auto bg-white shadow-lg flex flex-col break-words';
  const containerStyle = fullscreen
    ? { fontFamily, fontSize, lineHeight, letterSpacing, color: '#1e293b', minHeight: '297mm', ...watermarkStyle }
    : { fontFamily, fontSize, lineHeight, letterSpacing, color: '#1e293b', minHeight: '297mm', ...watermarkStyle };

  const layoutProps = {
    containerClass,
    containerStyle,
    primary,
    sectionSpacing,
    personal,
    experience,
    education,
    skills,
    projects,
    languages,
    certifications,
  };

  if (templateId === 'modern') return <ModernLayout {...layoutProps} />;
  if (templateId === 'classic-photo') return <ClassicPhotoLayout {...layoutProps} />;
  if (templateId === 'modern-photo') return <ModernPhotoLayout {...layoutProps} />;
  if (templateId === 'creative-photo') return <CreativePhotoLayout {...layoutProps} />;
  if (templateId === 'minimalist') return <MinimalistLayout {...layoutProps} />;
  if (templateId === 'creative') return <CreativeLayout {...layoutProps} />;
  if (templateId === 'executive') return <ExecutiveLayout {...layoutProps} />;
  if (templateId === 'tech') return <TechLayout {...layoutProps} />;
  if (templateId === 'brown-sidebar') return <BrownSidebarLayout {...layoutProps} />;
  if (templateId === 'minimal-grey') return <MinimalGreyLayout {...layoutProps} />;
  if (templateId === 'yellow-header') return <YellowHeaderLayout {...layoutProps} />;
  if (templateId === 'blue-right-sidebar') return <BlueRightSidebarLayout {...layoutProps} />;
  if (templateId === 'corporate') return <CorporateLayout {...layoutProps} />;
  if (templateId === 'executive-pro') return <ExecutiveProLayout {...layoutProps} />;

  return <ClassicLayout {...layoutProps} />;
}
