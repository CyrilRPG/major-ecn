import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddStudentSchema } from '@/lib/schemas/student';
import { siteUrl } from '@/lib/email/send';
import { buildStudentScope, sendStudentInvite } from '@/lib/admin/student-invite';
import { isDecouverteOnly } from '@/lib/auth/trial';

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

  const { first_name, last_name, email, phone, offer, offers, permission_type, colleges, cours, voie } = parsed.data;
  const permission_scope = buildStudentScope({ offer, offers, permission_type, colleges, cours, voie });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service role indisponible' },
      { status: 500 },
    );
  }

  // 1) Un compte existe-t-il déjà avec cet email ?
  //    - Compte « Découverte » (gratuit, non payant) → on l'ÉCRASE : on réutilise
  //      son userId et on remplace son permission_scope par celui saisi ici.
  //      L'élève garde le même compte auth (et son éventuel mot de passe), mais
  //      bascule sur l'offre payante choisie par l'admin.
  //    - Compte payant existant → on refuse (comme avant).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingList } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingUser = existingList?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existingUser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingProfile } = await (admin as any)
      .from('profiles')
      .select('permission_scope')
      .eq('id', existingUser.id)
      .maybeSingle();

    if (!isDecouverteOnly(existingProfile)) {
      return NextResponse.json(
        { error: 'Un compte payant existe déjà avec cet email. Utilise le bouton « Renvoyer l’email d’activation » ou modifie l’élève existant.' },
        { status: 400 },
      );
    }
    userId = existingUser.id;
  } else {
    // Création du user auth SANS envoi d'email automatique (email_confirm:false).
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
    userId = created.user.id;
  }

  // 2) Profil (upsert + vérif) — couvre le cas où handle_new_user n'a pas encore
  //    inséré, ET l'écrasement d'un compte Découverte existant.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr } = await (admin as any)
    .from('profiles')
    .upsert({
      id: userId,
      first_name,
      last_name,
      email,
      phone: phone ?? null,
      role: 'student',
      permission_scope,
    }, { onConflict: 'id' });
  if (upsertErr) {
    if (!existingUser) await admin.auth.admin.deleteUser(userId).catch(() => null);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // 3) Email d'invitation robuste (Resend puis fallback Supabase).
  const base = origin(req);
  const { via, error: emailError, setupUrl } = await sendStudentInvite(admin, base, email, first_name, last_name);

  if (!via) {
    return NextResponse.json({
      ok: true,
      id: userId,
      warning:
        `Élève créé, mais l'email d'invitation n'a pas pu être envoyé : ${emailError ?? 'erreur inconnue'}. ` +
        `Communiquez ce lien à l'élève pour activer son compte : ${setupUrl}`,
    });
  }

  return NextResponse.json({
    ok: true,
    id: userId,
    emailVia: via,
    ...(via === 'supabase'
      ? { warning: 'Email envoyé via Supabase Auth (template standard, Resend a échoué).' }
      : {}),
  });
}
