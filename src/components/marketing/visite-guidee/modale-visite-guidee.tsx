'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { SourceVideo } from '@/lib/marketing/video-evenements';
import { LecteurVisiteGuidee, type CtaFin } from './lecteur-visite-guidee';

/**
 * Modale de la visite guidée, ouverte depuis le hero (image ou lien
 * « Découvrir la plateforme ») : par-dessus la page, sans la quitter.
 *
 * - Grande : ≈ 90vw, 1 280 px au plus, 16:9, bornée par la hauteur d'écran.
 * - Fermeture : Échap, clic sur le fond, bouton ✕ ; le focus revient à
 *   l'élément qui l'a ouverte.
 * - Focus piégé : deux sentinelles encadrent la boîte de dialogue (elles
 *   rattrapent aussi le focus qui sort de l'iframe du lecteur, où un
 *   gestionnaire clavier du document ne voit plus rien).
 * - Défilement de la page bloqué pendant l'ouverture.
 * - Rendue dans un portail : le hero est animé (transform), un `fixed` à
 *   l'intérieur serait positionné par rapport à lui, pas à l'écran.
 * - Démontée à la fermeture : l'iframe (et la lecture) disparaissent avec elle.
 */

const abonnementVide = () => () => {};

/** Contrôles focalisables de la boîte, sentinelles exclues. */
function focusables(boite: HTMLElement | null): HTMLElement[] {
  return Array.from(boite?.querySelectorAll<HTMLElement>('button, a[href], iframe, [tabindex]:not([tabindex="-1"])') ?? [])
    .filter((el) => !el.hasAttribute('disabled') && !el.dataset.sentinelle);
}

export function ModaleVisiteGuidee({
  ouverte, onFermer, embedUrl, source, ctaFin,
}: {
  ouverte: boolean;
  onFermer: () => void;
  embedUrl: string | null;
  source: SourceVideo;
  ctaFin: CtaFin;
}) {
  // Côté serveur, pas de document : le portail n'est rendu qu'après hydratation.
  const client = useSyncExternalStore(abonnementVide, () => true, () => false);
  const boiteRef = useRef<HTMLDivElement>(null);
  const fermerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouverte) return;
    const precedent = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const largeurBarre = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (largeurBarre > 0) document.body.style.paddingRight = `${largeurBarre}px`;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onFermer(); } };
    document.addEventListener('keydown', onKey);
    // Focus initial sur le premier contrôle de la boîte (le bouton son, une fois l'iframe montée).
    const t = setTimeout(() => focusables(boiteRef.current)[0]?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      precedent?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouverte]);

  const premierFocusable = () => focusables(boiteRef.current)[0] ?? fermerRef.current;
  const dernierFocusable = () => focusables(boiteRef.current).at(-1) ?? fermerRef.current;

  if (!client || !ouverte) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050914]/85 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}
    >
      <span tabIndex={0} data-sentinelle="1" onFocus={() => dernierFocusable()?.focus()} />
      <div
        ref={boiteRef}
        role="dialog"
        aria-modal="true"
        aria-label="Visite guidée de la plateforme Major ECN"
        className="relative flex flex-col"
        style={{ width: 'min(90vw, 1280px, calc((90vh - 3.5rem) * 16 / 9))' }}
      >
        <div className="mb-2 flex justify-end">
          <button
            ref={fermerRef}
            type="button"
            onClick={onFermer}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-2 text-[13px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
            aria-label="Fermer la vidéo"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <X className="h-4 w-4" /> Fermer
          </button>
        </div>
        <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]" style={{ aspectRatio: '16 / 9' }}>
          <LecteurVisiteGuidee embedUrl={embedUrl} source={source} ctaFin={ctaFin} demarrerAuMontage />
        </div>
      </div>
      <span tabIndex={0} data-sentinelle="1" onFocus={() => premierFocusable()?.focus()} />
    </div>,
    document.body,
  );
}
