'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FormField } from '@/lib/schemas/satisfaction';

export async function submitSatisfactionAction(
  formId: string,
  answers: Record<string, unknown>,
  filePath: string | null,
): Promise<{ ok: true } | { error: string }> {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: form } = await supabase
    .from('satisfaction_forms')
    .select('id, fields, active')
    .eq('id', formId)
    .maybeSingle();
  if (!form || !form.active) return { error: 'Formulaire introuvable.' };

  const fields = (form.fields ?? []) as FormField[];
  for (const f of fields) {
    if (f.required) {
      const v = answers[f.key];
      if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
        return { error: `Le champ « ${f.label} » est obligatoire.` };
      }
    }
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('satisfaction_responses')
    .upsert(
      {
        form_id: formId,
        user_id: user.id,
        answers,
        file_path: filePath,
        skipped: false,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'form_id,user_id' },
    );
  if (error) return { error: error.message };

  revalidatePath('/accueil');
  return { ok: true };
}

export async function skipSatisfactionAction(formId: string): Promise<{ ok: true } | { error: string }> {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: form } = await supabase
    .from('satisfaction_forms')
    .select('id, mandatory, active')
    .eq('id', formId)
    .maybeSingle();
  if (!form || !form.active) return { error: 'Formulaire introuvable.' };
  if (form.mandatory) return { error: 'Ce formulaire est obligatoire.' };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('satisfaction_responses')
    .upsert(
      {
        form_id: formId,
        user_id: user.id,
        answers: {},
        file_path: null,
        skipped: true,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'form_id,user_id' },
    );
  if (error) return { error: error.message };

  revalidatePath('/accueil');
  return { ok: true };
}
