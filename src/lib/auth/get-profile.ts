import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { extractAccessTokenFromCookies } from './access-token-cookie';
import { getVerifiedUser } from './verified-user';
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

  // Vérification LOCALE du JWT (cf. verified-user.ts), avec le jeton du cookie
  // passé EXPLICITEMENT. Sans argument, `getClaims()` lit la session via
  // `getSession()`, qui RENOUVELLE le refresh token dès que le JWT est expiré.
  // Or un Server Component ne peut pas écrire de cookies (le setAll de
  // server.ts avale l'erreur) : le jeton tourné n'était jamais persisté, le
  // navigateur rejouait l'ANCIEN refresh token à la requête suivante, et la
  // rotation Supabase finissait par révoquer TOUTE la famille — « Invalid
  // Refresh Token: Refresh Token Not Found » (772 occurrences, 45 élèves),
  // élève déconnecté en pleine session. Le SEUL rafraîchisseur serveur est le
  // middleware, qui, lui, sait réécrire les cookies.
  //
  // Session indéterminée ⇒ `null` : l'appelant (`requireUser`) redirige vers
  // /login, et la reconnexion réécrit les cookies.
  const cookieStore = await cookies();
  const token = extractAccessTokenFromCookies(cookieStore.getAll());
  if (!token) return { user: null, profile: null };
  const user = await getVerifiedUser(supabase, token);
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, evc_session:evc_sessions(id, label, default_access_end)')
    .eq('id', user.id)
    .maybeSingle();

  // Cast: `pseudo` and `trial_until` are added by recent migrations and not in generated types yet.
  return { user, profile: profile as unknown as Profile | null };
});
