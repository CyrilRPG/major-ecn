import { AVATARS_PLANCHE, cheminAvatar, estAvatarPlanche } from '@/components/arena/avatars';
import {
  avatarAuHasard,
  avatarDepuisChaine,
  avatarDepuisPortrait,
  canoniserAvatar,
  estAvatarAutorise,
  estAvatarCompose,
} from '@/lib/avatars/traits';

export { AVATAR_PRESETS } from '@/lib/avatars/presets';

/**
 * Identité visuelle des comptes Major ECN.
 *
 * Depuis septembre 2026, un avatar est une COMBINAISON de traits composée dans
 * l'atelier (`c1-…`, voir `lib/avatars/traits`), et non plus un médaillon
 * choisi dans une planche de vingt-quatre images. Les anciens identifiants
 * restent valides et continuent de s'afficher : personne ne perd le portrait
 * qu'il avait choisi.
 */

/** Ancien catalogue d'images, conservé pour les choix déjà enregistrés. */
export const PLATFORM_AVATARS = AVATARS_PLANCHE.filter((avatar) => avatar.id !== 'casque');

/**
 * Une graine enregistrable côté Major ECN : un médaillon composé du périmètre
 * plateforme, ou un portrait de l'ancienne planche. Le gladiateur reste à
 * l'Arena — c'est la seule restriction de catalogue entre les deux mondes.
 */
export function isPlatformAvatar(seed: unknown): seed is string {
  if (estAvatarCompose(seed)) return estAvatarAutorise(seed, 'plateforme');
  return typeof seed === 'string' && seed !== 'casque' && estAvatarPlanche(seed);
}

/** Toute nouvelle attribution est un médaillon composé du périmètre plateforme. */
export function randomAvatarSeed(): string {
  return avatarAuHasard(Math.random, 'plateforme');
}

/**
 * Secours stable pour un profil sans choix : même compte, même médaillon.
 * Un portrait de l'ancienne planche est promu en médaillon sans ornement :
 * le visage choisi est conservé à l'identique.
 */
export function effectiveSeed(id: string, chosen?: string | null): string {
  if (estAvatarCompose(chosen)) return canoniserAvatar(chosen);
  if (isPlatformAvatar(chosen)) return avatarDepuisPortrait(chosen);
  return avatarDepuisChaine(id, 'plateforme');
}

/**
 * URL d'image d'un avatar : les avatars composés sont rendus par la route
 * `/api/avatar`, qui renvoie un SVG immuable. Indispensable partout où une
 * balise `<img>` est la seule option — application mobile, exports.
 */
export function platformAvatarUrl(seed: string): string {
  const id = effectiveSeed(seed, seed);
  return estAvatarCompose(id) ? `/api/avatar/${id}.svg` : cheminAvatar(id);
}
