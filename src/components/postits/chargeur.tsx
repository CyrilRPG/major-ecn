'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { contexteDepuisChemin } from '@/lib/postits/regles';

/**
 * Point d'entrée « Mes Post-it » de l'espace élève (monté une fois, dans le
 * layout). Il ne pèse presque rien : il déduit de l'adresse si la page admet
 * des Post-it (accueil, spécialité, item et ses ressources — jamais une
 * épreuve, un check-up, une évaluation ou une interrogation, §33), attend que
 * la page soit rendue et le navigateur au repos, puis seulement charge le
 * calque (code, police manuscrite, données de la page) — §23 : les pages
 * pédagogiques ne sont jamais ralenties.
 */
const Calque = dynamic(() => import('./calque'), { ssr: false });

export function ChargeurPostits({ userId }: { userId: string }) {
  const chemin = usePathname() ?? '';
  const contexte = contexteDepuisChemin(chemin);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    if (pret) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setPret(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setPret(true), 1200);
    return () => clearTimeout(t);
  }, [pret]);

  if (!pret || !contexte) return null;
  // `key` : changer de page recharge les notes de la nouvelle page.
  return <Calque key={contexte.cle} contexte={contexte} chemin={chemin} userId={userId} />;
}
