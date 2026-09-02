'use client';

/**
 * Amène le candidat directement au bloc visé par l'ancre du tunnel
 * d'inscription (`#formules`, `#choisir-formule`).
 *
 * Le saut natif du navigateur ne suffit pas ici : la cible est rendue plus bas
 * dans la page et n'existe pas encore au moment de la navigation, si bien que
 * l'arrivée se faisait en haut de page. On attend donc que l'élément
 * apparaisse, on y défile une fois, puis on s'arrête.
 */

import { useEffect } from 'react';

export function AncreTunnel({ actif }: { actif: boolean }) {
  useEffect(() => {
    if (!actif) return;
    const id = window.location.hash.slice(1);
    if (!id) return;

    let essais = 0;
    const timer = window.setInterval(() => {
      const cible = document.getElementById(id);
      if (cible) {
        // `instant` et non le défilement doux hérité du CSS : la cible est à
        // plusieurs milliers de pixels, l'animation ferait défiler toute la
        // page sous les yeux du candidat au lieu de l'amener au bloc.
        cible.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.clearInterval(timer);
        return;
      }
      // ~2 s au total : au-delà, la cible n'existe pas sur cette page.
      if (++essais > 20) window.clearInterval(timer);
    }, 100);

    return () => window.clearInterval(timer);
  }, [actif]);

  return null;
}
