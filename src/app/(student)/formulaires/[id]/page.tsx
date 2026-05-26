import { notFound, redirect } from 'next/navigation';
import { ClipboardList, Lock } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { isUserTargeted, type FormField } from '@/lib/schemas/satisfaction';
import { StudentForm } from '@/components/student/satisfaction-form';

export const metadata = { title: 'Formulaire de satisfaction' };

export default async function StudentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: form } = await supabase.from('satisfaction_forms').select('*').eq('id', id).maybeSingle();
  if (!form || !form.active) notFound();
  if (!isUserTargeted(form, { promotion: profile.promotion, permission_scope: profile.permission_scope })) notFound();

  const { data: existing } = await supabase
    .from('satisfaction_responses')
    .select('skipped, submitted_at')
    .eq('form_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  // Si déjà répondu (non skippé), retour à l'accueil avec un message
  if (existing && !existing.skipped) redirect('/accueil');

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-6">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-(--color-primary)">
          <ClipboardList className="h-3.5 w-3.5" />
          Formulaire de satisfaction
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-(--color-ink)">
          {form.title}
        </h1>
        {form.intro_text && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--color-ink-soft)">
            {form.intro_text}
          </p>
        )}
        {form.mandatory && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-(--color-danger)/10 px-3 py-2 text-xs font-medium text-(--color-danger)">
            <Lock className="h-3.5 w-3.5" />
            Ce formulaire est obligatoire pour continuer à utiliser la plateforme.
          </p>
        )}
      </header>

      <StudentForm
        formId={form.id}
        fields={(form.fields ?? []) as FormField[]}
        mandatory={!!form.mandatory}
        userId={user.id}
        allowUpload={!!form.allow_file_upload}
        uploadLabel={form.file_upload_label}
      />
    </div>
  );
}
