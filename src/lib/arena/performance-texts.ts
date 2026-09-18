/**
 * EVC Arena — textes du cahier des charges complémentaire (18/09/2026) sur
 * les scores faibles, le classement et les distinctions (§3, §5 à §10, §16,
 * §17). Repris tels quels : ne pas reformuler sans validation de Major ECN.
 *
 * Le client parle de « Battle » ; l'interface dit « manche » partout
 * ailleurs. Les intitulés ci-dessous gardent le vocabulaire du cahier des
 * charges là où il est cité littéralement.
 *
 * Module pur.
 */
import { DISTINCTION_LABEL, ordinalPlace, ordinalRank, outcomeVariant, type RoundOutcome } from './performance';

export type OutcomeCopy = {
  /** Surtitre court (ex. « NON CLASSÉ », « 1re PLACE »). */
  status: string;
  /** Titre principal de l'écran. */
  title: string;
  /** Paragraphes de motivation, dans l'ordre. */
  paragraphs: string[];
  /** Bloc « Prochain objectif ». */
  objective: { title: string; body: string; closing?: string };
};

/** §3 — écran du candidat non classé. */
export const UNRANKED_COPY: OutcomeCopy = {
  status: 'Non classé',
  title: 'Vous n’avez pas encore réussi à intégrer le classement EVC Arena.',
  paragraphs: [
    'Il reste du travail, mais ne vous arrêtez pas là.',
    'Entraînement, régularité, sérieux et détermination : analysez vos erreurs, entraînez-vous chaque jour et revenez plus fort à chaque Battle.',
    'Chaque défi est une nouvelle occasion de progresser, de gagner des places et de vous rapprocher des meilleurs.',
  ],
  objective: {
    title: 'Intégrer le classement EVC Arena',
    body: 'Intégrer le classement EVC Arena et partir à la conquête des trophées de la saison.',
    closing: 'Nous comptons sur vous pour relever les prochains Battles et tenter de vous hisser parmi les meilleurs !',
  },
};

/** §6 — premier du Battle sous le seuil de distinction. */
export function firstWithoutTrophyCopy(): OutcomeCopy {
  return {
    status: '1re place',
    title: 'Vous terminez en tête de ce Battle !',
    paragraphs: [
      'Félicitations ! Vous avez décroché la 1re place de cette manche EVC Arena.',
      'Votre performance montre que vous disposez déjà d’acquis et d’un potentiel à développer.',
      'Vous avez remporté cette manche, mais la compétition ne s’arrête pas là : les trophées EVC Arena sont encore à conquérir.',
      'Continuez à vous entraîner avec sérieux, régularité et détermination. Analysez vos erreurs, consolidez vos connaissances et revenez encore plus fort lors des prochains Battles.',
    ],
    objective: {
      title: 'Décrocher un trophée EVC Arena',
      body: 'Transformer vos premières places en trophées EVC Arena et vous installer parmi les meilleurs de la saison.',
    },
  };
}

/** §8 — deuxième / troisième sous le seuil de distinction. */
export function podiumWithoutTrophyCopy(rank: 2 | 3): OutcomeCopy {
  return {
    status: `${ordinalPlace(rank)} place`,
    title: `Vous terminez ${ordinalRank(rank)} de ce Battle !`,
    paragraphs: [
      'Félicitations, vous faites partie du podium de cette manche.',
      'Votre classement montre que vous êtes sur la bonne voie.',
      'Continuez à vous entraîner pour améliorer votre score, gagner des places et tenter de décrocher votre premier trophée EVC Arena.',
    ],
    objective: {
      title: 'Atteindre le niveau de distinction EVC Arena',
      body: 'Atteindre le niveau de distinction EVC Arena et transformer votre place sur le podium en trophée.',
    },
  };
}

/** §5 — classé, hors podium, sous le seuil de distinction. */
export function rankedCopy(rank: number): OutcomeCopy {
  return {
    status: `${ordinalRank(rank)} du Battle`,
    title: `Vous êtes classé ${ordinalRank(rank)} de ce Battle.`,
    paragraphs: [
      'Vous avez intégré le classement EVC Arena : votre rang est établi parmi les participants de cette manche.',
      'Continuez à vous entraîner pour améliorer votre score, gagner des places et viser le podium.',
    ],
    objective: {
      title: 'Gagner des places',
      body: 'Monter au classement, viser le podium et décrocher un trophée EVC Arena.',
    },
  };
}

/** §17 — niveau de distinction atteint, hors podium. */
export function highCopy(rank: number): OutcomeCopy {
  return {
    status: `${ordinalRank(rank)} du Battle`,
    title: 'Une belle performance. Maintenant, visez encore plus haut.',
    paragraphs: [
      `Vous avez démontré un excellent niveau sur ce Battle et vous êtes classé ${ordinalRank(rank)}.`,
      'Mais à l’approche des EVC, chaque point, chaque minute et chaque automatisme peuvent compter.',
    ],
    objective: {
      title: 'Confirmer cette performance',
      body: 'Votre prochain défi : confirmer cette performance Battle après Battle, monter sur le podium et arriver aux EVC au meilleur niveau possible.',
    },
  };
}

/** §9 / §17 — podium avec distinction. */
export function trophyCopy(o: RoundOutcome & { distinction: NonNullable<RoundOutcome['distinction']> }): OutcomeCopy {
  const label = DISTINCTION_LABEL[o.distinction];
  const rank = o.rank ?? 1;
  return {
    status: `Distinction ${label}`,
    title: rank === 1 ? 'Vous remportez ce Battle avec les honneurs !' : `Vous terminez ${ordinalRank(rank)} de ce Battle avec les honneurs !`,
    paragraphs: [
      `Vous décrochez la distinction ${label} EVC Arena : ${ordinalPlace(rank)} place et niveau de distinction atteint. Cette distinction est conservée dans votre palmarès.`,
      'Vous avez démontré un excellent niveau sur ce Battle. Mais à l’approche des EVC, chaque point, chaque minute et chaque automatisme peuvent compter.',
    ],
    objective: {
      title: 'Viser encore plus haut',
      body: 'Votre prochain défi : confirmer cette performance Battle après Battle, continuer à dominer la saison et arriver aux EVC au meilleur niveau possible.',
    },
  };
}

/** Résultats non encore publiés. */
export const PENDING_COPY: OutcomeCopy = {
  status: 'Classement à venir',
  title: 'Votre score est enregistré.',
  paragraphs: [
    'Le classement de la manche sera publié à sa clôture : vous saurez alors si vous intégrez le classement EVC Arena et à quelle place.',
    'En attendant, analysez vos réponses et préparez le prochain Battle.',
  ],
  objective: {
    title: 'Intégrer le classement EVC Arena',
    body: 'Atteindre le seuil du classement, gagner des places et partir à la conquête des trophées de la saison.',
  },
};

/** Axes de travail des hauts niveaux (§17). */
export const HIGH_PERFORMANCE_AXES = ['Rapidité', 'Précision', 'Automatismes', 'Gestion du temps', 'Régularité'] as const;

/** Sélection du texte selon le résultat. */
export function outcomeCopy(o: RoundOutcome): OutcomeCopy {
  switch (outcomeVariant(o)) {
    case 'pending': return PENDING_COPY;
    case 'unranked': return UNRANKED_COPY;
    case 'podium': return o.rank === 1 ? firstWithoutTrophyCopy() : podiumWithoutTrophyCopy(o.rank as 2 | 3);
    case 'high': return highCopy(o.rank as number);
    case 'trophy': return trophyCopy(o as RoundOutcome & { distinction: NonNullable<RoundOutcome['distinction']> });
    default: return rankedCopy(o.rank as number);
  }
}

/** §10 — aucun candidat classé sur la manche. */
export const NO_RANKED_TITLE = 'Aucun candidat classé pour cette manche';
export const NO_RANKED_BODY = [
  'Le seuil nécessaire pour intégrer le classement EVC Arena n’a pas été atteint cette fois-ci.',
  'Mais le Battle n’est pas terminé pour autant : analysez vos corrections, poursuivez votre entraînement et revenez relever le prochain défi.',
  'Le classement et les trophées restent à conquérir.',
];

/** §16 — phrase de progression par niveau (espace, palmarès). */
export function levelMotto(o: RoundOutcome): string {
  switch (outcomeVariant(o)) {
    case 'unranked': return 'Je veux entrer dans le classement.';
    case 'podium': return o.rank === 1 ? 'J’ai gagné mon Battle. Maintenant je veux mon trophée.' : 'Je suis sur le podium. Je veux mon trophée.';
    case 'trophy': return 'J’ai décroché une distinction. Je veux continuer à dominer la saison.';
    case 'high': return 'Mon niveau est là. Je veux le podium.';
    case 'ranked': return 'Je suis classé. Je veux monter et décrocher un trophée.';
    default: return 'Je dois continuer à m’entraîner.';
  }
}
