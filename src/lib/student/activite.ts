/**
 * Accueil — « Votre activité sur les N derniers jours » : règles PURES.
 *
 * Une journée = une date civile (Paris) renvoyée par la RPC
 * `get_activite_quotidienne`. La hauteur du point est le temps de travail
 * MESURÉ (battement des pages d'étude) ; les compteurs ne servent qu'à
 * l'infobulle et au repérage des jours actifs : aucune durée n'est déduite
 * d'un nombre de questions.
 *
 * Ce graphique répond à « quelle a été mon activité réelle ? » : il ne dépend
 * jamais du planificateur (dont le taux de réalisation reste une ligne
 * secondaire de l'infobulle).
 */

export type JourActivite = {
  /** Date civile AAAA-MM-JJ. */
  d: string;
  /** Secondes de travail mesurées. */
  s: number;
  qcm: number;
  cas: number;
  fc: number;
  transv: number;
  epreuves: number;
  parcours: number;
  plan_prevues: number;
  plan_faites: number;
};

export const PERIODES = [7, 30, 90] as const;
export type Periode = (typeof PERIODES)[number];

/** Une journée compte comme active à partir de 5 minutes mesurées (même seuil que l'app mobile). */
export const SECONDES_JOUR_ACTIF = 300;

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

function parties(d: string): [number, number, number] {
  const [a, m, j] = d.split('-').map(Number);
  return [a, m, j];
}

/** « 20 septembre 2026 », « 1er octobre 2026 ». */
export function dateLongue(d: string): string {
  const [a, m, j] = parties(d);
  return `${j === 1 ? '1er' : j} ${MOIS[m - 1]} ${a}`;
}

/** « 02/09 ». */
export function dateCourte(d: string): string {
  const [, m, j] = parties(d);
  return `${String(j).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** « 3 h 20 », « 2 h », « 45 min », « 0 min ». */
export function duree(secondes: number): string {
  const minutes = Math.floor(Math.max(0, secondes) / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

function compteurs(j: JourActivite): number {
  return j.qcm + j.cas + j.fc + j.transv + j.epreuves + j.parcours + j.plan_faites;
}

export function estJourActif(j: JourActivite): boolean {
  return j.s >= SECONDES_JOUR_ACTIF || compteurs(j) > 0;
}

/** Durée affichable : moins d'une minute mesurée = rien de mesuré. */
export function dureeMesuree(j: JourActivite): boolean {
  return j.s >= 60;
}

export type LigneInfobulle = {
  type: 'qcm' | 'cas' | 'fc' | 'transv' | 'epreuves' | 'parcours' | 'plan';
  texte: string;
};

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`;

/** Lignes de l'infobulle : seules les catégories réellement utilisées ce jour-là. */
export function lignesInfobulle(j: JourActivite): LigneInfobulle[] {
  const lignes: LigneInfobulle[] = [];
  if (j.qcm > 0) lignes.push({ type: 'qcm', texte: `${j.qcm} QCM/QROC` });
  if (j.cas > 0) lignes.push({ type: 'cas', texte: pluriel(j.cas, 'cas clinique', 'cas cliniques') });
  if (j.fc > 0) lignes.push({ type: 'fc', texte: pluriel(j.fc, 'flashcard', 'flashcards') });
  if (j.transv > 0) lignes.push({ type: 'transv', texte: pluriel(j.transv, 'révision transversale', 'révisions transversales') });
  if (j.epreuves > 0) lignes.push({ type: 'epreuves', texte: pluriel(j.epreuves, 'épreuve blanche', 'épreuves blanches') });
  if (j.parcours > 0) lignes.push({ type: 'parcours', texte: `${pluriel(j.parcours, 'niveau', 'niveaux')} du Parcours du Major` });
  // Planificateur : information secondaire, toujours en dernière ligne.
  if (j.plan_prevues > 0) {
    const pct = Math.round((Math.min(j.plan_faites, j.plan_prevues) / j.plan_prevues) * 100);
    lignes.push({ type: 'plan', texte: `${pct} % du programme prévu réalisé` });
  }
  return lignes;
}

export type Repere = { valeur: number; libelle: string };

/** Échelle verticale adaptée aux données : minutes sous l'heure, puis pas de 1, 2 ou 4 h. */
export function echelleY(maxSecondes: number): { max: number; reperes: Repere[] } {
  const minutes = (v: number) => (v === 0 ? '0 h' : v % 3600 === 0 ? `${v / 3600} h` : `${v / 60} min`);
  const construire = (max: number, pas: number) => {
    const reperes: Repere[] = [];
    for (let v = 0; v <= max; v += pas) reperes.push({ valeur: v, libelle: minutes(v) });
    return { max, reperes };
  };
  if (maxSecondes <= 1800 && maxSecondes > 0) return construire(1800, 600);
  if (maxSecondes <= 3600) return construire(3600, 900);
  const heures = maxSecondes / 3600;
  const pas = heures <= 5 ? 1 : heures <= 10 ? 2 : 4;
  return construire(Math.ceil(heures / pas) * pas * 3600, pas * 3600);
}

/**
 * Indices des dates affichées sous l'axe : environ 5 à 8 repères selon la
 * largeur, le premier jour toujours repéré, pas régulier.
 */
export function indicesReperes(n: number, largeur: number, ecartMin = 58): number[] {
  if (n <= 1) return n === 1 ? [0] : [];
  const maxReperes = Math.max(2, Math.min(8, Math.floor(largeur / ecartMin) + 1));
  // Plus petit pas qui tient dans le nombre de repères permis.
  let pas = 1;
  while (Math.floor((n - 1) / pas) + 1 > maxReperes) pas++;
  const indices: number[] = [];
  for (let i = 0; i < n; i += pas) indices.push(i);
  return indices;
}

/* ============================================================
   Bandeau : constat calculé sur les données réelles
   ============================================================ */

export type Tendance = 'hausse' | 'baisse' | 'stable' | 'aucune';

export type BilanSemaine = {
  tendance: Tendance;
  joursActifs: number;
  /** Jours actifs de la semaine précédente, sur la même période (lundi → même jour). */
  joursActifsPrecedents: number;
  secondes: number;
  titre: string;
  detail: string;
  conseil: string;
};

function joursDepuisLundi(d: string): number {
  const [a, m, j] = parties(d);
  return (new Date(Date.UTC(a, m - 1, j)).getUTCDay() + 6) % 7;
}

/**
 * Compare la semaine en cours (lundi → aujourd'hui) à la MÊME période de la
 * semaine précédente. Aujourd'hui n'entre dans la comparaison qu'une fois
 * actif : une matinée pas encore commencée ne vaut jamais une « baisse ».
 * Une hausse n'est annoncée que si elle est mesurée.
 */
export function bilanSemaine(jours: JourActivite[]): BilanSemaine {
  const fin = jours.length - 1;
  const aujourdHui = jours[fin];
  const ecoules = aujourdHui ? joursDepuisLundi(aujourdHui.d) + 1 : 0;
  const semaine = jours.slice(Math.max(0, fin - ecoules + 1));
  const joursActifs = semaine.filter(estJourActif).length;
  const secondes = semaine.reduce((n, j) => n + j.s, 0);

  const comparables = aujourdHui && estJourActif(aujourdHui) ? ecoules : ecoules - 1;
  const debutPrecedente = fin - ecoules - 6;
  const precedente = debutPrecedente >= 0 ? jours.slice(debutPrecedente, debutPrecedente + comparables) : [];
  const joursActifsPrecedents = precedente.filter(estJourActif).length;
  const historique = jours.slice(0, Math.max(0, fin - ecoules + 1)).some(estJourActif);
  const semaineComplete = ecoules === 7;

  const n = joursActifs;
  const nJours = `${n} jour${n > 1 ? 's' : ''}`;
  const tempsTravail = secondes >= 60
    ? `${duree(secondes)} de travail réalisé sur Major ECN.`
    : 'Aucun temps de travail mesuré sur Major ECN.';

  let tendance: Tendance;
  if (n === 0) tendance = 'aucune';
  else if (comparables > 0 && debutPrecedente >= 0 && historique && n > joursActifsPrecedents) tendance = 'hausse';
  else if (comparables > 0 && debutPrecedente >= 0 && n < joursActifsPrecedents) tendance = 'baisse';
  else tendance = 'stable';

  const regularite = 'La régularité est la clé de la réussite.';
  switch (tendance) {
    case 'hausse': {
      const avant = joursActifsPrecedents === 0 ? 'aucun' : String(joursActifsPrecedents);
      return {
        tendance, joursActifs: n, joursActifsPrecedents, secondes,
        titre: 'Votre régularité progresse.',
        detail: semaineComplete
          ? `${nJours} actif${n > 1 ? 's' : ''} cette semaine contre ${avant} la semaine précédente.`
          : `${nJours} actif${n > 1 ? 's' : ''} depuis lundi contre ${avant} à la même période la semaine dernière.`,
        conseil: `${regularite} Continuez dans cette dynamique !`,
      };
    }
    case 'baisse':
      return {
        tendance, joursActifs: n, joursActifsPrecedents, secondes,
        titre: `${nJours} actif${n > 1 ? 's' : ''} cette semaine.`,
        detail: 'Reprenez progressivement votre rythme de travail.',
        conseil: `${regularite} Quelques séances courtes suffisent pour relancer la dynamique.`,
      };
    case 'aucune':
      return {
        tendance, joursActifs: 0, joursActifsPrecedents, secondes,
        titre: 'Aucune activité cette semaine pour le moment.',
        detail: 'Chaque séance de travail apparaîtra sur ce graphique.',
        conseil: `${regularite} Une première séance suffit pour lancer la dynamique.`,
      };
    default:
      return {
        tendance, joursActifs: n, joursActifsPrecedents, secondes,
        titre: `Vous avez été actif ${nJours} cette semaine.`,
        detail: tempsTravail,
        conseil: `${regularite} Continuez dans cette dynamique !`,
      };
  }
}
