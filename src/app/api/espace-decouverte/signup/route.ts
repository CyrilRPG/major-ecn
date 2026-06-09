/**
 * POST /api/espace-decouverte/signup
 *
 * Crée un compte étudiant "Espace Découverte" :
 *  - Aucun paiement requis
 *  - Permission scope limité au collège "col-decouverte"
 *  - Email d'activation envoyé avec lien magic-link → /auth/setup-password
 *
 * Body attendu : { firstName, lastName, email, phone?, specialty? }
 *
 * Retourne : { ok: true, redirectTo: '/espace-decouverte/confirmation' }
 *
 * En cas d'erreur (email déjà utilisé, etc.) : 400 avec message clair.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates';

const Schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().max(40).optional(),
  specialty: z.string().trim().max(100).optional(),
});

const DECOUVERTE_COLLEGE_ID = 'col-decouverte';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requête invalide (JSON attendu)' },
      { status: 400 },
    );
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, phone, specialty } = parsed.data;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service Supabase admin indisponible' },
      { status: 500 },
    );
  }

  // Configuration permission scope : accès UNIQUEMENT au collège Découverte
  const permission_scope = {
    type: 'college' as const,
    colleges: [DECOUVERTE_COLLEGE_ID],
    offer: 'essentiel' as const,
    espace_decouverte: true,
    specialty_wish: specialty || null,
  };

  // 1) Recherche d'un user existant avec cet email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = existing?.users?.find(
    (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  let userId: string;
  let isNew = false;

  if (found) {
    userId = found.id;
  } else {
    // 2) Création du user (email_confirm: false → activation via magic-link)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        espace_decouverte: true,
      },
    });
    if (cErr || !created?.user) {
      const msg = cErr?.message ?? 'Échec de la création';
      const friendly = /already|exist|duplicate/i.test(msg)
        ? "Un compte existe déjà avec cet email — vérifiez votre boîte mail."
        : msg;
      return NextResponse.json({ error: friendly }, { status: 400 });
    }
    userId = created.user.id;
    isNew = true;
  }

  // 3) Upsert profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pErr } = await (admin as any)
    .from('profiles')
    .upsert(
      {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        role: 'student',
        permission_scope,
      },
      { onConflict: 'id' },
    );

  if (pErr) {
    // Si on a créé le user à l'étape 2 mais que le profile a échoué,
    // on supprime le user pour éviter les orphelins.
    if (isNew) {
      await admin.auth.admin.deleteUser(userId).catch(() => null);
    }
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  // 4) Générer le lien d'invitation pour activation
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any).auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo },
  });
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;

  // 5) Envoi de l'email de bienvenue avec lien magic-link
  const { subject, html, text } = welcomeEmail({
    firstName,
    setupUrl,
    role: 'student',
  });
  const emailResult = await sendEmail({ to: email, subject, html, text });

  return NextResponse.json({
    ok: true,
    isNew,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.error,
    redirectTo: '/espace-decouverte/confirmation',
  });
}
