import { z } from 'zod';

export const ContactSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(120),
  email: z.string().email('Email invalide').max(160),
  phone: z.string().max(40).optional().or(z.literal('')),
  subject: z.string().min(1, 'Sujet requis').max(160),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)').max(4000),
  // Honeypot anti-spam : doit rester vide.
  company: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof ContactSchema>;
