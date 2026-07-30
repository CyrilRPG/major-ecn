import 'server-only';
import { createClient as createSupabaseClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { createClient as createCookieClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

/**
 * Authentification par header `Authorization: Bearer <access token Supabase>` —
 * utilisée par l'application mobile (pas de cookies). Le client renvoyé est
 * borné par la RLS exactement comme le client cookie du web.
 */

export type RequestAuth = {
  user: User;
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
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { user, supabase, accessToken: token, via: 'bearer' };
}

/**
 * Auth duale : cookie (web) d'abord, Bearer (mobile) sinon. Permet de rendre
 * les routes existantes (fiche PDF, heartbeat…) accessibles à l'app mobile
 * sans changer le comportement web.
 */
export async function getRequestUser(req: Request): Promise<RequestAuth | null> {
  try {
    const cookieClient = await createCookieClient();
    const { data: { user } } = await cookieClient.auth.getUser();
    if (user) {
      const { data: { session } } = await cookieClient.auth.getSession();
      return { user, supabase: cookieClient, accessToken: session?.access_token ?? null, via: 'cookie' };
    }
  } catch {
    // Pas de contexte cookie (ou erreur) → on tente le Bearer.
  }
  return getBearerUser(req);
}
