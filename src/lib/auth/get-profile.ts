import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DB_TIMEOUT_MS, getUserSafely, withTimeout } from '@/lib/auth/safe-auth';
import type { Tables } from '@/types/database';

/** Augmented with columns added by recent migrations not yet in generated types. */
export type Profile = Tables<'profiles'> & {
  pseudo: string | null;
  trial_until: string | null;
  is_active: boolean | null;
  address: string | null;
  cv_url: string | null;
  certificat_scolarite_url: string | null;
  carte_pro_url: string | null;
  avatar_seed: string | null;
  /** Session EVC embarquée (fin d'accès par défaut) — cf. lib/auth/access.ts. */
  evc_session: { id: string; label: string; default_access_end: string } | null;
};

/**
 * Mémoïsé par requête (React `cache`) : le layout étudiant et la page appellent
 * tous deux requireUser() → cette fonction ; sans cache, l'auth + le SELECT
 * profiles étaient rejoués 2 à 5 fois par navigation. Le cache dédup­lique tout
 * l'arbre d'appels (auth, profil, arbre navigateur, accès contenu).
 */
export const getCurrentUserAndProfile = cache(async () => {
  const supabase = await createClient();

  // Appels BORNÉS. Sans cela, un rafraîchissement de token saturé (409 Supabase
  // « too many concurrent token refresh requests ») faisait pendre le rendu de
  // la page jusqu'au plafond de 300 s de la fonction, et la connexion était
  // coupée côté navigateur (ERR_CONNECTION_ABORTED sur /app).
  //
  // En cas d'échec on renvoie `user: null` : l'appelant (`requireUser`) redirige
  // alors vers /login en une fraction de seconde. Se reconnecter est désagréable,
  // rester cinq minutes sur une page morte l'est bien davantage.
  const { user } = await getUserSafely(supabase);
  if (!user) return { user: null, profile: null };

  const res = await withTimeout(
    supabase
      .from('profiles')
      .select('*, evc_session:evc_sessions(id, label, default_access_end)')
      .eq('id', user.id)
      .maybeSingle(),
    DB_TIMEOUT_MS,
  );
  if (res.timedOut) {
    console.warn('[auth] lecture du profil : délai dépassé', { userId: user.id });
    return { user: null, profile: null };
  }
  const { data: profile } = res.value;

  // Cast: `pseudo` and `trial_until` are added by recent migrations and not in generated types yet.
  return { user, profile: profile as unknown as Profile | null };
});
