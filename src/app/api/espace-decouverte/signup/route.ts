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
import { sendEmail, siteUrl, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { welcomeEmail, decouverteSignupNotificationEmail } from '@/lib/email/templates';
import { verifyTurnstile, clientIp } from '@/lib/turnstile';
import { spamCheck } from '@/lib/anti-spam';
import { enrollInCampaign } from '@/lib/email/campaign-enroll';

const Schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone requis').max(40),
  specialty: z.string().trim().min(1, 'Spécialité requise').max(120),
  voie: z.string().trim().max(40).optional().or(z.literal('')),
  session: z.string().trim().min(1, 'Session requise').max(20),
  country: z.string().trim().min(1, 'Pays de résidence requis').max(80),
  passedEvc: z.string().trim().min(1, 'Réponse EVC requise').max(10),
  consents: z
    .object({
      cgu: z.boolean().optional(),
      cgs: z.boolean().optional(),
      timestamp: z.string().optional(),
    })
    .optional(),
  turnstileToken: z.string().optional(),
  // Anti-spam (honeypot + piège temporel).
  hp: z.string().optional(),
  elapsedMs: z.number().optional(),
});

const DECOUVERTE_COLLEGE_ID = 'col-decouverte';
/** Spécialité déclenchant le sous-champ Voie interne/externe. */
const MG_NAME = 'Médecine générale';

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

  const { firstName, lastName, email, phone, specialty, voie, session, country, passedEvc, consents, turnstileToken, hp, elapsedMs } = parsed.data;

  // Anti-spam (honeypot + piège temporel) : fonctionne même sans Turnstile.
  // On répond une fausse réussite (drop silencieux) pour ne pas guider le bot,
  // sans rien créer en base.
  const spam = spamCheck({ hp, elapsedMs });
  if (!spam.ok) {
    log('spam-dropped', { reason: spam.reason });
    return NextResponse.json({
      ok: true, isNew: false, emailSent: false, emailVia: null, emailError: null,
      redirectTo: '/espace-decouverte/confirmation',
    });
  }

  // Anti-robot : vérification du captcha Turnstile (neutralisée si non configuré).
  const captcha = await verifyTurnstile(turnstileToken, clientIp(req));
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  // Acceptation des CGU + CGS obligatoire pour créer un compte découverte.
  if (!consents?.cgu || !consents?.cgs) {
    return NextResponse.json(
      { error: 'Vous devez accepter les CGU et les CGS pour créer votre compte.' },
      { status: 400 },
    );
  }

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
    offer: 'decouverte' as const, // était 'essentiel' → bug : un user découverte est désormais bien typé.
    espace_decouverte: true,
    specialty_wish: specialty || null,
    // Informations d'inscription saisies dans le formulaire découverte —
    // affichées côté admin (liste élèves).
    signup: {
      specialty,
      voie: specialty === MG_NAME ? (voie || null) : null,
      session,
      country,
      passed_evc: passedEvc,
      // Traçabilité de l'acceptation des conditions (compte gratuit : CGU + CGS).
      consent_cgu: true,
      consent_cgs: true,
      consent_timestamp: consents.timestamp ?? new Date().toISOString(),
    },
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

  enrollInCampaign(email, firstName, 'espace_decouverte').catch(() => {});

  // Récap interne (contact@ + abonan1@) — n'interrompt jamais le flux étudiant.
  try {
    const notif = decouverteSignupNotificationEmail({
      firstName,
      lastName,
      email,
      phone: phone || null,
      specialty: specialty || null,
      voie: specialty === MG_NAME ? (voie || null) : null,
      session,
      country,
      passedEvc,
    });
    const n = await sendEmail({
      to: INTERNAL_NOTIFY_EMAILS,
      subject: notif.subject,
      html: notif.html,
      text: notif.text,
      replyTo: email,
    });
    log('internal-notify', { ok: n.ok, error: n.ok ? null : n.error });
  } catch (e) {
    log('internal-notify-throw', { error: e instanceof Error ? e.message : 'unknown' });
  }

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
