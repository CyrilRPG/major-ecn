/**
 * Pays d'origine des lauréats qui témoignent, pour afficher un petit drapeau
 * à côté de leur nom.
 *
 * Les témoignages sont rendus par une douzaine de composants aux formes
 * différentes (`name`, `nom`, texte en dur…). Plutôt que de répéter le pays
 * dans chacun, tout est centralisé ici et retrouvé à partir du nom affiché :
 * ajouter un lauréat ne demande qu'une ligne dans `PAR_NOM`.
 *
 * Les drapeaux sont des SVG auto-hébergés dans `public/drapeaux/`, et non des
 * emojis : Chrome et Edge sous Windows ne savent pas rendre les emojis
 * drapeaux et afficheraient les deux lettres du code pays à la place.
 */

export type Origine = {
  /** Nom du pays en français, lu par les lecteurs d'écran et en infobulle. */
  pays: string;
  /** Code ISO 3166-1 alpha-2 en minuscules ; nomme aussi le fichier SVG. */
  code: string;
};

const PAYS = {
  algerie: { pays: 'Algérie', code: 'dz' },
  benin: { pays: 'Bénin', code: 'bj' },
  bresil: { pays: 'Brésil', code: 'br' },
  cameroun: { pays: 'Cameroun', code: 'cm' },
  liban: { pays: 'Liban', code: 'lb' },
  madagascar: { pays: 'Madagascar', code: 'mg' },
  mauritanie: { pays: 'Mauritanie', code: 'mr' },
  rdCongo: { pays: 'République démocratique du Congo', code: 'cd' },
  syrie: { pays: 'Syrie', code: 'sy' },
  tunisie: { pays: 'Tunisie', code: 'tn' },
} as const satisfies Record<string, Origine>;

/**
 * Clé = fragment distinctif du nom, normalisé (sans accent, en minuscules).
 * C'est en général le nom de famille ; il doit être assez spécifique pour ne
 * désigner qu'une personne, la recherche se faisant sur les mots du nom
 * affiché. Un même lauréat apparaît sous plusieurs graphies selon les pages
 * (« Ahena HAROUN » et « Athéna Haroun », « Sami » et « Samy KABAWEH ») : la
 * clé est choisie pour couvrir toutes ces variantes.
 */
const PAR_NOM: Record<string, Origine> = {
  kobercy: PAYS.liban,
  sifaoui: PAYS.algerie,
  khiareddine: PAYS.tunisie,
  kabaweh: PAYS.syrie,
  kabawe: PAYS.syrie,
  nached: PAYS.syrie,
  khaoula: PAYS.algerie,
  // « Dr Ely Cheikh SY » et « Dr SY Ely Cheikh Ibrahima » : « cheikh » est le
  // seul fragment commun aux deux graphies qui ne soit pas ambigu.
  cheikh: PAYS.mauritanie,
  lamure: PAYS.rdCongo,
  haroun: PAYS.algerie,
  chergou: PAYS.algerie,
  ghorbel: PAYS.tunisie,
  boudebza: PAYS.algerie,
  maevazaka: PAYS.madagascar,
  wankpo: PAYS.benin,
  semevo: PAYS.benin,
  minkala: PAYS.cameroun,
  hnania: PAYS.algerie,
  abdelbaki: PAYS.tunisie,
  hadjij: PAYS.algerie,
  bettaieb: PAYS.algerie,
  semai: PAYS.algerie,
  waitzfelder: PAYS.bresil,
  deneche: PAYS.algerie,
  // Origine reprise du site lui-même : la carte témoignage de la page d'accueil
  // (TT_CARDS dans extra-sections.tsx) affiche « Cameroun » sous son nom depuis
  // sa mise en ligne.
  talla: PAYS.cameroun,
  // Origine non communiquée pour Mme Lilia Ould Benahmed : aucun drapeau n'est
  // affiché tant qu'elle n'est pas connue, plutôt que d'en supposer une.
};

/** Titres et particules à ignorer lors de la recherche du nom de famille. */
const MOTS_IGNORES = new Set(['dr', 'mme', 'mlle', 'm', 'pr', 'docteur', 'madame', 'monsieur', 'de', 'du', 'des', 'la', 'le', 'ould', 'ben', 'el', 'al']);

const normaliser = (valeur: string) =>
  valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`-]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Origine d'un lauréat à partir de son nom tel qu'il est affiché, quelle que
 * soit la graphie (casse, accents, titre, ordre prénom/nom).
 * Renvoie `null` si l'origine n'est pas connue — l'appelant n'affiche alors
 * simplement aucun drapeau.
 */
export function origineDe(nom: string | null | undefined): Origine | null {
  if (!nom) return null;
  for (const mot of normaliser(nom).split(' ')) {
    if (mot.length < 3 || MOTS_IGNORES.has(mot)) continue;
    const trouve = PAR_NOM[mot];
    if (trouve) return trouve;
  }
  return null;
}

/** Chemin public du SVG d'un drapeau. */
export const drapeauSrc = (code: string) => `/drapeaux/${code}.svg`;
