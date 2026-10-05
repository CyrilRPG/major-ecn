'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isStudyRoute } from '@/lib/student/study-route';

/**
 * 60 s (et non 30) : chaque battement est une requête authentifiée + 3 requêtes
 * SQL. Avec plusieurs dizaines d'élèves en cours d'étude simultanée, la cadence
 * précédente représentait à elle seule plusieurs requêtes par seconde en
 * permanence. La précision du « Temps de révision » est inchangée : le serveur
 * comptabilise l'écart réel entre deux battements.
 */
const HEARTBEAT_MS = 60_000;

/**
 * Sans clic, frappe, défilement ni toucher depuis 10 minutes, l'élève n'est
 * plus devant la page : plus aucun battement, donc plus de temps compté.
 * Avant le 05/10/2026, un onglet resté ouvert (même caché) comptait jour et
 * nuit — jusqu'à 23 h 47 « de travail » par jour pour certains élèves.
 */
const INACTIF_APRES_MS = 10 * 60_000;
/** Une vidéo de cours se regarde sans toucher la souris : délai porté à 90 min tant qu'elle joue. */
const INACTIF_VIDEO_APRES_MS = 90 * 60_000;

const INTERACTIONS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;

/**
 * Compte le « Temps de révision » — mais UNIQUEMENT sur les pages d'étude
 * réelle (fiche, vidéo, QCM, flashcards, entraînement, révisions transversales,
 * épreuves blanches, Parcours du Major), onglet visible et élève présent.
 * Sur les pages de navigation (accueil, facultés, agenda…), aucun heartbeat
 * n'est émis : ouvrir/parcourir la plateforme ne gonfle plus les statistiques.
 */
export function PlatformTimer() {
  const pathname = usePathname();
  const active = isStudyRoute(pathname);

  useEffect(() => {
    if (!active) return;

    let derniereInteraction = Date.now();

    // Lecteur Bunny (iframe sélectionnée) ou <video> en lecture.
    const videoEnCours = () =>
      document.activeElement instanceof HTMLIFrameElement
      || Array.from(document.querySelectorAll('video')).some((v) => !v.paused && !v.ended);

    const present = () => {
      if (document.visibilityState !== 'visible') return false;
      const inactif = Date.now() - derniereInteraction;
      return inactif < INACTIF_APRES_MS || (inactif < INACTIF_VIDEO_APRES_MS && videoEnCours());
    };

    const send = () => {
      if (!present()) return;
      fetch('/api/student/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // L'effet est relancé à chaque changement de page : `pathname` est à jour.
        body: JSON.stringify({ path: pathname }),
      }).catch(() => { /* offline */ });
    };

    const marquer = () => {
      const revient = Date.now() - derniereInteraction >= INACTIF_APRES_MS;
      derniereInteraction = Date.now();
      // Retour après une absence : on repart tout de suite, sans attendre le prochain battement.
      if (revient) send();
    };

    send();
    const interval = setInterval(send, HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') send();
    };
    document.addEventListener('visibilitychange', onVisibility);
    for (const e of INTERACTIONS) window.addEventListener(e, marquer, { passive: true, capture: true });
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      for (const e of INTERACTIONS) window.removeEventListener(e, marquer, { capture: true });
    };
  }, [active, pathname]);

  return null;
}
