import { roundState, type RoundWindow } from './time';

/**
 * EVC Arena — « Correction détaillée » d'une manche (§12).
 *
 * Règles d'accès, pures et testables :
 *  - la correction n'existe pour un participant qu'après la clôture de la
 *    manche ET la publication des résultats (règle « corrections après
 *    clôture ») ;
 *  - seul le participant connecté du tournoi concerné (compte actif, ni bloqué
 *    ni anonymisé) y accède ; le personnel en prévisualisation y accède à tout
 *    moment ;
 *  - elle n'est jamais servie sous forme de fichier : ni pièce jointe, ni lien
 *    de téléchargement, ni URL publique. Le PDF éventuel du bucket `arena`
 *    reste réservé au personnel (`/admin/arena`).
 */

export type CorrectionsRoundLike = RoundWindow & { results_published_at: string | null };

export type CorrectionsParticipantLike = {
  id: string;
  tournament_id: string;
  blocked_at: string | null;
  anonymized_at: string | null;
};

export type CorrectionsDenial = 'not_authenticated' | 'wrong_tournament' | 'account_inactive' | 'round_not_closed' | 'results_not_published';

export type CorrectionsAccess =
  | { allowed: true; mode: 'participant' | 'staff' }
  | { allowed: false; reason: CorrectionsDenial };

export function correctionsAccess(input: {
  round: CorrectionsRoundLike;
  tournamentId: string;
  participant: CorrectionsParticipantLike | null;
  staffPreview?: boolean;
  now?: Date;
}): CorrectionsAccess {
  if (input.staffPreview) return { allowed: true, mode: 'staff' };
  const p = input.participant;
  if (!p) return { allowed: false, reason: 'not_authenticated' };
  if (p.tournament_id !== input.tournamentId) return { allowed: false, reason: 'wrong_tournament' };
  if (p.blocked_at || p.anonymized_at) return { allowed: false, reason: 'account_inactive' };
  if (roundState(input.round, input.now) !== 'closed') return { allowed: false, reason: 'round_not_closed' };
  if (!input.round.results_published_at) return { allowed: false, reason: 'results_not_published' };
  return { allowed: true, mode: 'participant' };
}

/** Message affiché au participant quand la correction n'est pas (encore) accessible. */
export function correctionsDenialMessage(reason: CorrectionsDenial, roundNumber: number): string {
  switch (reason) {
    case 'round_not_closed':
      return `La correction détaillée de la manche ${roundNumber} est disponible dans votre espace après la clôture de la manche.`;
    case 'results_not_published':
      return `La correction détaillée de la manche ${roundNumber} sera disponible dans votre espace dès la publication des résultats.`;
    case 'account_inactive':
      return 'Ce compte ne peut plus consulter les corrections.';
    case 'wrong_tournament':
      return 'Cette correction appartient à un autre tournoi que celui de votre session.';
    case 'not_authenticated':
    default:
      return 'Connectez-vous à votre espace EVC Arena pour consulter votre correction détaillée.';
  }
}
