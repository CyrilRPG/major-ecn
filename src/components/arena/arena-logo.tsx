import { ARENA, BODY, HEADLINE } from './tokens';

/**
 * Logo EVC Arena — casque spartiate (SVG, isomorphe) + wordmark condensé
 * « EVC / ARENA » et mention « MAJOR ECN », conformément aux maquettes.
 * La marque Major ECN reste identifiable sur chaque page (notoriété).
 */
export function Helmet({ size = 40, className }: { size?: number; className?: string }) {
  const id = 'evc-helmet-g';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF4A63" />
          <stop offset="1" stopColor="#B00020" />
        </linearGradient>
      </defs>
      {/* cimier */}
      <path d="M32 3 C 22.5 3, 15.5 10.5, 15.5 20 L 21 20 C 21 13.5, 25.8 9, 32 9 C 38.2 9, 43 13.5, 43 20 L 48.5 20 C 48.5 10.5, 41.5 3, 32 3 Z" fill={`url(#${id})`} />
      <path d="M32 9 C 25.8 9, 21 13.5, 21 20 L 43 20 C 43 13.5, 38.2 9, 32 9 Z" fill="#7A0A1E" opacity="0.55" />
      {/* calotte et protège-joues */}
      <path d="M13 40 C 13 25, 21 17, 32 17 C 43 17, 51 25, 51 40 L 51 51 L 43 61 L 39.5 61 L 39.5 50 L 24.5 50 L 24.5 61 L 21 61 L 13 51 Z" fill={`url(#${id})`} />
      {/* ouvertures : yeux et bouche */}
      <path d="M18.5 35 h9.5 v6.5 h-9.5 z" fill={ARENA.bg} />
      <path d="M36 35 h9.5 v6.5 h-9.5 z" fill={ARENA.bg} />
      <path d="M27.5 50 h9 v11 h-9 z" fill={ARENA.bg} />
      {/* nasal */}
      <path d="M29.5 33 h5 v13 h-5 z" fill="#7A0A1E" opacity="0.5" />
      {/* reflet */}
      <path d="M18 34 C 19 27, 24 22, 31 21" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Wordmark horizontal (barre de navigation) : casque + EVC ARENA + « by Major ECN ». */
export function ArenaWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Helmet size={compact ? 28 : 34} />
      <span className="inline-flex items-baseline gap-1.5" style={{ fontFamily: HEADLINE, lineHeight: 1 }}>
        <span className={compact ? 'text-[22px]' : 'text-[26px]'} style={{ color: ARENA.text, letterSpacing: '0.02em' }}>EVC</span>
        <span className={compact ? 'text-[22px]' : 'text-[26px]'} style={{ color: ARENA.red, letterSpacing: '0.06em' }}>ARENA</span>
      </span>
      <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:inline" style={{ color: ARENA.textMuted, fontFamily: BODY }}>by Major ECN</span>
    </span>
  );
}

/** Logo empilé (cartes, écrans mobiles) : casque au-dessus, EVC / ARENA / MAJOR ECN. */
export function ArenaLogoStack({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: { helmet: 34, evc: 30, tag: 9 }, md: { helmet: 48, evc: 42, tag: 10 }, lg: { helmet: 72, evc: 72, tag: 12 } }[size];
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <Helmet size={s.helmet} />
      <span className="mt-1 inline-flex items-baseline gap-2" style={{ fontFamily: HEADLINE, lineHeight: 1 }}>
        <span style={{ fontSize: s.evc, color: ARENA.text, letterSpacing: '0.02em' }}>EVC</span>
        <span style={{ fontSize: s.evc, color: ARENA.red, letterSpacing: '0.06em' }}>ARENA</span>
      </span>
      <span className="mt-1 font-bold uppercase" style={{ fontSize: s.tag, letterSpacing: '0.34em', color: ARENA.textSoft, fontFamily: BODY }}>Major ECN</span>
    </span>
  );
}
