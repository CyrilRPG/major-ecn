import { computeArenaRankings, type RankingAttempt } from "@/lib/arena/ranking";
import {
  tournamentFinalSummary,
  type FinalVariant,
} from "@/lib/arena/final-summary";
import { DEFAULT_ARENA_AVATAR } from "@/components/arena/avatars";

export function finalFixture(variant: FinalVariant, showEffectif: boolean) {
  const rounds = [1, 2, 3].map((number, i) => ({
    id: `r${number}`,
    number,
    counted: true,
    maxScore: 20,
    date: `2026-09-${[20, 25, 28][i]}T10:00:00Z`,
    theme: "Médecine interne",
    questionCount: 20,
    max: 20,
  }));
  const participants = Array.from({ length: 100 }, (_, i) => ({
    id: `p${i}`,
    pseudo: `DrArena${i}`,
    avatarSeed: DEFAULT_ARENA_AVATAR,
  }));
  const values =
    variant === "champion"
      ? [20, 20, 20]
      : variant === "silver"
        ? [19.5, 19, 20]
        : variant === "bronze"
          ? [19, 19, 19.5]
          : variant === "top"
            ? [18.5, 18.5, 18.5]
            : variant === "progress"
              ? [20, 17.5]
              : [8, 9, 9.5];
  const attempts: RankingAttempt[] = participants.flatMap((p, i) =>
    (i === 0 ? values : [20 - i / 12, 20 - i / 12, 20 - i / 12]).map(
      (value, j) => ({
        participantId: p.id,
        roundId: `r${j + 1}`,
        score: value,
        perfectCount: Math.floor(value),
        durationSeconds: i === 0 ? [542, 571, 581][j] : 600 + i,
        truncated: false,
      }),
    ),
  );
  if (variant === "silver" || variant === "bronze") {
    const ahead = variant === "silver" ? 1 : 2;
    for (const a of attempts)
      if (a.participantId !== "p0")
        a.score = Number(a.participantId.slice(1)) <= ahead ? 20 : 15;
  }
  if (variant === "top")
    for (const a of attempts)
      if (a.participantId !== "p0")
        a.score = Number(a.participantId.slice(1)) <= 9 ? 20 : 15;
  const rankings = computeArenaRankings(rounds, attempts, participants, {
    thresholdPct: 50,
    minRoundsFinal: 3,
    isFinal: true,
  });
  const ranks =
    variant === "champion"
      ? [1, 1]
      : variant === "silver"
        ? [3, 2]
        : variant === "bronze"
          ? [4, 3]
          : variant === "top"
            ? [15, 10]
            : [null, null];
  return tournamentFinalSummary({
    participantId: "p0",
    edition: "2026",
    afficherEffectifGeneral: showEffectif,
    rankings,
    rounds,
    thresholdPct: 50,
    history: ranks.map((rank, i) => ({
      roundId: `r${i + 1}`,
      roundNumber: i + 1,
      rank,
      totalScore: 20,
      totalMax: 20,
      recordedAt: "2026-09-20",
      isFinal: false,
      reconstructed: false,
    })),
    analysis: {
      strong: variant === "progress" ? "QCM de connaissances" : "QRU",
      weak: variant === "progress" ? "Questions à raisonnement" : "QRM",
    },
  });
}
