import Image from 'next/image';
import type { ReactNode } from 'react';
import { PHOTOS } from './tokens';

type Photo = keyof typeof PHOTOS;

/**
 * Fond photographique de stade (photos Unsplash, crédits dans
 * public/arena/CREDITS.md) : image en couverture, voile sombre, teinte rouge
 * Major ECN et vignettage pour garder le texte lisible. `beams` ajoute deux
 * faisceaux de projecteurs statiques (aucune animation infantile, §13).
 */
export function Stadium({
  photo = 'stadiumRed', darken = 0.62, tint = 0.28, beams = false, position = 'center', priority = false, className = '', children,
}: {
  photo?: Photo; darken?: number; tint?: number; beams?: boolean; position?: string; priority?: boolean; className?: string; children?: ReactNode;
}) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <Image src={PHOTOS[photo]} alt="" fill priority={priority} sizes="100vw" className="-z-30 object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `rgba(11,15,20,${darken})` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(180deg, rgba(228,0,43,${tint * 0.55}) 0%, rgba(11,15,20,0) 45%, rgba(11,15,20,0.92) 100%)` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(0,0,0,0) 40%, rgba(11,15,20,0.85) 100%)' }} />
      {beams && (
        <>
          <div aria-hidden className="pointer-events-none absolute -top-[10%] left-[8%] -z-10 h-[140%] w-[26%] opacity-70" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 70%)', transform: 'skewX(-14deg)', filter: 'blur(18px)' }} />
          <div aria-hidden className="pointer-events-none absolute -top-[10%] right-[10%] -z-10 h-[140%] w-[22%] opacity-60" style={{ background: 'linear-gradient(180deg, rgba(228,0,43,0.20), rgba(228,0,43,0) 70%)', transform: 'skewX(16deg)', filter: 'blur(20px)' }} />
        </>
      )}
      {children}
    </div>
  );
}
