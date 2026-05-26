import { z } from 'zod';

export const FIELD_TYPES = ['text', 'textarea', 'select', 'rating'] as const;
export type FieldType = typeof FIELD_TYPES[number];

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  select: 'Choix multiples',
  rating: 'Note (1 à 5)',
};

export const FormFieldSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(240),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1).max(120)).optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const CreateFormSchema = z.object({
  title: z.string().min(1, 'Titre requis').max(160),
  intro_text: z.string().max(2000).optional(),
  mandatory: z.boolean().default(false),
  active: z.boolean().default(true),
  target_promo: z.string().optional(),
  target_offer: z.string().optional(),
  target_college: z.string().optional(),
  fields: z.array(FormFieldSchema).min(1, 'Au moins un champ requis'),
  allow_file_upload: z.boolean().default(false),
  file_upload_label: z.string().max(240).optional(),
});
export type CreateFormInput = z.infer<typeof CreateFormSchema>;

export type SatisfactionForm = {
  id: string;
  title: string;
  intro_text: string | null;
  mandatory: boolean;
  active: boolean;
  target_promo: string | null;
  target_offer: string | null;
  target_college: string | null;
  fields: FormField[];
  allow_file_upload: boolean;
  file_upload_label: string | null;
  created_by: string | null;
  created_at: string;
};

/** Détermine si un profil donné est ciblé par un formulaire (côté serveur). */
export function isUserTargeted(
  form: Pick<SatisfactionForm, 'target_promo' | 'target_offer' | 'target_college'>,
  profile: {
    promotion: string | null;
    permission_scope: unknown;
  },
): boolean {
  if (form.target_promo && profile.promotion !== form.target_promo) return false;

  const scope = (profile.permission_scope ?? {}) as {
    offer?: string;
    type?: 'all' | 'college';
    colleges?: string[];
  };

  if (form.target_offer && scope.offer !== form.target_offer) return false;

  if (form.target_college === 'all-access') {
    if (scope.type !== 'all') return false;
  } else if (form.target_college) {
    if (scope.type === 'college' && !(scope.colleges ?? []).includes(form.target_college)) return false;
  }
  return true;
}
