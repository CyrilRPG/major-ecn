import type { Profile } from './get-profile';

/**
 * Essai gratuit / abonnement.
 *
 *   trial_until = NULL     → abonné (accès complet, pas d'expiration)
 *   trial_until > maintenant → essai actif
 *   trial_until ≤ maintenant → essai expiré (accès lecture seule, banner upgrade)
 *
 * Note : un utilisateur dont le scope contient `espace_decouverte: true` SANS
 * `paid_formule` n'est PAS un abonné — même si son trial_until est null. Cela
 * évite que le banner upgrade soit masqué et que le profil affiche « Abonné »
 * à un user Découverte gratuit.
 */

type IsSubscriberArg = Pick<Profile, 'trial_until' | 'permission_scope'> | Pick<Profile, 'trial_until'> | null | undefined;

function isDecouverteOnly(p: { permission_scope?: unknown } | null | undefined): boolean {
  if (!p?.permission_scope || typeof p.permission_scope !== 'object') return false;
  const s = p.permission_scope as { espace_decouverte?: unknown; paid_formule?: unknown; offer?: unknown };
  if (s.espace_decouverte === true && !s.paid_formule) return true;
  if (s.offer === 'decouverte' && !s.paid_formule) return true;
  return false;
}

export function isSubscriber(p: IsSubscriberArg): boolean {
  if (!p) return false;
  if (isDecouverteOnly(p as { permission_scope?: unknown })) return false;
  return p.trial_until === null;
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
