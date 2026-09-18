/**
 * Catégories de replays d'un item : « Séance intensive » (vidéos de
 * `type = 'cours'`, Formule Intensive) et « Séances approfondies » (vidéos de
 * `type = 'seance_approfondie'`, Programme Approfondi).
 *
 * Une élève du Programme Approfondi a souvent accès aux DEUX (les items
 * « Replays - Révisions » de Médecine d'urgence, Pédiatrie, Gériatrie…). Sans
 * séparation, elle voyait un seul flot de dizaines de cartes et d'onglets
 * mêlant les deux programmes et leurs supports (demande de Cyril, 18/09/2026).
 * L'élève choisit donc d'abord sa catégorie, puis ne voit que son contenu.
 *
 * Module PUR, sans dépendance : utilisé par l'aperçu, les pages de catégorie
 * et la console d'étude.
 */

import { rubriqueParDefaut } from './rubriques';

export type CategorieVideo = 'cours' | 'seance_approfondie';

export type DescriptionCategorie = {
  type: CategorieVideo;
  /** Clé d'onglet / de bloc (`hidden_blocks`, `locked`). */
  bloc: 'video' | 'seance-approfondie';
  /** Segment d'URL sous `/cours/<id>/`. */
  segment: 'video' | 'seance-approfondie';
  /** Formule qui ouvre normalement cette catégorie. */
  formule: string;
  /** Couleurs de la catégorie (cartes, badges, en-têtes). */
  accent: string;
  fond: string;
};

export const CATEGORIES_VIDEO: Record<CategorieVideo, DescriptionCategorie> = {
  cours: {
    type: 'cours',
    bloc: 'video',
    segment: 'video',
    formule: 'Formule Intensive',
    accent: '#E4002B',
    fond: '#FDE7E9',
  },
  seance_approfondie: {
    type: 'seance_approfondie',
    bloc: 'seance-approfondie',
    segment: 'seance-approfondie',
    formule: 'Programme Approfondi',
    accent: '#7C3AED',
    fond: '#F3EAFF',
  },
};

/** Ordre de présentation : la Préparation intensive d'abord (cf. ORDRE_RUBRIQUES). */
export const ORDRE_CATEGORIES: readonly CategorieVideo[] = ['cours', 'seance_approfondie'];

/** Catégorie d'une vidéo : tout ce qui n'est pas une séance approfondie est un cours. */
export function categorieDeVideo(type: string | null | undefined): CategorieVideo {
  return type === 'seance_approfondie' ? 'seance_approfondie' : 'cours';
}

/** L'autre catégorie (pour le sélecteur « Intensif ⇄ Approfondi »). */
export function autreCategorie(type: CategorieVideo): CategorieVideo {
  return type === 'cours' ? 'seance_approfondie' : 'cours';
}

/**
 * Titre d'une catégorie pour cet item : la rubrique commune à ses vidéos si
 * l'administration en a saisi une (« Dernier tour », « Séance intensive »…),
 * sinon le libellé par défaut du type.
 */
export function titreCategorie(type: CategorieVideo, rubriqueCommune: string | null | undefined): string {
  return rubriqueCommune?.trim() || rubriqueParDefaut(type);
}

/** « 10 séances · 26 supports » — le résumé d'une carte de catégorie. */
export function resumeCategorie(nbSeances: number, nbSupports: number): string {
  const seances = `${nbSeances} séance${nbSeances > 1 ? 's' : ''}`;
  if (nbSupports === 0) return seances;
  return `${seances} · ${nbSupports} support${nbSupports > 1 ? 's' : ''}`;
}

/**
 * Catégories que cet élève peut ouvrir, dans l'ordre de présentation.
 * Une catégorie n'est proposée que si elle a au moins une vidéo visible.
 */
export function categoriesDisponibles(nb: { cours: number; seance_approfondie: number }): CategorieVideo[] {
  return ORDRE_CATEGORIES.filter((c) => nb[c] > 0);
}
