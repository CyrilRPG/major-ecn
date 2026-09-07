'use server';

import { siteUrl } from '@/lib/email/send';
import { isPublic } from '@/lib/arena/access';
import { arenaDb, listTournaments } from '@/lib/arena/db';
import { confirmationEmail, loginEmail, sendArenaEmail } from '@/lib/arena/emails';
import { newToken } from '@/lib/arena/session';
import { normalizeEmail, type ParticipantRow } from '@/lib/arena/types';

/**
 * Lien de connexion global : l'adresse peut être inscrite à plusieurs
 * tournois, chacun reçoit son lien. Réponse identique quoi qu'il arrive
 * (aucune énumération d'adresses).
 */
export async function requestLoginLinkAny(rawEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  const tournaments = (await listTournaments()).filter(isPublic);
  if (tournaments.length === 0) return { ok: true };
  const db = arenaDb();
  const { data } = await db.from('arena_participants').select('*').eq('email', email).in('tournament_id', tournaments.map((t) => t.id));
  for (const p of (data ?? []) as ParticipantRow[]) {
    if (p.anonymized_at || p.blocked_at) continue;
    const t = tournaments.find((x) => x.id === p.tournament_id);
    if (!t) continue;
    const { token, hash } = newToken();
    if (!p.email_confirmed_at) {
      await db.from('arena_participants').update({ confirmation_token_hash: hash, confirmation_sent_at: new Date().toISOString() }).eq('id', p.id);
      const url = `${siteUrl()}/arena/confirmer?t=${encodeURIComponent(token)}`;
      await sendArenaEmail({ tournament: t, participant: p, to: email, kind: 'confirmation', mail: confirmationEmail(t, p, url) });
    } else {
      await db.from('arena_participants').update({ login_token_hash: hash, login_token_expires_at: new Date(Date.now() + 3_600_000).toISOString() }).eq('id', p.id);
      const url = `${siteUrl()}/arena/connecter?t=${encodeURIComponent(token)}`;
      await sendArenaEmail({ tournament: t, participant: p, to: email, kind: 'login', mail: loginEmail(t, p, url) });
    }
  }
  return { ok: true };
}
