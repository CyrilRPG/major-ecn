import 'server-only';
import { arenaDb } from './db';

export const ARENA_BUCKET = 'arena';

/**
 * URL signée vers un fichier du bucket privé `arena`, ou null.
 *
 * RÉSERVÉ AU PERSONNEL (`/admin/arena`, route `/api/admin/arena/rounds/[id]/pdf`
 * derrière `requireAdminRequest`). Les participants ne reçoivent jamais de
 * fichier ni de lien de fichier : la correction détaillée se consulte dans la
 * visionneuse intégrée de leur espace (`manche/[n]/corrections`). Ne pas
 * réintroduire cet appel dans les pages publiques ni dans les emails.
 */
export async function correctionsPdfSignedUrl(path: string, ttlSeconds = 600): Promise<string | null> {
  const { data } = await arenaDb().storage.from(ARENA_BUCKET).createSignedUrl(path, ttlSeconds);
  return data?.signedUrl ?? null;
}
