/**
 * « Le conseil du jour » de l'accueil — module PUR (testé).
 *
 * Entièrement automatique : aucune règle ni aucun texte à régler côté
 * administration. Chaque conseil part de la situation RÉELLE de l'élève
 * (ses chiffres, son item en tête de priorités, ses erreurs du mois, la
 * prochaine séance en direct…) et fait découvrir une fonctionnalité qu'il
 * n'utilise pas encore, au moment où elle lui sert.
 *
 * - Un seul conseil à la fois : le plus utile (score), parmi ceux qui
 *   s'appliquent et que l'élève n'a pas écartés.
 * - Un conseil suivi disparaît de lui-même (le fait qui le déclenchait change).
 * - Lassitude : un conseil affiché depuis plus de LASSITUDE_JOURS jours sans
 *   effet passe derrière les autres ; ils tournent ainsi d'un jour à l'autre.
 */

export type ConseilCle =
  | 'checkup' | 'planning' | 'priorites' | 'ciblee' | 'transversale' | 'entrainement-cible'
  | 'epreuve-blanche' | 'parcours' | 'agenda' | 'questions-revoir' | 'notes' | 'mes-entrainements';

export const CONSEIL_CLES: ConseilCle[] = [
  'checkup', 'planning', 'priorites', 'ciblee', 'transversale', 'entrainement-cible',
  'epreuve-blanche', 'parcours', 'agenda', 'questions-revoir', 'notes', 'mes-entrainements',
];

export type FaitsConseil = {
  /** Jours restants avant l'EVC (null : date inconnue). */
  joursAvantEvc: number | null;
  ouverts: { checkup: boolean; moteur: boolean; planning: boolean; parcours: boolean; mesEntrainements: boolean };
  checkupFait: boolean;
  planningCree: boolean;
  /** Items qui demandent du travail (moteur central). */
  itemsAttention: number;
  /** Item en tête des priorités. */
  topItem: string | null;
  revisionCibleeFaite: boolean;
  transversalesFaites: number;
  /** Questions répondues sur 30 jours. */
  questions30j: number;
  /** Erreurs des 30 derniers jours par collège, la plus forte d'abord. */
  erreursParCollege: { nom: string; erreurs: number }[];
  entrainementCibleFait: boolean;
  questionsMisesDeCote: number;
  notes: number;
  parcoursTermines: number;
  epreuvesRemises: number;
  epreuvesDisponibles: number;
  exercicesPerso: number;
  prochaineSeance: { titre: string; jour: string; heure: string | null } | null;
  agendaOuvert: boolean;
  prioritesOuvertes: boolean;
};

export type Conseil = { cle: ConseilCle; titre: string; texte: string; cta: string; href: string; score: number };

/** Au-delà, un conseil resté sans effet passe derrière les autres. */
export const LASSITUDE_JOURS = 3;

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;

/** Tous les conseils qui s'appliquent, avec leur score brut. */
export function conseilsApplicables(f: FaitsConseil): Conseil[] {
  const out: Conseil[] = [];
  const jn = f.joursAvantEvc !== null && f.joursAvantEvc >= 0 ? f.joursAvantEvc : null;

  if (f.ouverts.checkup && !f.checkupFait) {
    out.push({
      cle: 'checkup', score: 100, titre: 'Mesurez votre niveau',
      texte: `${jn !== null ? `À J-${jn}, un` : 'Un'} EVC Check-up situe votre niveau item par item : vos priorités, votre planning et vos révisions s’appuient ensuite sur vos vrais résultats.`,
      cta: 'Faire mon Check-up', href: '/checkup',
    });
  }
  if (f.ouverts.planning && !f.planningCree) {
    out.push({
      cle: 'planning', score: 95, titre: jn !== null ? `Organisez vos ${jn} jours avant l’EVC` : 'Organisez votre préparation',
      texte: 'Mon planning répartit le programme selon vos disponibilités et vous dit chaque jour quoi faire, en tenant compte de vos résultats.',
      cta: 'Créer mon planning', href: '/planificateur',
    });
  }
  if (f.ouverts.moteur && f.itemsAttention > 0 && !f.prioritesOuvertes) {
    out.push({
      cle: 'priorites', score: 90, titre: `${pluriel(f.itemsAttention, 'item')} à retravailler`,
      texte: `Mes priorités vous dit lesquels, pourquoi, et quoi faire${f.topItem ? ` — en tête : ${f.topItem}` : ''}.`,
      cta: 'Voir mes priorités', href: '/mes-priorites',
    });
  }
  if (f.ouverts.moteur && f.itemsAttention > 0 && !f.revisionCibleeFaite) {
    out.push({
      cle: 'ciblee', score: 85, titre: 'Réviser une priorité',
      texte: `${f.topItem ? `« ${f.topItem} »` : 'Votre item en tête'} : une révision ciblée de quelques minutes, au bon moment, pour le remettre d’aplomb (bouton « Réviser » de Mes priorités).`,
      cta: 'Réviser maintenant', href: '/mes-priorites#a_revoir',
    });
  }
  if (f.transversalesFaites === 0 && f.questions30j >= 20) {
    out.push({
      cle: 'transversale', score: 80, titre: 'Entretenez vos acquis',
      texte: `Vous avez répondu à ${f.questions30j} questions ce mois-ci : la révision transversale du jour (15 à 25 minutes) mélange vos spécialités pour ne rien oublier.`,
      cta: 'Faire ma révision du jour', href: '/revisions-transversales',
    });
  }
  const pire = f.erreursParCollege[0];
  if (!f.entrainementCibleFait && pire && pire.erreurs >= 3) {
    out.push({
      cle: 'entrainement-cible', score: 75, titre: `Vos erreurs se concentrent en ${pire.nom}`,
      texte: `${pluriel(pire.erreurs, 'erreur')} ce mois-ci : l’entraînement ciblé vous fait retravailler en priorité les questions que vous ratez le plus.`,
      cta: 'Lancer un entraînement ciblé', href: '/entrainement',
    });
  }
  if (f.epreuvesDisponibles > 0 && f.epreuvesRemises === 0) {
    out.push({
      cle: 'epreuve-blanche', score: jn !== null && jn <= 60 ? 88 : 70, titre: 'Testez-vous en conditions réelles',
      texte: `${f.epreuvesDisponibles > 1 ? `${f.epreuvesDisponibles} épreuves blanches vous attendent` : 'Une épreuve blanche vous attend'} : temps limité, comme le jour J${jn !== null ? ` (dans ${jn} jours)` : ''}. Vos résultats mettent à jour vos priorités.`,
      cta: 'Voir les épreuves blanches', href: '/epreuves-blanches',
    });
  }
  if (f.ouverts.parcours && f.parcoursTermines === 0) {
    out.push({
      cle: 'parcours', score: 65, titre: 'La méthode du Major',
      texte: 'Le Parcours du Major vous apprend à organiser votre travail et à répondre aux questions : commencez par le premier parcours, en quelques minutes.',
      cta: 'Commencer le parcours', href: '/parcours',
    });
  }
  if (f.prochaineSeance && !f.agendaOuvert) {
    out.push({
      cle: 'agenda', score: 60, titre: `Cours en direct ${f.prochaineSeance.jour}${f.prochaineSeance.heure ? ` à ${f.prochaineSeance.heure}` : ''}`,
      texte: `« ${f.prochaineSeance.titre} » : retrouvez toutes les séances de la semaine dans l’agenda, et réservez-y vos propres créneaux de révision.`,
      cta: 'Ouvrir l’agenda', href: '/agenda',
    });
  }
  if (f.questions30j >= 40 && f.questionsMisesDeCote === 0) {
    out.push({
      cle: 'questions-revoir', score: 55, titre: 'Gardez vos questions pièges',
      texte: `Vous avez répondu à ${f.questions30j} questions ce mois-ci : l’étoile en haut à droite d’une question la met de côté dans « Questions à revoir », pour la retravailler avant l’épreuve.`,
      cta: 'Voir Questions à revoir', href: '/revoir',
    });
  }
  if (f.notes === 0 && f.questions30j >= 30) {
    out.push({
      cle: 'notes', score: 40, titre: 'Prenez des notes pendant vos cours',
      texte: 'Chaque item a un onglet « Prise de notes » : vos notes se retrouvent ensuite toutes dans « Prises de notes », par item, collège ou mot-clé.',
      cta: 'Voir mes notes', href: '/notes',
    });
  }
  if (f.ouverts.mesEntrainements && f.exercicesPerso === 0 && f.itemsAttention > 0) {
    out.push({
      cle: 'mes-entrainements', score: 35, titre: 'Créez vos propres flashcards',
      texte: `${f.topItem ? `Sur « ${f.topItem} »` : 'Sur un item qui vous résiste'}, quelques flashcards personnelles fixent la notion difficile. Elles restent visibles de vous seul.`,
      cta: 'Découvrir Mes entraînements', href: '/mes-entrainements',
    });
  }
  return out;
}

/**
 * Le conseil à afficher aujourd'hui (null : rien d'utile à proposer).
 * `vues` : date de PREMIER affichage de chaque conseil (AAAA-MM-JJ) ;
 * `masques` : conseils écartés par l'élève.
 */
export function choisirConseil(
  f: FaitsConseil,
  opts: { aujourdhui: string; vues: Partial<Record<ConseilCle, string>>; masques: Set<string> },
): Conseil | null {
  const jours = (depuis: string) => Math.round((Date.parse(`${opts.aujourdhui}T12:00:00Z`) - Date.parse(`${depuis.slice(0, 10)}T12:00:00Z`)) / 86_400_000);
  const candidats = conseilsApplicables(f)
    .filter((c) => !opts.masques.has(c.cle))
    .map((c) => {
      const vu = opts.vues[c.cle];
      const lasse = vu !== undefined && jours(vu) > LASSITUDE_JOURS;
      return { ...c, score: lasse ? c.score * 0.3 : c.score };
    })
    .sort((a, b) => b.score - a.score || a.cle.localeCompare(b.cle));
  return candidats[0] ?? null;
}
