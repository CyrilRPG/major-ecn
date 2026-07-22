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
  /** Multi-formules : union des droits. Si absent, on retombe sur `offer`. */
  offers: z.array(AdminOffer).min(1).optional(),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  /** Liste optionnelle de cours (matières au sein d'un collège) — utilisée
   *  pour restreindre l'accès à certaines matières au sein des Médecines
   *  Générales (voie interne / voie externe) par exemple. */
  cours: z.array(z.string()).optional(),
  /** Voie de concours pour la Médecine générale : détermine l'accès aux séries
   *  QCM/QROC via la RLS (comme après paiement Stripe). */
  voie: z.enum(['interne', 'externe']).optional().nullable(),
});

export const UpdateStudentSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  phone: z.string().optional().nullable(),
  offer: AdminOffer,
  /** Multi-formules (édition) : union des droits. Si absent, on retombe sur `offer`. */
  offers: z.array(AdminOffer).min(1).optional(),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  cours: z.array(z.string()).optional(),
  can_download: z.boolean().optional(),
  /** Spécialités (collèges) où l'impression des fiches est autorisée. Ignoré si
   *  `can_download` est vrai — celui-ci accorde le droit sur toutes. */
  download_colleges: z.array(z.string()).optional(),
  voie: z.enum(['interne', 'externe']).optional().nullable(),
  /** Session EVC de rattachement (fin d'accès par défaut). null = aucune session. */
  evc_session_id: z.string().optional().nullable(),
  /** Fin d'accès individuelle (ISO) — prime sur la date de la session. null = hérite. */
  access_end: z.string().datetime({ offset: true }).optional().nullable(),
});

export type AddStudentInput = z.infer<typeof AddStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
