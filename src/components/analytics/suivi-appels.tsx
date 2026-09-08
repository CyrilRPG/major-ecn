'use client';

import { useEffect } from 'react';
import { EVENEMENTS, pousserEvenement } from '@/lib/analytics/evenements';

/**
 * Suivi des appels : « Suivi des appels » dans Google Ads.
 *
 * Un écouteur global plutôt qu'un `onClick` sur chaque lien : les numéros sont
 * dispersés (pied de page, page Médecine générale, CGU, CGS) et d'autres
 * apparaîtront. Instrumenter chaque lien garantissait d'en oublier un, et
 * qu'un lien ajouté plus tard ne soit jamais compté.
 *
 * L'écoute se fait en phase de capture, sur `document` : le clic est
 * enregistré même si un composant intercepte l'événement plus bas.
 */
export function SuiviAppels() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const cible = e.target as HTMLElement | null;
      const lien = cible?.closest?.('a[href^="tel:"]') as HTMLAnchorElement | null;
      if (!lien) return;
      pousserEvenement(EVENEMENTS.phoneCall, {
        phone_number: lien.getAttribute('href')?.replace(/^tel:/, '') ?? '',
        page_path: window.location.pathname,
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
