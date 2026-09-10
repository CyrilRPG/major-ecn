import type { ReactNode } from 'react';

/**
 * Oriflammes de l'arène — bannières verticales suspendues au bord supérieur
 * du hero (bordeaux, liseré doré, pointe de fanion), en HTML/SVG et non dans
 * la photo de fond : elles défilent avec le contenu tandis que l'architecture
 * (arena-backdrop.tsx) reste derrière. Position absolue dans le hero qui les
 * accueille ; ce dernier réserve sa hauteur (voir arena-scene.css,
 * `--oriflamme-w` / `--oriflamme-ratio`). Masquées sous 900 px.
 *
 * Composants serveur : aucun état, SVG inline en or.
 */

/** Casque spartiate stylisé, au trait. */
export function SpartanHelmetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* crête */}
      <path d="M13 13c5-9 17-12 28-7l-3 4" />
      <path d="M17 12c5-6 14-8 22-4" />
      <path d="M20 9l-1-4M25 7l0-4M30 6l1-4M35 6l2-3" />
      {/* calotte */}
      <path d="M12 31V22c0-8 5-13 13-13s13 5 13 13v9" />
      {/* fente des yeux et nasal */}
      <path d="M17 24h9M31 24h7M28 20v16" />
      {/* paragnathides */}
      <path d="M12 31l2 11h10l3-6M38 31l-2 11h-5" />
      <path d="M12 31h26" />
    </svg>
  );
}

/** Couronne de laurier, au trait. */
export function LaurelIcon({ className }: { className?: string }) {
  const leaf = 'M0 0c-4.5-2.5-5.5-8-2-12c4.5 2.5 5.5 8 2 12z';
  const angles = [212, 238, 264, 290, 316];
  const side = (mirror: boolean) =>
    angles.map((a) => (
      <path key={`${mirror ? 'r' : 'l'}${a}`} d={leaf} transform={`rotate(${mirror ? 360 - a : a} 24 24) translate(24 6) rotate(${mirror ? 20 : -20})`} />
    ));
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M24 44c-10-2-17-10-17-21M24 44c10-2 17-10 17-21" />
      <g>{side(false)}</g>
      <g transform="translate(48 0) scale(-1 1)">{side(false)}</g>
    </svg>
  );
}

export function ArenaOriflamme({ side, children, className = '' }: { side: 'left' | 'right'; children: ReactNode; className?: string }) {
  const id = `oriflamme-${side}`;
  return (
    <div className={`arena-oriflamme arena-oriflamme-${side} ${className}`} aria-hidden>
      <svg className="arena-oriflamme-cloth" viewBox="0 0 123 380" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6E0F1E" />
            <stop offset="1" stopColor="#4A0A14" />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(0,0,0,0.28)" />
            <stop offset="0.35" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="0.7" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>
        {/* toile : rectangle terminé en pointe de fanion */}
        <path d="M0 0H123V346L61.5 380L0 346Z" fill={`url(#${id}-fill)`} />
        <path d="M0 0H123V346L61.5 380L0 346Z" fill={`url(#${id}-sheen)`} />
        {/* liseré doré fin (stroke non déformé : le ratio est fixé par le CSS) */}
        <path d="M0.75 0.75H122.25V345.6L61.5 379.1L0.75 345.6Z" fill="none" stroke="#E8C46A" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <path d="M6 6H117V342.5L61.5 373L6 342.5Z" fill="none" stroke="rgba(232,196,106,0.45)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* tringle de suspension */}
        <rect x="-4" y="0" width="131" height="4" fill="#C9A24E" />
      </svg>
      <div className="arena-oriflamme-content">{children}</div>
    </div>
  );
}

/** Contenu par défaut de la bannière gauche : casque, EVC ARENA, devise. */
export function OriflammeEvcArena() {
  return (
    <>
      <SpartanHelmetIcon className="arena-oriflamme-icon" />
      <p className="arena-oriflamme-wordmark"><span>EVC</span><span>ARENA</span></p>
      <span className="arena-oriflamme-rule" />
      <p className="arena-oriflamme-motto"><span>Apprendre</span><span>S’évaluer</span><span>Progresser</span></p>
    </>
  );
}

/** Paire d'oriflammes : `left` / `right` acceptent un contenu libre. */
export function ArenaOriflammes({ left, right, className = '' }: { left: ReactNode; right: ReactNode; className?: string }) {
  return (
    <div className={`arena-oriflammes ${className}`} aria-hidden>
      <ArenaOriflamme side="left">{left}</ArenaOriflamme>
      <ArenaOriflamme side="right">{right}</ArenaOriflamme>
    </div>
  );
}
