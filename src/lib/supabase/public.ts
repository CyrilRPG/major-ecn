import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { cloisonnerParFaculte } from './faculte-scope';

/**
 * Client Supabase ANONYME et SANS COOKIES, pour le contenu public.
 *
 * POURQUOI. `@/lib/supabase/server` appelle `cookies()`. Or `cookies()` bascule
 * une page Next.js en rendu dynamique, ce qui ANNULE silencieusement tout
 * `export const revalidate`. Le blog en faisait les frais : il déclarait
 * `revalidate = 300` mais interrogeait la base à chaque visite, pour chaque
 * visiteur — exactement le pire cas en période d'affluence, puisqu'aucune
 * page n'était jamais servie depuis le cache.
 *
 * Ce client ne lit aucun cookie : il est donc utilisable dans `unstable_cache`
 * et n'entraîne pas le passage en dynamique.
 *
 * SÉCURITÉ. On reste sur la clé anonyme, jamais la clé de service : la RLS
 * s'applique pleinement. Pour `blog_posts`, la policy `blog_posts_public_read`
 * ne laisse passer que les articles publiés dont la date est atteinte — un
 * brouillon reste donc invisible même si l'appelant se trompe de filtre.
 */
export function createPublicClient() {
  return cloisonnerParFaculte(
    createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    ),
  );
}
