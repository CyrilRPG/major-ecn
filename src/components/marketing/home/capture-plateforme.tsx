'use client';

import Image from 'next/image';
import type { CalendrierEvc } from '@/lib/evc-calendrier/types';
import { useMaintenant } from '@/lib/evc-calendrier/use-maintenant';
import { HeroCaptureCarte } from './hero-capture-carte';

/**
 * Capture ordinateur + tablette avec sa carte calendrier VIVANTE (jamais la
 * capture d'origine et son « J-146 » figé). Sert d'affiche au lecteur de
 * /visite-guidee ; le hero de l'accueil compose la même chose dans son bouton.
 */
export function CapturePlateforme({ calendrier, rendu, className }: { calendrier: CalendrierEvc; rendu: number; className?: string }) {
  const maintenant = useMaintenant(rendu);
  return (
    <span className={`relative block aspect-[1504/914] ${className ?? ''}`} style={{ containerType: 'inline-size' }}>
      <Image src="/homepage/hero-plateforme-base.png" alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-contain" />
      <HeroCaptureCarte calendrier={calendrier} maintenant={maintenant} />
    </span>
  );
}
