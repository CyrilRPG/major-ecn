/**
 * Appels d'authentification bornés dans le temps.
 *
 * POURQUOI CE MODULE EXISTE
 *
 * `supabase.auth.getUser()` déclenche, quand l'access token est expiré, un
 * rafraîchissement du refresh token. Une navigation génère plusieurs requêtes
 * serveur simultanées (page + payloads RSC + préchargements + heartbeat), qui
 * tentent TOUTES de rafraîchir le MÊME token en parallèle. Supabase répond
 * alors 409 « Too many concurrent token refresh requests » et le client peut
 * rester en attente.
 *
 * Aucun de ces appels n'était borné : la fonction serverless partait alors
 * jusqu'à son plafond (25 s pour le middleware, 300 s pour une page) avant
 * d'être tuée — côté navigateur, ERR_CONNECTION_ABORTED ou « Load failed ».
 *
 * DEUX RÈGLES, la seconde ayant été apprise à nos frais.
 *
 *  1. Plus aucun appel d'authentification ne peut pendre : tout passe par une
 *     course contre un délai.
 *
 *  2. Un échec n'est JAMAIS interprété comme une absence de session. Il signifie
 *     seulement « indéterminé ». On ne purge pas de cookies, on ne déconnecte
 *     personne : la requête suivante retentera avec les cookies à jour.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js';

/** Au-delà, on considère l'authentification injoignable. Très en deçà des
 *  plafonds d'exécution (25 s middleware / 300 s page) pour que la réponse
 *  parte toujours avant que la plateforme ne coupe la connexion. */
export const AUTH_TIMEOUT_MS = 10_000;

/** Idem pour les lectures de profil, qui suivent immédiatement l'auth. */
export const DB_TIMEOUT_MS = 8_000;

export type SafeAuth = {
  user: User | null;
  /** Délai dépassé, OU erreur d'authentification quelconque : dans les deux cas
   *  on n'a PAS pu déterminer l'utilisateur — ce qui ne veut pas dire qu'il n'y
   *  en a pas. Les appelants ne doivent jamais en déduire une déconnexion. */
  timedOut: boolean;
};

/**
 * AUCUNE erreur d'authentification ne provoque de déconnexion automatique.
 *
 * Une version précédente considérait `refresh_token_not_found` et
 * `refresh_token_already_used` comme des sessions mortes, et purgeait les
 * cookies. C'était faux et ça a coupé l'accès à la plateforme : ces deux codes
 * apparaissent aussi lorsqu'une requête PERD une course au rafraîchissement —
 * le jeton a été légitimement remplacé par une requête concurrente, et la
 * session est parfaitement valide. Purger les cookies détruisait donc des
 * sessions saines, et la redirection vers /login s'appliquait même depuis
 * /login, créant une boucle qui rendait la connexion impossible.
 *
 * La règle est désormais : on ne peut pas conclure qu'une session est morte
 * depuis une seule requête. On ne déconnecte jamais ; on laisse simplement la
 * requête suivante retenter avec les cookies à jour.
 */
function isTransient(err: unknown): boolean {
  if (!err || typeof err !== 'object') return true;
  const e = err as { code?: string; status?: number };
  // Conservé pour la journalisation : ces codes sont fréquents et bénins.
  return e.status === 409
    || e.code === 'refresh_token_not_found'
    || e.code === 'refresh_token_already_used';
}

/**
 * Course entre une promesse et un délai. La promesse perdante continue en
 * arrière-plan mais n'empêche plus la réponse de partir.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
): Promise<{ value: T; timedOut: false } | { value: null; timedOut: true }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<'__timeout__'>((resolve) => {
    timer = setTimeout(() => resolve('__timeout__'), ms);
  });
  try {
    const res = await Promise.race([promise, timeout]);
    if (res === '__timeout__') return { value: null, timedOut: true };
    return { value: res as T, timedOut: false };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** `auth.getUser()` qui ne peut ni pendre ni lever d'exception. */
export async function getUserSafely(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  timeoutMs: number = AUTH_TIMEOUT_MS,
): Promise<SafeAuth> {
  try {
    const res = await withTimeout(supabase.auth.getUser(), timeoutMs);
    if (res.timedOut) {
      console.warn('[auth] getUser: délai dépassé', { timeoutMs });
      return { user: null, timedOut: true };
    }
    const { data, error } = res.value;
    if (error) {
      // `timedOut: true` signifie ici « indéterminé », pas « pas d'utilisateur » :
      // c'est ce qui empêche l'appelant de conclure à une déconnexion.
      console.warn('[auth] getUser: erreur', {
        code: error.code, status: error.status, transient: isTransient(error),
      });
      return { user: null, timedOut: true };
    }
    return { user: data.user ?? null, timedOut: false };
  } catch (e) {
    console.warn('[auth] getUser: exception', {
      message: e instanceof Error ? e.message : String(e), transient: isTransient(e),
    });
    return { user: null, timedOut: true };
  }
}

