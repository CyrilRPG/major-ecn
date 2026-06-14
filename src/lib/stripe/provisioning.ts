/**
 * Provisioning des comptes étudiants après achat Stripe.
 *
 * Workflow :
 *  1. Webhook Stripe reçoit checkout.session.completed
 *  2. On extrait email + metadata.formule + metadata.firstName/lastName
 *  3. On crée le user dans auth.users via admin SDK (s'il n'existe pas)
 *  4. On configure le profile avec :
 *      - role = 'student'
 *      - permission_scope = accès Découverte uniquement (col-decouverte)
 *        → l'utilisateur ne voit pour l'instant que le contenu Découverte
 *      - paid_offer (metadata.permission_scope.paid_offer) = 'essentiel' |
 *        'premium' | 'intensif' selon la formule réellement achetée
 *      - paid_formule (idem) = identifiant exact de la formule achetée
 *      - specialty (en metadata) = "Médecine générale"
 *      - voie (Intensive uniquement) en metadata
 *  5. On envoie l'email de confirmation + lien d'activation
 *     - Tentative 1 : Resend (template Major ECN custom)
 *     - Tentative 2 : Supabase `inviteUserByEmail` en fallback
 */

import { createClient as createSupabasePublicClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { purchaseConfirmationEmail } from '@/lib/email/templates';
import { FORMULES, type FormuleId } from '@/lib/stripe';

export type ProvisioningInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  formuleId: FormuleId;
  installments?: number;
  amountTotalCents?: number;
  /** Spécialité préparée (pour l'instant toujours Médecine générale). */
  specialty?: string;
  /** Voie de concours pour la Formule Intensive ('interne' / 'externe' / ''). */
  voie?: string;
  /** ID de session Stripe — clé de déduplication d'envoi d'email. */
  sessionId?: string;
  /** Source de l'appel : webhook OU /merci. Utile pour le log d'audit. */
  source?: 'webhook' | 'merci';
};

export type ProvisioningResult =
  | {
      ok: true;
      userId: string;
      isNew: boolean;
      emailSent: boolean;
      emailVia: 'resend' | 'supabase' | null;
      emailError: string | null;
    }
  | { ok: false; error: string };

const MAP_OFFER: Record<FormuleId, 'essentiel' | 'premium' | 'intensif'> = {
  essentielle: 'essentiel',
  intensive: 'premium',
  'programme-approfondi': 'intensif',
};

const DECOUVERTE_COLLEGE_ID = 'col-decouverte';

/** Petit logger structuré pour faciliter la lecture des Logs Vercel. */
function log(label: string, payload: Record<string, unknown> = {}) {
  // eslint-disable-next-line no-console
  console.log(`[provisioning] ${label}`, JSON.stringify(payload));
}

/**
 * Crée (ou récupère) un compte étudiant avec :
 *  - une trace claire de la formule achetée (paid_offer / paid_formule)
 *  - un accès plateforme limité à l'Espace Découverte pour l'instant
 *    (l'équipe Major ECN pourra étendre l'accès depuis l'admin une fois
 *     que tous les contenus payants seront publiés).
 */
export async function provisionStudentAccount(
  input: ProvisioningInput,
): Promise<ProvisioningResult> {
  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Service Supabase admin indisponible',
    };
  }

  log('start', {
    email: input.email,
    formuleId: input.formuleId,
    installments: input.installments ?? 1,
    hasResendKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.EMAIL_FROM ?? '(fallback resend.dev sandbox)',
  });

  // Permission scope : pour l'instant, accès Découverte uniquement.
  // La formule réellement achetée est conservée dans `paid_offer` et
  // `paid_formule` pour pouvoir débloquer le contenu plus tard.
  const permission_scope = {
    type: 'college' as const,
    colleges: [DECOUVERTE_COLLEGE_ID],
    offer: 'essentiel' as const,
    espace_decouverte: true,
    /* Marqueurs de la formule réellement payée — l'admin pourra basculer
       l'accès complet (MG voie interne + voie externe) une fois le contenu
       finalisé. Côté UI : permet de différencier un "vrai" abonné d'un
       utilisateur Découverte gratuit. */
    paid_offer: MAP_OFFER[input.formuleId],
    paid_formule: input.formuleId,
    paid_specialty: input.specialty ?? 'Médecine générale',
    paid_voie: input.voie ?? null,
    paid_at: new Date().toISOString(),
  };

  // 1) Existe-t-il déjà un user avec cet email ?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = existing?.users?.find((u: any) => u.email?.toLowerCase() === input.email.toLowerCase());

  let userId: string;
  let isNew = false;

  if (found) {
    userId = found.id;
    log('user-existing', { userId });
  } else {
    // 2) Création du user
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: input.email,
      email_confirm: false,
      user_metadata: {
        first_name: input.firstName ?? '',
        last_name: input.lastName ?? '',
        role: 'student',
        paid_formule: input.formuleId,
      },
    });
    if (cErr || !created?.user) {
      log('user-create-error', { msg: cErr?.message });
      return { ok: false, error: cErr?.message ?? 'Échec de la création du user' };
    }
    userId = created.user.id;
    isNew = true;
    log('user-created', { userId });
  }

  // 3) Upsert du profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pErr } = await (admin as any)
    .from('profiles')
    .upsert(
      {
        id: userId,
        first_name: input.firstName ?? '',
        last_name: input.lastName ?? '',
        email: input.email,
        role: 'student',
        permission_scope,
      },
      { onConflict: 'id' },
    );
  if (pErr) {
    log('profile-upsert-error', { msg: pErr.message });
    return { ok: false, error: pErr.message };
  }
  log('profile-upserted');

  // 4) DÉDUPLICATION D'ENVOI D'EMAIL :
  //    Si on a un sessionId, on tente d'insérer dans stripe_provisioning_log.
  //    INSERT ON CONFLICT DO NOTHING : seul le PREMIER à insérer (webhook ou
  //    /merci) déclenchera l'envoi. L'autre verra le conflict et skipera
  //    l'envoi — évitant ainsi qu'un 2e generateLink invalide le token du
  //    premier email reçu par l'utilisateur.
  let weOwnTheEmailSend = true;
  if (input.sessionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claimed, error: claimErr } = await (admin as any)
      .from('stripe_provisioning_log')
      .insert({
        session_id: input.sessionId,
        user_id: userId,
        email: input.email,
        source: input.source ?? 'merci',
      })
      .select('session_id')
      .maybeSingle();
    // Postgres renvoie 23505 (unique_violation) si la ligne existe déjà.
    const isConflict = claimErr && (
      claimErr.code === '23505'
      || /duplicate|already exists/i.test(claimErr.message ?? '')
    );
    if (claimErr && !isConflict) {
      log('dedup-claim-error', { msg: claimErr.message });
    } else if (isConflict || !claimed) {
      weOwnTheEmailSend = false;
      log('dedup-already-sent', { sessionId: input.sessionId, source: input.source });
    } else {
      log('dedup-claimed', { sessionId: input.sessionId, source: input.source });
    }
  }

  if (!weOwnTheEmailSend) {
    // Quelqu'un d'autre (webhook ou /merci, l'autre côté de la race) a déjà
    // envoyé l'email. On retourne ok sans regénérer de token pour ne pas
    // invalider celui du 1er email.
    return { ok: true, userId, isNew, emailSent: true, emailVia: null, emailError: null };
  }

  // 5) Générer le lien d'invitation pour setup-password
  //    - Nouveau user → invite link
  //    - User existant → magiclink (un nouveau lien valable 24 h)
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: isNew ? 'invite' : 'magiclink',
    email: input.email,
    options: { redirectTo },
  });
  if (linkErr) log('generate-link-error', { msg: linkErr.message });

  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=${isNew ? 'invite' : 'magiclink'}&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;

  // 5) Envoi de l'email : Resend (template custom) puis Supabase en fallback
  let emailVia: 'resend' | 'supabase' | null = null;
  let emailError: string | null = null;

  const formule = FORMULES[input.formuleId];

  // -- Tentative 1 : Resend
  try {
    const { subject, html, text } = purchaseConfirmationEmail({
      firstName: input.firstName ?? '',
      formuleName: formule.name,
      amountEuros: (input.amountTotalCents ?? formule.amountCents) / 100,
      installments: input.installments ?? 1,
      setupUrl,
    });
    log('email-resend-attempt', {
      to: input.email,
      subject,
      setupUrlPrefix: setupUrl.slice(0, 60) + '…',
    });
    const sendResult = await sendEmail({ to: input.email, subject, html, text });
    if (sendResult.ok) {
      emailVia = 'resend';
      log('email-sent-resend', { id: sendResult.id });
    } else {
      emailError = sendResult.error;
      log('email-fail-resend', { error: sendResult.error });
    }
  } catch (e) {
    emailError = e instanceof Error ? e.message : 'Erreur Resend inconnue';
    log('email-fail-resend-throw', { error: emailError });
  }

  // -- Tentative 2 : Supabase reset-password via le SMTP intégré.
  //    On utilise un client public (anon key) car les méthodes auth user-facing
  //    comme resetPasswordForEmail/signInWithOtp NE déclenchent PAS l'envoi
  //    d'email quand elles sont appelées via le service-role client.
  if (!emailVia) {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !anonKey) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes — fallback Supabase impossible.');
      }
      const publicClient = createSupabasePublicClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // Pour un nouveau user → invite (le compte vient d'être créé sans confirm).
      // Pour un user existant → recovery (toujours valide, renvoie un lien set-password).
      if (isNew) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: invErr } = await (admin as any).auth.admin.inviteUserByEmail(
          input.email,
          { redirectTo },
        );
        if (invErr) {
          // En cas de "user already registered", on bascule sur recovery.
          if (/already|exist/i.test(invErr.message ?? '')) {
            const { error: rpErr } = await publicClient.auth.resetPasswordForEmail(input.email, { redirectTo });
            if (!rpErr) {
              emailVia = 'supabase';
              emailError = null;
              log('email-sent-supabase-recovery-fallback');
            } else {
              emailError = (emailError ?? '') + ' | Supabase: ' + rpErr.message;
              log('email-fail-supabase-recovery', { error: rpErr.message });
            }
          } else {
            emailError = (emailError ?? '') + ' | Supabase: ' + invErr.message;
            log('email-fail-supabase-invite', { error: invErr.message });
          }
        } else {
          emailVia = 'supabase';
          emailError = null;
          log('email-sent-supabase-invite');
        }
      } else {
        const { error: rpErr } = await publicClient.auth.resetPasswordForEmail(input.email, { redirectTo });
        if (!rpErr) {
          emailVia = 'supabase';
          emailError = null;
          log('email-sent-supabase-recovery');
        } else {
          emailError = (emailError ?? '') + ' | Supabase: ' + rpErr.message;
          log('email-fail-supabase-recovery', { error: rpErr.message });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur Supabase inconnue';
      emailError = (emailError ?? '') + ' | Supabase: ' + msg;
      log('email-fail-supabase-throw', { error: msg });
    }
  }

  const emailSent = !!emailVia;
  log('end', { emailSent, emailVia, emailError, isNew });

  // Met à jour la ligne de dédup avec le résultat de l'envoi (audit + debug).
  if (input.sessionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('stripe_provisioning_log')
      .update({ email_via: emailVia, email_error: emailError })
      .eq('session_id', input.sessionId);
  }

  return { ok: true, userId, isNew, emailSent, emailVia, emailError };
}
