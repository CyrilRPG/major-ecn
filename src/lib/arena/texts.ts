import { DEFAULT_SECONDS_PER_QUESTION } from './types';
/**
 * EVC Arena — textes imposés par le cahier des charges, à reprendre
 * LITTÉRALEMENT (§2.4, §3.1, §9, §12.2, §19). Ils sont versionnés : la version
 * acceptée est stockée avec chaque consentement (§3.1).
 *
 * Ne pas reformuler sans validation de Major ECN.
 */

export const CONSENT_VERSION = '2026-09-v1';

/** Case 1 — obligatoire (bloque l'inscription si non cochée). */
export const CONSENT_TOURNAMENT =
  'J’accepte que Major ECN traite mes données pour organiser le tournoi EVC Arena : gestion de mon inscription, envoi des convocations, des résultats et des corrections. Mon pseudonyme et mon avatar pourront apparaître publiquement dans le classement.';

/** Case 2 — facultative (n'empêche jamais l'inscription). */
export const CONSENT_MARKETING =
  'Je souhaite recevoir les informations de Major ECN sur la préparation aux EVC : actualités réglementaires, calendrier officiel, offres de formation. Je peux me désinscrire à tout moment.';

/** Avertissement « nature du dispositif » (§9). */
export const WARNING_NATURE =
  'Ceci est un tournoi ludique d’entraînement. Ce n’est pas un concours blanc. Le résultat obtenu ne constitue en aucun cas une évaluation de votre niveau réel ni une indication sur vos chances de réussite aux EVC.';

/** Avertissement « connexion » (§9). */
export const WARNING_CONNECTION =
  'Assurez-vous de disposer d’une connexion internet stable avant de commencer. Le chronomètre continue de tourner en cas de déconnexion.';

/** Avertissement de durée réduite (§2.4), `{n}` = minutes restantes. */
export function warningTruncated(minutesLabel: string): string {
  return `Attention : cette manche se termine dans ${minutesLabel}. Si vous commencez maintenant, vous disposerez de ${minutesLabel} maximum pour répondre. La partie sera automatiquement clôturée à la fermeture de la manche.`;
}

/** Libellé du bouton en durée réduite (§2.4), en capitales comme dans le cahier des charges. */
export function buttonTruncated(minutes: number): string {
  return `COMMENCER LA MANCHE — ${minutes} MIN RESTANTE${minutes > 1 ? 'S' : ''}`;
}

/** Mention discrète après M3 uniquement (§12.2). */
export const COMMERCIAL_AFTER_M3 = 'Vous souhaitez poursuivre votre préparation ? Découvrez l’environnement Major ECN.';

/**
 * Règles publiques (§19).
 *
 * Le nombre de questions et le temps alloué étaient écrits en toutes lettres
 * (« 12 questions, 12 minutes »). Depuis que chaque question porte sa propre
 * durée, ces deux valeurs viennent du tournoi : une règle publique fausse
 * serait pire que pas de règle du tout.
 */
export function publicRules(t: { questions_per_round: number; seconds_per_question?: number | null }): string[] {
  const secondes = t.seconds_per_question ?? DEFAULT_SECONDS_PER_QUESTION;
  return [
  'Trois manches, dates annoncées à l’avance. Chaque manche est ouverte 24 h.',
  `${t.questions_per_round} questions, ${secondes} s par question, une seule tentative. Chaque question est chronométrée séparément : le temps écoulé, on passe à la suivante. Thème et barème annoncés à l’avance.`,
  'Corrections après clôture.',
  'Classement cumulatif, provisoire après M1 et M2, final après M3.',
  'Au moins deux manches pour figurer au classement final.',
  'Inscription possible en cours de tournoi, y compris pendant une manche ouverte : le temps de jeu est alors limité au temps restant avant la clôture.',
  'Égalité départagée par points, puis réponses parfaites, puis temps moyen par manche.',
  'Sous 50 % de score cumulé, aucun rang affiché et aucune apparition dans le classement public ; le seuil est réévalué après chaque manche sur le score cumulé du moment.',
  'Aucun effectif total affiché.',
  'EVC Arena est un entraînement ludique, pas un concours blanc.',
  ];
}

/** Message neutre sous le seuil (§7) — jamais de mention de perte de rang. */
export const UNDER_THRESHOLD_MESSAGE =
  'Vous restez en course. Le classement cumulé s’affiche dès que votre score cumulé atteint le seuil, réévalué après chaque manche. Les corrections détaillées vous aideront à préparer la suivante.';

/** Motifs de signalement (§10.1). */
export const REPORT_MOTIFS: Record<string, string> = {
  erreur_medicale: 'Erreur médicale',
  enonce_ambigu: 'Énoncé ambigu',
  reponse_contestable: 'Réponse contestable',
  recommandation_obsolete: 'Recommandation obsolète',
  autre: 'Autre',
};

/** Pseudonymes interdits (§3.3) — filtre automatique, complété par la modération. */
export const FORBIDDEN_PSEUDO_PATTERNS: RegExp[] = [
  /major\s*ecn/i,
  /\badmin/i,
  /\bmod[ée]rat/i,
  /\bcng\b/i,
  /\bofficiel/i,
  /(merde|putain|connard|salope|encul|nique|pute|bite|couille|nazi|hitler|fdp|ntm)/i,
];

export function pseudoForbidden(pseudo: string): boolean {
  return FORBIDDEN_PSEUDO_PATTERNS.some((re) => re.test(pseudo));
}
