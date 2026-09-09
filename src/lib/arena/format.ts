export const ARENA_ROUNDS = 3;
export const ARENA_QUESTIONS_PER_ROUND = 20;
export const GENERAL_RANKING_NOTICE =
  "Classement général établi sur les participants ayant disputé les trois manches.";

/** Rounded once in the ranking engine; the UI only formats these seconds. */
export function meanRoundSeconds(
  totalSeconds: number,
  roundsPlayed: number,
): number | null {
  return roundsPlayed > 0 ? Math.round(totalSeconds / roundsPlayed) : null;
}

export function durationText(seconds: number | null): string {
  if (seconds === null) return "—";
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)} min ${String(whole % 60).padStart(2, "0")} s`;
}

/** Rank and denominator are one value, so a hidden rank cannot leak an effectif. */
export function individualGeneralRank(
  rank: number | null,
  effectif: number,
  showEffectif: boolean,
): { rank: number; effectif: number | null; text: string } | null {
  if (rank === null) return null;
  const denominator = showEffectif ? effectif : null;
  return {
    rank,
    effectif: denominator,
    text: `${rank}${rank === 1 ? "er" : "e"}${denominator !== null ? ` sur ${denominator}` : ""} du classement général`,
  };
}
