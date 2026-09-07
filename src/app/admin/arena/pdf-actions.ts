'use server';

import { revalidatePath } from 'next/cache';
import { ensureArenaAdmin, logAdmin } from '@/lib/arena/admin';
import { arenaDb, getRound } from '@/lib/arena/db';
import { ARENA_BUCKET } from '@/lib/arena/pdf-url';

/**
 * PDF de corrections fourni par Major ECN (§12.1, arbitrage : les deux modes
 * coexistent). Le fichier est envoyé par le navigateur directement dans le
 * bucket privé via une URL signée (plafond Vercel 4,5 Mo) ; seule la
 * référence transite par une action serveur.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };

export async function prepareCorrectionsUpload(roundId: string): Promise<Ok<{ path: string; token: string }> | Err> {
  await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return { ok: false, error: 'Manche introuvable.' };
  const path = `${round.tournament_id}/corrections-m${round.number}-fourni-${Date.now()}.pdf`;
  const { data, error } = await arenaDb().storage.from(ARENA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? 'URL d’envoi indisponible.' };
  return { ok: true, path, token: data.token };
}

export async function attachCorrectionsPdf(roundId: string, path: string): Promise<Ok | Err> {
  const actor = await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return { ok: false, error: 'Manche introuvable.' };
  if (!path.startsWith(`${round.tournament_id}/`)) return { ok: false, error: 'Chemin invalide.' };
  await arenaDb().from('arena_rounds').update({ corrections_pdf_path: path, corrections_pdf_source: 'uploaded', corrections_pdf_generated_at: new Date().toISOString() }).eq('id', roundId);
  await logAdmin(actor, { tournamentId: round.tournament_id, roundId, kind: 'pdf_uploaded', details: `PDF de corrections fourni par Major ECN (${path}).` });
  revalidatePath(`/admin/arena/${round.tournament_id}`);
  return { ok: true };
}

export async function removeCorrectionsPdf(roundId: string): Promise<Ok | Err> {
  const actor = await ensureArenaAdmin();
  const round = await getRound(roundId);
  if (!round) return { ok: false, error: 'Manche introuvable.' };
  await arenaDb().from('arena_rounds').update({ corrections_pdf_path: null, corrections_pdf_source: null, corrections_pdf_generated_at: null }).eq('id', roundId);
  await logAdmin(actor, { tournamentId: round.tournament_id, roundId, kind: 'pdf_removed', details: 'PDF de corrections retiré.' });
  revalidatePath(`/admin/arena/${round.tournament_id}`);
  return { ok: true };
}
