import type { Profile } from './get-profile';

/**
 * Essai gratuit / abonnement.
 *
 *   trial_until = NULL     → abonné (accès complet, pas d'expiration)
 *   trial_until > maintenant → essai actif
 *   trial_until ≤ maintenant → essai expiré (accès lecture seule, banner upgrade)
 */

export function isSubscriber(p: Pick<Profile, 'trial_until'> | null | undefined): boolean {
  return !!p && p.trial_until === null;
}

export function isOnTrial(p: Pick<Profile, 'trial_until'> | null | undefined): boolean {
  if (!p?.trial_until) return false;
  return new Date(p.trial_until).getTime() > Date.now();
}

export function isTrialExpired(p: Pick<Profile, 'trial_until'> | null | undefined): boolean {
  if (!p?.trial_until) return false;
  return new Date(p.trial_until).getTime() <= Date.now();
}

export function trialDaysLeft(p: Pick<Profile, 'trial_until'> | null | undefined): number {
  if (!p?.trial_until) return 0;
  const ms = new Date(p.trial_until).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

export function trialUntilForNewSignup(days = 7): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
