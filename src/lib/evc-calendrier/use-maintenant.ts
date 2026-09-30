'use client';

import { useEffect, useState } from 'react';
import { delaiProchainRecalcul } from './dates';

/**
 * Instant courant pour les affichages du calendrier EVC (bandeau, carte du
 * hero), sans erreur d'hydratation ni valeur figée.
 *
 * - Premier rendu : l'instant du RENDU SERVEUR (`rendu`), passé en prop. Le
 *   navigateur produit donc exactement le même HTML que le serveur, quel que
 *   soit son fuseau (tous les calculs se font à l'heure de Paris).
 * - Dès le montage : recalcul avec l'heure réelle (la page peut sortir d'un
 *   cache de quelques minutes), puis au plus tard toutes les heures ET pile au
 *   passage de minuit à Paris, et à chaque retour sur l'onglet (un onglet
 *   laissé ouvert la nuit se remet à jour dès qu'on le regarde).
 */
export function useMaintenant(rendu: number): number {
  const [maintenant, setMaintenant] = useState(rendu);

  useEffect(() => {
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const planifier = () => {
      clearTimeout(minuterie);
      minuterie = setTimeout(() => { setMaintenant(Date.now()); planifier(); }, delaiProchainRecalcul(Date.now()));
    };
    const actualiser = () => { setMaintenant(Date.now()); planifier(); };
    const surVisibilite = () => { if (document.visibilityState === 'visible') actualiser(); };
    // Premier recalcul différé d'un tick : il suit l'hydratation, jamais pendant.
    const premier = setTimeout(actualiser, 0);
    document.addEventListener('visibilitychange', surVisibilite);
    return () => {
      clearTimeout(premier);
      clearTimeout(minuterie);
      document.removeEventListener('visibilitychange', surVisibilite);
    };
  }, []);

  return maintenant;
}
