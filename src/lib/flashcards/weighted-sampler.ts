/**
 * Algorithme de pondération pour les flashcards.
 *
 * Règles :
 * - Une carte jamais vue passe en priorité au début.
 * - Sinon, on tire au hasard sans remise, mais une carte de poids 4 a 4x plus
 *   de chances d'apparaître tôt qu'une carte de poids 1.
 */

export type SampleInput<T> = {
  id: string;
  card: T;
  /** Dernier poids enregistré dans flashcard_reviews. null = jamais vue */
  lastWeight: number | null;
};

export function weightedSample<T>(items: SampleInput<T>[], rng: () => number = Math.random): T[] {
  const unseen = items.filter((i) => i.lastWeight === null);
  const seen = items.filter((i) => i.lastWeight !== null);

  // Shuffle unseen with simple Fisher-Yates
  const shuffledUnseen = [...unseen];
  for (let i = shuffledUnseen.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledUnseen[i], shuffledUnseen[j]] = [shuffledUnseen[j], shuffledUnseen[i]];
  }

  // Weighted shuffle for seen: each card receives weight^random key
  // Card with weight 4 picks ~4× lower key (= earlier) than card with weight 1
  const weightedSeen = seen
    .map((i) => {
      const w = Math.max(1, Math.min(4, i.lastWeight ?? 1));
      const r = rng();
      // Inverse weighting: lower key = earlier; raise random to 1/weight power
      const key = Math.pow(r, 1 / w);
      return { i, key };
    })
    .sort((a, b) => a.key - b.key)
    .map(({ i }) => i);

  return [...shuffledUnseen, ...weightedSeen].map((s) => s.card);
}
