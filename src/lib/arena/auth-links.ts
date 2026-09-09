import 'server-only';
import { siteUrl } from '@/lib/email/send';
import { arenaDb, arenaLog, getTournament, loadTournamentSnapshot } from './db';
import { confirmationEmail, loginEmail, sendArenaEmail, validatedEmail } from './emails';
import { hashToken, newToken, setSessionCookie } from './session';
import { toDate } from './time';
import { qrpNs, type ParticipantRow, type TournamentRow } from './types';

/**
 * EVC Arena — liens de confirmation d'adresse et de connexion (sans mot de
 * passe). Un seul module pour l'inscription, la page de connexion, le renvoi
 * et les pages d'atterrissage des liens.
 *
 * Principes (revue du 09/09/2026, après les bugs signalés par le client) :
 * - un lien reçu par email n'est JAMAIS consommé par un simple GET : les
 *   antivirus et aperçus de messagerie ouvrent les liens avant l'utilisateur,
 *   ce qui rendait le lien « déjà utilisé ». La page d'atterrissage affiche un
 *   bouton ; seule l'action serveur (POST) consomme le jeton ;
 * - anti-rafale : un lien par minute et par adresse, sans révéler si l'adresse
 *   est inscrite ;
 * - le lien de connexion vaut LOGIN_HOURS heures ; le lien de confirmation
 *   reste valable jusqu'à son utilisation.
 */
export const LOGIN_HOURS = 2;
const THROTTLE_MS = 60_000;

export type IssueResult = { ok: true; throttled?: boolean } | { ok: false; error: string };

/** (Re)génère le lien de confirmation et l'envoie. Silencieux si un envoi date de moins d'une minute. */
export async function issueConfirmationLink(t: TournamentRow, p: ParticipantRow): Promise<IssueResult> {
  const last = p.confirmation_sent_at ? new Date(p.confirmation_sent_at).getTime() : 0;
  if (Date.now() - last < THROTTLE_MS) return { ok: true, throttled: true };
  const { token, hash } = newToken();
  const { error } = await arenaDb().from('arena_participants').update({ confirmation_token_hash: hash, confirmation_sent_at: new Date().toISOString() }).eq('id', p.id);
  if (error) return { ok: false, error: error.message };
  const url = `${siteUrl()}/arena/confirmer?t=${encodeURIComponent(token)}`;
  const sent = await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind: 'confirmation', mail: confirmationEmail(t, p, url) });
  if (!sent.ok && !sent.skipped) {
    console.error('[arena] email de confirmation', sent.error);
    return { ok: false, error: 'L’email n’a pas pu être envoyé. Réessayez dans un instant ou contactez Major ECN.' };
  }
  return { ok: true };
}

/** Génère un lien de connexion (LOGIN_HOURS h) et l'envoie. Silencieux si un lien date de moins d'une minute. */
export async function issueLoginLink(t: TournamentRow, p: ParticipantRow): Promise<IssueResult> {
  const exp = p.login_token_expires_at ? new Date(p.login_token_expires_at).getTime() : 0;
  const issuedAt = exp - LOGIN_HOURS * 3_600_000;
  if (Date.now() - issuedAt < THROTTLE_MS) return { ok: true, throttled: true };
  const { token, hash } = newToken();
  const { error } = await arenaDb().from('arena_participants').update({ login_token_hash: hash, login_token_expires_at: new Date(Date.now() + LOGIN_HOURS * 3_600_000).toISOString() }).eq('id', p.id);
  if (error) return { ok: false, error: error.message };
  const url = `${siteUrl()}/arena/connecter?t=${encodeURIComponent(token)}`;
  const sent = await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind: 'login', mail: loginEmail(t, p, url) });
  if (!sent.ok && !sent.skipped) {
    console.error('[arena] email de connexion', sent.error);
    return { ok: false, error: 'L’email n’a pas pu être envoyé. Réessayez dans un instant ou contactez Major ECN.' };
  }
  return { ok: true };
}

/** Lien adapté à l'état du compte : confirmation si l'adresse n'est pas confirmée, connexion sinon. */
export async function issueAccessLink(t: TournamentRow, p: ParticipantRow): Promise<IssueResult> {
  if (p.blocked_at || p.anonymized_at) return { ok: true };
  return p.email_confirmed_at ? issueLoginLink(t, p) : issueConfirmationLink(t, p);
}

export type TokenLookup =
  | { status: 'ok'; participant: ParticipantRow; tournament: TournamentRow }
  | { status: 'unknown' | 'expired' | 'blocked' };

/** Lecture sans effet de bord (page d'atterrissage du lien de confirmation). */
export async function lookupConfirmationToken(token: string): Promise<TokenLookup> {
  if (!token) return { status: 'unknown' };
  const { data } = await arenaDb().from('arena_participants').select('*').eq('confirmation_token_hash', hashToken(token)).maybeSingle();
  const p = data as ParticipantRow | null;
  if (!p) return { status: 'unknown' };
  if (p.blocked_at) return { status: 'blocked' };
  const t = await getTournament(p.tournament_id);
  if (!t) return { status: 'unknown' };
  return { status: 'ok', participant: p, tournament: t };
}

/** Lecture sans effet de bord (page d'atterrissage du lien de connexion). */
export async function lookupLoginToken(token: string): Promise<TokenLookup> {
  if (!token) return { status: 'unknown' };
  const { data } = await arenaDb().from('arena_participants').select('*').eq('login_token_hash', hashToken(token)).maybeSingle();
  const p = data as ParticipantRow | null;
  if (!p) return { status: 'unknown' };
  if (!p.login_token_expires_at || new Date(p.login_token_expires_at).getTime() < Date.now()) return { status: 'expired' };
  if (p.blocked_at) return { status: 'blocked' };
  const t = await getTournament(p.tournament_id);
  if (!t) return { status: 'unknown' };
  return { status: 'ok', participant: p, tournament: t };
}

/** Consomme le lien de confirmation : adresse confirmée, email « inscription validée » (une fois), session ouverte. */
export async function consumeConfirmationToken(token: string): Promise<{ ok: true; slug: string; first: boolean } | { ok: false; status: 'unknown' | 'blocked' }> {
  const found = await lookupConfirmationToken(token);
  if (found.status !== 'ok') return { ok: false, status: found.status === 'blocked' ? 'blocked' : 'unknown' };
  const { participant: p, tournament: t } = found;
  const first = !p.email_confirmed_at;
  const db = arenaDb();
  await db.from('arena_participants').update({
    email_confirmed_at: p.email_confirmed_at ?? new Date().toISOString(),
    confirmation_token_hash: null,
    last_login_at: new Date().toISOString(),
  }).eq('id', p.id);
  if (first) {
    await arenaLog({ tournamentId: t.id, kind: 'participant_confirmed', details: `Adresse confirmée pour ${p.pseudo}.` });
    if (t.email_sequence.validated.enabled) {
      const snap = await loadTournamentSnapshot(t);
      const m1 = snap.rounds[0];
      const mail = validatedEmail(t, p, { m1Open: toDate(m1?.opens_at), m1Theme: m1?.theme ?? '', bareme: t.bareme, qrpNs: qrpNs(m1 ? snap.questionsByRound.get(m1.id) ?? [] : []) });
      await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind: 'validated', mail, dedupeKey: `validated:${t.id}:${p.id}` });
    }
  }
  await setSessionCookie(p.id, t.id);
  return { ok: true, slug: t.slug, first };
}

/** Consomme le lien de connexion : session ouverte (et adresse confirmée si elle ne l'était pas). */
export async function consumeLoginToken(token: string): Promise<{ ok: true; slug: string } | { ok: false; status: 'unknown' | 'expired' | 'blocked' }> {
  const found = await lookupLoginToken(token);
  if (found.status !== 'ok') return { ok: false, status: found.status };
  const { participant: p, tournament: t } = found;
  await arenaDb().from('arena_participants').update({
    login_token_hash: null,
    login_token_expires_at: null,
    email_confirmed_at: p.email_confirmed_at ?? new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  }).eq('id', p.id);
  await setSessionCookie(p.id, t.id);
  return { ok: true, slug: t.slug };
}
