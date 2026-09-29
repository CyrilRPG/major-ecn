import { PORTRAITS_BRUTS } from './catalogue';

/**
 * Avatars Major ECN et EVC Arena — portraits peints (29/09/2026).
 *
 * Un avatar est désormais UN des trois cent vingt portraits de
 * `catalogue.ts`, tel quel : on n'y superpose ni cadre ni ornement. La
 * variété vient du catalogue lui-même, que le parcours de choix
 * (`parcours.ts`) permet de parcourir trait par trait.
 *
 * Code enregistré dans `avatar_seed` : `av-NNN` (numéro du portrait sur trois
 * chiffres). Côté EVC Arena seulement, un tournoi plus peuplé que le catalogue
 * reçoit `av-NNN-xxxx` : même image, code distinct — l'unicité par tournoi
 * reste garantie par l'index sans refuser personne.
 *
 * Unicité : EVC Arena uniquement (un portrait par participant d'un même
 * tournoi). Sur Major ECN, plusieurs comptes peuvent porter le même portrait.
 *
 * Les anciens codes (`c1-…` des médaillons composés, `medecin-07` de la
 * planche, graines procédurales) ne sont plus enregistrés, mais restent
 * LISIBLES : ils s'affichent comme un portrait fixe dérivé du code, jamais
 * comme une image cassée.
 *
 * Module SANS directive 'use client' : le serveur et le navigateur
 * l'importent à l'identique.
 */

export const AVATAR_PREFIX = 'av-';

export type Critere =
  | 'genre'
  | 'teint'
  | 'visage'
  | 'cheveux'
  | 'coiffure'
  | 'barbe'
  | 'accessoires'
  | 'tenue'
  | 'expression'
  | 'fond';

/** Ordre des colonnes de `PORTRAITS_BRUTS` — c'est aussi l'ordre du parcours. */
export const CRITERES: Critere[] = [
  'genre',
  'teint',
  'visage',
  'cheveux',
  'coiffure',
  'barbe',
  'accessoires',
  'tenue',
  'expression',
  'fond',
];

export type Portrait = {
  numero: number;
  code: string;
  traits: Record<Critere, string>;
};

const pad = (n: number) => String(n).padStart(3, '0');

export const PORTRAITS: Portrait[] = PORTRAITS_BRUTS.map((ligne, i) => {
  const valeurs = ligne.split(' ');
  const traits = {} as Record<Critere, string>;
  CRITERES.forEach((critere, j) => { traits[critere] = valeurs[j]; });
  return { numero: i + 1, code: `${AVATAR_PREFIX}${pad(i + 1)}`, traits };
});

export const NOMBRE_DE_PORTRAITS = PORTRAITS.length;

const CODE_RE = /^av-(\d{3})(?:-[0-9a-z]{4})?$/;

/** Numéro du portrait désigné par un code valide, sinon `null`. */
export function numeroDe(seed: unknown): number | null {
  if (typeof seed !== 'string') return null;
  const m = CODE_RE.exec(seed);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= NOMBRE_DE_PORTRAITS ? n : null;
}

/** Le code désigne-t-il un portrait du catalogue (suffixe Arena compris) ? */
export function estAvatarPortrait(seed: unknown): seed is string {
  return numeroDe(seed) !== null;
}

/** Code d'un portrait du catalogue, SANS suffixe : ce qu'enregistre Major ECN. */
export function estAvatarSimple(seed: unknown): seed is string {
  return estAvatarPortrait(seed) && seed.length === AVATAR_PREFIX.length + 3;
}

export function codePortrait(numero: number): string {
  return `${AVATAR_PREFIX}${pad(numero)}`;
}

/** Empreinte stable d'une chaîne (FNV-1a) — sert de repli déterministe. */
export function empreinte(source: string): number {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return hash >>> 0;
}

/**
 * Portrait déterministe dérivé d'une chaîne quelconque (identifiant de compte,
 * ancien code). Un compte sans choix lisible affiche toujours le même visage,
 * jamais un tirage à chaque rendu.
 */
export function avatarDepuisChaine(source: string): string {
  return codePortrait(1 + (empreinte(source || 'avatar') % NOMBRE_DE_PORTRAITS));
}

export type Rng = () => number;

export function avatarAuHasard(rng: Rng = Math.random): string {
  return codePortrait(1 + Math.floor(rng() * NOMBRE_DE_PORTRAITS));
}

/**
 * Le portrait AFFICHÉ pour n'importe quelle graine : le portrait lui-même,
 * suffixe retiré, ou — ancien code — un portrait fixe dérivé du code.
 */
export function portraitAffiche(seed: string | null | undefined): Portrait {
  const n = numeroDe(seed);
  if (n !== null) return PORTRAITS[n - 1];
  return PORTRAITS[numeroDe(avatarDepuisChaine(seed ?? ''))! - 1];
}

/** Forme canonique d'un code à enregistrer (ancien code → portrait dérivé). */
export function canoniserAvatar(seed: string | null | undefined): string {
  return estAvatarPortrait(seed) ? seed : portraitAffiche(seed).code;
}

/**
 * Même image, code distinct : réservé aux tournois EVC Arena plus peuplés que
 * le catalogue, pour que l'index d'unicité n'ait jamais à refuser quelqu'un.
 */
export function avatarDoublon(seed: string, rng: Rng = Math.random): string {
  const base = portraitAffiche(seed).code;
  let suffixe = '';
  for (let i = 0; i < 4; i++) suffixe += '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(rng() * 36)];
  return `${base}-${suffixe}`;
}

/** Adresse publique de l'image (WebP 192 px, détourée en disque). */
export function urlPortrait(seed: string | null | undefined): string {
  return `/avatars/portraits/${pad(portraitAffiche(seed).numero)}.webp`;
}

/* ------------------------------------------------------ libellés */

export type OptionCritere = { valeur: string; label: string; swatch?: string };

/** Libellés des valeurs relevées dans le catalogue, dans l'ordre d'affichage. */
export const OPTIONS: Record<Critere, OptionCritere[]> = {
  genre: [
    { valeur: 'F', label: 'Femme' },
    { valeur: 'H', label: 'Homme' },
  ],
  teint: [
    { valeur: 'c', label: 'Clair', swatch: '#f1c9a5' },
    { valeur: 'm', label: 'Mat', swatch: '#c38e63' },
    { valeur: 'f', label: 'Foncé', swatch: '#6b4226' },
  ],
  visage: [
    { valeur: 'a', label: 'Traits fins' },
    { valeur: 'p', label: 'Visage rond' },
  ],
  cheveux: [
    { valeur: 'br', label: 'Bruns', swatch: '#3b2619' },
    { valeur: 'ch', label: 'Châtains', swatch: '#7a5232' },
    { valeur: 'bl', label: 'Blonds', swatch: '#dcb46e' },
    { valeur: 'ro', label: 'Roux', swatch: '#b5532a' },
    { valeur: 'gr', label: 'Gris', swatch: '#b9bcc0' },
    { valeur: 'cv', label: 'Couverts', swatch: '#d8c3b3' },
  ],
  coiffure: [
    { valeur: 'co', label: 'Courts' },
    { valeur: 'lo', label: 'Longs' },
    { valeur: 'qu', label: 'Queue de cheval' },
    { valeur: 'ci', label: 'Chignon' },
    { valeur: 'bo', label: 'Bouclés' },
    { valeur: 'cb', label: 'Calot bleu', swatch: '#6d95c8' },
    { valeur: 'cm', label: 'Calot à motifs', swatch: '#5b6fb0' },
    { valeur: 'cvt', label: 'Calot vert', swatch: '#1f8f86' },
    { valeur: 'cs', label: 'Calot sombre', swatch: '#1c2433' },
    { valeur: 'cr', label: 'Calot bordeaux', swatch: '#8e1d3f' },
    { valeur: 'hj', label: 'Foulard', swatch: '#d8c3b3' },
  ],
  barbe: [
    { valeur: '0', label: 'Rasé' },
    { valeur: '1', label: 'Barbe' },
  ],
  accessoires: [
    { valeur: '-', label: 'Aucun' },
    { valeur: 'l', label: 'Lunettes' },
    { valeur: 'k', label: 'Masque' },
    { valeur: 'lk', label: 'Lunettes et masque' },
    { valeur: 'x', label: 'Loupes frontales' },
    { valeur: 'lx', label: 'Lunettes et loupes' },
    { valeur: 'lkx', label: 'Lunettes, masque et loupes' },
  ],
  tenue: [
    { valeur: 'bb', label: 'Blouse, tenue bleue', swatch: '#3f6fb5' },
    { valeur: 'bv', label: 'Blouse, tenue verte', swatch: '#2b8a7e' },
    { valeur: 'bd', label: 'Blouse, tenue bordeaux', swatch: '#7d2140' },
    { valeur: 'bc', label: 'Blouse, chemise et cravate', swatch: '#9fb6d6' },
    { valeur: 'tb', label: 'Tenue de bloc bleue', swatch: '#5d86c4' },
    { valeur: 'tv', label: 'Tenue de bloc verte', swatch: '#23857a' },
    { valeur: 'td', label: 'Tenue de bloc bordeaux', swatch: '#6f1830' },
    { valeur: 'tn', label: 'Tenue de bloc noire', swatch: '#1b1d22' },
  ],
  expression: [
    { valeur: 's', label: 'Regard au loin' },
    { valeur: 'r', label: 'Souriant' },
  ],
  fond: [
    { valeur: 'marine', label: 'Marine', swatch: '#133a63' },
    { valeur: 'bleu', label: 'Bleu ciel', swatch: '#4f86c6' },
    { valeur: 'rouge', label: 'Rouge', swatch: '#8a1424' },
    { valeur: 'rose', label: 'Rose', swatch: '#ec94a0' },
    { valeur: 'or', label: 'Or', swatch: '#bd8a4f' },
    { valeur: 'sable', label: 'Sable', swatch: '#dfb690' },
    { valeur: 'sarcelle', label: 'Sarcelle', swatch: '#3a9f9f' },
    { valeur: 'nuit', label: 'Nuit', swatch: '#15151b' },
  ],
};

export function libelleOption(critere: Critere, valeur: string): string {
  return OPTIONS[critere].find((o) => o.valeur === valeur)?.label ?? valeur;
}

/** Description textuelle d'un avatar, pour l'alternative des lecteurs d'écran. */
export function decrireAvatar(seed: string | null | undefined): string {
  const t = portraitAffiche(seed).traits;
  const bas = (c: Critere) => libelleOption(c, t[c]).toLowerCase();
  const morceaux = [t.genre === 'F' ? 'soignante' : 'soignant'];
  if (t.cheveux === 'cv') morceaux.push('foulard');
  else morceaux.push(`cheveux ${bas('cheveux')}`, bas('coiffure'));
  if (t.barbe === '1') morceaux.push('barbe');
  if (t.accessoires !== '-') morceaux.push(bas('accessoires'));
  morceaux.push(bas('tenue'), `fond ${bas('fond')}`);
  return `Avatar : ${morceaux.join(', ')}`;
}
