'use client';

import { useEffect, useRef } from 'react';
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
 * Compte le « Temps de révision » — mais UNIQUEMENT sur les pages d'étude
 * réelle (fiche, vidéo, QCM, flashcards, entraînement, révisions transversales).
 * Sur les pages de navigation (accueil, facultés, agenda…), aucun heartbeat
 * n'est émis : ouvrir/parcourir la plateforme ne gonfle plus les statistiques.
 */
export function PlatformTimer() {
  const pathname = usePathname();
  const active = isStudyRoute(pathname);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    if (!active) return;

    const send = () => {
      fetch('/api/student/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathRef.current }),
      }).catch(() => { /* offline */ });
    };

    send();
    const interval = setInterval(send, HEARTBEAT_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') send();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, pathname]);

  return null;
}
