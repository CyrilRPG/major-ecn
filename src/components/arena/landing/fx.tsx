'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ARENA, BODY, DISPLAY, MONO } from '../arena-ui';

/* ============================================================
   Effets de l'arène — primitives partagées de la landing.
   Codes sportifs uniquement (projecteurs, piste, tableau
   d'affichage, chronomètre) : aucune mascotte, aucun confetti,
   aucune animation infantile (§13). Tout respecte
   prefers-reduced-motion.
   ============================================================ */

/** Feuille de style des animations, montée une seule fois. */
export function ArenaFxStyles() {
  return (
    <style>{`
      @keyframes arena-sweep { 0% { transform: translateX(-120%) skewX(-18deg); } 100% { transform: translateX(220%) skewX(-18deg); } }
      @keyframes arena-flood { 0%, 100% { opacity: .35; transform: rotate(-14deg) scaleY(1); } 50% { opacity: .75; transform: rotate(-6deg) scaleY(1.06); } }
      @keyframes arena-flood-b { 0%, 100% { opacity: .55; transform: rotate(10deg); } 50% { opacity: .25; transform: rotate(16deg); } }
      @keyframes arena-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes arena-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(228,0,43,.55); } 70% { box-shadow: 0 0 0 14px rgba(228,0,43,0); } }
      @keyframes arena-led { 0%, 100% { opacity: .9; } 50% { opacity: 1; } }
      @keyframes arena-scan { 0% { top: -10%; } 100% { top: 110%; } }
      @keyframes arena-runner { 0% { offset-distance: 0%; } 100% { offset-distance: 100%; } }
      .arena-sweep::after { content: ''; position: absolute; inset: -20% -40%; background: linear-gradient(100deg, transparent 40%, rgba(255,255,255,.55) 50%, transparent 60%); animation: arena-sweep 3.2s cubic-bezier(.4,0,.2,1) 1.1s 1 both; pointer-events: none; mix-blend-mode: screen; }
      .arena-flood { animation: arena-flood 9s ease-in-out infinite; transform-origin: top center; }
      .arena-flood-b { animation: arena-flood-b 11s ease-in-out infinite; transform-origin: top center; }
      .arena-ticker { animation: arena-ticker 38s linear infinite; }
      .arena-pulse { animation: arena-pulse 2.2s ease-out infinite; }
      .arena-led { animation: arena-led 1.6s ease-in-out infinite; }
      .arena-scan::before { content: ''; position: absolute; left: 0; right: 0; height: 18%; background: linear-gradient(180deg, transparent, rgba(255,255,255,.06), transparent); animation: arena-scan 5s linear infinite; pointer-events: none; }
      @media (prefers-reduced-motion: reduce) {
        .arena-sweep::after, .arena-flood, .arena-flood-b, .arena-ticker, .arena-pulse, .arena-led, .arena-scan::before { animation: none !important; }
      }
    `}</style>
  );
}

/** Projecteurs de stade : deux cônes de lumière qui respirent au-dessus du contenu. */
export function Floodlights({ intensity = 1 }: { intensity?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="arena-flood absolute -top-[10%] left-[8%] h-[120%] w-[34%]"
        style={{ background: `linear-gradient(180deg, rgba(228,0,43,${0.32 * intensity}) 0%, rgba(228,0,43,${0.06 * intensity}) 55%, transparent 100%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(6px)' }}
      />
      <div
        className="arena-flood-b absolute -top-[10%] right-[6%] h-[120%] w-[34%]"
        style={{ background: `linear-gradient(180deg, rgba(255,255,255,${0.16 * intensity}) 0%, rgba(255,255,255,${0.03 * intensity}) 55%, transparent 100%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', filter: 'blur(8px)' }}
      />
    </div>
  );
}

/** Bandeau défilant façon panneau de stade. */
export function Ticker({ items, tone = 'dark' }: { items: string[]; tone?: 'dark' | 'light' }) {
  const row = items.map((t, i) => (
    <span key={`${t}-${i}`} className="inline-flex items-center gap-5 pr-5 text-[11px] font-extrabold uppercase tracking-[0.24em] sm:text-xs" style={{ color: tone === 'dark' ? ARENA.textSoft : '#4B5563', fontFamily: BODY }}>
      {t}
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: ARENA.red }} />
    </span>
  ));
  return (
    <div className="relative overflow-hidden whitespace-nowrap py-3" style={{ borderTop: `1px solid ${tone === 'dark' ? ARENA.line : '#E8E7E3'}`, borderBottom: `1px solid ${tone === 'dark' ? ARENA.line : '#E8E7E3'}` }} aria-hidden>
      <div className="arena-ticker inline-flex w-max">
        <span className="inline-flex">{row}</span>
        <span className="inline-flex">{row}</span>
      </div>
    </div>
  );
}

/** Chiffres LED de tableau d'affichage, à segments simulés par la fonte mono et une lueur rouge. */
export function LedDigits({ value, size = 'lg', color = ARENA.text, glow = true }: { value: string; size?: 'md' | 'lg' | 'xl'; color?: string; glow?: boolean }) {
  const cls = size === 'xl' ? 'text-[3.4rem] sm:text-[5.5rem]' : size === 'lg' ? 'text-[2.6rem] sm:text-[3.6rem]' : 'text-[1.6rem] sm:text-[2rem]';
  return (
    <span
      className={`arena-led inline-block leading-none ${cls}`}
      style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 500, color, textShadow: glow ? '0 0 18px rgba(228,0,43,0.55), 0 0 2px rgba(255,255,255,0.4)' : 'none', letterSpacing: '0.02em' }}
    >
      {value}
    </span>
  );
}

/** Compteur qui monte quand il entre dans l'écran. */
export function CountUp({ to, duration = 1200, className, style }: { to: number; duration?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) { const t = window.setTimeout(() => setV(to), 0); return () => window.clearTimeout(t); }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);
  return <span ref={ref} className={className} style={style}>{v}</span>;
}

/** Titre à révélation cinétique : chaque mot monte depuis le bas, léger décalage. */
export function KineticTitle({ words, className, style, delay = 0 }: { words: string[]; className?: string; style?: React.CSSProperties; delay?: number }) {
  return (
    <span className={className} style={style}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.08 }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/** Ligne de couloir de piste (SVG inline), réutilisée par la section des manches. */
export function LaneLines({ lanes = 4, tone = 'light' }: { lanes?: number; tone?: 'dark' | 'light' }) {
  const stroke = tone === 'light' ? 'rgba(20,37,78,0.10)' : 'rgba(255,255,255,0.08)';
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {Array.from({ length: lanes + 1 }, (_, i) => {
        const y = 8 + (i * 84) / lanes;
        return <line key={i} x1="0" y1={y} x2="100" y2={y} stroke={stroke} strokeWidth="0.35" strokeDasharray={i === 0 || i === lanes ? undefined : '1.2 0.8'} />;
      })}
    </svg>
  );
}

/** Cadre « écran de stade » : bordure LED discrète + balayage lumineux. */
export function StadiumScreen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`arena-scan relative overflow-hidden rounded-[1.6rem] p-[3px] ${className}`} style={{ background: 'linear-gradient(135deg, rgba(228,0,43,0.55), rgba(255,255,255,0.08) 40%, rgba(228,0,43,0.25))', boxShadow: '0 40px 90px -30px rgba(228,0,43,0.35), 0 30px 60px -30px rgba(0,0,0,0.9)' }}>
      <div className="rounded-[1.45rem]" style={{ background: ARENA.bg }}>{children}</div>
    </div>
  );
}

/** Petite étiquette de section façon dossard. */
export function Bib({ children, tone = 'dark' }: { children: ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ background: tone === 'dark' ? 'rgba(228,0,43,0.14)' : '#FDF1F3', color: tone === 'dark' ? ARENA.redSoft : '#C0112E', fontFamily: DISPLAY, boxShadow: `inset 0 0 0 1px ${tone === 'dark' ? 'rgba(228,0,43,0.35)' : 'rgba(192,17,46,0.25)'}` }}>
      {children}
    </span>
  );
}
