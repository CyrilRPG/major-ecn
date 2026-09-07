/**
 * EVC Arena — classement cumulatif (cahier des charges §2.2, §6.13, §7).
 *
 * Module pur, testé. Il travaille sur des données déjà chargées (quelques
 * centaines de participants au plus) : le calcul en TypeScript garde une seule
 * implémentation lisible, vérifiable, réutilisée par l'écran de fin de manche,
 * l'espace participant, les « Meilleurs scores » et les emails.
 *
 * Règles :
 *  - score cumulé = somme des scores des manches dont les résultats sont
 *    publiés ; un participant absent d'une manche y compte 0 (pénalité
 *    mécanique, §2.2) ;
 *  - droit au rang : score cumulé ≥ seuil (50 % par défaut), recalculé à chaque
 *    manche (§7.1) ; au classement final, au moins `minRoundsFinal` manches ;
 *  - départage (§6.13) : points, puis réponses parfaites, puis temps moyen par
 *    manche (le plus faible l'emporte), calculé sur les manches non tronquées ;
 *    un participant dont toutes les manches sont tronquées est classé après les
 *    participants à égalité dont le temps est calculable ;
 *  - aucun effectif n'est jamais exposé par ce module : les écrans n'affichent
 *    que le rang et les entrées des Meilleurs scores.
 */

export type RankingRound = {
  id: string;
  number: number;
  /** Résultats publiés : la manche compte dans le cumul. */
  counted: boolean;
  /** Maximum atteignable (somme des maxima des questions non neutralisées). */
  maxScore: number;
};

export type RankingAttempt = {
  participantId: string;
  roundId: string;
  score: number;
  perfectCount: number;
  durationSeconds: number;
  truncated: boolean;
};

export type RankingParticipant = {
  id: string;
  pseudo: string;
  avatarSeed: string;
  /** Exclu (§10) ou anonymisé : retiré du classement. */
  excluded?: boolean;
};

export type Standing = {
  participantId: string;
  pseudo: string;
  avatarSeed: string;
  roundsPlayed: number;
  totalScore: number;
  /** Somme des maxima des manches comptées (identique pour tous). */
  totalMax: number;
  /** Score cumulé en pourcentage du maximum cumulé (0 si aucune manche comptée). */
  pct: number;
  perfectCount: number;
  /** Temps moyen par manche non tronquée, en secondes ; null si aucune. */
  meanTime: number | null;
  /** Rang affiché, ou null si le participant n'a pas droit au rang. */
  rank: number | null;
  /** Explication de l'absence de rang (jamais affichée telle quelle, §7.1). */
  reason: 'under_threshold' | 'not_enough_rounds' | 'no_round' | null;
  perRound: Record<string, { score: number; perfect: number; duration: number; truncated: boolean } | null>;
};

export type RankingOptions = {
  thresholdPct: number;
  minRoundsFinal: number;
  /** Vrai quand toutes les manches sont comptées : le classement est final. */
  isFinal: boolean;
};

export function computeStandings(
  rounds: readonly RankingRound[],
  attempts: readonly RankingAttempt[],
  participants: readonly RankingParticipant[],
  opts: RankingOptions,
): Standing[] {
  const counted = rounds.filter((r) => r.counted);
  const countedIds = new Set(counted.map((r) => r.id));
  const totalMax = counted.reduce((a, r) => a + r.maxScore, 0);

  const byParticipant = new Map<string, RankingAttempt[]>();
  for (const a of attempts) {
    if (!countedIds.has(a.roundId)) continue;
    const list = byParticipant.get(a.participantId) ?? [];
    list.push(a);
    byParticipant.set(a.participantId, list);
  }

  const standings: Standing[] = [];
  for (const p of participants) {
    if (p.excluded) continue;
    const list = byParticipant.get(p.id) ?? [];
    const perRound: Standing['perRound'] = {};
    for (const r of counted) {
      const a = list.find((x) => x.roundId === r.id);
      perRound[r.id] = a ? { score: a.score, perfect: a.perfectCount, duration: a.durationSeconds, truncated: a.truncated } : null;
    }
    const totalScore = round3(list.reduce((s, a) => s + a.score, 0));
    const perfectCount = list.reduce((s, a) => s + a.perfectCount, 0);
    const timed = list.filter((a) => !a.truncated);
    const meanTime = timed.length ? Math.round(timed.reduce((s, a) => s + a.durationSeconds, 0) / timed.length) : null;
    const pct = totalMax > 0 ? round3((totalScore / totalMax) * 100) : 0;

    let reason: Standing['reason'] = null;
    if (list.length === 0) reason = 'no_round';
    else if (pct < opts.thresholdPct) reason = 'under_threshold';
    else if (opts.isFinal && list.length < opts.minRoundsFinal) reason = 'not_enough_rounds';

    standings.push({
      participantId: p.id,
      pseudo: p.pseudo,
      avatarSeed: p.avatarSeed,
      roundsPlayed: list.length,
      totalScore,
      totalMax: round3(totalMax),
      pct,
      perfectCount,
      meanTime,
      rank: null,
      reason,
      perRound,
    });
  }

  const eligible = standings.filter((s) => s.reason === null);
  eligible.sort(compareStandings);
  let rank = 0;
  for (let i = 0; i < eligible.length; i++) {
    if (i === 0 || compareStandings(eligible[i - 1], eligible[i]) !== 0) rank = i + 1;
    eligible[i].rank = rank;
  }

  return standings.sort((a, b) => {
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank || a.pseudo.localeCompare(b.pseudo, 'fr');
    if (a.rank !== null) return -1;
    if (b.rank !== null) return 1;
    return b.totalScore - a.totalScore || a.pseudo.localeCompare(b.pseudo, 'fr');
  });
}

/** Ordre de départage §6.13 ; 0 = égalité parfaite (même rang). */
export function compareStandings(a: Standing, b: Standing): number {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (b.perfectCount !== a.perfectCount) return b.perfectCount - a.perfectCount;
  if (a.meanTime === null && b.meanTime === null) return 0;
  if (a.meanTime === null) return 1;
  if (b.meanTime === null) return -1;
  return a.meanTime - b.meanTime;
}

export type LeaderboardRow = { rank: number; pseudo: string; avatarSeed: string; totalScore: number; roundsPlayed: number; me: boolean };

/** « Meilleurs scores » (§7.2) : au plus `size` entrées, uniquement les participants ayant droit au rang. */
export function leaderboardRows(standings: readonly Standing[], size: number, meId: string | null = null): LeaderboardRow[] {
  return standings
    .filter((s) => s.rank !== null)
    .slice(0, Math.max(1, size))
    .map((s) => ({ rank: s.rank as number, pseudo: s.pseudo, avatarSeed: s.avatarSeed, totalScore: s.totalScore, roundsPlayed: s.roundsPlayed, me: s.participantId === meId }));
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}
