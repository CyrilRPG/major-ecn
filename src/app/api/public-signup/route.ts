import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PublicSignupSchema } from '@/lib/schemas/public-signup';
import { generatePseudo, uniquePseudo } from '@/lib/auth/pseudo';
import { trialUntilForNewSignup } from '@/lib/auth/trial';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { welcomeEmail, adminSignupNotificationEmail } from '@/lib/email/templates';

const CONTACT_EMAIL = 'contact@major-ecn.fr';

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
  const body = await req.json().catch(() => ({}));
  const parsed = PublicSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }
  const { first_name, last_name, email, phone, promotion, offer, colleges_wish } = parsed.data;

  // Intensif : pas de création de compte automatique — l'équipe rappelle l'élève.
  if (offer === 'approfondi') {
    return NextResponse.json({
      ok: true,
      flow: 'callback',
      message: `Demande enregistrée. L'équipe Major ECN vous rappelle sous 24 h. En attendant, vous pouvez aussi écrire à ${CONTACT_EMAIL}.`,
    });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service indisponible.' },
      { status: 500 },
    );
  }

  // Build a unique pseudo from prénom+nom+promo.
  const baseSeed = generatePseudo(first_name, last_name, promotion);
  const pseudo = await uniquePseudo(baseSeed, async (candidate) => {
    const { data } = await admin
      .from('profiles')
      .select('id')
      .ilike('pseudo', candidate)
      .maybeSingle();
    return !!data;
  });

  const base = origin(req);
  const redirectTo = `${base}/auth/setup-password`;

  // 1) Création du user sans envoi automatique d'email (createUser + email_confirm=false).
  //    On générera ensuite un magic-link et on enverra NOTRE propre email branded.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { first_name, last_name, promotion, offer },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? 'Échec de l’inscription.';
    const friendly = /already|exist|duplicate/i.test(msg)
      ? `Un compte existe déjà avec cet email. Connectez-vous, ou écrivez à ${CONTACT_EMAIL}.`
      : msg;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  const permission_scope = { type: 'all' as const, offer };

  // `pseudo` and `trial_until` are recent columns; cast until types are regenerated.
  const profileUpdate: Record<string, unknown> = {
    first_name,
    last_name,
    email,
    phone: phone || null,
    promotion,
    permission_scope,
    pseudo,
    role: 'student',
    trial_until: trialUntilForNewSignup(7),
  };
  const { error: profileErr } = await admin
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(profileUpdate as any)
    .eq('id', created.user.id);

  if (profileErr) {
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  // Free-text college wish list is stored as metadata for the team (no schema change).
  if (colleges_wish) {
    await admin.auth.admin.updateUserById(created.user.id, {
      user_metadata: { colleges_wish, offer_at_signup: offer },
    });
  }

  // 2) Génère un magic-link d'invitation (pas envoyé par Supabase — on l'envoie nous-mêmes).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo },
  });
  if (linkErr || (!link?.properties?.hashed_token && !link?.properties?.action_link)) {
    return NextResponse.json({ error: linkErr?.message ?? 'Lien d’activation indisponible.' }, { status: 500 });
  }
  // On pointe vers notre route /auth/confirm SSR-safe via le hashed_token
  // (l'action_link Supabase brut casse en flow PKCE par défaut).
  const hashedToken = link.properties.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`
    : (link.properties.action_link as string);

  // 3) Envoie NOTRE email branded via Resend (avec fallback Supabase si pas de clé).
  const { subject, html, text } = welcomeEmail({
    firstName: first_name,
    setupUrl,
    role: 'student',
  });
  const sent = await sendEmail({ to: email, subject, html, text });
  if (!sent.ok) {
    // Fallback : si Resend pas configuré, on retombe sur l'invite Supabase classique
    // pour ne pas bloquer l'inscription en prod.
    if (sent.error.includes('RESEND_API_KEY non configurée')) {
      await admin.auth.admin.inviteUserByEmail(email, {
        data: { first_name, last_name, promotion, offer },
        redirectTo,
      });
      return NextResponse.json({
        ok: true,
        flow: 'invite_sent',
        message: `Email d'activation envoyé à ${email}.`,
        warning: 'RESEND_API_KEY non configurée — fallback email Supabase utilisé.',
      });
    }
    return NextResponse.json({ error: `Email non envoyé : ${sent.error}` }, { status: 500 });
  }

  // Notif admin (best-effort) — récupère les admins, envoie le récap.
  notifyAdminsOfSignup({
    email,
    first_name,
    last_name,
    promotion: promotion ?? null,
    colleges_wish: colleges_wish ?? null,
  }).catch(() => null);

  return NextResponse.json({
    ok: true,
    flow: 'invite_sent',
    message: `Email d'activation envoyé à ${email}. Cliquez sur le lien pour choisir votre mot de passe.`,
  });
}

async function notifyAdminsOfSignup(args: {
  email: string;
  first_name: string;
  last_name: string;
  promotion: string | null;
  colleges_wish: string | null;
}) {
  const admin = createAdminClient();
  const { data: admins } = await admin.from('profiles').select('email').eq('role', 'admin');
  if (!admins?.length) return;
  const { subject, html, text } = adminSignupNotificationEmail({
    firstName: args.first_name,
    lastName: args.last_name,
    email: args.email,
    promotion: args.promotion,
    collegesWish: args.colleges_wish,
    adminUrl: `${siteUrl()}/admin/eleves`,
  });
  await Promise.all(
    admins
      .filter((a): a is { email: string } => !!a.email)
      .map((a) => sendEmail({ to: a.email, subject, html, text }).catch(() => null)),
  );
}
