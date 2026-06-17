import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  jobTitle: z.string().max(120).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  linkedinUrl: z
    .string()
    .url('URL inválida')
    .max(300)
    .nullable()
    .or(z.literal(''))
    .optional(),
  allowPdfDownload: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
