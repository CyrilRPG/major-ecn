import { parseScope } from '@/lib/auth/permissions';

/**
 * Ouverture du moteur pédagogique à un compte (Mes priorités, EVC Check-up,
 * révision ciblée, programme du jour) : réservé aux formules — l'offre
 * Découverte garde ces modules verrouillés, comme les révisions
 * transversales. L'équipe (admin, professeur) y accède toujours.
 */
export function moteurOuvert(profile: { role?: string | null; permission_scope: unknown }, flag: boolean): boolean {
  if (profile.role && profile.role !== 'student') return true;
  if (!flag) return false;
  return parseScope(profile.permission_scope).offer !== 'decouverte';
}
