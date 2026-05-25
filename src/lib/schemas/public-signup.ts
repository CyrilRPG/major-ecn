import { z } from 'zod';

export const PublicSignupSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis').max(80),
  last_name: z.string().min(1, 'Nom requis').max(80),
  email: z.string().email('Email invalide'),
  phone: z.string().max(40).optional().or(z.literal('')),
  promotion: z.enum(['D2', 'D3', 'D4', 'PAE', 'Autre']),
  offer: z.enum(['essentiel', 'premium', 'intensif']),
  colleges_wish: z.string().max(500).optional().or(z.literal('')),
});

export type PublicSignupInput = z.infer<typeof PublicSignupSchema>;
