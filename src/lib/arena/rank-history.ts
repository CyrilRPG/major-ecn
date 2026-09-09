import type { Standing } from './ranking';

export type RankHistoryEntry = {
  roundId: string;
  roundNumber: number;
  rank: number | null;
  totalScore: number;
  totalMax: number;
  recordedAt: string;
  isFinal: boolean;
  reconstructed: boolean;
};

/** Snapshot values, not references to the mutable current standings. No identity. */
export function rankingSnapshotRows(standings: readonly Standing[]) {
  return standings.map(s => ({ participant_id: s.participantId, rank: s.rank, total_score: s.totalScore, total_max: s.totalMax }));
}

/** Legacy publications: only the cumulative rounds available at that checkpoint. */
export function roundsAtPublication<T extends { id: string; number: number; results_published_at: string | null }>(rounds: readonly T[], roundId: string): T[] {
  const target = rounds.find(r => r.id === roundId);
  if (!target?.results_published_at) return [];
  const cutoff = new Date(target.results_published_at).getTime();
  return rounds.filter(r => r.results_published_at && (
    new Date(r.results_published_at).getTime() < cutoff ||
    (new Date(r.results_published_at).getTime() === cutoff && r.number <= target.number)
  ));
}
