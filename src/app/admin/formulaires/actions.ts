'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { CreateFormSchema, type CreateFormInput } from '@/lib/schemas/satisfaction';

export async function createSatisfactionFormAction(
  input: CreateFormInput,
): Promise<{ ok: true; id: string } | { error: string }> {
  await requireAdmin();
  const parsed = CreateFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('satisfaction_forms')
    .insert({
      title: parsed.data.title.trim(),
      intro_text: parsed.data.intro_text?.trim() || null,
      mandatory: parsed.data.mandatory,
      active: parsed.data.active,
      target_promo: parsed.data.target_promo || null,
      target_offer: parsed.data.target_offer || null,
      target_college: parsed.data.target_college || null,
      fields: parsed.data.fields,
      allow_file_upload: parsed.data.allow_file_upload,
      file_upload_label: parsed.data.allow_file_upload ? parsed.data.file_upload_label?.trim() || 'Fichier à joindre' : null,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Échec de la création.' };

  revalidatePath('/admin/formulaires');
  return { ok: true, id: data.id };
}

export async function toggleFormActiveAction(id: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('satisfaction_forms').update({ active }).eq('id', id);
  revalidatePath('/admin/formulaires');
}

export async function deleteFormAction(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('satisfaction_forms').delete().eq('id', id);
  revalidatePath('/admin/formulaires');
}
