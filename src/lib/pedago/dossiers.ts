/**
 * Dossiers progressifs dans les sessions de révision (transversales,
 * consolidation, renforcement).
 *
 * POURQUOI. Ces sessions piochaient les questions une à une, y compris dans
 * les dossiers progressifs. Or la question 5 d'un DP suppose connues les
 * réponses des questions 1 à 4 (le cas évolue : « le patient revient à 48 h… »).
 * Servie seule, elle est intraitable — les élèves l'ont signalé le 18/09/2026.
 *
 * RÈGLE (décision de Cyril, 18/09/2026) :
 *   - QCM et QROC isolés : pioche question par question, comme avant ;
 *   - DP QCM et DP QROC : la série ENTIÈRE, dans l'ordre, ou rien ;
 *   - toute autre série de forme « dossier » (un entraînement à vignette, par
 *     exemple) suit la même règle : un dossier servi est un dossier complet.
 *
 * Un dossier est une série qui porte une vignette (contexte clinique partagé) —
 * c'est le critère que la base elle-même utilise pour poser `kind = 'dp'`
 * (trigger `qcm_series_set_kind`) ; les DP QROC ont `kind = 'qroc'` mais une
 * vignette, ce qui les range ici avec les DP.
 *
 * Module PUR (aucun accès base) : testé dans tests/pedago-dossiers.test.ts.
 */

export type QuestionDossierable = {
  id: string;
  serie_id: string;
  order_index: number;
};

/** Une unité de sélection : un dossier complet (plusieurs questions, dans
 *  l'ordre) ou une question isolée. `serieId` n'est renseigné que pour un
 *  dossier. */
export type UniteRevision<Q> = {
  serieId: string | null;
  questions: Q[];
};

/** Position d'une question au sein de son dossier, pour l'affichage
 *  (« Dossier progressif · question 2/6 »). */
export type PositionDossier = {
  serieId: string;
  position: number;
  total: number;
};

/**
 * Regroupe les questions en unités.
 *
 * `dossiers` associe à chaque série de forme « dossier » son nombre TOTAL de
 * questions en base. Un dossier dont toutes les questions ne sont pas dans
 * `questions` (série tronquée par la pagination, question sans items écartée
 * en amont…) est ÉCARTÉ EN ENTIER : un dossier amputé n'a pas plus de sens
 * qu'une question seule. Les séries absentes de `dossiers` donnent une unité
 * par question.
 */
export function regrouperEnUnites<Q extends QuestionDossierable>(
  questions: readonly Q[],
  dossiers: ReadonlyMap<string, number>,
): { unites: UniteRevision<Q>[]; dossiersIncomplets: string[] } {
  const parSerie = new Map<string, Q[]>();
  const unites: UniteRevision<Q>[] = [];

  for (const q of questions) {
    if (dossiers.has(q.serie_id)) {
      const groupe = parSerie.get(q.serie_id);
      if (groupe) groupe.push(q);
      else parSerie.set(q.serie_id, [q]);
    } else {
      unites.push({ serieId: null, questions: [q] });
    }
  }

  const dossiersIncomplets: string[] = [];
  for (const [serieId, groupe] of parSerie) {
    const total = dossiers.get(serieId) ?? 0;
    if (groupe.length !== total || total === 0) {
      dossiersIncomplets.push(serieId);
      continue;
    }
    groupe.sort((a, b) => a.order_index - b.order_index || a.id.localeCompare(b.id));
    unites.push({ serieId, questions: groupe });
  }

  return { unites, dossiersIncomplets };
}

/**
 * Choisit des unités jusqu'à `n` questions, par priorité croissante.
 *
 * La priorité d'une unité est la MOYENNE des scores de ses questions (plus le
 * score est bas, plus la question est urgente) : un dossier dont une seule
 * question est nouvelle ne passe pas devant une question isolée jamais vue.
 * Un dossier qui ne tient pas dans les places restantes est sauté — jamais
 * coupé — et les places sont comblées par les unités suivantes, plus petites.
 *
 * `scoreDe` doit être DÉTERMINISTE : le bruit aléatoire qui varie les sessions
 * (`bruit × alea()`) est ajouté ici, UNE fois par unité. Ajouté par question,
 * il se moyennait sur un dossier et le rangeait toujours derrière les
 * questions isolées les mieux tirées — un dossier n'apparaissait alors
 * pratiquement jamais dans une session, quelle que soit sa priorité réelle.
 *
 * Le résultat est mélangé PAR UNITÉ : les questions d'un dossier restent
 * contiguës et dans l'ordre, ce sont les dossiers et les questions isolées
 * qui alternent.
 */
export function choisirUnites<Q>(
  unites: readonly UniteRevision<Q>[],
  scoreDe: (q: Q) => number,
  n: number,
  alea: () => number = Math.random,
  bruit = 1.5,
): UniteRevision<Q>[] {
  if (n <= 0) return [];

  const triees = unites
    .filter((u) => u.questions.length > 0)
    .map((u) => ({
      u,
      score: u.questions.reduce((acc, q) => acc + scoreDe(q), 0) / u.questions.length + bruit * alea(),
    }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.u);

  const retenues: UniteRevision<Q>[] = [];
  let compte = 0;
  for (const u of triees) {
    if (compte >= n) break;
    if (compte + u.questions.length > n) continue;
    retenues.push(u);
    compte += u.questions.length;
  }

  for (let i = retenues.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [retenues[i], retenues[j]] = [retenues[j], retenues[i]];
  }
  return retenues;
}

/** Aplatit des unités en une séquence de questions, chacune annotée de sa
 *  position dans son dossier (`null` pour une question isolée). */
export function aplatirUnites<Q>(
  unites: readonly UniteRevision<Q>[],
): { question: Q; dossier: PositionDossier | null }[] {
  const out: { question: Q; dossier: PositionDossier | null }[] = [];
  for (const u of unites) {
    u.questions.forEach((question, i) => {
      out.push({
        question,
        dossier: u.serieId
          ? { serieId: u.serieId, position: i + 1, total: u.questions.length }
          : null,
      });
    });
  }
  return out;
}
