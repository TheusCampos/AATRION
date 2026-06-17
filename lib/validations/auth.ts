import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(80),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(120, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;
