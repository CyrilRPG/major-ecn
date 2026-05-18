import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service-role client. NEVER import from a client component.
 * Used by /api/admin/* routes and seed scripts.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === 'replace_me') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY est requise pour cette opération. ' +
        'Récupère-la sur https://supabase.com/dashboard/project/_/settings/api-keys et colle-la dans .env.local',
    );
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
