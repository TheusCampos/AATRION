import { z } from 'zod';
export const analyzeResumeSchema = z.object({
  targetJob: z.string().max(200).optional(),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>;

export const adaptResumeSchema = z.object({
  jobDescription: z.string().min(20, 'Cole a descricao da vaga (minimo 20 caracteres)').max(8000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
});

export type AdaptResumeInput = z.infer<typeof adaptResumeSchema>;
