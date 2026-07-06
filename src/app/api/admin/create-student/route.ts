import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddStudentSchema } from '@/lib/schemas/student';
import { siteUrl } from '@/lib/email/send';
import { buildStudentScope, sendStudentInvite } from '@/lib/admin/student-invite';

/** URL publique : siteUrl() (NEXT_PUBLIC_SITE_URL / Vercel) en priorité,
 *  sinon reconstruite depuis les en-têtes de la requête. */
function origin(req: Request): string {
  const fromEnv = siteUrl();
  if (fromEnv && !fromEnv.startsWith('http://localhost')) return fromEnv;
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const parsed = AddStudentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });

  const { first_name, last_name, email, phone, offer, permission_type, colleges, cours, voie } = parsed.data;
  const permission_scope = buildStudentScope({ offer, permission_type, colleges, cours, voie });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service role indisponible' },
      { status: 500 },
    );
  }

  // 1) Création du user auth SANS envoi d'email automatique (email_confirm:false).
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name, last_name, role: 'student' },
  });
  if (error || !created?.user) {
    const msg = error?.message ?? 'Échec de la création';
    const friendly = /already|exist|duplicate/i.test(msg)
      ? 'Un compte existe déjà avec cet email. Utilise le bouton « Renvoyer l’email d’activation » sur la ligne de l’élève.'
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  // 2) Profil (upsert + vérif) — couvre le cas où handle_new_user n'a pas encore inséré.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr } = await (admin as any)
    .from('profiles')
    .upsert({
      id: created.user.id,
      first_name,
      last_name,
      email,
      phone: phone ?? null,
      role: 'student',
      permission_scope,
    }, { onConflict: 'id' });
  if (upsertErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => null);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // 3) Email d'invitation robuste (Resend puis fallback Supabase).
  const base = origin(req);
  const { via, error: emailError, setupUrl } = await sendStudentInvite(admin, base, email, first_name, last_name);

  if (!via) {
    return NextResponse.json({
      ok: true,
      id: created.user.id,
      warning:
        `Élève créé, mais l'email d'invitation n'a pas pu être envoyé : ${emailError ?? 'erreur inconnue'}. ` +
        `Communiquez ce lien à l'élève pour activer son compte : ${setupUrl}`,
    });
  }

  return NextResponse.json({
    ok: true,
    id: created.user.id,
    emailVia: via,
    ...(via === 'supabase'
      ? { warning: 'Email envoyé via Supabase Auth (template standard, Resend a échoué).' }
      : {}),
  });
}
