import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { cloisonnerParFaculte } from './faculte-scope';

/**
 * Service-role client. NEVER import from a client component.
 * Used by /api/admin/* routes and seed scripts.
 *
 * La clé service-role court-circuite la RLS : c'est donc ici, et non en base,
 * que se joue le cloisonnement des tables transverses partagées avec Major
 * Odontologie (cf. `faculte-scope.ts`).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === 'replace_me') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY est requise pour cette opération. ' +
        'Récupère-la sur https://supabase.com/dashboard/project/_/settings/api-keys et colle-la dans .env.local',
    );
  }
  return cloisonnerParFaculte(
    createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  );
}
