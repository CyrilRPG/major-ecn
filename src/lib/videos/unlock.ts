/**
 * Déblocage d'une séance approfondie.
 *
 * Deux cas, et deux seulement :
 *  - la séance est RELIÉE à une séance du professeur (`videos.serie_id`) : elle
 *    s'ouvre quand CETTE séance est terminée (déblocage progressif) ;
 *  - elle n'est reliée à rien : elle est ouverte, sans condition.
 *
 * `unlock_direct` reste un forçage : une séance reliée peut être ouverte
 * d'emblée si l'administration le demande. Le staff voit tout ouvert.
 *
 * Les cours vidéo n'ont pas de déblocage progressif — cette logique ne
 * s'applique qu'aux séances approfondies.
 */

export type SeanceUnlock = {
  /** Séance du professeur qui ouvre cette vidéo, si elle est reliée. */
  serie_id?: string | null;
  /** Forçage : ouverte d'emblée même si elle est reliée à une séance. */
  unlock_direct?: boolean | null;
};

/** La séance est-elle ouverte pour cet élève ? */
export function estOuverte(
  video: SeanceUnlock,
  seancesTerminees: ReadonlySet<string>,
  isStaff = false,
): boolean {
  if (isStaff) return true;
  if (video.unlock_direct) return true;
  if (!video.serie_id) return true;
  return seancesTerminees.has(video.serie_id);
}
