/**
 * POST /api/espace-decouverte/signup
 *
 * Crée un compte étudiant "Espace Découverte" :
 *  - Aucun paiement requis
 *  - Permission scope limité au collège "col-decouverte"
 *  - Email d'activation envoyé avec lien magic-link → /auth/setup-password
 *
 * Stratégie d'envoi email (robuste) :
 *  1) Tentative 1 : Resend avec template Major ECN (HTML personnalisé)
 *  2) Tentative 2 (si 1 échoue) : Supabase `inviteUserByEmail`
 *     → utilise le SMTP intégré Supabase, déclenche un email standard mais
 *     toujours délivrable (Supabase gère son propre domaine vérifié).
 *  3) Si les deux échouent : on renvoie quand même le compte créé + un
 *     emailError explicite que la page de confirmation affichera.
 *
 * Body attendu : { firstName, lastName, email, phone?, specialty? }
 *
 * Retourne : {
 *   ok: true,
 *   isNew: boolean,
 *   emailSent: boolean,
 *   emailVia: 'resend' | 'supabase' | null,
 *   emailError: string | null,
 *   redirectTo: '/espace-decouverte/confirmation'
 * }
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
  phone: z.string().trim().min(6, 'Téléphone requis').max(40),
  specialty: z.string().trim().max(100).optional(),
});

const DECOUVERTE_COLLEGE_ID = 'col-decouverte';

/** Petit logger structuré pour faciliter la lecture des Logs Vercel. */
function log(label: string, payload: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.log(`[signup-decouverte] ${label}`, JSON.stringify(payload));
}

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
  log('start', {
    email,
    hasResendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM ?? '(fallback resend.dev sandbox)',
    siteUrl: siteUrl(),
  });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Service Supabase admin indisponible' },
      { status: 500 },
    );
  }

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
    // Email déjà utilisé : on N'ÉCRASE PAS le compte existant. On renvoie une
    // erreur claire avec une invitation à se connecter directement.
    log('user-existing-block', { userId: found.id });
    return NextResponse.json(
      {
        ok: false,
        existingAccount: true,
        error: 'Un compte existe déjà avec cet email. Connectez-vous directement pour accéder à votre espace.',
      },
      { status: 409 },
    );
  }

  {
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
      log('user-create-error', { msg });
      // Race condition / pagination listUsers : si le user existait déjà
      // sans qu'on l'ait trouvé, on renvoie le même flag existingAccount
      // pour que la page d'inscription propose « Se connecter ».
      if (/already|exist|duplicate/i.test(msg)) {
        return NextResponse.json(
          {
            ok: false,
            existingAccount: true,
            error: 'Un compte existe déjà avec cet email. Connectez-vous directement pour accéder à votre espace.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    userId = created.user.id;
    isNew = true;
    log('user-created', { userId });
  }

  // 2) Upsert profile
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
    if (isNew) {
      await admin.auth.admin.deleteUser(userId).catch(() => null);
    }
    log('profile-upsert-error', { msg: pErr.message });
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  log('profile-upserted', { isNew });

  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;

  // 3) Génération du lien d'activation
  //    - Nouveau user → invite link
  //    - User existant → magiclink (un nouveau lien valable 24 h)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: isNew ? 'invite' : 'magiclink',
    email,
    options: { redirectTo },
  });
  if (linkErr) log('generate-link-error', { msg: linkErr.message });

  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=${isNew ? 'invite' : 'magiclink'}&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;
  log('setup-url-built', { viaHashedToken: !!hashedToken });

  // 4) Envoi de l'email : Resend (template custom) puis Supabase en fallback
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;

  // -- Tentative 1 : Resend
  try {
    const { subject, html, text } = welcomeEmail({
      firstName,
      setupUrl,
      role: 'student',
    });
    const r = await sendEmail({ to: email, subject, html, text });
    if (r.ok) {
      emailVia = 'resend';
      log('email-sent-resend', { id: r.id });
    } else {
      emailError = r.error;
      log('email-fail-resend', { error: r.error });
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
    log('email-fail-resend-throw', { error: emailError });
  }

  // -- Tentative 2 : Supabase inviteUserByEmail (SMTP intégré, toujours dispo)
  if (!emailVia) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: invErr } = await (admin as any).auth.admin.inviteUserByEmail(
        email,
        { redirectTo },
      );
      if (invErr) {
        // Si l'utilisateur existe déjà, on retente avec un magic-link.
        if (/already|exist/i.test(invErr.message ?? '')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: mlErr } = await (admin as any).auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
          });
          if (!mlErr) {
            emailVia = 'supabase';
            emailError = null;
            log('email-sent-supabase-magiclink');
          } else {
            log('email-fail-supabase-magiclink', { error: mlErr.message });
            emailError = (emailError ?? '') + ' | Supabase: ' + mlErr.message;
          }
        } else {
          emailError = (emailError ?? '') + ' | Supabase: ' + invErr.message;
          log('email-fail-supabase', { error: invErr.message });
        }
      } else {
        emailVia = 'supabase';
        emailError = null;
        log('email-sent-supabase-invite');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Supabase inconnue';
      emailError = (emailError ?? '') + ' | Supabase: ' + msg;
      log('email-fail-supabase-throw', { error: msg });
    }
  }

  const emailSent = !!emailVia;
  log('end', { emailSent, emailVia, emailError });

  return NextResponse.json({
    ok: true,
    isNew,
    emailSent,
    emailVia,
    emailError,
    redirectTo: `/espace-decouverte/confirmation${emailSent ? '' : '?email_failed=1'}`,
  });
}
