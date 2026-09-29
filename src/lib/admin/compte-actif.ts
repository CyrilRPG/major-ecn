import 'server-only';
import type { createAdminClient } from '@/lib/supabase/admin';
import { MOTIFS_DESACTIVATION, type MotifDesactivation } from './compte-actif-pure';

/**
 * Désactivation / réactivation d'un compte — UN seul chemin pour la fiche
 * élève, la désactivation en masse et l'équipe.
 *
 * Un compte désactivé ne doit plus avoir accès à RIEN :
 *  - `profiles.is_active = false` : pages (requireUser…), routes API
 *    (api-guard, assertDeviceSlot) et RLS (`access_expired()` renvoie vrai
 *    depuis la migration 20260929120000) ;
 *  - bannissement Supabase Auth : plus de connexion ni de rafraîchissement de
 *    jeton, sur le web comme dans l'app. Le jeton d'accès déjà émis meurt à
 *    son expiration (≤ 1 h) et la RLS le ferme dès maintenant.
 *
 * Avant, la route appelait `auth.admin.signOut(userId)` : cette méthode attend
 * un JETON, pas un identifiant — l'appel échouait en silence et aucune session
 * n'était révoquée.
 *
 * Le mot de passe et les données restent intacts : la réactivation lève le
 * bannissement et le compte refonctionne comme avant.
 */

type Admin = ReturnType<typeof createAdminClient>;

/** ~100 ans : Supabase n'a pas de bannissement « illimité ». */
const BAN_DURATION = '876000h';

export { MOTIFS_DESACTIVATION, type MotifDesactivation };

export async function desactiverCompte(
  admin: Admin,
  userId: string,
  opts: { motif: MotifDesactivation | null; note?: string | null; par: string },
): Promise<{ error: string | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('profiles').update({
    is_active: false,
    deactivation_reason: opts.motif,
    deactivation_note: opts.note?.trim() || null,
    deactivated_at: new Date().toISOString(),
    deactivated_by: opts.par,
  }).eq('id', userId);
  if (error) return { error: error.message };
  const ban = await admin.auth.admin.updateUserById(userId, { ban_duration: BAN_DURATION });
  if (ban.error) return { error: `Profil désactivé, mais le blocage de connexion a échoué : ${ban.error.message}` };
  return { error: null };
}

/** Motif seul, compte déjà désactivé (l'admin le précise après coup). */
export async function preciserMotif(
  admin: Admin,
  userId: string,
  opts: { motif: MotifDesactivation | null; note?: string | null },
): Promise<{ error: string | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('profiles').update({
    deactivation_reason: opts.motif,
    deactivation_note: opts.note?.trim() || null,
  }).eq('id', userId).eq('is_active', false);
  return { error: error?.message ?? null };
}

export async function reactiverCompte(admin: Admin, userId: string): Promise<{ error: string | null }> {
  // Bannissement levé AVANT le profil : si l'appel Auth échoue, le compte
  // reste entièrement désactivé plutôt qu'« actif » mais incapable de se connecter.
  const unban = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
  if (unban.error) return { error: `Réactivation impossible : ${unban.error.message}` };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('profiles').update({
    is_active: true,
    deactivation_reason: null,
    deactivation_note: null,
    deactivated_at: null,
    deactivated_by: null,
  }).eq('id', userId);
  return { error: error?.message ?? null };
}
