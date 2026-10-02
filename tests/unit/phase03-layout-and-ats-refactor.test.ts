import { describe, it, expect } from 'vitest';
import { DEFAULT_STYLE, type ResumeStyle } from '../../components/resume/templates/types';

describe('Fase 03 - Controles de Layout e Refatoração ATS', () => {
  describe('ResumeStyle e DEFAULT_STYLE', () => {
    it('deve conter as novas propriedades de controle de layout e seções', () => {
      // Verifica se as propriedades de Phase 03 estão no DEFAULT_STYLE
      expect(DEFAULT_STYLE).toHaveProperty('paperSize');
      expect(DEFAULT_STYLE).toHaveProperty('showPhoto');
      expect(DEFAULT_STYLE).toHaveProperty('hiddenSections');
      expect(DEFAULT_STYLE).toHaveProperty('sectionOrder');

      // Verifica os valores padrão
      expect(DEFAULT_STYLE.paperSize).toBe('a4');
      expect(DEFAULT_STYLE.showPhoto).toBe(true);
      expect(Array.isArray(DEFAULT_STYLE.hiddenSections)).toBe(true);
      expect(DEFAULT_STYLE.hiddenSections).toHaveLength(0);
      
      expect(Array.isArray(DEFAULT_STYLE.sectionOrder)).toBe(true);
      expect(DEFAULT_STYLE.sectionOrder).toContain('personal');
      expect(DEFAULT_STYLE.sectionOrder).toContain('experience');
      expect(DEFAULT_STYLE.sectionOrder).toContain('education');
      expect(DEFAULT_STYLE.sectionOrder).toContain('skills');
      expect(DEFAULT_STYLE.sectionOrder).toContain('projects');
      expect(DEFAULT_STYLE.sectionOrder).toContain('languages');
      expect(DEFAULT_STYLE.sectionOrder).toContain('certifications');
    });

    it('deve aceitar os tipos corretos para as propriedades novas', () => {
      const customStyle: ResumeStyle = {
        fontFamily: 'Inter',
        fontSize: 'md',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        primaryColor: '#000',
        sectionSpacing: 'normal',
        paperSize: 'letter',
        showPhoto: false,
        hiddenSections: ['summary', 'skills'],
        sectionOrder: ['personal', 'education', 'experience']
      };

      expect(customStyle.paperSize).toBe('letter');
      expect(customStyle.showPhoto).toBe(false);
      expect(customStyle.hiddenSections).toContain('summary');
      expect(customStyle.sectionOrder?.[1]).toBe('education');
    });
  });
});
