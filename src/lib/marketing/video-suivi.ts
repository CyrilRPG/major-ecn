import type { EvenementVideo, SourceVideo } from './video-evenements';

/**
 * Envoi des événements de la vidéo de présentation depuis le navigateur.
 *
 * - `visitor_id` : UUID aléatoire gardé dans localStorage (`mecn_video_visitor`).
 *   Aucune donnée personnelle. Navigation privée / stockage bloqué : un
 *   identifiant en mémoire, valable pour la page seulement.
 * - Envoi par `sendBeacon` (survit à une navigation immédiate, ex. clic sur le
 *   bouton de fin), sinon `fetch` keepalive. JAMAIS d'erreur remontée : le
 *   suivi ne doit en aucun cas gêner la lecture ni l'inscription.
 */

const CLE_VISITEUR = 'mecn_video_visitor';
/** Posé au premier événement « play » de ce navigateur : sert à l'événement `signup`. */
const CLE_A_VU = 'mecn_video_play';

let visiteurEnMemoire: string | null = null;

function nouvelId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* contexte non sécurisé */ }
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function visiteurVideo(): string {
  try {
    const existant = window.localStorage.getItem(CLE_VISITEUR);
    if (existant && /^[A-Za-z0-9-]{8,64}$/.test(existant)) return existant;
    const id = nouvelId();
    window.localStorage.setItem(CLE_VISITEUR, id);
    return id;
  } catch {
    visiteurEnMemoire ??= nouvelId();
    return visiteurEnMemoire;
  }
}

/** Ce navigateur a-t-il déjà lancé la vidéo (événement `play` émis) ? */
export function aLanceLaVideo(): boolean {
  try {
    return window.localStorage.getItem(CLE_A_VU) === '1';
  } catch {
    return false;
  }
}

export function envoyerEvenementVideo(event: EvenementVideo, source: SourceVideo | null): void {
  try {
    if (typeof window === 'undefined') return;
    if (event === 'play') {
      try { window.localStorage.setItem(CLE_A_VU, '1'); } catch { /* stockage bloqué */ }
    }
    const corps = JSON.stringify({ visitor_id: visiteurVideo(), event, source, path: window.location.pathname.slice(0, 300) });
    const url = '/api/marketing/video-event';
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(url, new Blob([corps], { type: 'application/json' }))) return;
    }
    void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: corps, keepalive: true }).catch(() => {});
  } catch {
    /* jamais bloquant */
  }
}

/**
 * Après une inscription réussie à l'espace découverte : si ce navigateur a
 * lancé la vidéo, on le signale (taux d'inscription après visionnage).
 */
export function signalerInscriptionApresVideo(): void {
  if (aLanceLaVideo()) envoyerEvenementVideo('signup', null);
}
