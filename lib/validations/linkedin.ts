import { z } from 'zod';

export const createAuditSchema = z.object({
  profileText: z
    .string()
    .min(100, 'Cole o texto completo do seu perfil (mínimo 100 caracteres)')
    .max(40000, 'Texto muito longo (máximo 40.000 caracteres)'),
  profileUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  area: z.string().max(200).optional().or(z.literal('')),
  targetJob: z.string().max(5000).optional().or(z.literal('')),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
