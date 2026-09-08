import Image from 'next/image';
import type { ReactNode } from 'react';
import { PHOTOS } from './tokens';

type Photo = keyof typeof PHOTOS;

/**
 * Fond photographique de l'arène (visuels client + photos Unsplash, crédits
 * dans public/arena/CREDITS.md) : image en couverture, voile sombre, teinte
 * rouge Major ECN, lueur dorée en pied et vignettage pour garder le texte
 * lisible. `beams` ajoute deux faisceaux statiques ; `animate` applique un
 * lent travelling (Ken Burns), coupé sous prefers-reduced-motion (§13).
 */
export function Stadium({
  photo = 'stadiumRed', darken = 0.62, tint = 0.28, gold = 0.18, topShade = 0, beams = false, animate = false, position = 'center', priority = false, className = '', children,
}: {
  photo?: Photo; darken?: number; tint?: number; gold?: number; /** Dégradé noir depuis le haut (lisibilité du titre). */ topShade?: number; beams?: boolean; animate?: boolean; position?: string; priority?: boolean; className?: string; children?: ReactNode;
}) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div aria-hidden className={`absolute inset-0 -z-30 ${animate ? 'arena-kenburns' : ''}`} style={{ transformOrigin: 'center 40%' }}>
        <Image src={PHOTOS[photo]} alt="" fill priority={priority} sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `rgba(11,15,20,${darken})` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(180deg, rgba(228,0,43,${tint * 0.55}) 0%, rgba(11,15,20,0) 45%, rgba(11,15,20,0.92) 100%)` }} />
      {topShade > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(180deg, rgba(5,8,13,${topShade}) 0%, rgba(5,8,13,${topShade * 0.55}) 32%, rgba(5,8,13,0) 58%)` }} />}
      {gold > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `radial-gradient(ellipse 70% 45% at 50% 100%, rgba(212,169,74,${gold}), transparent 70%)` }} />}
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
