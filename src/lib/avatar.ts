/**
 * Avatars « dessin » procéduraux — générés déterministiquement à partir d'une
 * graine (seed). Aucune dépendance externe : tout est dessiné en SVG par
 * <DrawnAvatar /> à partir des paramètres renvoyés ici.
 */

/** Hash FNV-1a 32 bits d'une chaîne. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG déterministe (mulberry32) initialisé par la graine. */
export function rngFromSeed(seed: string): () => number {
  let a = hashSeed(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BG = ['#FDE68A', '#FBCFE8', '#BFDBFE', '#BBF7D0', '#DDD6FE', '#FECACA', '#A7F3D0', '#FED7AA'];
const SKIN = ['#F8D9C0', '#F1C9A5', '#E0AC8B', '#C68642', '#8D5524', '#FFE0BD'];
const HAIR = ['#2E2A28', '#4B3621', '#8C5A2B', '#C19A6B', '#6B1A2A', '#1F2A44', '#9CA3AF', '#E8742C'];

export type AvatarParams = {
  bg: string;
  skin: string;
  hair: string;
  hairStyle: number; // 0..4
  eyes: number; // 0..3
  mouth: number; // 0..4
  glasses: boolean;
  freckles: boolean;
};

const pick = <T,>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)];

/** Dérive les paramètres de dessin d'un avatar à partir de sa graine. */
export function avatarParams(seed: string): AvatarParams {
  const r = rngFromSeed(seed || 'major-ecn');
  return {
    bg: pick(r, BG),
    skin: pick(r, SKIN),
    hair: pick(r, HAIR),
    hairStyle: Math.floor(r() * 5),
    eyes: Math.floor(r() * 4),
    mouth: Math.floor(r() * 5),
    glasses: r() < 0.35,
    freckles: r() < 0.4,
  };
}

/** Graine aléatoire (changement d'avatar). */
export function randomAvatarSeed(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Graine effective : la graine choisie, sinon l'id (avatar stable par défaut). */
export function effectiveSeed(id: string, chosen?: string | null): string {
  return chosen && chosen.trim() ? chosen : id;
}
