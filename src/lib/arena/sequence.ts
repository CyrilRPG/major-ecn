import 'server-only';
import { arenaDb, arenaLog, computeTournamentStandings, effectiveBareme, listAttemptsForRounds, listParticipants, listTournaments, loadTournamentSnapshot, roundMaxScore, type TournamentSnapshot } from './db';
import { finalizeAttempt } from './grading';
import { relanceEmail, resultsEmail, roundOpeningEmail, roundReminderEmail, sendArenaEmail } from './emails';
import { correctionsPdfSignedUrl } from './pdf-url';
import { remainingLabel, toDate } from './time';
import type { AttemptRow, ParticipantRow, RoundRow, TournamentRow } from './types';

/**
 * EVC Arena — balayage périodique (cron `arena-sweep`, toutes les 5 minutes).
 *
 *  1. clôt les tentatives dont l'échéance est dépassée (§5 : temps écoulé →
 *     partie close, réponses conservées) ;
 *  2. pour chaque tournoi visible du public : fige le barème à l'ouverture de
 *     chaque manche (§6.10), publie les résultats après la clôture (§11,
 *     délai paramétrable), journalise les transitions de statut (§15.1) ;
 *  3. envoie les emails automatiques dus (J-7, J-1, ouverture, relance 3 h,
 *     résultats), chacun protégé par une clé de dédoublonnage ;
 *  4. anonymise les participants des tournois terminés depuis plus de
 *     `retention_days` (§3.1).
 *
 * Tout est idempotent : un balayage relancé ne renvoie rien deux fois.
 */

export type SweepReport = {
  expiredAttempts: number;
  transitions: string[];
  emailsSent: number;
  emailsSkipped: number;
  errors: string[];
  anonymized: number;
};

const GRACE_MS = 15_000;
const H = 3_600_000;
const D = 24 * H;

export async function runArenaSweep(now = new Date()): Promise<SweepReport> {
  const report: SweepReport = { expiredAttempts: 0, transitions: [], emailsSent: 0, emailsSkipped: 0, errors: [], anonymized: 0 };
  const db = arenaDb();

  // 1. Tentatives expirées
  const { data: expired } = await db
    .from('arena_attempts')
    .select('id')
    .eq('status', 'in_progress')
    .lt('deadline_at', new Date(now.getTime() - GRACE_MS).toISOString())
    .limit(500);
  for (const a of (expired ?? []) as { id: string }[]) {
    try {
      await finalizeAttempt(a.id, 'expired', now);
      report.expiredAttempts++;
    } catch (e) {
      report.errors.push(`expire ${a.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 2 + 3. Tournois publics
  const tournaments = await listTournaments();
  for (const t of tournaments) {
    if (t.status === 'draft' || t.status === 'scheduled' || t.status === 'archived') continue;
    try {
      await sweepTournament(t, now, report);
    } catch (e) {
      report.errors.push(`tournoi ${t.slug}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return report;
}

async function sweepTournament(t: TournamentRow, now: Date, report: SweepReport): Promise<void> {
  const db = arenaDb();
  let snap = await loadTournamentSnapshot(t, now);

  // Statut effectif journalisé
  if (snap.status !== t.status) {
    await db.from('arena_tournaments').update({ status: snap.status }).eq('id', t.id);
    await arenaLog({ tournamentId: t.id, kind: 'status', oldValue: t.status, newValue: snap.status, actorLabel: 'cron', details: 'Transition automatique pilotée par les dates.' });
    report.transitions.push(`${t.slug}: ${t.status} → ${snap.status}`);
  }

  // Barème figé à l'ouverture, publication des résultats
  let changed = false;
  for (const r of snap.rounds) {
    const opens = toDate(r.opens_at);
    const closes = toDate(r.closes_at);
    if (!opens || !closes) continue;
    if (now >= opens && !r.bareme_locked_at) {
      await db.from('arena_rounds').update({ bareme_snapshot: t.bareme, bareme_locked_at: now.toISOString() }).eq('id', r.id);
      await arenaLog({ tournamentId: t.id, roundId: r.id, kind: 'bareme_locked', newValue: t.bareme, actorLabel: 'cron', details: `Barème verrouillé à l’ouverture de la manche ${r.number}.` });
      report.transitions.push(`${t.slug}: barème M${r.number} verrouillé`);
      changed = true;
    }
    const delay = (t.email_sequence.results_delay_minutes ?? 0) * 60_000;
    if (now.getTime() >= closes.getTime() + delay && !r.results_published_at) {
      // Toute tentative encore ouverte est close avant publication.
      const open = await listAttemptsForRounds([r.id], true);
      for (const a of open) if (a.status === 'in_progress') await finalizeAttempt(a.id, 'expired', now);
      await db.from('arena_rounds').update({ results_published_at: now.toISOString() }).eq('id', r.id);
      await arenaLog({ tournamentId: t.id, roundId: r.id, kind: 'results_published', actorLabel: 'cron', details: `Résultats de la manche ${r.number} publiés.` });
      report.transitions.push(`${t.slug}: résultats M${r.number} publiés`);
      changed = true;
    }
  }
  if (changed) snap = await loadTournamentSnapshot(t, now);

  await sendDueEmails(snap, now, report);
  await applyRetention(snap, now, report);
}

async function sendDueEmails(snap: TournamentSnapshot, now: Date, report: SweepReport): Promise<void> {
  const t = snap.tournament;
  const seq = t.email_sequence;
  const participants = (await listParticipants(t.id)).filter((p) => p.email_confirmed_at && !p.blocked_at && !p.anonymized_at);
  if (participants.length === 0) return;
  const attempts = await listAttemptsForRounds(snap.rounds.map((r) => r.id));
  const played = new Set(attempts.map((a) => `${a.round_id}:${a.participant_id}`));
  let standings: Awaited<ReturnType<typeof computeTournamentStandings>> | null = null;

  const send = async (p: ParticipantRow, kind: 'j7' | 'j1' | 'opening' | 'relance' | 'results', r: RoundRow, mail: Parameters<typeof sendArenaEmail>[0]['mail']) => {
    const res = await sendArenaEmail({ tournament: t, participant: p, to: p.email, kind, mail, roundId: r.id, dedupeKey: `${kind}:${r.id}:${p.id}` });
    if (res.ok) report.emailsSent++;
    else if (res.skipped) report.emailsSkipped++;
    else report.errors.push(`${kind} ${p.email}: ${res.error}`);
  };

  for (const r of snap.rounds) {
    const opens = toDate(r.opens_at);
    const closes = toDate(r.closes_at);
    if (!opens || !closes) continue;
    const ms = now.getTime();
    const roundInfo = { number: r.number, theme: r.theme, opens_at: opens, closes_at: closes };

    for (const p of participants) {
      const registeredAt = new Date(p.created_at).getTime();
      // J-7 : fenêtre [J-7, J-1) — jamais rattrapé après J-1 (le rappel J-1 prend le relais).
      if (seq.j7.enabled && ms >= opens.getTime() - 7 * D && ms < opens.getTime() - D) {
        await send(p, 'j7', r, roundReminderEmail(t, p, 'j7', roundInfo));
      }
      if (seq.j1.enabled && ms >= opens.getTime() - D && ms < opens.getTime()) {
        await send(p, 'j1', r, roundReminderEmail(t, p, 'j1', roundInfo));
      }
      const hasPlayed = played.has(`${r.id}:${p.id}`);
      if (seq.opening.enabled && ms >= opens.getTime() && ms < closes.getTime() - 3 * H && !hasPlayed) {
        await send(p, 'opening', r, roundOpeningEmail(t, p, roundInfo, remainingLabel(closes.getTime() - ms)));
      }
      if (seq.relance.enabled && ms >= closes.getTime() - 3 * H && ms < closes.getTime() && !hasPlayed && registeredAt < closes.getTime()) {
        await send(p, 'relance', r, relanceEmail(t, p, roundInfo, remainingLabel(closes.getTime() - ms)));
      }
      if (seq.results.enabled && r.results_published_at && registeredAt < closes.getTime()) {
        standings ??= await computeTournamentStandings(snap);
        const st = standings.standings.find((s) => s.participantId === p.id);
        const mine = attempts.find((a) => a.round_id === r.id && a.participant_id === p.id) as AttemptRow | undefined;
        const nextRound = snap.rounds.find((x) => x.number === r.number + 1) ?? null;
        const pdfUrl = r.corrections_pdf_path ? await correctionsPdfSignedUrl(r.corrections_pdf_path) : null;
        await send(p, 'results', r, resultsEmail(t, p, {
          number: r.number,
          theme: r.theme,
          score: mine && mine.status !== 'in_progress' ? Number(mine.score ?? 0) : null,
          max: roundMaxScore(snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)),
          cumulScore: st?.totalScore ?? 0,
          cumulMax: st?.totalMax ?? 0,
          rank: st?.rank ?? null,
          isLast: r.number === Math.max(...snap.rounds.map((x) => x.number)),
          next: nextRound ? { number: nextRound.number, opens_at: toDate(nextRound.opens_at), theme: nextRound.theme } : null,
          pdfUrl,
        }));
      }
    }
  }
}

async function applyRetention(snap: TournamentSnapshot, now: Date, report: SweepReport): Promise<void> {
  const t = snap.tournament;
  if (snap.status !== 'finished') return;
  const lastClose = snap.rounds.map((r) => toDate(r.closes_at)?.getTime() ?? 0).reduce((a, b) => Math.max(a, b), 0);
  if (!lastClose || now.getTime() < lastClose + t.retention_days * D) return;
  const participants = (await listParticipants(t.id)).filter((p) => !p.anonymized_at);
  for (const p of participants) {
    await anonymizeParticipant(p, 'retention');
    report.anonymized++;
  }
  if (participants.length) await arenaLog({ tournamentId: t.id, kind: 'retention', actorLabel: 'cron', details: `${participants.length} participant(s) anonymisé(s) après ${t.retention_days} jours.` });
}

/** Anonymisation (§3.1) : identité effacée, pseudonyme et réponses conservés pour les statistiques agrégées. */
export async function anonymizeParticipant(p: ParticipantRow, reason: 'retention' | 'request'): Promise<void> {
  const db = arenaDb();
  await db.from('arena_participants').update({
    first_name: '',
    last_name: '',
    email: `anonyme-${p.id}@anonymise.invalid`,
    timezone: null,
    confirmation_token_hash: null,
    login_token_hash: null,
    login_token_expires_at: null,
    utm: null,
    acquisition_source: reason === 'request' ? p.acquisition_source : null,
    consent_marketing: false,
    anonymized_at: new Date().toISOString(),
  }).eq('id', p.id);
}
