import 'server-only';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { createClient as createCookieClient } from '@/lib/supabase/server';
import { extractAccessTokenFromCookies } from './access-token-cookie';
import { getVerifiedUser, type VerifiedUser } from './verified-user';
import type { Database } from '@/types/database';

/**
 * Authentification par header `Authorization: Bearer <access token Supabase>` —
 * utilisée par l'application mobile (pas de cookies). Le client renvoyé est
 * borné par la RLS exactement comme le client cookie du web.
 */

export type RequestAuth = {
  user: VerifiedUser;
  supabase: SupabaseClient<Database>;
  /** Access token JWT — sert notamment à révoquer les AUTRES sessions. */
  accessToken: string | null;
  via: 'cookie' | 'bearer';
};

export async function getBearerUser(req: Request): Promise<RequestAuth | null> {
  const header = req.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createSupabaseClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  // Vérification locale de la signature du jeton (cf. verified-user.ts) plutôt
  // qu'un appel réseau à l'API Auth : l'app mobile appelle ces routes en
  // rafale (sync, fiches, heartbeat).
  const user = await getVerifiedUser(supabase, token);
  if (!user) return null;
  return { user, supabase, accessToken: token, via: 'bearer' };
}

/**
 * Auth duale : cookie (web) d'abord, Bearer (mobile) sinon. Permet de rendre
 * les routes existantes (fiche PDF, heartbeat…) accessibles à l'app mobile
 * sans changer le comportement web.
 *
 * IMPORTANT : on lit le JWT dans les cookies et on le passe à `getClaims(jwt)`.
 * On n'appelle JAMAIS `getSession()` ici — sous saturation Auth, le refresh
 * automatique bloquait heartbeat/API pendant des dizaines de secondes et
 * amplifiait la panne (522 → files d'attente → plus aucune connexion DB).
 */
export async function getRequestUser(req: Request): Promise<RequestAuth | null> {
  try {
    const cookieStore = await cookies();
    const token = extractAccessTokenFromCookies(cookieStore.getAll());
    if (token) {
      const cookieClient = await createCookieClient();
      const user = await getVerifiedUser(cookieClient, token);
      if (user) {
        return { user, supabase: cookieClient, accessToken: token, via: 'cookie' };
      }
    }
  } catch {
    // Pas de contexte cookie (ou erreur) → on tente le Bearer.
  }
  return getBearerUser(req);
}
