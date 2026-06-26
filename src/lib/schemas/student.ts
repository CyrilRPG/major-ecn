import { z } from 'zod';

// Côté admin / création student : on accepte les 3 formules payantes
// (Essentielle / Intensive / Programme Approfondi). 'decouverte' est
// un signup public sans intervention admin, on l'exclut ici.
const AdminOffer = z.enum(['essentiel', 'intensif', 'approfondi']);

export const AddStudentSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  offer: AdminOffer,
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  /** Liste optionnelle de cours (matières au sein d'un collège) — utilisée
   *  pour restreindre l'accès à certaines matières au sein des Médecines
   *  Générales (voie interne / voie externe) par exemple. */
  cours: z.array(z.string()).optional(),
});

export const UpdateStudentSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional().nullable(),
  offer: AdminOffer,
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  cours: z.array(z.string()).optional(),
  can_download: z.boolean().optional(),
});

export type AddStudentInput = z.infer<typeof AddStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
