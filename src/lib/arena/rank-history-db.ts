import 'server-only';
import { arenaDb, computeTournamentStandings, getRound, getTournament, loadTournamentSnapshot } from './db';
import { rankingSnapshotRows, roundsAtPublication, type RankHistoryEntry } from './rank-history';

/** Publication + immutable ranking checkpoint are committed in one transaction.
 * The same operation serves cron and administration, and is safe to retry.
 * Existing publications without a snapshot are explicitly marked reconstructed.
 */
export async function publishArenaRound(roundId: string, now = new Date()): Promise<void> {
  for (let retry = 0; retry < 3; retry++) {
    const round = await getRound(roundId);
    if (!round) throw new Error('Manche introuvable.');
    if (round.ranking_snapshot_at) return;
    const tournament = await getTournament(round.tournament_id);
    if (!tournament) throw new Error('Tournoi introuvable.');
    const snap = await loadTournamentSnapshot(tournament, now);
    const publishedIds = snap.rounds.filter(r => r.results_published_at).map(r => r.id);
    const reconstructed = Boolean(round.results_published_at);
    const recordedAt = round.results_published_at ?? now.toISOString();
    const included = reconstructed ? new Set(roundsAtPublication(snap.rounds, roundId).map(r => r.id)) : new Set([...publishedIds, roundId]);
    const checkpoint = {
      ...snap,
      rounds: snap.rounds.map(r => ({ ...r, results_published_at: included.has(r.id) ? r.results_published_at ?? recordedAt : null })),
    };
    const { standings, isFinal } = await computeTournamentStandings(checkpoint, reconstructed ? recordedAt : undefined);
    const { data, error } = await arenaDb().rpc('arena_publish_ranking_snapshot', {
      p_round_id: roundId,
      p_expected_published_ids: publishedIds,
      p_recorded_at: recordedAt,
      p_is_final: isFinal,
      p_reconstructed: reconstructed,
      p_entries: rankingSnapshotRows(standings),
    });
    if (error) throw new Error(`Publication du classement : ${error.message}`);
    if (data === true) return;
    // Another round was published concurrently: recompute from the new cumul.
  }
  throw new Error('Le classement a changé pendant la publication. Réessayez.');
}

/** Private only: caller obtains participantId from currentParticipant, never input. */
export async function participantRankHistory(participantId: string): Promise<RankHistoryEntry[]> {
  const { data, error } = await arenaDb().from('arena_rank_history')
    .select('round_id, round_number, rank, total_score, total_max, recorded_at, is_final, reconstructed')
    .eq('participant_id', participantId).order('recorded_at').order('round_number');
  if (error) throw new Error(`Palmarès indisponible : ${error.message}`);
  return (data ?? []).map((row: Record<string, unknown>) => ({
    roundId: String(row.round_id), roundNumber: Number(row.round_number), rank: row.rank === null ? null : Number(row.rank),
    totalScore: Number(row.total_score), totalMax: Number(row.total_max), recordedAt: String(row.recorded_at),
    isFinal: Boolean(row.is_final), reconstructed: Boolean(row.reconstructed),
  }));
}
