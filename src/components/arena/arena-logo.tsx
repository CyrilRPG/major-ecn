import Image from 'next/image';
import { ARENA, BODY, HEADLINE, PHOTOS } from './tokens';

/**
 * Logo EVC Arena — casque spartiate (visuel client détouré, PNG transparent)
 * + wordmark condensé « EVC ARENA » et mention « BY MAJOR ECN », conformément
 * au modèle de page principale. La marque Major ECN reste identifiable sur
 * chaque page (notoriété). Isomorphe (next/image).
 */
export function Helmet({ size = 40, className = '', priority = false }: { size?: number; className?: string; priority?: boolean }) {
  // Le PNG source fait 880 × 1186 : on fixe la hauteur, la largeur suit.
  const w = Math.round(size * (880 / 1186));
  return <Image src={PHOTOS.helmet} alt="" width={w} height={size} priority={priority} className={`inline-block select-none ${className}`} style={{ width: w, height: size }} />;
}

/** Wordmark horizontal (barre de navigation) : casque + EVC ARENA sur BY MAJOR ECN. */
export function ArenaWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Helmet size={compact ? 40 : 48} />
      <span className="inline-flex flex-col leading-none">
        <span className="inline-flex items-baseline gap-1.5" style={{ fontFamily: HEADLINE }}>
          <span className={compact ? 'text-[24px]' : 'text-[28px]'} style={{ color: ARENA.text, letterSpacing: '0.02em' }}>EVC</span>
          <span className={compact ? 'text-[24px]' : 'text-[28px]'} style={{ color: ARENA.red, letterSpacing: '0.06em' }}>ARENA</span>
        </span>
        <span className="mt-0.5 text-[8.5px] font-bold uppercase" style={{ letterSpacing: '0.34em', color: ARENA.textSoft, fontFamily: BODY }}>By Major ECN</span>
      </span>
    </span>
  );
}

/** Logo empilé (hero, cartes, écrans mobiles) : casque au-dessus, EVC ARENA, BY MAJOR ECN. */
export function ArenaLogoStack({ size = 'md', className = '', priority = false }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; priority?: boolean }) {
  const s = { sm: { helmet: 56, evc: 32, tag: 9 }, md: { helmet: 84, evc: 46, tag: 10 }, lg: { helmet: 120, evc: 72, tag: 12 }, xl: { helmet: 150, evc: 96, tag: 14 } }[size];
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <Helmet size={s.helmet} priority={priority} className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]" />
      <span className="mt-2 inline-flex items-baseline gap-3" style={{ fontFamily: HEADLINE, lineHeight: 1 }}>
        <span style={{ fontSize: s.evc, color: ARENA.text, letterSpacing: '0.02em', textShadow: '0 12px 40px rgba(0,0,0,0.7)' }}>EVC</span>
        <span style={{ fontSize: s.evc, color: ARENA.red, letterSpacing: '0.06em', textShadow: '0 0 40px rgba(228,0,43,0.45)' }}>ARENA</span>
      </span>
      <span className="mt-1.5 font-bold uppercase" style={{ fontSize: s.tag, letterSpacing: '0.38em', color: ARENA.text, fontFamily: BODY }}>By Major ECN</span>
    </span>
  );
}
