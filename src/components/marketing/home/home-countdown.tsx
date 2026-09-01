'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CALENDRIER_ARTICLE, EPREUVES_2026 } from './evc-calendrier-2026';
import { JAKARTA, MANROPE } from './home-ui';

/* ============================================================
   BANDEAU COMPTE À REBOURS — prochaine épreuve de la session.
   Les épreuves s'étalent du 10 novembre 2026 au 15 janvier 2027 et
   chaque spécialité a sa propre date : le bandeau vise donc la
   prochaine épreuve à venir, pas une date unique.
   ============================================================ */

export function HomeCountdown() {
  // La prochaine épreuve dépend de la date du visiteur : on ne la calcule
  // qu'après le montage, sinon le rendu serveur et le rendu client diffèrent.
  const [etat, setEtat] = useState<{ jours: number; nom: string; label: string } | null>(null);

  useEffect(() => {
    const calcule = () => {
      const n = new Date();
      const aujourdhui = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
      const prochaine = EPREUVES_2026.find((e) => Date.UTC(e.a, e.m - 1, e.j) >= aujourdhui);
      if (!prochaine) return setEtat(null);
      const jours = Math.round((Date.UTC(prochaine.a, prochaine.m - 1, prochaine.j) - aujourdhui) / 86_400_000);
      setEtat({ jours, nom: prochaine.nom, label: prochaine.label });
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
        {etat && (
          <p className="shrink-0 rounded-lg bg-white/15 px-3.5 py-1.5 text-[15px] font-black tabular-nums text-white">
            J−{etat.jours}
          </p>
        )}
        <p className="text-[13.5px] leading-snug text-white/90" style={{ fontFamily: MANROPE }}>
          <span className="font-black text-white" style={{ fontFamily: JAKARTA }}>
            {etat ? `Prochaine épreuve EVC : ${etat.nom}, ${etat.label}` : 'Épreuves EVC 2026 : du 10 novembre 2026 au 15 janvier 2027'}
          </span>
          {' — '}
          Espace Jean Monnet, Rungis. Chaque spécialité a sa propre date.
        </p>
        <Link
          href={`/blog/${CALENDRIER_ARTICLE}`}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-[12.5px] font-black tracking-tight transition-transform hover:scale-[1.03]"
          style={{ color: '#8B0E22' }}
        >
          Voir la date de ma spécialité
        </Link>
      </div>
    </aside>
  );
}
