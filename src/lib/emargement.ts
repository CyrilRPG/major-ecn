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
  /** Progression entre 0 et 1. */
  ratio: number;
  seconds: number;
};
