import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import type { SondeAvatars } from '@/lib/avatars/unicite';

/**
 * Sonde d'unicité des avatars Major ECN.
 *
 * Périmètre : les comptes de la faculté Major ECN, et eux seuls. EVC Arena a
 * sa propre sonde sur `arena_participants` — les deux mondes sont cloisonnés,
 * la même combinaison peut exister des deux côtés.
 *
 * Le client service-role est nécessaire : un élève ne voit pas les lignes des
 * autres profils sous RLS, il ne pourrait donc jamais savoir ce qui est pris.
 * On ne renvoie que l'intersection des codes demandés : aucune énumération.
 */
export function sondeAvatarsProfils(exclureId?: string): SondeAvatars {
  return async (codes) => {
    let requete = createAdminClient()
      .from('profiles')
      .select('avatar_seed')
      .eq('faculte_id', EDN_FACULTE_ID)
      .in('avatar_seed', codes);
    // Garder SON propre avatar disponible : sinon la personne ne pourrait plus
    // réenregistrer le médaillon qu'elle porte déjà.
    if (exclureId) requete = requete.neq('id', exclureId);
    const { data } = await requete;
    return new Set(((data ?? []) as { avatar_seed: string | null }[])
      .map((row) => row.avatar_seed)
      .filter((seed): seed is string => !!seed));
  };
}
