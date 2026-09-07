'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { ARENA, BODY, DISPLAY, HEADLINE } from '../arena-ui';

/* ============================================================
   Effets de l'arène — sobres, rapides, désactivés sous
   prefers-reduced-motion (§13 : aucune animation infantile).
   ============================================================ */

export function ArenaFxStyles() {
  return (
    <style>{`
@keyframes arena-ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes arena-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
@keyframes arena-sweep { 0% { transform: translateX(-120%) skewX(-18deg) } 100% { transform: translateX(320%) skewX(-18deg) } }
@keyframes arena-led { 0%,100% { opacity: 1 } 92% { opacity: 1 } 94% { opacity: .82 } 96% { opacity: 1 } }
.arena-ticker { animation: arena-ticker 46s linear infinite }
.arena-pulse { animation: arena-pulse 1.6s ease-in-out infinite }
.arena-sweep { animation: arena-sweep 9s ease-in-out infinite }
.arena-led { animation: arena-led 7s linear infinite }
@media (prefers-reduced-motion: reduce) { .arena-ticker, .arena-pulse, .arena-sweep, .arena-led { animation: none } }
    `}</style>
  );
}

/** Étiquette rouge en capitales condensées (dossard de section). */
export function Bib({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'muted' | 'ok' }) {
  const c = tone === 'red' ? ARENA.red : tone === 'ok' ? ARENA.okDeep : ARENA.raised2;
  return (
    <span className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white" style={{ background: c, fontFamily: DISPLAY }}>
      {children}
    </span>
  );
}

/** Écran de stade : cadre sombre, bandeau LED rouge en tête, surface intérieure. */
export function StadiumScreen({ children, title, className = '' }: { children: ReactNode; title?: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl ${className}`} style={{ background: '#05080D', boxShadow: `0 0 0 1px ${ARENA.lineStrong}, 0 40px 90px -40px rgba(0,0,0,0.95), 0 0 80px -30px rgba(228,0,43,0.35)` }}>
      <div className="relative h-[6px] w-full overflow-hidden" style={{ background: `linear-gradient(90deg, ${ARENA.redDeep}, ${ARENA.red} 40%, ${ARENA.redSoft} 60%, ${ARENA.redDeep})` }}>
        <span aria-hidden className="arena-sweep absolute inset-y-0 w-1/4" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
      </div>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 sm:px-7" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{title}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
            <span className="arena-pulse inline-block h-1.5 w-1.5 rounded-full" style={{ background: ARENA.red }} /> Live
          </span>
        </div>
      )}
      <div className="p-2 sm:p-3">{children}</div>
    </div>
  );
}

/** Chiffres de tableau d'affichage (jours · heures · minutes · secondes). */
export function LedDigits({ parts, size = 'lg' }: { parts: (number | null)[]; size?: 'md' | 'lg' }) {
  const cell = (v: number | null) => (v === null ? '--' : v.toString().padStart(2, '0'));
  const units = ['j', 'h', 'min', 's'];
  const fs = size === 'lg' ? 'text-[3.2rem] sm:text-[4.6rem]' : 'text-[2.2rem] sm:text-[3rem]';
  return (
    <div className="arena-led flex items-end justify-center gap-2 sm:gap-4">
      {parts.map((p, i) => (
        <div key={units[i]} className="flex items-end gap-2 sm:gap-4">
          {i > 0 && <span aria-hidden className={`pb-4 ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`} style={{ color: ARENA.redDeep, fontFamily: HEADLINE }}>:</span>}
          <div className="text-center">
            <span className={`block leading-none ${fs}`} style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.04em', textShadow: '0 0 24px rgba(228,0,43,0.35)' }}>{cell(p)}</span>
            <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{units[i]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compteur qui monte jusqu'à `to` quand la tuile entre à l'écran. */
export function CountUp({ to, duration = 900, className, style }: { to: number; duration?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { const t = window.setTimeout(() => setV(to), 0); return () => window.clearTimeout(t); }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={className} style={style}>{v}</span>;
}

/** Bandeau défilant (points clés du format). */
export function Ticker({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-3" style={{ background: ARENA.red }} aria-hidden>
      <div className="arena-ticker flex w-max whitespace-nowrap">
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-6 pr-6 text-[12px] font-semibold uppercase tracking-[0.24em] text-white" style={{ fontFamily: DISPLAY }}>
            {it}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Apparition en fondu-montée, déclenchée à l'entrée à l'écran. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}
