/**
 * Dossiers progressifs dans les sessions de révision (transversales,
 * consolidation, renforcement).
 *
 * POURQUOI. Ces sessions piochaient les questions une à une, y compris dans
 * les dossiers progressifs. Or la question 5 d'un DP suppose connues les
 * réponses des questions 1 à 4 (le cas évolue : « le patient revient à 48 h… »).
 * Servie seule, elle est intraitable — les élèves l'ont signalé le 18/09/2026.
 *
 * RÈGLE (décision de Cyril, 18/09/2026, précisée le 20/09/2026) :
 *   - une série de QUESTIONS ISOLÉES : pioche question par question ;
 *   - TOUTE AUTRE série : la série ENTIÈRE, dans l'ordre, ou rien.
 *
 * Le 18/09, seule la vignette (contexte clinique partagé, critère du trigger
 * `qcm_series_set_kind`) faisait d'une série un dossier. C'était insuffisant :
 * deux jours plus tard, des élèves recevaient encore « Sujet 7 — Question 3 :
 * tous les critères de bénignité de ce phénomène sont réunis… » seule. La
 * question venait d'une ANNALE (36 QROC, dix sujets, aucune vignette de série :
 * le cas clinique de chaque sujet est dans sa première question). Même forme
 * pour les entraînements EVC (50 questions à cas enchaînés), les séances du
 * professeur, les sujets de concours importés en bloc.
 *
 * La règle est donc INVERSÉE : une question n'est servie seule que si sa série
 * est reconnue comme une série de questions isolées — sans vignette, ni DP, ni
 * annale, ni entraînement, ni séance, et courte (voir
 * `estSerieDeQuestionsIsolees`). Le doute profite au dossier : une série
 * d'un type inconnu est servie entière, jamais dépecée.
 *
 * Module PUR (aucun accès base) : testé dans tests/pedago-dossiers.test.ts.
 */
import { estSerieAnnale } from '../data/annales';

/** Ce qu'il faut savoir d'une série pour décider de sa forme. */
export type SerieForme = {
  label: string | null;
  vignette: string | null;
  /** `qcm_series.type` : 'qcm', 'qroc' ou 'seance' (séance du professeur). */
  type?: string | null;
  /** Nombre TOTAL de questions de la série en base. */
  nbQuestions: number;
};

/**
 * Taille maximale d'une série de questions isolées.
 *
 * Les séries de questions isolées sont générées par cinq (« QCM — Série 3 ·
 * … », « QROC 2 · … », « Série 8 »). Une série plus longue sans vignette est,
 * dans toute la base au 20/09/2026, un sujet importé d'un bloc dont les
 * questions s'enchaînent : annales (12 à 40 questions), entraînements EVC
 * (25 à 53), révision générale (354), sujets de concours à cas cliniques
 * (16 à 60). Aucune série de questions isolées ne dépasse dix questions.
 */
export const MAX_QUESTIONS_SERIE_ISOLEE = 10;

/**
 * Une série se pioche question par question SEULEMENT si c'est une série de
 * questions isolées. Tout le reste est servi entier ou pas du tout.
 *
 * Est servie entière une série :
 *   - à vignette (dossier progressif, DP QCM comme DP QROC) ;
 *   - libellée « DP … » même sans vignette saisie ;
 *   - d'annales (« Annales - <Collège> - <Année> … ») : dix sujets de plusieurs
 *     questions, le cas clinique dans la première question de chaque sujet ;
 *   - d'entraînement (« Entraînement n°1 », « Entraînement EVC 2025 — QROC ») ;
 *   - de séance du professeur (`type = 'seance'`) ;
 *   - de plus de MAX_QUESTIONS_SERIE_ISOLEE questions : un sujet importé.
 */
export function estSerieDeQuestionsIsolees(s: SerieForme): boolean {
  if (s.vignette && s.vignette.trim()) return false;
  if (s.type === 'seance') return false;
  const label = (s.label ?? '').trim();
  if (/^dp\b/i.test(label)) return false;
  if (estSerieAnnale(label)) return false;
  if (/entra[iî]nement/i.test(label)) return false;
  if (/s[ée]ance/i.test(label)) return false;
  if (s.nbQuestions > MAX_QUESTIONS_SERIE_ISOLEE) return false;
  return true;
}

/**
 * Ligne de série telle que les pages la lisent (PostgREST) :
 * `select('id, label, type, vignette, qcm_questions(count)')`.
 */
export type SerieRowForme = {
  id: string;
  label: string | null;
  type?: string | null;
  vignette: string | null;
  qcm_questions: { count: number }[] | null;
};

/** Passe d'une ligne PostgREST à la forme attendue par `dossiersDepuisSeries`. */
export function formeDeSerie(s: SerieRowForme): SerieForme & { id: string } {
  return {
    id: s.id,
    label: s.label,
    type: s.type ?? null,
    vignette: s.vignette,
    nbQuestions: s.qcm_questions?.[0]?.count ?? 0,
  };
}

/**
 * Carte des séries à servir entières (id → nombre TOTAL de questions), telle
 * que l'attend `regrouperEnUnites`. Toute série qui n'est pas une série de
 * questions isolées y figure.
 */
export function dossiersDepuisSeries<S extends SerieForme & { id: string }>(
  series: readonly S[],
): Map<string, number> {
  const out = new Map<string, number>();
  for (const s of series) {
    if (!estSerieDeQuestionsIsolees(s)) out.set(s.id, s.nbQuestions);
  }
  return out;
}

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
 * `dossiers` associe à chaque série servie entière (voir
 * `dossiersDepuisSeries`) son nombre TOTAL de questions en base. Un dossier
 * dont toutes les questions ne sont pas dans `questions` (série tronquée par
 * la pagination, question sans items écartée en amont…) est ÉCARTÉ EN ENTIER :
 * un dossier amputé n'a pas plus de sens qu'une question seule. Les séries
 * absentes de `dossiers` (séries de questions isolées) donnent une unité par
 * question.
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
