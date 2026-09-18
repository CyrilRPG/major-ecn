import { z } from 'zod';
import { CONTENT_TYPES } from '@/lib/schemas/professor';

/**
 * Validation des formulaires « Équipe & Permissions » (cahier des charges
 * 18/09/2026). Client-safe : partagé entre le dialogue d'administration et
 * les routes API qui l'enregistrent.
 */

const FORMULE = z.enum(['essentiel', 'intensif', 'approfondi']);

export const ModulesSchema = z.object({
  suivi: z.object({
    actif: z.boolean(),
    rediger: z.boolean(),
    gerer: z.boolean(),
    population: z.enum(['tous', 'alertes', 'affectes']),
  }),
  contenus: z.object({
    actif: z.boolean(),
    creer: z.boolean(),
    modifier: z.boolean(),
    publier: z.boolean(),
    supprimer: z.boolean(),
    types: z.array(z.enum(CONTENT_TYPES)),
  }),
  blog: z.object({
    actif: z.boolean(),
    creer: z.boolean(),
    modifier_siens: z.boolean(),
    modifier_tous: z.boolean(),
    publier: z.boolean(),
    depublier: z.boolean(),
    supprimer: z.boolean(),
  }),
});

export const PerimetreSchema = z.object({
  specialites: z.union([z.literal('toutes'), z.array(z.string().min(1))]),
  // Clé '*' = défaut, sinon un identifiant de collège.
  formules: z.record(z.string(), z.array(FORMULE)),
});

export const RoleModeleSchema = z.enum(['commercial', 'gestionnaire_video', 'redacteur_blog', 'enseignant_relecteur', 'responsable_complet']);

/** Champs communs à la création et à la modification. */
const Droits = z.object({
  fonction: z.string().trim().max(80).optional().nullable(),
  modele: RoleModeleSchema.optional().nullable(),
  modules: ModulesSchema,
  perimetre: PerimetreSchema,
  mfa_obligatoire: z.boolean().optional(),
  /** Date de fin d'accès (YYYY-MM-DD), vide = sans fin. */
  access_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  is_active: z.boolean().optional(),
});

export const CreerCollaborateurSchema = Droits.extend({
  first_name: z.string().trim().min(1, 'Prénom requis'),
  last_name: z.string().trim().min(1, 'Nom requis'),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().optional().nullable(),
});
export type CreerCollaborateurInput = z.infer<typeof CreerCollaborateurSchema>;

export const ModifierCollaborateurSchema = Droits.extend({
  userId: z.string().uuid('userId invalide'),
});
export type ModifierCollaborateurInput = z.infer<typeof ModifierCollaborateurSchema>;
