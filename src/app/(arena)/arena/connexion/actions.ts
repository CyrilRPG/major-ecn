'use server';

import { unstable_rethrow } from 'next/navigation';
import { isPublicStatus } from '@/lib/arena/access';
import { issueAccessLink } from '@/lib/arena/auth-links';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { normalizeEmail, type ParticipantRow } from '@/lib/arena/types';

/** Accusé neutre : ni un renvoi limité ni une adresse inconnue ne sont annoncés comme un email envoyé. */
export async function requestLoginLinkAny(rawEmail: string): Promise<{ ok: true; retryAfter: number } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  if (email.length > 160 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  try {
    const tournaments = (await listTournaments()).filter(t => isPublicStatus(t) || t.status === 'scheduled');
    if (tournaments.length) {
      const { data } = await arenaDb().from('arena_participants').select('*').eq('email', email)
        .in('tournament_id', tournaments.map(t => t.id)).throwOnError();
      for (const p of (data ?? []) as ParticipantRow[]) {
        const t = tournaments.find(x => x.id === p.tournament_id);
        if (!t || p.blocked_at || p.anonymized_at) continue;
        const result = await issueAccessLink(t, p);
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
