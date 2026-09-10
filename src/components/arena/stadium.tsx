import type { ReactNode } from 'react';

/**
 * Section « en scène » de l'arène. Elle posait autrefois sa propre photo
 * (une par section : hero, corrections, règlement…), d'où une image répétée
 * verticalement avec des raccords visibles. La photographie est désormais
 * unique et portée par la couche fixe du layout (arena-backdrop.tsx) ; cette
 * section reste transparente et n'ajoute qu'un voile uniforme (`darken`),
 * une teinte rouge légère en tête (`tint`), un dégradé sombre optionnel depuis
 * le haut (`topShade`), une lueur dorée en pied (`gold`) et deux faisceaux
 * statiques (`beams`). `photo`, `animate`, `position` et `priority` sont
 * conservés pour la compatibilité des appels et ignorés.
 */
export function Stadium({
  darken = 0.2, tint = 0.28, gold = 0.18, topShade = 0, beams = false, className = '', children,
}: {
  photo?: string; darken?: number; tint?: number; gold?: number; /** Dégradé noir depuis le haut (lisibilité du titre). */ topShade?: number; beams?: boolean; animate?: boolean; position?: string; priority?: boolean; className?: string; children?: ReactNode;
}) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      {darken > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `rgba(11,15,20,${Math.min(darken, 0.55)})` }} />}
      {tint > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(180deg, rgba(228,0,43,${tint * 0.4}) 0%, rgba(228,0,43,0) 50%)` }} />}
      {topShade > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `linear-gradient(180deg, rgba(5,8,13,${topShade * 0.6}) 0%, rgba(5,8,13,${topShade * 0.3}) 32%, rgba(5,8,13,0) 58%)` }} />}
      {gold > 0 && <div aria-hidden className="pointer-events-none absolute inset-0 -z-20" style={{ background: `radial-gradient(ellipse 70% 45% at 50% 100%, rgba(212,169,74,${gold}), transparent 70%)` }} />}
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
