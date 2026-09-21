import { AVATARS_PLANCHE } from '@/components/arena/avatars';

/**
 * Avatars composés — catalogue des traits et encodage.
 *
 * Le VISAGE reste l'un des vingt-quatre portraits fournis par Major ECN : ce
 * sont des illustrations peintes, on ne leur change ni la tenue ni les
 * lunettes. Ce qui se compose, c'est le MÉDAILLON autour d'eux — champ
 * coloré, motif, cadre ouvragé, liseré, emblème. Vingt-quatre visages
 * multipliés par les ornements donnent plusieurs millions de médaillons
 * distincts : de quoi garantir un avatar unique par participant sur une Arena
 * de plusieurs centaines d'inscrits.
 *
 * L'identifiant part en base dans la colonne `avatar_seed` existante, sous la
 * forme `c1-<un caractère base 36 par emplacement>` : aucune colonne nouvelle,
 * et les anciennes graines (identifiant de portrait seul, emblèmes
 * procéduraux) restent lisibles côté rendu.
 *
 * Module SANS directive 'use client' : le serveur et le navigateur
 * l'importent à l'identique.
 */

export const AVATAR_CODE_PREFIX = 'c1-';

/** Familles d'onglets de l'atelier, dans l'ordre d'affichage. */
export type TraitGroup = 'portrait' | 'cadre' | 'fond' | 'embleme';

/**
 * Les étapes de l'atelier, DANS L'ORDRE. L'emblème vient en dernier : c'est à
 * la dernière étape seulement que la combinaison est complète, donc la seule
 * où l'on peut dire ce qui est déjà pris.
 */
export const TRAIT_GROUPS: { id: TraitGroup; label: string; consigne: string }[] = [
  { id: 'portrait', label: 'Portrait', consigne: 'Choisissez votre visage.' },
  { id: 'fond', label: 'Fond', consigne: 'La couleur du champ et son motif.' },
  { id: 'cadre', label: 'Cadre', consigne: 'L’orfèvrerie autour du portrait.' },
  { id: 'embleme', label: 'Emblème', consigne: 'Dernière touche — et vérification de disponibilité.' },
];

/** Dernière étape : la seule où la combinaison est complète. */
export const DERNIER_GROUPE = TRAIT_GROUPS[TRAIT_GROUPS.length - 1].id;

export type TraitKey =
  | 'portrait'
  | 'fond'
  | 'motif'
  | 'cadre'
  | 'couleurCadre'
  | 'lisere'
  | 'embleme';

/**
 * ORDRE FIGÉ : la position dans ce tableau est la position du caractère dans
 * le code. Ne jamais réordonner ni retirer un emplacement — seulement en
 * ajouter à la fin, sinon tous les avatars enregistrés changent d'apparence.
 */
export const TRAIT_ORDER: TraitKey[] = [
  'portrait',
  'fond',
  'motif',
  'cadre',
  'couleurCadre',
  'lisere',
  'embleme',
];

export type TraitOption = {
  /** Libellé lisible, repris dans l'alternative textuelle et l'atelier. */
  label: string;
  /** Pastille de couleur de l'atelier, quand le trait est une couleur. */
  swatch?: string;
};

export type TraitDefinition = {
  key: TraitKey;
  label: string;
  group: TraitGroup;
  /** Les couleurs s'affichent en pastilles, le reste en vignettes d'avatar. */
  kind: 'forme' | 'couleur';
  options: TraitOption[];
};

/* ------------------------------------------------------------- palettes */

/** Champ du médaillon : dégradé haut/bas et couleur du motif. */
export const FONDS = [
  { label: 'Nuit', haut: '#1B2430', bas: '#080B11', motif: '#7C8CA3' },
  { label: 'Rouge Arena', haut: '#8E1024', bas: '#3A0610', motif: '#FF6B7E' },
  { label: 'Or', haut: '#A9832F', bas: '#4B3610', motif: '#F0D48A' },
  { label: 'Marine', haut: '#223B63', bas: '#0C1830', motif: '#7FA6DE' },
  { label: 'Olive', haut: '#445E2E', bas: '#1C2916', motif: '#9DC172' },
  { label: 'Pourpre', haut: '#4C2B69', bas: '#1F1130', motif: '#B58CE0' },
  { label: 'Bronze', haut: '#7C5029', bas: '#33200F', motif: '#DDA268' },
  { label: 'Sarcelle', haut: '#1B565E', bas: '#07242A', motif: '#68BFC7' },
  { label: 'Prune', haut: '#61223E', bas: '#280D1A', motif: '#C4718F' },
  { label: 'Ardoise', haut: '#333B47', bas: '#12161D', motif: '#93A1B4' },
] as const;

/** Métaux et émaux du cadre : lumière, corps, ombre. */
export const COULEURS_CADRE = [
  { label: 'Or', clair: '#FFF0B4', base: '#D9AE45', sombre: '#7E5A11' },
  { label: 'Argent', clair: '#FFFFFF', base: '#B9C1CD', sombre: '#5F6773' },
  { label: 'Bronze', clair: '#F2C89A', base: '#B3763F', sombre: '#5E3A1C' },
  { label: 'Acier', clair: '#DCE6F2', base: '#7C8B9E', sombre: '#3A4653' },
  { label: 'Rouge Arena', clair: '#FF8A99', base: '#E4002B', sombre: '#6E0416' },
  { label: 'Marine', clair: '#9DBCEA', base: '#3B639F', sombre: '#182F52' },
  { label: 'Émeraude', clair: '#95E0BE', base: '#2E9068', sombre: '#124434' },
  { label: 'Pourpre', clair: '#CDA5EC', base: '#7B4BA8', sombre: '#38205A' },
  { label: 'Ivoire', clair: '#FFFFFF', base: '#E6DCC6', sombre: '#9A8E72' },
  { label: 'Obsidienne', clair: '#8A93A1', base: '#2B313A', sombre: '#0A0D12' },
] as const;

/* ------------------------------------------------------------- catalogue */

const opts = (labels: readonly string[]): TraitOption[] => labels.map((label) => ({ label }));

export const CADRES = [
  'Sans cadre',
  'Anneau simple',
  'Double filet',
  'Couronne de laurier',
  'Grecque',
  'Crénelé',
  'Rayons',
  'Cordage',
] as const;

export const LISERES = [
  'Aucun',
  'Filet fin',
  'Double filet',
  'Perles',
  'Denticules',
  'Tresse',
] as const;

export const MOTIFS = ['Uni', 'Halo', 'Rayons', 'Laurier', 'Colonnes', 'Grecque'] as const;

/**
 * Emblèmes du médaillon : les six emblèmes de la planche Major ECN, plus le
 * casque spartiate. Aucun dessin nouveau — ce sont les images existantes,
 * réduites en pastille.
 */
export const EMBLEMES = [
  { label: 'Aucun', id: null },
  { label: 'Casque spartiate', id: 'casque' },
  { label: 'Lion', id: 'lion' },
  { label: 'Hibou', id: 'hibou' },
  { label: 'Statue antique', id: 'statue' },
  { label: 'Caducée et laurier', id: 'caducee' },
  { label: 'Livre ouvert', id: 'livre' },
  { label: 'Sommet', id: 'sommet' },
] as const;

export const TRAITS: Record<TraitKey, TraitDefinition> = {
  portrait: {
    key: 'portrait',
    label: 'Portrait',
    group: 'portrait',
    kind: 'forme',
    options: AVATARS_PLANCHE.map((a) => ({ label: a.label })),
  },
  fond: {
    key: 'fond',
    label: 'Couleur du fond',
    group: 'fond',
    kind: 'couleur',
    options: FONDS.map((f) => ({ label: f.label, swatch: f.haut })),
  },
  motif: { key: 'motif', label: 'Motif', group: 'fond', kind: 'forme', options: opts(MOTIFS) },
  cadre: { key: 'cadre', label: 'Cadre', group: 'cadre', kind: 'forme', options: opts(CADRES) },
  couleurCadre: {
    key: 'couleurCadre',
    label: 'Métal',
    group: 'cadre',
    kind: 'couleur',
    options: COULEURS_CADRE.map((c) => ({ label: c.label, swatch: c.base })),
  },
  lisere: { key: 'lisere', label: 'Liseré', group: 'cadre', kind: 'forme', options: opts(LISERES) },
  embleme: {
    key: 'embleme',
    label: 'Emblème',
    group: 'embleme',
    kind: 'forme',
    options: EMBLEMES.map((e) => ({ label: e.label })),
  },
};

/* ------------------------------------------------------------- périmètres */

/**
 * EVC Arena et Major ECN sont deux mondes séparés.
 *
 * Deux séparations, à ne pas confondre :
 *  - l'UNICITÉ est cloisonnée (un avatar unique par tournoi d'un côté, unique
 *    par compte Major ECN de l'autre) : la même combinaison peut exister des
 *    deux côtés sans se gêner, chaque table portant son propre index ;
 *  - le CATALOGUE est restreint côté plateforme : le gladiateur reste à
 *    l'Arena, en portrait comme en emblème.
 *
 * Les INDICES restent communs aux deux périmètres : filtrer le catalogue
 * décalerait le sens d'un code déjà enregistré. On masque des options, on ne
 * renumérote jamais.
 */
export type Perimetre = 'arena' | 'plateforme';

const PORTRAIT_CASQUE = AVATARS_PLANCHE.findIndex((a) => a.id === 'casque');
const EMBLEME_CASQUE = EMBLEMES.findIndex((e) => e.id === 'casque');

/** Indices proposables pour un trait dans un périmètre donné. */
export function optionsAutorisees(key: TraitKey, perimetre: Perimetre): number[] {
  const total = TRAITS[key].options.length;
  const tous = Array.from({ length: total }, (_, i) => i);
  if (perimetre === 'arena') return tous;
  if (key === 'portrait') return tous.filter((i) => i !== PORTRAIT_CASQUE);
  if (key === 'embleme') return tous.filter((i) => i !== EMBLEME_CASQUE);
  return tous;
}

/** Le code est-il composé ET autorisé dans ce périmètre ? */
export function estAvatarAutorise(seed: unknown, perimetre: Perimetre): seed is string {
  if (!estAvatarCompose(seed)) return false;
  const config = decoderAvatar(seed);
  return TRAIT_ORDER.every((key) => optionsAutorisees(key, perimetre).includes(config[key]));
}

/** Identifiant du portrait choisi, tel qu'il existe dans `public/arena/avatars`. */
export function portraitDe(config: AvatarConfig): string {
  return AVATARS_PLANCHE[config.portrait].id;
}

/** Identifiant de l'image d'emblème, ou `null` quand il n'y en a pas. */
export function emblemeDe(config: AvatarConfig): string | null {
  return EMBLEMES[config.embleme].id;
}

/** Les traits d'un onglet, dans l'ordre d'affichage de l'atelier. */
export function traitsDuGroupe(group: TraitGroup): TraitDefinition[] {
  return TRAIT_ORDER.map((key) => TRAITS[key]).filter((t) => t.group === group);
}

/** Nombre total de combinaisons du catalogue — sert aux tests et à l'admin. */
export const NOMBRE_DE_COMBINAISONS = TRAIT_ORDER.reduce(
  (total, key) => total * TRAITS[key].options.length,
  1,
);

/* --------------------------------------------------------------- encodage */

export type AvatarConfig = Record<TraitKey, number>;

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

function clamp(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  const n = Math.trunc(value);
  return n < 0 ? 0 : n >= max ? max - 1 : n;
}

/** Configuration entièrement valide : indices bornés, emplacements complets. */
export function normaliserConfig(config: Partial<AvatarConfig> | null | undefined): AvatarConfig {
  const out = {} as AvatarConfig;
  for (const key of TRAIT_ORDER) out[key] = clamp(config?.[key] ?? 0, TRAITS[key].options.length);
  return out;
}

/** Code stocké en base. Un caractère base 36 par emplacement, ordre figé. */
export function encoderAvatar(config: Partial<AvatarConfig>): string {
  const full = normaliserConfig(config);
  return AVATAR_CODE_PREFIX + TRAIT_ORDER.map((key) => CHARS[full[key]]).join('');
}

/**
 * Lecture tolérante : un code tronqué complète par le premier choix, un code
 * plus long (version future) ignore le surplus, un index hors catalogue est
 * ramené dans les bornes. Jamais d'exception — un avatar illisible en base ne
 * doit pas faire tomber une page de classement.
 */
export function decoderAvatar(code: string | null | undefined): AvatarConfig {
  const body = typeof code === 'string' && code.startsWith(AVATAR_CODE_PREFIX)
    ? code.slice(AVATAR_CODE_PREFIX.length)
    : '';
  const config = {} as AvatarConfig;
  TRAIT_ORDER.forEach((key, i) => {
    const index = CHARS.indexOf(body[i] ?? '0');
    config[key] = clamp(index < 0 ? 0 : index, TRAITS[key].options.length);
  });
  return config;
}

/** La graine désigne-t-elle un avatar composé (et non un ancien portrait seul) ? */
export function estAvatarCompose(seed: unknown): seed is string {
  if (typeof seed !== 'string' || !seed.startsWith(AVATAR_CODE_PREFIX)) return false;
  const body = seed.slice(AVATAR_CODE_PREFIX.length);
  if (body.length !== TRAIT_ORDER.length) return false;
  return TRAIT_ORDER.every((key, i) => {
    const index = CHARS.indexOf(body[i]);
    return index >= 0 && index < TRAITS[key].options.length;
  });
}

/**
 * Forme canonique : deux codes qui décrivent le même médaillon donnent la même
 * chaîne. Indispensable avant tout contrôle d'unicité — sinon un code hors
 * bornes et sa version corrigée désigneraient le même avatar sous deux clés.
 */
export function canoniserAvatar(seed: string | null | undefined): string {
  return encoderAvatar(decoderAvatar(seed));
}

/**
 * Médaillon par défaut d'un portrait de l'ancienne planche : le portrait tel
 * quel, sans ornement. Sert à convertir un choix historique sans le trahir.
 */
export function avatarDepuisPortrait(portraitId: string): string {
  const index = AVATARS_PLANCHE.findIndex((a) => a.id === portraitId);
  return encoderAvatar({ portrait: index < 0 ? 0 : index });
}

/* ------------------------------------------------------------- tirage */

export type Rng = () => number;

/** Tirage uniforme sur le catalogue autorisé dans ce périmètre. */
export function avatarAuHasard(rng: Rng = Math.random, perimetre: Perimetre = 'arena'): string {
  const config = {} as AvatarConfig;
  for (const key of TRAIT_ORDER) {
    const choix = optionsAutorisees(key, perimetre);
    config[key] = choix[Math.floor(rng() * choix.length)];
  }
  return encoderAvatar(config);
}

/**
 * Variante proche : on rejoue quelques emplacements seulement, pour proposer
 * un médaillon libre sans changer le VISAGE que la personne vient de choisir.
 * Les ornements d'abord, le portrait en tout dernier recours.
 */
const ORDRE_DES_VARIANTES: TraitKey[] = [
  'lisere', 'motif', 'couleurCadre', 'fond', 'cadre', 'embleme', 'portrait',
];

export function variantesProches(
  seed: string,
  rng: Rng = Math.random,
  perimetre: Perimetre = 'arena',
): string[] {
  const base = decoderAvatar(seed);
  const out: string[] = [];
  for (const key of ORDRE_DES_VARIANTES) {
    const choix = optionsAutorisees(key, perimetre);
    const decalage = 1 + Math.floor(rng() * Math.max(1, choix.length - 1));
    for (let pas = 0; pas < choix.length; pas++) {
      const index = choix[(decalage + pas) % choix.length];
      if (index === base[key]) continue;
      const candidat = encoderAvatar({ ...base, [key]: index });
      if (!out.includes(candidat)) out.push(candidat);
    }
  }
  return out;
}

/** Empreinte stable d'une chaîne — sert de repli déterministe. */
export function empreinte(source: string): number {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return hash >>> 0;
}

/**
 * Médaillon déterministe dérivé d'une chaîne quelconque (identifiant de
 * compte, pseudonyme). Sert de repli : un compte sans choix enregistré doit
 * toujours afficher le même avatar, jamais un tirage à chaque rendu.
 */
export function avatarDepuisChaine(source: string, perimetre: Perimetre = 'arena'): string {
  const base = source || 'arena';
  const config = {} as AvatarConfig;
  // Une empreinte par emplacement : diviser une empreinte unique épuise
  // l'entropie et fait converger les derniers traits vers la même valeur.
  for (const key of TRAIT_ORDER) {
    const choix = optionsAutorisees(key, perimetre);
    config[key] = choix[empreinte(`${base}#${key}`) % choix.length];
  }
  return encoderAvatar(config);
}

/** Description textuelle d'un avatar, pour l'alternative des lecteurs d'écran. */
export function decrireAvatar(seed: string): string {
  const config = decoderAvatar(seed);
  const libelle = (key: TraitKey) => TRAITS[key].options[config[key]].label;
  const morceaux = [libelle('portrait')];
  if (config.cadre > 0) morceaux.push(`${libelle('cadre').toLowerCase()} ${libelle('couleurCadre').toLowerCase()}`);
  morceaux.push(`fond ${libelle('fond').toLowerCase()}`);
  if (config.embleme > 0) morceaux.push(`emblème ${libelle('embleme').toLowerCase()}`);
  return `Avatar : ${morceaux.join(', ')}`;
}
