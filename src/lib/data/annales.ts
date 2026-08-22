/**
 * Reconnaissance des ANNALES EVC corrigées.
 *
 * Elles sont publiées comme des séries `qcm_series` de type 'qcm' libellées
 * « Annales - <Collège> - <Année> - <Type> », dans l'onglet DP · QI d'un item
 * transversal (« Révisions - <Collège> », « Annales - Médecine générale »).
 *
 * Certains de ces items ne contiennent QUE des annales : ils n'ont ni fiche, ni
 * vidéo, ni flashcard, et aucune autre série. Leur page d'item ne doit alors
 * proposer que la carte « Dossiers progressifs & QI » — afficher les six autres
 * cartes vides (fiche, fiche éclair, cours vidéo, flashcards, interrogation…)
 * laisse croire à un contenu manquant. La règle est déduite du CONTENU réel, et
 * non d'une liste d'identifiants : un item qui recevra plus tard une fiche ou
 * une vidéo retrouvera automatiquement son parcours complet.
 */

/** Une série d'annales EVC ? (miroir de `isAnnale` dans la page DP · QI). */
export function estSerieAnnale(label: string | null | undefined): boolean {
  return /^annales?\b/i.test((label ?? '').trim());
}

/**
 * Année de session d'une série d'annales.
 *
 * `qcm_series.annee` fait foi ; le libellé sert de repli, car la convention
 * « Annales - <Collège> - <Année> - EVC[FP] » la porte toujours et une série
 * importée à la main peut avoir laissé la colonne vide.
 */
export function anneeDeSerieAnnale(serie: { annee?: number | null; label?: string | null }): number | null {
  if (typeof serie.annee === 'number') return serie.annee;
  const m = (serie.label ?? '').match(/\b((?:19|20)\d{2})\b/);
  return m ? Number(m[1]) : null;
}

/** Un item dédié aux annales : aucun autre contenu que des séries d'annales. */
export function estItemAnnales(item: {
  series: { label?: string | null }[] | null | undefined;
  fiches?: { storage_path?: string | null }[] | null;
  videos?: unknown[] | null;
  flashcards?: unknown[] | null;
}): boolean {
  const series = item.series ?? [];
  if (series.length === 0) return false;
  if (!series.every((s) => estSerieAnnale(s.label))) return false;
  if ((item.fiches ?? []).some((f) => !!f.storage_path)) return false;
  if ((item.videos ?? []).length > 0) return false;
  if ((item.flashcards ?? []).length > 0) return false;
  return true;
}

type ClientLecture = {
  from: (t: string) => {
    select: (s: string) => {
      in: (col: string, v: string[]) => Promise<{ data: unknown[] | null }>;
    };
  };
};

/**
 * Items d'annales des spécialités indiquées, par `matiere_id`.
 *
 * Ces items ne s'« étudient » pas : ils n'ont ni fiche, ni vidéo, ni flashcard,
 * et l'élève n'y passe pas pour apprendre mais pour s'entraîner. Deux endroits
 * en ont besoin :
 *
 *  - les RÉVISIONS TRANSVERSALES, qui ne piochent que dans les items déjà
 *    étudiés : sans cela, les annales n'entreraient dans le vivier qu'après y
 *    avoir répondu au moins une fois, alors qu'elles sont la ressource de
 *    révision la plus utile de la spécialité ;
 *  - la détection « spécialité terminée », qui compare le nombre d'items
 *    étudiés au nombre total d'items : y compter un item d'annales rendrait
 *    inachevables des spécialités qui l'étaient avant leur publication.
 */
export async function coursAnnalesParMatiere(
  supabase: unknown,
  matiereIds: string[],
): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  if (matiereIds.length === 0) return out;
  const { data } = await (supabase as ClientLecture)
    .from('cours')
    .select('id, matiere_id, qcm_series(label), fiches(storage_path), videos(id), flashcards(id)')
    .in('matiere_id', matiereIds);
  type Row = {
    id: string; matiere_id: string;
    qcm_series: { label: string | null }[] | null;
    fiches: { storage_path: string | null }[] | null;
    videos: unknown[] | null;
    flashcards: unknown[] | null;
  };
  for (const c of ((data ?? []) as Row[])) {
    const estAnnales = estItemAnnales({
      series: c.qcm_series, fiches: c.fiches, videos: c.videos, flashcards: c.flashcards,
    });
    if (!estAnnales) continue;
    out.set(c.matiere_id, [...(out.get(c.matiere_id) ?? []), c.id]);
  }
  return out;
}
