import { NextResponse } from 'next/server';
import { arenaDb, arenaLog, getTournament, loadTournamentSnapshot } from '@/lib/arena/db';
import { sendArenaEmail, validatedEmail } from '@/lib/arena/emails';
import { toDate } from '@/lib/arena/time';
import { qrpNs, type ParticipantRow } from '@/lib/arena/types';
import { hashToken, setSessionCookie } from '@/lib/arena/session';
import { siteUrl } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lien de confirmation d'adresse email (§3.2). Authentifie le compte, ouvre
 * la session et renvoie vers l'espace participant. Un lien déjà utilisé ou
 * inconnu renvoie vers la page de connexion avec un message.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  const base = siteUrl();
  if (!token) return NextResponse.redirect(`${base}/arena/connexion?erreur=lien`);
  const db = arenaDb();
  const { data: p } = await db.from('arena_participants').select('*').eq('confirmation_token_hash', hashToken(token)).maybeSingle();
  if (!p) return NextResponse.redirect(`${base}/arena/connexion?erreur=lien`);
  const t = await getTournament(p.tournament_id);
  if (!t) return NextResponse.redirect(`${base}/arena/connexion?erreur=lien`);
  if (p.blocked_at) return NextResponse.redirect(`${base}/arena/${t.slug}?erreur=bloque`);

  const first = !p.email_confirmed_at;
  await db.from('arena_participants').update({
    email_confirmed_at: p.email_confirmed_at ?? new Date().toISOString(),
    confirmation_token_hash: null,
    last_login_at: new Date().toISOString(),
  }).eq('id', p.id);
  if (first) {
    await arenaLog({ tournamentId: t.id, kind: 'participant_confirmed', details: `Adresse confirmée pour ${p.pseudo}.` });
    // Email « après validation » (§11) : règles, barème, date de M1 — une seule fois.
    if (t.email_sequence.validated.enabled) {
      const snap = await loadTournamentSnapshot(t);
      const m1 = snap.rounds[0];
      const mail = validatedEmail(t, p as ParticipantRow, { m1Open: toDate(m1?.opens_at), m1Theme: m1?.theme ?? '', bareme: t.bareme, qrpNs: qrpNs(m1 ? snap.questionsByRound.get(m1.id) ?? [] : []) });
      await sendArenaEmail({ tournament: t, participant: p as ParticipantRow, to: p.email, kind: 'validated', mail, dedupeKey: `validated:${t.id}:${p.id}` });
    }
  }
  await setSessionCookie(p.id, t.id);
  return NextResponse.redirect(`${base}/arena/${t.slug}/espace${first ? '?bienvenue=1' : ''}`);
}
