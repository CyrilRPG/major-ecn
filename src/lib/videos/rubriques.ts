/**
 * Rubriques d'affichage des vidéos d'un item.
 *
 * Une élève du Programme Approfondi suit AUSSI les séances de la Préparation
 * intensive (vidéos de `type = 'cours'` ciblant les deux formules). Sans
 * intitulé de section, elle voyait une liste plate mêlant « SEANCE 1 … 9 » et
 * « Séance approfondie N ». La colonne `videos.rubrique` (texte libre, NULL =
 * libellé par défaut du type) regroupe les vidéos sous un titre de section,
 * pour que l'élève sache quoi travailler et dans quel ordre.
 *
 * Module PUR : utilisé côté serveur (pages élève) comme côté navigateur
 * (placeholder du formulaire d'administration), sans dépendance.
 */

export type VideoRubriqueType = 'cours' | 'seance_approfondie';

export type VideoAvecRubrique = {
  type?: string | null;
  rubrique?: string | null;
  order_index?: number | null;
};

/** Libellé de section quand l'administrateur n'en a pas saisi. */
export function rubriqueParDefaut(type: string | null | undefined): string {
  return type === 'seance_approfondie'
    ? 'Séances approfondies · Programme approfondi'
    : 'Dernier tour de révision · Préparation intensive';
}

/** Rubrique effective d'une vidéo : la sienne, sinon celle de son type. */
export function rubriqueDeVideo(video: Pick<VideoAvecRubrique, 'type' | 'rubrique'>): string {
  return video.rubrique?.trim() || rubriqueParDefaut(video.type);
}

/**
 * Ordre des rubriques par défaut : la Préparation intensive (type `cours`)
 * d'abord, le Programme approfondi ensuite — décision de Cyril (09/2026) :
 * le dernier tour de révision se travaille avant d'approfondir.
 */
export const ORDRE_RUBRIQUES: readonly string[] = [
  rubriqueParDefaut('cours'),
  rubriqueParDefaut('seance_approfondie'),
];

/** Rang d'un type dans l'ordre des rubriques (cours avant approfondi). */
function rangType(type: string | null | undefined): number {
  return type === 'seance_approfondie' ? 1 : 0;
}

export type GroupeRubrique<T> = { rubrique: string; videos: T[] };

/**
 * Regroupe des vidéos par rubrique effective.
 *
 * Ordre des groupes : les rubriques portées par des vidéos `cours` d'abord,
 * puis celles des séances approfondies (cf. `ORDRE_RUBRIQUES`) ; à type égal,
 * l'ordre d'apparition dans la liste fournie. Dans chaque groupe, les vidéos
 * sont triées par `order_index` (stable : à index égal, l'ordre d'entrée).
 *
 * Une rubrique saisie à la main sur des vidéos des deux types n'apparaît
 * qu'une fois, au rang de la première vidéo `cours` qui la porte.
 */
export function grouperParRubrique<T extends VideoAvecRubrique>(videos: readonly T[]): GroupeRubrique<T>[] {
  const groupes = new Map<string, { rang: number; apparition: number; videos: T[] }>();
  videos.forEach((v, i) => {
    const rubrique = rubriqueDeVideo(v);
    const rang = rangType(v.type);
    const existant = groupes.get(rubrique);
    if (existant) {
      existant.videos.push(v);
      if (rang < existant.rang) {
        existant.rang = rang;
        existant.apparition = i;
      }
    } else {
      groupes.set(rubrique, { rang, apparition: i, videos: [v] });
    }
  });
  return Array.from(groupes.entries())
    .sort((a, b) => (a[1].rang - b[1].rang) || (a[1].apparition - b[1].apparition))
    .map(([rubrique, g]) => ({
      rubrique,
      videos: g.videos
        .map((v, i) => ({ v, i }))
        .sort((x, y) => ((x.v.order_index ?? 0) - (y.v.order_index ?? 0)) || (x.i - y.i))
        .map((r) => r.v),
    }));
}

/** Rubrique commune à toutes les vidéos, ou null si elles en ont plusieurs. */
export function rubriqueCommune(videos: readonly VideoAvecRubrique[]): string | null {
  if (videos.length === 0) return null;
  const premiere = rubriqueDeVideo(videos[0]);
  return videos.every((v) => rubriqueDeVideo(v) === premiere) ? premiere : null;
}

/** Nettoie la saisie de l'administrateur : vide ⇒ NULL (libellé par défaut). */
export function normaliserRubrique(saisie: string | null | undefined): string | null {
  const r = (saisie ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return r || null;
}
