import { describe, it, expect } from 'vitest';
import {
  personalInfoSchema,
  experienceItemSchema,
  projectItemSchema,
  certificationItemSchema,
  resumeContentSchema,
  emptyResumeContent,
  type ResumeContent,
} from '../../lib/validations/resume';
import { calculateCompleteness } from '../../lib/completeness';

describe('Fase 02 - Validações de Campos Modernos e Compatibilidade ATS', () => {
  describe('personalInfoSchema com Portfolio', () => {
    it('deve validar com sucesso quando portfolio é fornecido', () => {
      const validPersonal = {
        name: 'Carlos Oliveira',
        email: 'carlos@example.com',
        phone: '11999998888',
        location: 'São Paulo, SP',
        jobTitle: 'Desenvolvedor Frontend Sênior',
        linkedin: 'linkedin.com/in/carlos',
        github: 'github.com/carlos',
        website: 'carlos.dev',
        portfolio: 'https://behance.net/carlos',
        summary: 'Especialista em interfaces e performance.',
        photo: '',
      };

      const result = personalInfoSchema.safeParse(validPersonal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.portfolio).toBe('https://behance.net/carlos');
      }
    });

    it('deve tratar portfolio undefined ou null como string vazia (retrocompatibilidade)', () => {
      const legacyPersonal = {
        name: 'Maria Souza',
        email: 'maria@example.com',
        phone: '11888887777',
        location: 'Curitiba, PR',
        jobTitle: 'Designer UX',
        linkedin: '',
        github: '',
        website: '',
        summary: 'Designer focada em usabilidade.',
        photo: '',
        // portfolio ausente propositalmente
      };

      const result = personalInfoSchema.safeParse(legacyPersonal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.portfolio).toBe('');
      }
    });
  });

  describe('experienceItemSchema e projectItemSchema com Achievements', () => {
    it('deve validar achievements em experiências como array de strings', () => {
      const exp = {
        id: 'exp-1',
        company: 'Empresa Alpha',
        role: 'Líder Técnico',
        start: '2022-01',
        end: '2024-05',
        current: false,
        description: 'Responsável pela arquitetura de microsserviços.',
        achievements: [
          'Redução de 40% no tempo de carregamento da aplicação.',
          'Economia de R$ 120k/ano em custos de infraestrutura em nuvem.',
        ],
      };

      const result = experienceItemSchema.safeParse(exp);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.achievements).toHaveLength(2);
        expect(result.data.achievements[0]).toContain('40%');
      }
    });

    it('deve converter achievements ausente ou nulo em array vazio', () => {
      const legacyExp = {
        id: 'exp-legacy',
        company: 'Empresa Antiga',
        role: 'Desenvolvedor Pleno',
        start: '2020-01',
        end: '2021-12',
        current: false,
        description: 'Desenvolvimento web.',
      };

      const result = experienceItemSchema.safeParse(legacyExp);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.achievements).toEqual([]);
      }
    });

    it('deve validar achievements em projetos', () => {
      const project = {
        id: 'proj-1',
        name: 'Gerador de Currículos',
        description: 'Plataforma SaaS para otimização de currículos.',
        achievements: ['Mais de 10.000 usuários cadastrados no primeiro mês.'],
        tech: ['Next.js', 'TypeScript', 'TailwindCSS'],
        url: 'https://cvforge.app',
      };

      const result = projectItemSchema.safeParse(project);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.achievements).toHaveLength(1);
        expect(result.data.tech).toHaveLength(3);
      }
    });
  });

  describe('certificationItemSchema com Credential ID e URL', () => {
    it('deve validar certificações com ID de credencial e link de verificação', () => {
      const cert = {
        id: 'cert-1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2024-03',
        credentialId: 'AWS-PSA-9928174',
        url: 'https://aws.amazon.com/verification',
      };

      const result = certificationItemSchema.safeParse(cert);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.credentialId).toBe('AWS-PSA-9928174');
        expect(result.data.url).toBe('https://aws.amazon.com/verification');
      }
    });

    it('deve permitir certificações legadas sem credentialId ou url', () => {
      const legacyCert = {
        id: 'cert-old',
        name: 'Scrum Master Certificado',
        issuer: 'Scrum Alliance',
        date: '2021-06',
      };

      const result = certificationItemSchema.safeParse(legacyCert);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.credentialId).toBe('');
        expect(result.data.url).toBe('');
      }
    });
  });

  describe('resumeContentSchema e Retrocompatibilidade Completa', () => {
    it('deve parsear com perfeição currículos do banco antigos (pré-Fase 02)', () => {
      const rawLegacyResume = {
        personal: {
          name: 'João Silva',
          email: 'joao@example.com',
          phone: '11999990000',
          location: 'SP',
          jobTitle: 'Analista de Sistemas',
          linkedin: 'in/joao',
          github: 'gh/joao',
          website: 'joao.com',
          summary: 'Analista focado em processos.',
          photo: '',
        },
        experience: [
          {
            id: '1',
            company: 'Tech ABC',
            role: 'Analista Jr',
            start: '2020-01',
            end: '2022-01',
            current: false,
            description: 'Atividades operacionais e de suporte.',
          },
        ],
        education: [
          {
            id: '1',
            institution: 'USP',
            course: 'Ciência da Computação',
            level: 'Graduação',
            start: '2016',
            end: '2020',
          },
        ],
        skills: [{ id: '1', name: 'Java', level: 'intermediate' }],
        projects: [
          {
            id: '1',
            name: 'API Rest',
            description: 'API desenvolvida em Spring Boot',
            tech: ['Java', 'Spring'],
            url: '',
          },
        ],
        languages: [{ id: '1', language: 'Inglês', level: 'advanced' }],
        certifications: [
          {
            id: '1',
            name: 'Oracle Certified Java SE',
            issuer: 'Oracle',
            date: '2020',
          },
        ],
      };

      const parsed = resumeContentSchema.parse(rawLegacyResume);
      // Assegura que novos campos ganham valores default amigáveis
      expect(parsed.personal.portfolio).toBe('');
      expect(parsed.experience[0].achievements).toEqual([]);
      expect(parsed.projects[0].achievements).toEqual([]);
      expect(parsed.certifications[0].credentialId).toBe('');
      expect(parsed.certifications[0].url).toBe('');
    });

    it('emptyResumeContent deve conter todas as chaves atualizadas', () => {
      const empty = emptyResumeContent();
      expect(empty.personal).toHaveProperty('portfolio');
      expect(empty.personal.portfolio).toBe('');
      expect(Array.isArray(empty.experience)).toBe(true);
      expect(Array.isArray(empty.projects)).toBe(true);
      expect(Array.isArray(empty.certifications)).toBe(true);
    });
  });

  describe('calculateCompleteness com novas métricas', () => {
    it('deve pontuar presença de portfolio quando website e github não estão preenchidos', () => {
      const baseContent: ResumeContent = emptyResumeContent();
      baseContent.personal.name = 'Ana';
      baseContent.personal.email = 'ana@test.com';
      baseContent.personal.jobTitle = 'Dev';
      baseContent.personal.portfolio = 'https://meuportfolio.com';

      const scoreWithPortfolio = calculateCompleteness(baseContent);
      baseContent.personal.portfolio = '';
      const scoreWithoutPortfolio = calculateCompleteness(baseContent);

      expect(scoreWithPortfolio).toBe(scoreWithoutPortfolio + 5);
    });
  });
});
