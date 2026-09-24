/**
 * « Séance à venir » : une entrée de la bibliothèque vidéo qui n'a PAS encore
 * de vidéo (ni lien Bunny, ni fichier), créée pour mettre en ligne les
 * dossiers à préparer avant une séance en direct. La vidéo est ajoutée après
 * la séance, sur la même entrée (crayon › lien Bunny) : les supports restent
 * attachés, rien n'est à refaire.
 *
 * Module PUR, sans dépendance : utilisé côté serveur (pages élève, actions
 * d'administration) comme côté client (bibliothèque vidéo).
 */

type AvecSource = { bunny_video_id?: string | null; storage_path?: string | null };

/** L'entrée porte une vidéo regardable (Bunny ou fichier). */
export function aUneVideo(v: AvecSource): boolean {
  return !!v.bunny_video_id || !!v.storage_path;
}

/** Séance annoncée dont la vidéo n'est pas encore déposée. */
export function estSeanceAVenir(v: AvecSource): boolean {
  return !aUneVideo(v);
}

/**
 * Une entrée se montre à l'élève si elle a une vidéo, ou si c'est une séance à
 * venir qui a déjà au moins un document visible pour lui. Une ligne vide (ni
 * vidéo ni document) reste cachée, comme avant : il n'y a rien à préparer.
 *
 * `nbSupportsVisibles` : supports déjà filtrés pour CET élève.
 */
export function seanceMontrable(v: AvecSource, nbSupportsVisibles: number): boolean {
  return aUneVideo(v) || nbSupportsVisibles > 0;
}

/** Fuseau d'affichage des dates de séance (les élèves sont en France). */
const FUSEAU = 'Europe/Paris';

/**
 * Date de séance lisible : « mardi 30 septembre à 18 h 00 » (l'année n'est
 * ajoutée que si elle diffère de l'année en cours). `null` si absente ou
 * invalide.
 */
export function formaterDateSeance(iso: string | null | undefined, maintenant: Date = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const annee = (x: Date) => new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, year: 'numeric' }).format(x);
  const jour = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(annee(d) !== annee(maintenant) ? { year: 'numeric' as const } : {}),
  }).format(d);
  const parties = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d);
  const h = parties.find((p) => p.type === 'hour')?.value ?? '00';
  const m = parties.find((p) => p.type === 'minute')?.value ?? '00';
  return `${jour} à ${h} h ${m}`;
}

/**
 * Valide une date de séance reçue du navigateur (ISO complète, déjà convertie
 * depuis l'heure locale de la personne qui la saisit). Vide ⇒ `null`.
 */
export function normaliserDateSeance(valeur: string | null | undefined): { liveAt: string | null } | { error: string } {
  const brut = (valeur ?? '').trim();
  if (!brut) return { liveAt: null };
  const d = new Date(brut);
  if (Number.isNaN(d.getTime())) return { error: 'Date de la séance invalide.' };
  return { liveAt: d.toISOString() };
}

/**
 * La colonne `videos.live_at` arrive avec la migration
 * 20260924100000_videos_seance_a_venir.sql, appliquée à la main. Tant qu'elle
 * ne l'est pas, PostgREST refuse toute requête qui la cite : on reconnaît
 * l'erreur pour relancer la lecture sans elle plutôt que de tout casser.
 */
export function erreurColonneLiveAt(error: { message?: string | null } | null | undefined): boolean {
  return !!error?.message && /live_at/.test(error.message);
}

export const MIGRATION_SEANCE_A_VENIR = '20260924100000_videos_seance_a_venir.sql';
