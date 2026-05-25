import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PublicSignupSchema } from '@/lib/schemas/public-signup';
import { generatePseudo, uniquePseudo } from '@/lib/auth/pseudo';
import { trialUntilForNewSignup } from '@/lib/auth/trial';

const CONTACT_EMAIL = 'inscriptionmajorecn@gmail.com';

function origin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
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
  if (offer === 'intensif') {
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

  const redirectTo = `${origin(req)}/auth/setup-password`;

  const { data: created, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name, promotion, offer },
    redirectTo,
  });

  if (inviteErr || !created?.user) {
    const msg = inviteErr?.message ?? 'Échec de l’inscription.';
    // Most common case: email already used.
    const friendly = /already|exist/i.test(msg)
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

  return NextResponse.json({
    ok: true,
    flow: 'invite_sent',
    message: `Email d'activation envoyé à ${email}. Cliquez sur le lien pour choisir votre mot de passe.`,
  });
}
