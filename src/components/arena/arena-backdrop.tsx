'use client';

import { useEffect, useRef } from 'react';

/**
 * Fond unique de l'arène — une seule photographie de l'amphithéâtre aux
 * torches (`/arena/colosseum-plate.jpg`, plaque sans bannière : les
 * oriflammes sont des éléments HTML, voir arena-oriflammes.tsx), montée UNE
 * fois par le layout Arena dans une couche fixe derrière tout le contenu.
 *
 * Avant, chaque section posait sa propre photo (raccords visibles, image
 * répétée verticalement) et les pages immersives collaient la photo en haut
 * puis un aplat en dessous. Désormais l'architecture reste derrière pendant
 * tout le défilement, avec un voile nuit commun pour la lisibilité des cartes.
 *
 * Bureau (≥ 1024 px, pointeur fin) : couche fixe + parallaxe très légère
 * (translateY ≤ 10 %, rAF, coupée sous prefers-reduced-motion). Mobile /
 * tablette : couche statique en tête de page (variante 1080 px), sans
 * position fixe ni parallaxe. Les règles CSS vivent dans arena-scene.css.
 */
export function ArenaBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // La couche déborde de 10 % en bas (inset bottom -10 %) : on ne dépasse jamais cette réserve.
        const max = el.offsetHeight * 0.1;
        const y = Math.min(max, window.scrollY * 0.08);
        el.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0)`;
      });
    };

    const apply = () => {
      if (mq.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
        raf = 0;
        el.style.transform = '';
      }
    };

    apply();
    mq.addEventListener('change', apply);
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="arena-backdrop" aria-hidden>
      <div ref={ref} className="arena-backdrop-photo" />
      <div className="arena-backdrop-veil" />
    </div>
  );
}
