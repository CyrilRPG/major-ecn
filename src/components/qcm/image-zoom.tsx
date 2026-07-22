'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zoom des images de questions (QCM / DP / épreuves / séances).
 *
 * Deux entrées :
 *  - `ZoomableImage`  : vignette agrandie + clic → lightbox plein écran.
 *  - `RichTextZoom`   : wrapper à délégation pour les contenus rendus via
 *    dangerouslySetInnerHTML (énoncés, vignettes, justifications) — tout <img>
 *    cliqué à l'intérieur s'ouvre dans la lightbox, sans toucher au sanitizer.
 *
 * La lightbox se ferme au clic n'importe où, via la croix ou avec Échap.
 */

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image agrandie"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 sm:p-10"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>
      {/* Image native : source déjà servie par le Storage, pas d'optimisation utile
          en plein écran — et <img> suit le ratio naturel sans conteneur mesuré. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>,
    document.body,
  );
}

/** Vignette d'image de question, cliquable pour zoomer. */
export function ZoomableImage({
  src,
  className,
  sizes = '256px',
}: {
  src: string;
  /** Classes du conteneur (dimensions/bordure) — voir les tailles par défaut aux points d'usage. */
  className?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* <span role="button"> et non <button> : la vignette vit parfois DANS un
          bouton (item de QCM) et les boutons imbriqués sont invalides en HTML. */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen(true); }
        }}
        aria-label="Agrandir l'image"
        className={cn(
          'relative block cursor-zoom-in overflow-hidden rounded-lg border border-(--color-border) bg-white transition-shadow hover:ring-2 hover:ring-(--color-primary)/40',
          className,
        )}
      >
        <Image src={src} alt="" fill sizes={sizes} className="object-contain p-1.5" unoptimized />
      </span>
      {open && <Lightbox src={src} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * Délégation de clic pour le HTML riche : tout <img> descendant devient zoomable.
 * `stopPropagation` protège les parents interactifs (item de QCM = <button> :
 * zoomer ne doit pas cocher/décocher la proposition).
 */
export function RichTextZoom({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  return (
    <span
      className={cn('contents [&_img]:cursor-zoom-in', className)}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t instanceof HTMLImageElement && t.src) {
          e.preventDefault();
          e.stopPropagation();
          setSrc(t.src);
        }
      }}
    >
      {children}
      {src && <Lightbox src={src} onClose={() => setSrc(null)} />}
    </span>
  );
}
