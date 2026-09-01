'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { JAKARTA, MANROPE } from './home-ui';

/* ============================================================
   BANDEAU COMPTE À REBOURS — épreuves de la session 2026.
   Épreuves à partir du 10 novembre 2026, Espace Jean Monnet à
   Rungis (Val-de-Marne). EVCF et EVCP se passent le même jour.
   ============================================================ */

/** Première journée d'épreuves de la session 2026, à minuit UTC : on compte
    des jours de calendrier entiers, pas une fraction d'heures. */
const PREMIERES_EPREUVES = Date.UTC(2026, 10, 10);

export function HomeCountdown() {
  // Le nombre de jours dépend de la date du visiteur : on ne le calcule
  // qu'après le montage, sinon le rendu serveur et le rendu client diffèrent.
  const [jours, setJours] = useState<number | null>(null);

  useEffect(() => {
    const calcule = () => {
      const n = new Date();
      const aujourdhui = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
      setJours(Math.max(0, Math.round((PREMIERES_EPREUVES - aujourdhui) / 86_400_000)));
    };
    calcule();
    const t = setInterval(calcule, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside
      aria-label="Compte à rebours avant les épreuves EVC 2026"
      className="relative z-10"
      style={{ fontFamily: JAKARTA, background: 'linear-gradient(100deg, #6B0F1E 0%, #A5122A 45%, #C0112E 100%)' }}
    >
      <div className="mx-auto flex max-w-[88rem] flex-col items-center gap-x-6 gap-y-3 px-4 py-3.5 text-center sm:px-6 lg:flex-row lg:justify-center lg:px-8 lg:text-left">
        {jours !== null && (
          <p className="shrink-0 rounded-lg bg-white/15 px-3.5 py-1.5 text-[15px] font-black tabular-nums text-white">
            J−{jours}
          </p>
        )}
        <p className="text-[13.5px] leading-snug text-white/90" style={{ fontFamily: MANROPE }}>
          <span className="font-black text-white" style={{ fontFamily: JAKARTA }}>
            Premières épreuves EVC 2026 le 10 novembre 2026
          </span>
          {' — '}
          Espace Jean Monnet, Rungis. EVCF et EVCP le même jour, en présentiel.
        </p>
        <Link
          href="/blog/calendrier-inscription-concours-pae-2026-cng"
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-[12.5px] font-black tracking-tight transition-transform hover:scale-[1.03]"
          style={{ color: '#8B0E22' }}
        >
          Voir le calendrier détaillé
        </Link>
      </div>
    </aside>
  );
}
