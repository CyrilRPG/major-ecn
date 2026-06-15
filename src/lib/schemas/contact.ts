import { z } from 'zod';

/** Pièce jointe transmise par le formulaire : nom + contenu encodé base64. */
export const ContactAttachmentSchema = z.object({
  filename: z.string().min(1).max(200),
  content: z.string().min(1).max(7_000_000), // base64 (~5 Mo de fichier brut)
});

export const ContactSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(120),
  email: z.string().email('Email invalide').max(160),
  // Téléphone désormais obligatoire (demande métier).
  phone: z.string().min(1, 'Téléphone requis').max(40),
  subject: z.string().min(1, 'Sujet requis').max(160),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)').max(4000),
  attachments: z.array(ContactAttachmentSchema).max(8).optional(),
  // Honeypot anti-spam : doit rester vide.
  company: z.string().max(0).optional().or(z.literal('')),
});

export type ContactInput = z.infer<typeof ContactSchema>;
