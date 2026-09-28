import 'server-only';
import type { createAdminClient } from '@/lib/supabase/admin';
import { BUCKET_SURLIGNAGES } from '@/lib/fiches/surlignages-stockage';

/**
 * Supprime `<user_id>/<fiche_id>/*.json` du bucket des surlignages
 * (best-effort). Les surlignages vivent dans Storage : aucune cascade SQL ne
 * les efface à la suppression du compte, d'où cet appel explicite depuis les
 * deux routes de suppression (web et mobile), comme l'annonce la page
 * publique /suppression-compte.
 */
export async function purgerSurlignages(admin: ReturnType<typeof createAdminClient>, userId: string): Promise<void> {
  const bucket = admin.storage.from(BUCKET_SURLIGNAGES);
  const { data: fiches } = await bucket.list(userId, { limit: 1000 });
  for (const fiche of fiches ?? []) {
    const { data: fichiers } = await bucket.list(`${userId}/${fiche.name}`, { limit: 1000 });
    const chemins = (fichiers ?? []).map((f) => `${userId}/${fiche.name}/${f.name}`);
    if (chemins.length > 0) await bucket.remove(chemins);
  }
}
