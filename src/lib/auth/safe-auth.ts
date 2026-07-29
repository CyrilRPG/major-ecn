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
 * Règle : plus aucun appel d'authentification ne peut pendre. On distingue
 *   - session INVALIDE (refresh token absent/déjà utilisé) → il faut nettoyer
 *     les cookies et renvoyer vers /login, sinon chaque requête suivante
 *     relance la même tempête ;
 *   - échec TRANSITOIRE (409, réseau, lenteur) → on ne déconnecte personne,
 *     on rend la main immédiatement.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js';

/** Au-delà, on considère l'authentification injoignable. Très en deçà des
 *  plafonds d'exécution (25 s middleware / 300 s page) pour que la réponse
 *  parte toujours avant que la plateforme ne coupe la connexion. */
export const AUTH_TIMEOUT_MS = 6_000;

/** Idem pour les lectures de profil, qui suivent immédiatement l'auth. */
export const DB_TIMEOUT_MS = 8_000;

export type SafeAuth = {
  user: User | null;
  /** Délai dépassé : Supabase Auth injoignable ou saturé. */
  timedOut: boolean;
  /** Session irrécupérable : seul ce cas justifie de déconnecter. */
  sessionInvalid: boolean;
};

/** Codes Supabase signant une session morte — réessayer ne sert à rien. */
const DEAD_SESSION_CODES = new Set([
  'refresh_token_not_found',
  'refresh_token_already_used',
  'session_not_found',
  'session_expired',
]);

function isDeadSession(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; status?: number; message?: string };
  if (e.code && DEAD_SESSION_CODES.has(e.code)) return true;
  // 409 = rafraîchissements concurrents : transitoire, surtout PAS une
  // déconnexion (c'est précisément le symptôme de la tempête à éteindre).
  if (e.status === 409) return false;
  return /refresh token (not found|already used)|session (not found|expired)/i.test(e.message ?? '');
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
      return { user: null, timedOut: true, sessionInvalid: false };
    }
    const { data, error } = res.value;
    if (error) {
      const dead = isDeadSession(error);
      console.warn('[auth] getUser: erreur', { code: error.code, status: error.status, dead });
      return { user: null, timedOut: false, sessionInvalid: dead };
    }
    return { user: data.user ?? null, timedOut: false, sessionInvalid: false };
  } catch (e) {
    const dead = isDeadSession(e);
    console.warn('[auth] getUser: exception', {
      message: e instanceof Error ? e.message : String(e), dead,
    });
    return { user: null, timedOut: false, sessionInvalid: dead };
  }
}

/** Noms des cookies de session Supabase présents sur la requête. */
export function supabaseCookieNames(names: string[]): string[] {
  return names.filter((n) => n.startsWith('sb-'));
}
