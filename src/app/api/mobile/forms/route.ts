import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { satisfactionSubmittedEmail } from '@/lib/email/templates';
import { isUserTargeted, type FormField } from '@/lib/schemas/satisfaction';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Formulaires de satisfaction pour l'app mobile — pendant des server actions
 * `(student)/formulaires/[id]/actions.ts` et du calcul « en attente » que le
 * layout étudiant fait côté web.
 *
 * GET  → { pending: [...], mandatory: <id|null> } ou, avec `?id=`, le détail
 *        d'un formulaire ciblant CET élève.
 * POST → { action: 'submit' | 'skip' }.
 *
 * Sans cette route, l'app n'affichait aucun formulaire : un élève qui ne se
 * connectait que sur mobile ne voyait jamais les formulaires obligatoires, et
 * l'équipe n'obtenait jamais ses réponses.
 */
type FormRow = {
  id: string;
  title: string;
  intro_text: string | null;
  mandatory: boolean;
  active: boolean;
  target_promo: string | null;
  target_offer: string | null;
  target_college: string | null;
  fields: FormField[] | null;
  allow_file_upload: boolean | null;
  file_upload_label: string | null;
};

async function auth(req: Request) {
  const a = await getBearerUser(req);
  if (!a) return { auth: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return { auth: null, response: check.response };
  return { auth: a, response: null };
}

function toPublic(f: FormRow) {
  return {
    id: f.id,
    title: f.title,
    intro_text: f.intro_text,
    mandatory: f.mandatory,
    fields: (f.fields ?? []) as FormField[],
    allow_file_upload: !!f.allow_file_upload,
    file_upload_label: f.file_upload_label,
  };
}

export async function GET(req: Request) {
  const checked = await auth(req);
  if (!checked.auth) return checked.response!;
  const userId = checked.auth.user.id;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: profile } = await db
    .from('profiles').select('promotion, permission_scope').eq('id', userId).maybeSingle();
  const cible = (f: FormRow) =>
    isUserTargeted(f, {
      promotion: profile?.promotion ?? null,
      permission_scope: profile?.permission_scope ?? null,
    });

  const id = new URL(req.url).searchParams.get('id');
  if (id) {
    const { data: form } = await db.from('satisfaction_forms').select('*').eq('id', id).maybeSingle();
    const f = form as FormRow | null;
    if (!f || !f.active || !cible(f)) {
      return NextResponse.json({ error: 'Formulaire introuvable' }, { status: 404 });
    }
    const { data: existing } = await db
      .from('satisfaction_responses')
      .select('skipped, submitted_at')
      .eq('form_id', id).eq('user_id', userId).maybeSingle();
    return NextResponse.json({ form: toPublic(f), answered: !!existing && !existing.skipped });
  }

  const [{ data: forms }, { data: responses }] = await Promise.all([
    db.from('satisfaction_forms')
      .select('id, title, intro_text, mandatory, active, target_promo, target_offer, target_college, fields, allow_file_upload, file_upload_label')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    db.from('satisfaction_responses').select('form_id').eq('user_id', userId),
  ]);
  const repondus = new Set(((responses ?? []) as { form_id: string }[]).map((r) => r.form_id));
  const pending = ((forms ?? []) as FormRow[]).filter((f) => !repondus.has(f.id)).filter(cible);

  return NextResponse.json({
    pending: pending.map(toPublic),
    mandatory: pending.find((f) => f.mandatory)?.id ?? null,
  });
}

const PostSchema = z.object({
  action: z.enum(['submit', 'skip']),
  form_id: z.string().min(1).max(120),
  answers: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const checked = await auth(req);
  if (!checked.auth) return checked.response!;
  const userId = checked.auth.user.id;

  const parsed = PostSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { action, form_id, answers } = parsed.data;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { data: form } = await db
    .from('satisfaction_forms').select('id, title, fields, active, mandatory').eq('id', form_id).maybeSingle();
  if (!form || !form.active) return NextResponse.json({ error: 'Formulaire introuvable.' }, { status: 404 });

  if (action === 'skip') {
    if (form.mandatory) return NextResponse.json({ error: 'Ce formulaire est obligatoire.' }, { status: 400 });
    const { error } = await db.from('satisfaction_responses').upsert(
      { form_id, user_id: userId, answers: {}, file_path: null, skipped: true, submitted_at: new Date().toISOString() },
      { onConflict: 'form_id,user_id' },
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Champs obligatoires — revalidés serveur, comme la server action.
  const values = answers ?? {};
  for (const f of ((form.fields ?? []) as FormField[])) {
    if (!f.required) continue;
    const v = values[f.key];
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
      return NextResponse.json({ error: `Le champ « ${f.label} » est obligatoire.` }, { status: 400 });
    }
  }

  const { error } = await db.from('satisfaction_responses').upsert(
    { form_id, user_id: userId, answers: values, file_path: null, skipped: false, submitted_at: new Date().toISOString() },
    { onConflict: 'form_id,user_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notification admin (best-effort, comme le web).
  void (async () => {
    try {
      const [{ data: student }, { data: admins }] = await Promise.all([
        db.from('profiles').select('first_name, last_name, email').eq('id', userId).maybeSingle(),
        db.from('profiles').select('email').eq('role', 'admin'),
      ]);
      if (!admins?.length) return;
      const studentName = `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim() || 'Étudiant';
      const { subject, html, text } = satisfactionSubmittedEmail({
        formTitle: form.title,
        studentName,
        studentEmail: student?.email ?? null,
        responsesUrl: `${siteUrl()}/admin/formulaires/${form_id}`,
      });
      await Promise.all(
        (admins as { email: string | null }[])
          .filter((a): a is { email: string } => !!a.email)
          .map((a) => sendEmail({ to: a.email, subject, html, text }).catch(() => null)),
      );
    } catch { /* notification best-effort */ }
  })();

  return NextResponse.json({ ok: true });
}
