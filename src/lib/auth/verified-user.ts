import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Identité vérifiée de l'utilisateur, SANS appel réseau à l'API Auth.
 *
 * POURQUOI : `auth.getUser()` fait un aller-retour HTTP vers l'API Auth de
 * Supabase (`GET /auth/v1/user`) À CHAQUE APPEL. Sur cette plateforme, une
 * seule navigation en déclenchait plusieurs (middleware + rendu serveur +
 * préchargements RSC + composants clients + heartbeat), soit plusieurs
 * requêtes /user par seconde dès quelques dizaines d'élèves connectés. L'API
 * Auth se mettait alors à répondre en 2 à 8 secondes, avec des 504 : la
 * plateforme devenait lente puis inaccessible, sans que rien ne soit « cassé ».
 *
 * `auth.getClaims()` fait le même travail de VÉRIFICATION mais en local : le
 * projet signe ses JWT en ES256 (clés asymétriques), la signature est donc
 * vérifiée avec `crypto.subtle` contre le JWKS public — mis en cache 10 min et
 * partagé par tout le process. Coût réseau en régime établi : zéro.
 *
 * SÉCURITÉ — ce n'est PAS `getSession()` (qui, lui, ne vérifie rien et ne doit
 * jamais servir côté serveur) :
 *  1. la signature du jeton est vérifiée cryptographiquement, et son `exp` est
 *     contrôlé (jeton expiré ⇒ `error`, donc `null` ici) ;
 *  2. si le jeton n'est pas vérifiable en local (algorithme HS256 héritée,
 *     `kid` absent, WebCrypto indisponible), `getClaims()` retombe de lui-même
 *     sur un appel réseau `getUser()` : aucune régression de sécurité possible ;
 *  3. toute lecture/écriture de données passe ensuite par PostgREST, qui
 *     revérifie le JWT et applique la RLS — un jeton forgé ne lit rien.
 *
 * RAFRAÎCHISSEMENT : `getClaims()` lit la session via `getSession()`, qui
 * renouvelle le jeton uniquement quand il est expiré (ou à moins de 30 s de
 * l'être) et réécrit les cookies. On passe donc d'un renouvellement concurrent
 * à chaque requête (source des 409 « too many concurrent token refresh
 * requests ») à environ un par heure et par session.
 */

export type VerifiedUser = {
  id: string;
  email: string | null;
};

/** Client minimal accepté : n'importe quel client Supabase (cookie, Bearer, navigateur). */
type ClaimsCapable = { auth: Pick<SupabaseClient<Database>['auth'], 'getClaims'> };

/**
 * Renvoie l'utilisateur vérifié, ou `null` si aucune session exploitable.
 *
 * `null` signifie « pas d'identité utilisable pour cette requête » — jamais
 * « session à détruire » : on ne purge aucun cookie ici, une purge ayant déjà
 * cassé des sessions saines par le passé (un jeton peut être refusé simplement
 * parce qu'une requête concurrente vient de le faire tourner).
 */
export async function getVerifiedUser(
  supabase: ClaimsCapable,
  jwt?: string,
): Promise<VerifiedUser | null> {
  try {
    const { data, error } = await supabase.auth.getClaims(jwt);
    const claims = data?.claims;
    if (error || !claims || typeof claims.sub !== 'string') return null;
    return {
      id: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : null,
    };
  } catch {
    // Jeton illisible / réseau indisponible : session indéterminée.
    return null;
  }
}

/** Raccourci pour les très nombreux appels qui n'ont besoin que de l'identifiant. */
export async function getVerifiedUserId(supabase: ClaimsCapable): Promise<string | null> {
  return (await getVerifiedUser(supabase))?.id ?? null;
}
