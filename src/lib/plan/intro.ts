/**
 * Présentation animée du planificateur — règle d'affichage (module PUR).
 *
 * Montrée sur l'accueil aux élèves concernés (une spécialité de leur formule a
 * son programme dans le planificateur) qui n'ont pas encore créé leur planning.
 * « Plus tard » la repousse de INTRO_DELAY_DAYS jours, au plus INTRO_MAX_DISMISS
 * fois ; créer son planning l'arrête. Rejouable à tout moment depuis le planning.
 */
export const INTRO_DELAY_DAYS = 3;
export const INTRO_MAX_DISMISS = 3;

export function shouldShowIntro(i: {
  enabled: boolean;
  eligible: boolean;
  onboardingDone: boolean;
  seenAt: string | null;
  dismissCount: number;
  now: Date;
}): boolean {
  if (!i.enabled || !i.eligible || i.onboardingDone) return false;
  if (i.dismissCount >= INTRO_MAX_DISMISS) return false;
  if (!i.seenAt) return true;
  const seen = new Date(i.seenAt).getTime();
  if (Number.isNaN(seen)) return true;
  return i.now.getTime() - seen >= INTRO_DELAY_DAYS * 86_400_000;
}
