import {
  COULEURS_CADRE,
  FONDS,
  decoderAvatar,
  decrireAvatar,
  emblemeDe,
  portraitDe,
  type AvatarConfig,
} from './traits';

/**
 * Dessin d'un médaillon composé.
 *
 * Le VISAGE est l'un des portraits peints de Major ECN, placé tel quel : on
 * ne le redessine pas, on ne le recolore pas. Tout ce qui est tracé ici est
 * l'ORFÈVRERIE autour de lui — champ, motif, cadre, liseré, emblème.
 *
 * Le dessin est produit sous forme de CHAÎNE, et non de JSX : c'est la seule
 * façon de le servir à la fois dans une page React et depuis une route
 * d'image (`/api/avatar`), Next interdisant `react-dom/server` dans le
 * répertoire `app`. Le composant `ComposedAvatarSvg` n'est qu'une enveloppe.
 *
 * Repères (viewBox 0 0 100 100) :
 *   champ  r 50 · cadre  r 39→47 · portrait  r 38,5 · emblème  centre 24,78
 * La couronne de distinction (Or, Argent, Bronze) est tracée PAR-DESSUS, au
 * rayon 48 : le cadre personnel doit rester en deçà pour ne pas la heurter.
 *
 * Rien de ce qui entre ici ne vient de l'utilisateur : la configuration est
 * une liste d'indices bornés, jamais du texte libre.
 */

const bloc = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join('');
const repete = (n: number, fn: (i: number) => string) => Array.from({ length: n }, (_, i) => fn(i)).join('');

/**
 * Cadrages. `buste` est le rendu partout ; `serre` resserre sur le portrait
 * pour l'atelier, où il faut voir le visage sur une vignette de 52 px.
 */
export const CADRAGES = { buste: '0 0 100 100', serre: '14 14 72 72' } as const;
export type Cadrage = keyof typeof CADRAGES;

/** Résout l'adresse d'une image de la planche. */
export type SourcePortrait = (id: string) => string;

const CHEMIN_PAR_DEFAUT: SourcePortrait = (id) => `/arena/avatars/${id}.png`;

/* ------------------------------------------------------------------ champ */

function champ(config: AvatarConfig, uid: string): string {
  const f = FONDS[config.fond];
  const m = config.motif;
  return bloc(
    `<circle cx="50" cy="50" r="50" fill="url(#${uid}-champ)"/>`,
    m === 1 && `<circle cx="50" cy="50" r="44" fill="${f.motif}" opacity="0.16"/>`,
    m === 2 &&
      `<g fill="${f.motif}" opacity="0.14">${repete(24, (i) => `<path d="M50 50 L47 -4 L53 -4 Z" transform="rotate(${i * 15} 50 50)"/>`)}</g>`,
    m === 3 &&
      `<g fill="${f.motif}" opacity="0.34">${repete(9, (i) => {
        const a = ((i * 17 - 68) * Math.PI) / 180;
        const x = +(50 - Math.cos(a) * 44.5).toFixed(2);
        const y = +(50 + Math.sin(a) * 44.5).toFixed(2);
        return (
          `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="5.4" transform="rotate(${-58 + i * 15} ${x} ${y})"/>` +
          `<ellipse cx="${(100 - x).toFixed(2)}" cy="${y}" rx="2.6" ry="5.4" transform="rotate(${58 - i * 15} ${(100 - x).toFixed(2)} ${y})"/>`
        );
      })}</g>`,
    m === 4 &&
      `<g fill="${f.motif}" opacity="0.18">${[4, 16, 74, 86]
        .map((x) => `<rect x="${x}" y="16" width="10" height="84"/><rect x="${x - 2}" y="12" width="14" height="5" rx="1.5"/>`)
        .join('')}</g>`,
    m === 5 &&
      `<g fill="none" stroke="${f.motif}" stroke-width="2" opacity="0.26">${repete(
        14,
        (i) => `<path d="M0 6 h6 v-6 h-3.4 v2.8 h3.4" transform="rotate(${i * 25.7} 50 50) translate(44 2)"/>`,
      )}</g>`,
  );
}

/* ------------------------------------------------------------------ cadre */

/** Anneau ouvragé, entre les rayons 39 et 47. */
function cadre(config: AvatarConfig, uid: string): string {
  const k = config.cadre;
  if (k === 0) return '';
  const m = COULEURS_CADRE[config.couleurCadre];
  const metal = `url(#${uid}-metal)`;
  return bloc(
    // Toutes les variantes reposent sur le même jonc : le cadre doit rester
    // un anneau reconnaissable, quel que soit l'ornement ajouté.
    `<circle cx="50" cy="50" r="43" fill="none" stroke="${metal}" stroke-width="${k === 2 ? 5.5 : 6.5}"/>`,
    `<circle cx="50" cy="50" r="46.6" fill="none" stroke="${m.sombre}" stroke-width="1"/>`,
    `<circle cx="50" cy="50" r="39.4" fill="none" stroke="${m.sombre}" stroke-width="1"/>`,
    k === 2 &&
      `<circle cx="50" cy="50" r="45.4" fill="none" stroke="${metal}" stroke-width="1.6"/>` +
        `<circle cx="50" cy="50" r="40.6" fill="none" stroke="${metal}" stroke-width="1.6"/>`,
    k === 3 &&
      `<g fill="${metal}" stroke="${m.sombre}" stroke-width="0.35">${repete(22, (i) => {
        const angle = i * 16 - 168;
        return `<ellipse cx="50" cy="7" rx="2.6" ry="5.2" transform="rotate(${angle} 50 50) rotate(${i % 2 ? 22 : -22} 50 7)"/>`;
      })}</g>`,
    k === 4 &&
      `<g fill="none" stroke="${m.clair}" stroke-width="1.5" opacity="0.9">${repete(
        16,
        (i) => `<path d="M0 0 h5.4 v-5.4 h-3 v2.8 h3" transform="rotate(${i * 22.5} 50 50) translate(46.4 -2.6) rotate(90)"/>`,
      )}</g>`,
    k === 5 &&
      `<g fill="${metal}" stroke="${m.sombre}" stroke-width="0.3">${repete(
        28,
        (i) => `<rect x="48.4" y="0.6" width="3.2" height="4.6" transform="rotate(${i * 12.85} 50 50)"/>`,
      )}</g>`,
    k === 6 &&
      `<g stroke="${m.clair}" stroke-width="1.3" opacity="0.85">${repete(
        36,
        (i) => `<path d="M50 4.2 v5.6" transform="rotate(${i * 10} 50 50)"/>`,
      )}</g>`,
    k === 7 &&
      `<g fill="${metal}" stroke="${m.sombre}" stroke-width="0.3">${repete(30, (i) => `<ellipse cx="50" cy="43" rx="2.1" ry="4" transform="rotate(${i * 12} 50 50) rotate(34 50 43)"/>`)}</g>`,
  );
}

/** Liseré intérieur, au contact du portrait. */
function lisere(config: AvatarConfig, uid: string): string {
  const k = config.lisere;
  if (k === 0) return '';
  const m = COULEURS_CADRE[config.couleurCadre];
  const metal = `url(#${uid}-metal)`;
  return bloc(
    k === 1 && `<circle cx="50" cy="50" r="38.8" fill="none" stroke="${metal}" stroke-width="1.4"/>`,
    k === 2 &&
      `<circle cx="50" cy="50" r="38.9" fill="none" stroke="${metal}" stroke-width="1.2"/>` +
        `<circle cx="50" cy="50" r="36.6" fill="none" stroke="${m.sombre}" stroke-width="0.9" opacity="0.8"/>`,
    k === 3 &&
      `<g fill="${metal}">${repete(44, (i) => `<circle cx="50" cy="11.4" r="1.25" transform="rotate(${i * 8.18} 50 50)"/>`)}</g>`,
    k === 4 &&
      `<g fill="${metal}">${repete(36, (i) => `<rect x="48.8" y="10.2" width="2.4" height="2.4" transform="rotate(${i * 10} 50 50)"/>`)}</g>`,
    k === 5 &&
      `<g fill="none" stroke="${metal}" stroke-width="1.5" stroke-linecap="round">${repete(
        24,
        (i) => `<path d="M46.6 11.4 q3.4 -3.4 6.8 0" transform="rotate(${i * 15} 50 50)"/>`,
      )}</g>`,
  );
}

/* ---------------------------------------------------------------- portrait */

function portrait(config: AvatarConfig, uid: string, source: SourcePortrait): string {
  // Le portrait garde ses proportions et son plateau doré : il est simplement
  // détouré au disque intérieur du cadre.
  return (
    `<image href="${source(portraitDe(config))}" x="11.5" y="11.5" width="77" height="77" ` +
    `clip-path="url(#${uid}-portrait)" preserveAspectRatio="xMidYMid slice"/>`
  );
}

function embleme(config: AvatarConfig, uid: string, source: SourcePortrait): string {
  const id = emblemeDe(config);
  if (!id) return '';
  const m = COULEURS_CADRE[config.couleurCadre];
  return (
    `<g transform="translate(24 78)">` +
    `<circle r="11.6" fill="${m.sombre}"/>` +
    `<image href="${source(id)}" x="-10" y="-10" width="20" height="20" clip-path="url(#${uid}-embleme)"/>` +
    `<circle r="10.6" fill="none" stroke="url(#${uid}-metal)" stroke-width="1.8"/>` +
    '</g>'
  );
}

/* ------------------------------------------------------------- assemblage */

/**
 * Identifiants dérivés des seuls traits de couleur : deux médaillons aux mêmes
 * couleurs partagent les mêmes dégradés — aucun conflit d'identifiant sur une
 * page qui en affiche cent, et un rendu identique serveur / navigateur.
 */
function identifiant(config: AvatarConfig): string {
  return `md${config.fond}x${config.couleurCadre}`;
}

/** Contenu interne du SVG (defs comprises), sans la balise `<svg>`. */
export function contenuAvatar(seed: string, source: SourcePortrait = CHEMIN_PAR_DEFAUT): string {
  const config = decoderAvatar(seed);
  const f = FONDS[config.fond];
  const m = COULEURS_CADRE[config.couleurCadre];
  const uid = identifiant(config);
  return (
    '<defs>' +
    `<linearGradient id="${uid}-champ" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${f.haut}"/><stop offset="1" stop-color="${f.bas}"/></linearGradient>` +
    `<linearGradient id="${uid}-metal" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${m.clair}"/><stop offset="0.35" stop-color="${m.base}"/>` +
    `<stop offset="0.62" stop-color="${m.clair}"/><stop offset="1" stop-color="${m.sombre}"/></linearGradient>` +
    `<radialGradient id="${uid}-vignette" cx="50%" cy="40%" r="70%">` +
    '<stop offset="0.6" stop-color="#000000" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="#04060A" stop-opacity="0.5"/></radialGradient>' +
    `<clipPath id="${uid}-disque"><circle cx="50" cy="50" r="50"/></clipPath>` +
    `<clipPath id="${uid}-portrait"><circle cx="50" cy="50" r="38.5"/></clipPath>` +
    `<clipPath id="${uid}-embleme"><circle cx="0" cy="0" r="9.6"/></clipPath>` +
    '</defs>' +
    `<g clip-path="url(#${uid}-disque)">` +
    champ(config, uid) +
    `<circle cx="50" cy="50" r="50" fill="url(#${uid}-vignette)"/>` +
    portrait(config, uid, source) +
    cadre(config, uid) +
    lisere(config, uid) +
    embleme(config, uid, source) +
    '</g>'
  );
}

/** Fichier SVG complet et autonome, prêt à être servi ou enregistré. */
export function avatarSvg(
  seed: string,
  {
    size = 256,
    cadrage = 'buste' as Cadrage,
    title,
    source,
  }: { size?: number; cadrage?: Cadrage; title?: string; source?: SourcePortrait } = {},
): string {
  const alt = (title ?? decrireAvatar(seed)).replace(/[<>&"]/g, '');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="${CADRAGES[cadrage]}" width="${size}" height="${size}" role="img" aria-label="${alt}">` +
    `${contenuAvatar(seed, source)}</svg>`
  );
}
