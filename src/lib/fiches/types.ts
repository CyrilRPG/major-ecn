/**
 * Modèle de données structuré d'une fiche Major ECN — miroir TypeScript du
 * `FicheData` du générateur (major-ecn-fiche / src/major_ecn/models.py).
 *
 * C'est la SOURCE CANONIQUE éditable d'une fiche : stockée dans
 * `public.fiches.content_json`, éditée dans l'app, et rendue à l'identique en
 * PDF via Chromium (même charte `styles.css` + mêmes polices que le générateur).
 *
 * Différence avec le modèle Python : les images ne référencent pas un chemin
 * disque local mais une URL (Supabase Storage), adaptée au web.
 */

/** Type d'une ligne-réflexe (pleine largeur) ou ligne normale concept|détail. */
export type FicheRowKind = 'normal' | 'a_retenir' | 'piege' | 'mnemo';

/** Une ligne de tableau de fiche. */
export type FicheRow = {
  /** Colonne gauche (markdown court, rendu inline). Vide pour les lignes-réflexe. */
  concept: string;
  /** Colonne droite / corps de la ligne-réflexe (markdown bloc : tableaux, listes…). */
  detail_md: string;
  kind: FicheRowKind;
};

/** Image pédagogique placée dans une sous-partie (référencée par URL Storage). */
export type FicheImage = {
  /** URL publique/Storage de l'image. */
  url: string;
  description: string;
  /** Numéro de figure affiché (« Figure 3 — … »). 0 = non numérotée. */
  figure_number: number;
};

/** Sous-partie du corps, rendue sous forme de tableau structuré. */
export type SousPartie = {
  lettre: string;
  titre: string;
  rows: FicheRow[];
  images: FicheImage[];
};

/** Grande partie rédigée du corps de la fiche. */
export type Partie = {
  /** Chiffre romain (I, II, III…). */
  numero: string;
  titre: string;
  sous_parties: SousPartie[];
};

/** Sous-partie du plan (page de garde). */
export type PlanSousPartie = {
  lettre: string;
  titre: string;
  resume: string;
};

/** Grande partie du plan (page de garde). */
export type PlanPartie = {
  numero: string;
  titre: string;
  resume: string;
  sous_parties: PlanSousPartie[];
};

/** Tableau de synthèse (contenu Markdown, tableaux GFM). */
export type TableauSynthese = {
  titre: string;
  markdown: string;
};

/** Représentation complète et structurée d'une fiche Major ECN. */
export type FicheData = {
  matiere: string;
  nom_cours: string;
  annee: string;
  item: string;
  plan: PlanPartie[];
  parties: Partie[];
  tableaux: TableauSynthese[];
  chiffres_cles: TableauSynthese | null;
  points_cles: string[];
  fiche_eclair_md: string;
  fiche_numero: string;
};

/** Entrée de légende des marqueurs (★ / ◆ / ⚠) affichée sur la page de garde. */
export type FicheLegendEntry = {
  symbol: string;
  label: string;
};

/** Légende par défaut (identique au générateur : config.FICHE_LEGEND). */
export const FICHE_LEGEND: FicheLegendEntry[] = [
  { symbol: '★', label: 'Déjà tombé aux EVC' },
  { symbol: '◆', label: 'Notion à haut rendement' },
  { symbol: '⚠', label: 'Piège classique' },
];

/** Libellés des lignes-réflexe (identiques au générateur : REFLEXE_TYPES). */
export const REFLEXE_LABELS: Record<Exclude<FicheRowKind, 'normal'>, string> = {
  a_retenir: 'À retenir',
  piege: 'Piège',
  mnemo: 'Moyen mnémotechnique',
};

/** Fiche vide pour démarrer l'édition d'une nouvelle fiche. */
export function emptyFiche(partial?: Partial<FicheData>): FicheData {
  return {
    matiere: '',
    nom_cours: '',
    annee: '',
    item: '',
    plan: [],
    parties: [],
    tableaux: [],
    chiffres_cles: null,
    points_cles: [],
    fiche_eclair_md: '',
    fiche_numero: '',
    ...partial,
  };
}
