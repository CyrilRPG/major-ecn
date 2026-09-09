import { AVATARS_PLANCHE, cheminAvatar } from '@/components/arena/avatars';

/** Le catalogue pédagogique partage les images Arena, sans le gladiateur. */
export const PLATFORM_AVATARS = AVATARS_PLANCHE.filter((avatar) => avatar.id !== 'casque');
const IDS = new Set(PLATFORM_AVATARS.map((avatar) => avatar.id));

export function isPlatformAvatar(seed: unknown): seed is string {
  return typeof seed === 'string' && IDS.has(seed);
}

export function randomAvatarSeed(): string {
  return PLATFORM_AVATARS[Math.floor(Math.random() * PLATFORM_AVATARS.length)].id;
}

/** Secours stable pour un ancien profil ; les nouveaux choix sont persistés en base. */
export function effectiveSeed(id: string, chosen?: string | null): string {
  if (isPlatformAvatar(chosen)) return chosen;
  let hash = 2166136261;
  for (let i = 0; i < id.length; i++) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
  }
  return PLATFORM_AVATARS[(hash >>> 0) % PLATFORM_AVATARS.length].id;
}

export function platformAvatarUrl(seed: string): string {
  return cheminAvatar(effectiveSeed(seed, seed));
}
