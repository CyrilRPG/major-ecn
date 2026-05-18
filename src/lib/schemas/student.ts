import { z } from 'zod';

export const AddStudentSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  promotion: z.enum(['Terminale', 'PASS', 'LAS1', 'LAS2', 'Redoublant']),
  permission_type: z.enum(['all', 'faculty']),
  faculties: z.array(z.string()).optional(),
});

export const UpdateStudentSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional().nullable(),
  promotion: z.enum(['Terminale', 'PASS', 'LAS1', 'LAS2', 'Redoublant']),
  permission_type: z.enum(['all', 'faculty']),
  faculties: z.array(z.string()).optional(),
});

export type AddStudentInput = z.infer<typeof AddStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
