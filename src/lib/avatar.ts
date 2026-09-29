import {
  avatarAuHasard,
  avatarDepuisChaine,
  estAvatarSimple,
  urlPortrait,
} from '@/lib/avatars/portraits';

/**
 * Identité visuelle des comptes Major ECN.
 *
 * Depuis le 29/09/2026, un avatar est l'un des trois cent vingt portraits du
 * catalogue (`lib/avatars/portraits`), choisi trait par trait dans le parcours
 * de `components/avatar/avatar-parcours`. Côté Major ECN, plusieurs comptes
 * peuvent porter le même portrait : seule EVC Arena impose l'unicité.
 */

/** Une graine enregistrable côté Major ECN : un portrait du catalogue, sans suffixe. */
export function isPlatformAvatar(seed: unknown): seed is string {
  return estAvatarSimple(seed);
}

/** Toute nouvelle attribution est un portrait tiré au hasard. */
export function randomAvatarSeed(): string {
  return avatarAuHasard();
}

/**
 * Secours stable pour un profil sans choix lisible : même compte, même
 * portrait. Un portrait enregistré est rendu tel quel.
 */
export function effectiveSeed(id: string, chosen?: string | null): string {
  return isPlatformAvatar(chosen) ? chosen : avatarDepuisChaine(chosen || id);
}

/**
 * URL d'image d'un avatar, pour les surfaces qui n'affichent qu'une URL
 * (application mobile, exports).
 */
export function platformAvatarUrl(seed: string): string {
  return urlPortrait(seed);
}
