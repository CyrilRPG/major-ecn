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
export function publicRules(t: { questions_per_round: number; seconds_per_question?: number | null; threshold_pct?: number; distinction_pct?: number }): string[] {
  const secondes = t.seconds_per_question ?? DEFAULT_SECONDS_PER_QUESTION;
  const seuil = t.threshold_pct ?? 50;
  const distinction = Math.max(seuil, t.distinction_pct ?? 70);
  return [
  'Trois manches. Les dates et heures d’ouverture et de clôture de chaque manche figurent dans le calendrier du tournoi.',
  `Format prévu : ${t.questions_per_round} questions par manche. Durée par défaut : ${secondes} s par question ; une durée spécifique peut être indiquée pour certaines questions. Une seule tentative. Chaque question est chronométrée séparément : le temps écoulé, on passe à la suivante. Le nombre effectif de questions, le thème et le barème figurent sur l’écran de la manche.`,
  'Corrections après clôture.',
  'Classement cumulatif, provisoire après M1 et M2, final après M3.',
  `Votre personnage est conservé pendant toute l’Arena. Son habillage suit votre distinction cumulée actuelle : Or / Prestige, Argent ou Bronze quand vous occupez la 1re, 2e ou 3e place ET que votre score cumulé atteint ${distinction} % ; Standard dans tous les autres cas. Il peut monter ou redescendre après chaque publication ; vos positions précédentes restent dans votre palmarès personnel.`,
  'Classement général établi sur les participants ayant disputé les trois manches.',
  'Inscription possible en cours de tournoi, y compris pendant une manche ouverte : le temps de jeu est alors limité au temps restant avant la clôture.',
  'Égalité départagée par points, puis réponses parfaites, puis temps moyen par manche.',
  `Sous ${seuil} % de score cumulé, aucun rang affiché et aucune apparition dans le classement public, même avec le meilleur score de la manche ; le seuil est réévalué après chaque manche sur le score cumulé du moment.`,
  `Être premier ne suffit pas : les distinctions Or, Argent et Bronze (trophées EVC Arena) exigent une place sur le podium ET un score d’au moins ${distinction} %. Un premier sous ce seuil est félicité pour sa place, sans trophée.`,
  'Les rangs de manche sont affichés sans effectif sur votre espace. L’effectif général peut accompagner votre rang final selon le paramétrage du tournoi. Il reste visible sur la page publique Meilleurs scores.',
  'EVC Arena est un entraînement ludique, pas un concours blanc.',
  ];
}

/**
 * Message sous le seuil (§7 du cahier initial : jamais de mention de perte de
 * rang ; §3 du complément du 18/09/2026 : « Il reste du travail, mais ne vous
 * arrêtez pas là »).
 */
export const UNDER_THRESHOLD_MESSAGE =
  'Vous n’avez pas encore réussi à intégrer le classement EVC Arena. Il reste du travail, mais ne vous arrêtez pas là : analysez vos erreurs, entraînez-vous et revenez plus fort à chaque manche. Le seuil est réévalué après chaque manche sur votre score cumulé.';

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
