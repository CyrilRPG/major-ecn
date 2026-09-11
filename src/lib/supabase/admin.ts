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
  return cloisonnerParFaculte(clientBrut());
}

/**
 * Client service-role SANS cloisonnement par faculté.
 *
 * RÉSERVÉ À LA FACTURATION IA. Major ECN et Major Odontologie partagent le même
 * projet Supabase et le même compte de facturation : ce qui est produit par IA
 * sur la plateforme d'odontologie (import d'exercices, import d'articles de
 * blog) est refacturé sur la facture de Major ECN. Or le client ordinaire borne
 * chaque lecture à `faculte_id = 'major-ecn'', ce qui rendait ces lignes
 * invisibles à la facture.
 *
 * NE PAS l'utiliser ailleurs : hors facturation, le cloisonnement est
 * exactement ce qui empêche le contenu d'une école d'apparaître chez l'autre.
 * Et jamais en écriture — une écriture non marquée n'appartiendrait à aucune
 * faculté.
 */
export function createAdminClientToutesFacultes() {
  return clientBrut();
}

function clientBrut() {
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
