import 'server-only';
import { sendEmail } from '@/lib/email/send';
import { welcomeEmail } from '@/lib/email/templates';

/** Construit le permission_scope d'un élève (offre, collèges, cours, voie). */
export function buildStudentScope(input: {
  offer: string;
  permission_type: 'all' | 'college';
  colleges?: string[] | null;
  cours?: string[] | null;
  voie?: 'interne' | 'externe' | null;
}) {
  const { offer, permission_type, colleges, cours, voie } = input;
  // Voie : stockée en `paid_voie` — lue par la RLS (current_voie()) ET parseScope,
  // exactement comme après un paiement Stripe. Filtre QCM/DP vs QROC/DP-QROC.
  const voieFields = voie ? { paid_voie: voie } : {};
  const mgGranted = permission_type === 'all' || (colleges ?? []).includes('col-medecine-generale');
  const specialtyFields = mgGranted ? { paid_specialty: 'Médecine générale' } : {};
  return permission_type === 'all'
    ? { type: 'all' as const, offer, ...specialtyFields, ...voieFields }
    : {
        type: 'college' as const,
        colleges: colleges ?? [],
        offer,
        ...(cours && cours.length > 0 ? { cours } : {}),
        ...specialtyFields,
        ...voieFields,
      };
}

/**
 * Envoie (ou renvoie) l'email d'invitation « bienvenue + choix de mot de passe »
 * à un élève déjà créé côté auth. Stratégie robuste identique à create-professor :
 *   1) generateLink(invite) -> URL /auth/confirm (SSR-safe, PKCE-safe)
 *   2) Resend (template Major ECN brandé)
 *   3) fallback Supabase inviteUserByEmail
 */
export async function sendStudentInvite(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  base: string,
  email: string,
  first_name: string,
  last_name: string,
): Promise<{ via: 'resend' | 'supabase' | null; error: string | null; setupUrl: string }> {
  const redirectTo = `${base}/auth/setup-password`;
  let setupUrl = `${base}/login`;
  try {
    const { data: link } = await admin.auth.admin.generateLink({
      type: 'invite', email, options: { redirectTo },
    });
    const hashedToken = link?.properties?.hashed_token as string | undefined;
    if (hashedToken) {
      setupUrl = `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=invite&next=${encodeURIComponent('/auth/setup-password')}`;
    } else if (link?.properties?.action_link) {
      setupUrl = link.properties.action_link as string;
    }
  } catch {
    /* generateLink KO → on tentera quand même Resend, puis Supabase */
  }

  try {
    const { subject, html, text } = welcomeEmail({ firstName: first_name || 'futur lauréat', setupUrl, role: 'student' });
    const sent = await sendEmail({ to: email, subject, html, text });
    if (sent.ok) return { via: 'resend', error: null, setupUrl };
    const { error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name, role: 'student' }, redirectTo,
    });
    return invErr
      ? { via: null, error: `${sent.error} | Supabase: ${invErr.message}`, setupUrl }
      : { via: 'supabase', error: null, setupUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur envoi';
    try {
      const { error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { first_name, last_name, role: 'student' }, redirectTo,
      });
      return invErr ? { via: null, error: `${msg} | Supabase: ${invErr.message}`, setupUrl }
        : { via: 'supabase', error: null, setupUrl };
    } catch (e2) {
      return { via: null, error: `${msg} | ${e2 instanceof Error ? e2.message : ''}`, setupUrl };
    }
  }
}
