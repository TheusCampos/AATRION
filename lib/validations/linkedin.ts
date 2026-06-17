import { z } from 'zod';

export const createAuditSchema = z.object({
  profileText: z
    .string()
    .min(100, 'Cole o texto completo do seu perfil (mínimo 100 caracteres)')
    .max(20000, 'Texto muito longo (máximo 20.000 caracteres)'),
  profileUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  area: z.string().max(80).optional().or(z.literal('')),
  targetJob: z.string().max(120).optional().or(z.literal('')),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
