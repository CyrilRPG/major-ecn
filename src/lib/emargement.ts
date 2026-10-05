/**
 * Constantes partagées de l'émargement par cours.
 *
 * Module « pur » : importable par les lecteurs vidéo (client), la barrière
 * d'émargement (client) et la route API (serveur), sans dépendance.
 */

/** Part de la vidéo à partir de laquelle l'émargement devient obligatoire.
 *  Volontairement bas : l'obligation porte sur le cours « vu, même en partie ». */
export const ATTENDANCE_THRESHOLD = 0.2;

/** Émis par les lecteurs vidéo à chaque avancement de la lecture. */
export const VIDEO_PROGRESS_EVENT = 'mecn:video-progress';

/** Émis par la barrière d'émargement pour suspendre la lecture. */
export const VIDEO_PAUSE_EVENT = 'mecn:video-pause';

export type VideoProgressDetail = {
  coursId: string;
  /** Séance lue (videos.id) : l'émargement est tenu par séance. */
  videoId?: string | null;
  /** Progression entre 0 et 1. */
  ratio: number;
  seconds: number;
};

/** Émis quand une feuille est signée hors du lecteur (fenêtre des émargements
 *  en attente) : la barrière du lecteur de ce cours se lève aussitôt. */
export const EMARGEMENT_SIGNE_EVENT = 'mecn:emargement-signe';

export type EmargementSigneDetail = {
  coursId: string;
  kind: 'video' | 'seance';
  /** Séance signée ; null = feuille à l'item. */
  videoId: string | null;
};

/** Intitulé d'une feuille : l'item, puis la séance quand la feuille est tenue
 *  par séance (« Replays - Révisions — Séance 3 : cardiologie »). */
export function titreFeuille(coursTitre: string | null, videoTitre: string | null | undefined): string | null {
  if (!videoTitre) return coursTitre;
  return coursTitre ? `${coursTitre} — ${videoTitre}` : videoTitre;
}
