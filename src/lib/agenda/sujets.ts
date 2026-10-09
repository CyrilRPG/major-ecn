/**
 * « Sujet disponible » dans l'agenda élève.
 *
 * Une séance à venir de la bibliothèque vidéo (`videos.live_at`, dossiers à
 * préparer déposés avant la séance, cf. `lib/videos/a-venir.ts`) apparaît dans
 * l'agenda le jour de la séance : rattachée à la séance de l'agenda qui lui
 * correspond (même jour, même spécialité, horaire le plus proche), ou seule si
 * aucune ne correspond. Un clic ouvre la séance, sur SA page : permissions,
 * déblocage et filigrane des supports y restent appliqués — l'agenda ne
 * transmet jamais un document.
 *
 * Module PUR (testé dans tests/agenda-sujets.test.ts).
 */

export type SujetAgenda = {
  /** Identifiant de la vidéo (séance de la bibliothèque). */
  id: string;
  titre: string;
  /** Spécialité de l'item, en clair. */
  specialite: string | null;
  /** AAAA-MM-JJ et HH:MM, heure de Paris. */
  date: string;
  heure: string;
  /** Page de la séance (contrôles d'accès et filigrane côté page). */
  href: string;
  /** `sujet` : dossiers à préparer, vidéo à venir ; `replay` : la vidéo est en ligne. */
  etat: 'sujet' | 'replay';
  nbDocuments: number;
  /** Séance de l'agenda à laquelle le sujet est rattaché, sinon null. */
  evenementId: string | null;
};

/** Ce qu'il faut d'une séance de l'agenda pour le rattachement. */
export type EvenementRattachable = {
  id: string;
  date: string;
  start_time: string | null;
  scope_type: 'all' | 'college';
  scope_colleges: string[] | null;
};

const minutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
/** Écart toléré pour rattacher à une séance « toutes spécialités ». */
const TOLERANCE_TOUTES_MIN = 60;

/** Page de la séance : catégorie de la vidéo + `?v=` pour n'afficher qu'elle. */
export function lienSeance(coursId: string, type: string | null | undefined, videoId: string): string {
  const segment = type === 'seance_approfondie' ? 'seance-approfondie' : 'video';
  return `/cours/${encodeURIComponent(coursId)}/${segment}?v=${encodeURIComponent(videoId)}`;
}

/**
 * Séance de l'agenda qui accueille le sujet : même jour ; spécialité de l'item
 * ciblée (le collège de l'item ou son collège parent, ex. MG pour
 * « MG · Médecine interne ») ; à défaut une séance « toutes spécialités » à
 * moins d'une heure. Entre plusieurs candidates, l'horaire le plus proche.
 */
export function rattacher(
  sujet: { date: string; heure: string; collegeIds: readonly string[] },
  evenements: readonly EvenementRattachable[],
): string | null {
  const cible = minutes(sujet.heure);
  let meilleur: { id: string; ecart: number } | null = null;
  for (const e of evenements) {
    if (e.date !== sujet.date) continue;
    const ecart = e.start_time ? Math.abs(minutes(e.start_time.slice(0, 5)) - cible) : 12 * 60;
    const memeSpecialite = e.scope_type === 'college'
      && (e.scope_colleges ?? []).some((id) => sujet.collegeIds.includes(id));
    const toutes = e.scope_type !== 'college' || (e.scope_colleges ?? []).length === 0;
    if (!memeSpecialite && !(toutes && ecart <= TOLERANCE_TOUTES_MIN)) continue;
    // La séance de la même spécialité l'emporte toujours sur une « toutes spécialités ».
    const score = ecart + (memeSpecialite ? 0 : 24 * 60);
    if (!meilleur || score < meilleur.ecart) meilleur = { id: e.id, ecart: score };
  }
  return meilleur?.id ?? null;
}
