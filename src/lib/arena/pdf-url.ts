import 'server-only';
import { arenaDb } from './db';

export const ARENA_BUCKET = 'arena';

/** URL signée (7 jours) vers un fichier du bucket privé `arena`, ou null. */
export async function correctionsPdfSignedUrl(path: string, ttlSeconds = 7 * 24 * 3600): Promise<string | null> {
  const { data } = await arenaDb().storage.from(ARENA_BUCKET).createSignedUrl(path, ttlSeconds);
  return data?.signedUrl ?? null;
}
