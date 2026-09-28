'use client';

import { useEffect, useRef } from 'react';
import { TEINTES_SURLIGNAGE } from '@/lib/fiches/surlignages-pure';
import { useSurlignagesOptionnel } from './contexte';
import { coucheAlignee, neutraliserFiligrane, rectsDepuisDecalages, spansDeCouche } from './dom';

/**
 * Surlignages d'UNE page, dessinés par-dessus le canvas et SOUS la couche
 * texte transparente (qui reste seule à recevoir la souris / le doigt).
 *
 * Le calque entier est en `mix-blend-mode: multiply` et ses rectangles sont
 * opaques : le blanc du papier prend la teinte, le texte et les figures gardent
 * exactement leurs couleurs, et deux morceaux qui se chevauchent ne foncent pas
 * (ils se composent entre eux avant le mélange). Coordonnées en % de la page :
 * identiques à tous les zooms. Le rendu du PDF n'est jamais modifié.
 */
export function CoucheSurlignages({ page, versionCouche }: { page: number; versionCouche: number }) {
  const ctx = useSurlignagesOptionnel();
  const calqueRef = useRef<HTMLDivElement>(null);

  // Couche texte (re)rendue : neutraliser le filigrane, puis recalculer les
  // rectangles des passages retrouvés à une nouvelle place sur cette page.
  const etats = ctx?.etats;
  const surlignages = ctx?.surlignages;
  const textePage = ctx?.textePage;
  const appliquerRects = ctx?.appliquerRects;
  const versionTextes = ctx?.versionTextes;
  useEffect(() => {
    if (!versionCouche || !textePage || !appliquerRects || !surlignages || !etats) return;
    const pageEl = calqueRef.current?.parentElement;
    const couche = pageEl?.querySelector('.textLayer');
    const tp = textePage(page);
    if (!pageEl || !couche || !tp) return;
    const spans = spansDeCouche(couche);
    if (!coucheAlignee(spans, tp)) return;
    neutraliserFiligrane(spans, tp);
    for (const s of surlignages) {
      if (s.page !== page || etats[s.id] !== 'a-redessiner') continue;
      const rects = rectsDepuisDecalages(pageEl, spans, tp, s.debut, s.debut + s.citation.length);
      appliquerRects(s.id, rects, tp.empreinte);
    }
  }, [page, versionCouche, versionTextes, etats, surlignages, textePage, appliquerRects]);

  if (!ctx) return null;
  const visibles = ctx.visiblesSurPage(page);
  return (
    <div
      ref={calqueRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{ mixBlendMode: 'multiply' }}
    >
      {visibles.map((s) =>
        s.rects.map((r, i) => (
          <div
            key={`${s.id}-${i}`}
            data-surlignage={s.id}
            className="absolute rounded-[2px]"
            style={{
              left: `${r.x * 100}%`,
              top: `${r.y * 100}%`,
              width: `${r.w * 100}%`,
              height: `${r.h * 100}%`,
              background: TEINTES_SURLIGNAGE[s.couleur],
            }}
          />
        )),
      )}
    </div>
  );
}
