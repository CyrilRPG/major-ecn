/**
 * Provisioning des comptes étudiants après achat Stripe.
 *
 * Workflow :
 *  1. Webhook Stripe reçoit checkout.session.completed
 *  2. On extrait email + metadata.formule + metadata.firstName/lastName
 *  3. On crée le user dans auth.users via admin SDK
 *  4. On configure le profile avec :
 *      - role = 'student'
 *      - permission_scope = { type: 'college', colleges: [MG voie interne, MG voie externe], offer: <formule> }
 *  5. On génère un lien magic-link "invite" → /auth/setup-password
 *  6. On envoie l'email de confirmation + lien d'activation
 */

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
};

export type ProvisioningResult =
  | { ok: true; userId: string; isNew: boolean }
  | { ok: false; error: string };

const MAP_OFFER: Record<FormuleId, 'essentiel' | 'premium' | 'intensif'> = {
  essentielle: 'essentiel',
  intensive: 'premium',
  'programme-approfondi': 'intensif',
};

/**
 * Crée (ou récupère) un compte étudiant et lui donne l'accès à la
 * Médecine Générale (voie interne + voie externe).
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

  // 1) Récupérer les IDs des collèges Médecine générale (interne + externe)
  const { data: matieres, error: mErr } = await admin
    .from('matieres')
    .select('id, nom')
    .or(
      [
        'nom.ilike.%Médecine générale - Voie interne%',
        'nom.ilike.%Médecine générale - Voie externe%',
        'nom.ilike.%Medecine generale%',
        // Fallback (cas où la migration MG voies n'a pas encore été appliquée)
        'nom.ilike.%Médecine générale%',
      ].join(','),
    );

  if (mErr) {
    return { ok: false, error: `Impossible de récupérer les collèges : ${mErr.message}` };
  }

  const collegeIds = (matieres ?? []).map((m: { id: string }) => m.id);

  const permission_scope = {
    type: 'college' as const,
    colleges: collegeIds,
    offer: MAP_OFFER[input.formuleId],
  };

  // 2) Existe-t-il déjà un user avec cet email ?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = existing?.users?.find((u: any) => u.email?.toLowerCase() === input.email.toLowerCase());

  let userId: string;
  let isNew = false;

  if (found) {
    userId = found.id;
  } else {
    // 3) Création du user
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: input.email,
      email_confirm: false,
      user_metadata: {
        first_name: input.firstName ?? '',
        last_name: input.lastName ?? '',
        role: 'student',
      },
    });
    if (cErr || !created?.user) {
      return { ok: false, error: cErr?.message ?? 'Échec de la création du user' };
    }
    userId = created.user.id;
    isNew = true;
  }

  // 4) Upsert du profile
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
    return { ok: false, error: pErr.message };
  }

  // 5) Générer le lien d'invitation pour setup-password
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link } = await (admin as any).auth.admin.generateLink({
    type: 'invite',
    email: input.email,
    options: { redirectTo },
  });
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const setupUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/login`;

  // 6) Envoi de l'email de confirmation d'achat + activation
  const formule = FORMULES[input.formuleId];
  const { subject, html, text } = purchaseConfirmationEmail({
    firstName: input.firstName ?? '',
    formuleName: formule.name,
    amountEuros: (input.amountTotalCents ?? formule.amountCents) / 100,
    installments: input.installments ?? 1,
    setupUrl,
  });
  await sendEmail({ to: input.email, subject, html, text }).catch(() => {
    // Email failure ne doit pas bloquer le provisioning — Stripe a déjà
    // encaissé. On log côté serveur si Resend est configuré.
  });

  return { ok: true, userId, isNew };
}
