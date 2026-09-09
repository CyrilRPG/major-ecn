import 'server-only';
import { after } from 'next/server';
import { siteUrl } from '@/lib/email/send';
import { arenaDb, arenaLog, currentParticipant, getParticipant, getTournament, loadTournamentSnapshot } from './db';
import { confirmationEmail, loginEmail, sendArenaEmail, validatedEmail } from './emails';
import { hashToken, newToken, readSession, setSessionCookie } from './session';
import { PUBLIC_STATUSES, toDate } from './time';
import { qrpNs, type ParticipantRow, type TournamentRow } from './types';

export const LOGIN_HOURS = 2;
export type IssueResult = { ok: true; throttled?: boolean; retryAfter?: number } | { ok: false; error: string };
type AccessKind = 'login' | 'confirmation';
type TokenStatus = 'unknown' | 'expired' | 'blocked';
export type TokenLookup = { status: 'ok'; participant: ParticipantRow; tournament: TournamentRow } | { status: TokenStatus };

export async function activeArenaSpace(expectedParticipantId?: string): Promise<string | null> {
  const session = await readSession();
  if (!session || (expectedParticipantId && session.participantId !== expectedParticipantId)) return null;
  const participant = await currentParticipant(session.tournamentId);
  if (!participant) return null;
  const tournament = await getTournament(session.tournamentId);
  if (!tournament || !PUBLIC_STATUSES.has(tournament.status)) return null;
  return '/arena/' + tournament.slug + '/espace';
}

/** Chaque envoi garde son propre jeton ; un renvoi ne révoque aucun lien précédent. */
async function issueToken(t: TournamentRow, p: ParticipantRow, kind: AccessKind, triggeredBy?: string): Promise<IssueResult> {
  const db = arenaDb();
  const { token, hash } = newToken();
  const { data: reservation, error } = await db.rpc('arena_reserve_access_token', {
    p_participant_id: p.id, p_kind: kind, p_token_hash: hash,
  });
  if (error) {
    console.error('[arena:auth] reservation_failed', { participantId: p.id, kind, code: error.code });
    return { ok: false, error: 'Le service de connexion est momentanément indisponible. Réessayez dans un instant.' };
  }
  if (!reservation?.ok) return { ok: false, error: 'Ce compte ne peut pas recevoir de lien. Contactez Major ECN.' };
  if (reservation.throttled) return { ok: true, throttled: true, retryAfter: reservation.retryAfter };
  const url = siteUrl() + '/arena/' + (kind === 'login' ? 'connecter' : 'confirmer') + '?t=' + encodeURIComponent(token);
  const sent = await sendArenaEmail({
    tournament: t, participant: p, to: p.email, kind, triggeredBy,
    mail: kind === 'login' ? loginEmail(t, p, url) : confirmationEmail(t, p, url),
  });
  // Une réponse réseau perdue n'implique pas que l'email n'est pas parti : son lien reste utilisable.
  const delivery = sent.ok ? 'sent' : sent.uncertain ? 'pending' : 'failed';
  const { error: deliveryError } = await db.from('arena_access_tokens').update({ delivery_status: delivery }).eq('id', reservation.tokenId);
  if (deliveryError) console.error('[arena:auth] delivery_record_failed', { tokenId: reservation.tokenId, code: deliveryError.code });
  console.info('[arena:auth] email_result', { participantId: p.id, kind, delivery, emailId: sent.ok ? sent.id : undefined });
  if (!sent.ok) return { ok: false, error: sent.uncertain
    ? 'Le service d’email n’a pas confirmé l’envoi. Vérifiez votre messagerie avant de réessayer.'
    : 'L’email n’a pas pu être envoyé. Réessayez ou contactez Major ECN.' };
  return { ok: true, retryAfter: 60 };
}
export function issueConfirmationLink(t: TournamentRow, p: ParticipantRow, triggeredBy?: string): Promise<IssueResult> {
  return issueToken(t, p, 'confirmation', triggeredBy);
}
export function issueLoginLink(t: TournamentRow, p: ParticipantRow, triggeredBy?: string): Promise<IssueResult> {
  return issueToken(t, p, 'login', triggeredBy);
}
export async function issueAccessLink(t: TournamentRow, p: ParticipantRow, triggeredBy?: string): Promise<IssueResult> {
  if (p.blocked_at || p.anonymized_at) return { ok: true };
  return p.email_confirmed_at ? issueLoginLink(t, p, triggeredBy) : issueConfirmationLink(t, p, triggeredBy);
}

/** Lecture seule : ni les antivirus ni les aperçus d'email ne consomment les liens. */
async function lookupToken(token: string, kind: AccessKind): Promise<TokenLookup> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return { status: 'unknown' };
  const db = arenaDb();
  const hash = hashToken(token);
  const { data: row } = await db.from('arena_access_tokens')
    .select('participant_id,expires_at,used_at,delivery_status,legacy').eq('token_hash', hash).eq('kind', kind).maybeSingle().throwOnError();
  let p: ParticipantRow | null;
  if (row) {
    if (row.used_at || row.delivery_status === 'failed') return { status: 'unknown' };
    if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return { status: 'expired' };
    p = await getParticipant(row.participant_id);
    if (row.legacy && (kind === 'login' ? p?.login_token_hash : p?.confirmation_token_hash) !== hash) return { status: 'unknown' };
  } else {
    const { data } = await db.from('arena_participants').select('*')
      .eq(kind === 'login' ? 'login_token_hash' : 'confirmation_token_hash', hash).maybeSingle().throwOnError();
    p = data as ParticipantRow | null;
    if (p && kind === 'login' && (!p.login_token_expires_at || new Date(p.login_token_expires_at).getTime() <= Date.now())) return { status: 'expired' };
  }
  if (!p) return { status: 'unknown' };
  if (p.blocked_at || p.anonymized_at) return { status: 'blocked' };
  const tournament = await getTournament(p.tournament_id);
  return tournament ? { status: 'ok', participant: p, tournament } : { status: 'unknown' };
}
export function lookupConfirmationToken(token: string): Promise<TokenLookup> { return lookupToken(token, 'confirmation'); }
export function lookupLoginToken(token: string): Promise<TokenLookup> { return lookupToken(token, 'login'); }

async function consumeToken(token: string, kind: AccessKind): Promise<
  { ok: true; slug: string; first: boolean } | { ok: false; status: TokenStatus }
> {
  const found = await lookupToken(token, kind);
  if (found.status !== 'ok') return { ok: false, status: found.status };
  const { participant: p, tournament: t } = found;
  const { data: consumed } = await arenaDb().rpc('arena_consume_access_token', {
    p_token_hash: hashToken(token), p_kind: kind,
  }).throwOnError();
  if (!consumed?.ok) return { ok: false, status: consumed?.status ?? 'unknown' };
  // Le succès de la connexion ne dépend pas de l'envoi d'un second email.
  await setSessionCookie(p.id, t.id);
  if (consumed.first) after(async () => {
    try {
      await arenaLog({ tournamentId: t.id, kind: 'participant_confirmed', details: 'Adresse confirmée pour ' + p.pseudo + '.' });
      if (t.email_sequence.validated.enabled) {
        const snap = await loadTournamentSnapshot(t);
        const m1 = snap.rounds[0];
        const mail = validatedEmail(t, p, { m1Open: toDate(m1?.opens_at), m1Theme: m1?.theme ?? '', bareme: t.bareme, qrpNs: qrpNs(m1 ? snap.questionsByRound.get(m1.id) ?? [] : []) });
        await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind: 'validated', mail, dedupeKey: 'validated:' + t.id + ':' + p.id });
      }
    } catch (error) {
      console.error('[arena:auth] welcome_email_failed', { participantId: p.id, error: error instanceof Error ? error.message : 'unknown' });
    }
  });
  console.info('[arena:auth] session_opened', { participantId: p.id, kind });
  return { ok: true, slug: t.slug, first: consumed.first };
}
export function consumeConfirmationToken(token: string) { return consumeToken(token, 'confirmation'); }
export function consumeLoginToken(token: string) { return consumeToken(token, 'login'); }
