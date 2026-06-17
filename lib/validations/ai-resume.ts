import { z } from 'zod';

/**
 * Schemas para os endpoints de IA do curriculo:
 *   - POST /api/resumes/[id]/analyze  -> analisa e da nota + melhorias
 *   - POST /api/resumes/[id]/adapt    -> adapta o curriculo para uma vaga
 */

export const analyzeResumeSchema = z.object({
  // sem body obrigatorio, mas mantemos extensivel
  targetJob: z.string().max(200).optional(),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;

export const adaptResumeSchema = z.object({
  jobDescription: z.string().min(20, 'Cole a descricao da vaga (minimo 20 caracteres)').max(8000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
});

export type AdaptResumeInput = z.infer<typeof adaptResumeSchema>;
