import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AddProfessorSchema, CONTENT_TYPES, PERMISSION_LEVELS, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates';

/** URL publique : siteUrl() (NEXT_PUBLIC_SITE_URL / Vercel) en priorité,
 *  sinon on tente de reconstruire depuis les en-têtes de la requête. */
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
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = AddProfessorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { first_name, last_name, email, phone, permission_type, colleges, cours, content_permissions } = parsed.data;

  const cleanedColleges = permission_type === 'college' ? (colleges ?? []) : [];
  const cleanedCours = permission_type === 'college' ? (cours ?? []).filter((c) => typeof c === 'string') : [];
  const cleanedPermissions: Partial<Record<ContentType, PermissionLevel>> = {};
  for (const t of CONTENT_TYPES) {
    const lvl = content_permissions?.[t];
    if (lvl && (PERMISSION_LEVELS as readonly string[]).includes(lvl) && lvl !== 'none') {
      cleanedPermissions[t] = lvl;
    }
  }

  const permission_scope = {
    role: 'professor',
    type: permission_type,
    colleges: cleanedColleges,
    ...(cleanedCours.length > 0 ? { cours: cleanedCours } : {}),
    content_permissions: cleanedPermissions,
  };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service indisponible' },
      { status: 500 },
    );
  }

  // Auto-include child sub-matières so permission checks pass for nested matières
  if (cleanedColleges.length > 0) {
    const { data: childMats } = await admin
      .from('matieres')
      .select('id')
      .in('parent_matiere_id', cleanedColleges);
    if (childMats) {
      for (const ch of childMats) {
        if (!cleanedColleges.includes(ch.id)) cleanedColleges.push(ch.id);
      }
    }
  }

  const base = origin(req);
  const redirectTo = `${base}/auth/setup-password`;

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name, last_name, role: 'professor' },
  });
  if (error || !created?.user) {
    const msg = error?.message ?? 'Échec de la création';
    const friendly = /already|exist|duplicate/i.test(msg)
      ? 'Un compte existe déjà avec cet email.'
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  // Upsert (au lieu d'update) pour couvrir le cas où le trigger handle_new_user
  // n'aurait pas (encore) inséré la ligne profile. On lit ensuite la ligne pour
  // CONFIRMER que role='professor' a bien été persisté — sinon on supprime le
  // user auth orphelin et on remonte une erreur claire (typiquement RLS qui
  // bloque silencieusement à cause d'une SUPABASE_SERVICE_ROLE_KEY incorrecte).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr } = await (admin as any)
    .from('profiles')
    .upsert({
      id: created.user.id,
      first_name,
      last_name,
      email,
      phone: phone || null,
      role: 'professor',
      permission_scope,
    }, { onConflict: 'id' });

  if (upsertErr) {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => null);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Vérification : la ligne a-t-elle vraiment été mise à jour avec role=professor ?
  const { data: persisted } = await admin
    .from('profiles')
    .select('role')
    .eq('id', created.user.id)
    .maybeSingle();

  if (!persisted || persisted.role !== 'professor') {
    await admin.auth.admin.deleteUser(created.user.id).catch(() => null);
    return NextResponse.json(
      {
        error:
          'Le rôle « professeur » n\'a pas pu être appliqué. ' +
          'Vérifie que SUPABASE_SERVICE_ROLE_KEY est bien la clé service_role ' +
          '(et pas l\'anon key) dans les variables d\'environnement Vercel, puis redéploie.',
      },
      { status: 500 },
    );
  }

  // Logger structuré pour les Logs Vercel — facilite le diagnostic si
  // l'email ne part pas (Resend KO ? Supabase KO ? domain non vérifié ?).
  // eslint-disable-next-line no-console
  const log = (label: string, data: Record<string, unknown> = {}) =>
    console.log(`[create-professor] ${label}`, JSON.stringify({ email, ...data }));
  log('start', {
    hasResendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM ?? '(fallback resend.dev sandbox)',
  });

  // Magic-link via Supabase admin SDK
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo },
  });
  if (linkErr) log('generate-link-error', { error: linkErr.message });

  // On pointe vers notre propre route /auth/confirm (SSR-safe) en utilisant
  // le `hashed_token` plutôt que l'URL Supabase brute (qui casse en PKCE).
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;
  log('setup-url-built', { viaHashedToken: !!hashedToken });

  // STRATÉGIE D'ENVOI (identique à /api/espace-decouverte/signup) :
  //   1) Tentative Resend (template Major ECN branded)
  //   2) Fallback Supabase `inviteUserByEmail` si Resend KO (peu importe la
  //      cause : clé absente, domaine non vérifié, 4xx/5xx…)
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;

  // -- Tentative 1 : Resend
  try {
    const { subject, html, text } = welcomeEmail({ firstName: first_name, setupUrl, role: 'professor' });
    const sent = await sendEmail({ to: email, subject, html, text });
    if (sent.ok) {
      emailVia = 'resend';
      log('email-sent-resend', { id: sent.id });
    } else {
      emailError = sent.error;
      log('email-fail-resend', { error: sent.error });
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
    log('email-fail-resend-throw', { error: emailError });
  }

  // -- Tentative 2 : Supabase inviteUserByEmail (toujours dispo si user existe)
  if (!emailVia) {
    try {
      const { error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { first_name, last_name, role: 'professor' },
        redirectTo,
      });
      if (invErr) {
        emailError = (emailError ?? '') + ' | Supabase: ' + invErr.message;
        log('email-fail-supabase', { error: invErr.message });
      } else {
        emailVia = 'supabase';
        emailError = null;
        log('email-sent-supabase');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Supabase inconnue';
      emailError = (emailError ?? '') + ' | Supabase: ' + msg;
      log('email-fail-supabase-throw', { error: msg });
    }
  }

  log('end', { emailVia, emailError });

  if (!emailVia) {
    return NextResponse.json({
      ok: true,
      id: created.user.id,
      warning:
        `Profil professeur créé, mais l'email d'activation n'a pas pu être envoyé : ${emailError ?? 'erreur inconnue'}. ` +
        `Communiquez ce lien au professeur pour qu'il puisse activer son compte : ${setupUrl}`,
    });
  }

  return NextResponse.json({
    ok: true,
    id: created.user.id,
    emailVia,
    ...(emailVia === 'supabase'
      ? { warning: 'Email envoyé via Supabase Auth (template standard, Resend a échoué).' }
      : {}),
  });
}
