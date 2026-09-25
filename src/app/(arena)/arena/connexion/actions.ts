'use server';

import { unstable_rethrow } from 'next/navigation';
import { isPublicStatus } from '@/lib/arena/access';
import { issueAccessLink } from '@/lib/arena/auth-links';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { normalizeEmail, type ParticipantRow } from '@/lib/arena/types';
import { pickLoginParticipant, safeArenaNext } from '@/lib/arena/identity';

/**
 * Accusé neutre : ni un renvoi limité ni une adresse inconnue ne sont annoncés
 * comme un email envoyé. UN seul email par demande, même pour une adresse
 * inscrite à plusieurs tournois : la session ouverte vaut pour tous
 * (`identity.ts`). On vise le tournoi d'où vient la demande s'il est connu.
 */
export async function requestLoginLinkAny(
  rawEmail: string,
  opts: { tournamentSlug?: string | null; next?: string | null } = {},
): Promise<{ ok: true; retryAfter: number } | { ok: false; error: string }> {
  const email = normalizeEmail(String(rawEmail ?? ''));
  if (email.length > 160 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  try {
    const tournaments = (await listTournaments()).filter(t => isPublicStatus(t) || t.status === 'scheduled');
    if (tournaments.length) {
      const { data } = await arenaDb().from('arena_participants').select('*').eq('email', email)
        .in('tournament_id', tournaments.map(t => t.id)).throwOnError();
      const rows = ((data ?? []) as ParticipantRow[]).flatMap(p => {
        const t = tournaments.find(x => x.id === p.tournament_id);
        return t ? [{ ...p, tournamentSlug: t.slug, tournamentStatus: t.status, tournament: t }] : [];
      });
      const chosen = pickLoginParticipant(rows, opts.tournamentSlug ? String(opts.tournamentSlug) : null);
      if (chosen) {
        const result = await issueAccessLink(chosen.tournament, chosen, undefined, safeArenaNext(opts.next ?? null));
        if (!result.ok) return result;
      }
    }
    // Même réponse et même délai pour protéger les adresses des participants.
    return { ok: true, retryAfter: 60 };
  } catch (error) {
    unstable_rethrow(error);
    console.error('[arena:auth] request_failed', { message: error instanceof Error ? error.message : 'unknown' });
    return { ok: false, error: 'La demande n’a pas pu aboutir. Réessayez dans un instant.' };
  }
}
