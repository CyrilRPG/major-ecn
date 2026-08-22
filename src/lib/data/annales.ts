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
