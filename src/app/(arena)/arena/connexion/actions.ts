'use server';

import { isPublicStatus } from '@/lib/arena/access';
import { issueAccessLink } from '@/lib/arena/auth-links';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { normalizeEmail, type ParticipantRow } from '@/lib/arena/types';

/**
 * Lien de connexion global (page /arena/connexion) : l'adresse peut être
 * inscrite à plusieurs tournois, chacun reçoit son lien (connexion si l'adresse
 * est confirmée, sinon nouvel email de confirmation). Réponse identique quoi
 * qu'il arrive (aucune énumération d'adresses), un envoi par minute maximum.
 *
 * Bug corrigé le 09/09/2026 : le filtre portait sur `isPublic`, qui dépend du
 * drapeau de mise en service (désactivé en mode test) — aucun lien n'était
 * jamais envoyé. Le filtre porte désormais sur le statut du tournoi.
 */
export async function requestLoginLinkAny(rawEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  const tournaments = (await listTournaments()).filter((t) => isPublicStatus(t) || t.status === 'scheduled');
  if (tournaments.length === 0) return { ok: true };
  const { data } = await arenaDb().from('arena_participants').select('*').eq('email', email).in('tournament_id', tournaments.map((t) => t.id));
  let failure: string | null = null;
  for (const p of (data ?? []) as ParticipantRow[]) {
    const t = tournaments.find((x) => x.id === p.tournament_id);
    if (!t) continue;
    const r = await issueAccessLink(t, p);
    if (!r.ok) failure = r.error;
  }
  return failure ? { ok: false, error: failure } : { ok: true };
}
