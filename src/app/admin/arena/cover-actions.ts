'use server';

import { unstable_rethrow } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ensureArenaAdmin, logAdmin } from '@/lib/arena/admin';
import { arenaDb, getTournament } from '@/lib/arena/db';

/**
 * Visuel de la carte d'un tournoi (« Choisissez votre tournoi »). Le fichier
 * est envoyé par le navigateur directement dans le bucket PUBLIC
 * `arena-public` via une URL signée (jamais par une action serveur, plafond
 * Vercel 4,5 Mo) ; seule la référence est enregistrée ici.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };

const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

export async function prepareCoverUpload(tournamentId: string, mime: string): Promise<Ok<{ path: string; token: string }> | Err> {
  try {
    await ensureArenaAdmin();
    const t = await getTournament(tournamentId);
    if (!t) return { ok: false, error: 'Tournoi introuvable.' };
    const ext = EXT[mime];
    if (!ext) return { ok: false, error: 'Format accepté : PNG, JPEG ou WebP.' };
    const path = `covers/${t.id}/${Date.now()}.${ext}`;
    const { data, error } = await arenaDb().storage.from('arena-public').createSignedUploadUrl(path);
    if (error || !data) return { ok: false, error: error?.message ?? 'URL d’envoi indisponible.' };
    return { ok: true, path, token: data.token };
  } catch (error) {
    unstable_rethrow(error);
    console.error('[arena] action échouée', error);
    return { ok: false, error: 'L’action n’a pas pu être effectuée. Réessayez.' };
  }
}

export async function setCoverImage(tournamentId: string, path: string | null): Promise<Ok | Err> {
  try {
    const actor = await ensureArenaAdmin();
    const t = await getTournament(tournamentId);
    if (!t) return { ok: false, error: 'Tournoi introuvable.' };
    if (path && !path.startsWith(`covers/${t.id}/`)) return { ok: false, error: 'Chemin invalide.' };
    if (path) {
      const { data: exists, error } = await arenaDb().storage.from('arena-public').exists(path);
      if (error || !exists) return { ok: false, error: 'Le visuel n’a pas été reçu. Réessayez l’envoi du fichier.' };
    }
    await arenaDb().from('arena_tournaments').update({ cover_image_path: path }).eq('id', t.id).throwOnError();
    if (t.cover_image_path && t.cover_image_path !== path) await arenaDb().storage.from('arena-public').remove([t.cover_image_path]);
    await logAdmin(actor, { tournamentId: t.id, kind: 'cover_image', newValue: { path }, details: path ? `Visuel du tournoi déposé (${path}).` : 'Visuel du tournoi retiré (visuel de la spécialité).' });
    revalidatePath(`/admin/arena/${t.id}`);
    revalidatePath('/arena');
    revalidatePath(`/arena/${t.slug}`);
    return { ok: true };
  } catch (error) {
    unstable_rethrow(error);
    console.error('[arena] action échouée', error);
    return { ok: false, error: 'L’action n’a pas pu être effectuée. Réessayez.' };
  }
}
