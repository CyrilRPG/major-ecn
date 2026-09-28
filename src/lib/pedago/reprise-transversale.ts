/**
 * Reprise d'une révision transversale sur un autre appareil (28/09/2026).
 *
 * Une session en cours est une ligne de `transversal_progress` par (élève,
 * type de session) : la suite ORDONNÉE des questions servies, le nombre de
 * questions déjà répondues et les scores partiels. La page de session la relit
 * avant de tirer une nouvelle suite (tirage en partie aléatoire : sans cette
 * ligne, un autre appareil ne peut pas retrouver les mêmes questions) ; la
 * ligne disparaît quand la session s'achève.
 *
 * Module PUR (aucun import) : copiable tel quel dans l'app mobile.
 */

export const TABLE_REPRISE = 'transversal_progress';

/** Au-delà, une session abandonnée n'est plus reprise : on en tire une neuve. */
export const REPRISE_DUREE_MAX_MS = 3 * 86_400_000;

export type ScoresPartiels = Record<string, { c: number; t: number }>;

/** Une question de la suite : son id et, pour un dossier, [série, position, total]. */
export type EtapeSuite = { id: string; d: [string, number, number] | null };

export type RepriseTransversale = {
  suite: EtapeSuite[];
  answered: number;
  score: number;
  per_cours: ScoresPartiels;
  per_matiere: ScoresPartiels;
  started_at: string;
  updated_at: string;
};

/** État initial transmis à l'écran de session quand on reprend. */
export type EtatReprise = {
  index: number;
  score: number;
  perCours: ScoresPartiels;
  perMatiere: ScoresPartiels;
  startedAt: string;
};

export const COLONNES_REPRISE = 'suite, answered, score, per_cours, per_matiere, started_at, updated_at';

/** Encode la suite servie (après tous les filtres) pour la ligne de reprise. */
export function encoderSuite(
  questions: { id: string; dossier?: { serie_id: string; position: number; total: number } | null }[],
): EtapeSuite[] {
  return questions.map((q) => ({
    id: q.id,
    d: q.dossier ? [q.dossier.serie_id, q.dossier.position, q.dossier.total] : null,
  }));
}

/** Suite au format attendu par le chargement des questions de la page. */
export function decoderSuite(suite: EtapeSuite[]) {
  return suite.map((e) => ({
    question: { id: e.id },
    dossier: e.d ? { serieId: e.d[0], position: e.d[1], total: e.d[2] } : null,
  }));
}

/** La ligne lue est-elle une session à reprendre (récente, entamée ou non, inachevée) ? */
export function repriseUtilisable(r: RepriseTransversale | null | undefined, maintenant = Date.now()): r is RepriseTransversale {
  if (!r || !Array.isArray(r.suite) || r.suite.length === 0) return false;
  if (!(r.answered >= 0 && r.answered < r.suite.length)) return false;
  const maj = new Date(r.updated_at).getTime();
  return Number.isFinite(maj) && maintenant - maj <= REPRISE_DUREE_MAX_MS;
}

/**
 * Où reprendre dans les questions RECONSTRUITES : une question a pu être
 * retirée entre-temps (dossier écarté par les filtres), on repart donc de la
 * première question non répondue plutôt que d'un index brut.
 */
export function etatDeReprise(r: RepriseTransversale, questionsReconstruites: { id: string }[]): EtatReprise | null {
  const repondues = new Set(r.suite.slice(0, r.answered).map((e) => e.id));
  const index = questionsReconstruites.findIndex((q) => !repondues.has(q.id));
  if (index < 0) return null;
  return {
    index,
    score: r.score,
    perCours: r.per_cours ?? {},
    perMatiere: r.per_matiere ?? {},
    startedAt: r.started_at,
  };
}
