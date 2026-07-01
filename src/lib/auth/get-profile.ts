import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
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
};

/**
 * Mémoïsé par requête (React `cache`) : le layout étudiant et la page appellent
 * tous deux requireUser() → cette fonction ; sans cache, l'auth + le SELECT
 * profiles étaient rejoués 2 à 5 fois par navigation. Le cache dédup­lique tout
 * l'arbre d'appels (auth, profil, arbre navigateur, accès contenu).
 */
export const getCurrentUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Cast: `pseudo` and `trial_until` are added by recent migrations and not in generated types yet.
  return { user, profile: profile as Profile | null };
});
