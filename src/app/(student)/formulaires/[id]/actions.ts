'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { satisfactionSubmittedEmail } from '@/lib/email/templates';
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
    .select('id, title, fields, active')
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

  // Notification admin (best-effort)
  notifyAdminsOfSubmission({ formId, formTitle: form.title, userId: user.id }).catch(() => null);

  revalidatePath('/accueil');
  return { ok: true };
}

async function notifyAdminsOfSubmission(args: { formId: string; formTitle: string; userId: string }) {
  const admin = createAdminClient();
  const [{ data: student }, { data: admins }] = await Promise.all([
    admin.from('profiles').select('first_name, last_name, email').eq('id', args.userId).maybeSingle(),
    admin.from('profiles').select('email').eq('role', 'admin'),
  ]);
  if (!admins?.length) return;
  const studentName = `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim() || 'Étudiant';
  const responsesUrl = `${siteUrl()}/admin/formulaires/${args.formId}`;
  const { subject, html, text } = satisfactionSubmittedEmail({
    formTitle: args.formTitle,
    studentName,
    studentEmail: student?.email ?? null,
    responsesUrl,
  });
  await Promise.all(
    admins
      .filter((a): a is { email: string } => !!a.email)
      .map((a) => sendEmail({ to: a.email, subject, html, text }).catch(() => null)),
  );
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
