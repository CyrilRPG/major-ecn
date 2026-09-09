import type { ArenaRankings } from "./ranking";
import type { RankHistoryEntry } from "./rank-history";
import { ARENA_ROUNDS, individualGeneralRank } from "./format";

export type FinalRound = {
  id: string;
  number: number;
  date: string | null;
  theme: string;
  questionCount: number;
  max: number;
  played: boolean;
  score: number;
  seconds: number;
  rank: number | null;
};
export type FinalVariant =
  | "champion"
  | "silver"
  | "bronze"
  | "top"
  | "standard"
  | "progress";
export type FinalSummary = {
  variant: FinalVariant;
  edition: string;
  rounds: FinalRound[];
  played: number;
  score: number;
  max: number;
  questionCount: number;
  perfect: number;
  totalSeconds: number;
  meanSeconds: number | null;
  wins: number;
  general: ReturnType<typeof individualGeneralRank>;
  topPercent: number | null;
  history: { number: number; rank: number | null; final: boolean }[];
  gap: { label: string; value: number } | null;
  analysis?: { strong: string; weak: string };
};

/** A single view model for all final screens; round ranks never use cumulative ranks. */
export function tournamentFinalSummary(input: {
  participantId: string;
  edition: string;
  afficherEffectifGeneral: boolean;
  rankings: ArenaRankings;
  history: RankHistoryEntry[];
  thresholdPct: number;
  rounds: Omit<FinalRound, "played" | "score" | "seconds" | "rank">[];
  analysis?: FinalSummary["analysis"];
}): FinalSummary {
  const me = input.rankings.standings.find(
    (s) => s.participantId === input.participantId,
  );
  const rounds = input.rounds.map((r) => {
    const result = me?.perRound[r.id];
    const standing = input.rankings.byRound[r.id]?.standings.find(
      (s) => s.participantId === input.participantId,
    );
    return {
      ...r,
      played: Boolean(result),
      score: result?.score ?? 0,
      seconds: result?.duration ?? 0,
      rank: standing?.rank ?? null,
    };
  });
  const played = rounds.filter((r) => r.played);
  const complete =
    played.length === ARENA_ROUNDS && rounds.length === ARENA_ROUNDS;
  const rank = complete ? (me?.rank ?? null) : null;
  const general = individualGeneralRank(
    rank,
    input.rankings.effectifGeneral,
    input.afficherEffectifGeneral,
  );
  const percentile =
    rank && input.rankings.effectifGeneral
      ? (rank / input.rankings.effectifGeneral) * 100
      : null;
  const topPercent =
    percentile !== null && percentile <= 50
      ? Math.max(5, Math.ceil(percentile / 5) * 5)
      : null;
  const variant: FinalVariant = !complete
    ? "progress"
    : rank === 1
      ? "champion"
      : rank === 2
        ? "silver"
        : rank === 3
          ? "bronze"
          : topPercent
            ? "top"
            : "standard";
  const leader = input.rankings.standings.find((s) => s.rank === 1);
  const runnerUp = input.rankings.standings.find(
    (s) => s.rank !== null && s.rank > 1,
  );
  const gap = !complete
    ? null
    : !rank
      ? {
          label: `Écart avec le seuil de ${input.thresholdPct} %`,
          value:
            (me?.totalScore ?? 0) -
            ((me?.totalMax ?? 0) * input.thresholdPct) / 100,
        }
      : rank === 1
        ? runnerUp
          ? {
              label: "Écart avec le suivant",
              value: (me?.totalScore ?? 0) - runnerUp.totalScore,
            }
          : null
        : leader
          ? {
              label: "Écart avec le 1er",
              value: (me?.totalScore ?? 0) - leader.totalScore,
            }
          : null;
  return {
    variant,
    edition: input.edition,
    rounds,
    played: played.length,
    score: me?.totalScore ?? 0,
    max: played.reduce((sum, r) => sum + r.max, 0),
    questionCount: played.reduce((sum, r) => sum + r.questionCount, 0),
    perfect: me?.perfectCount ?? 0,
    totalSeconds: me?.totalDurationSeconds ?? 0,
    meanSeconds: me?.meanTime ?? null,
    wins: rounds.filter((r) => r.rank === 1).length,
    general,
    topPercent,
    history: input.history
      .filter((h) => !h.isFinal)
      .map((h) => ({ number: h.roundNumber, rank: h.rank, final: false }))
      .concat([{ number: 3, rank, final: true }]),
    gap,
    analysis: input.analysis,
  };
}
