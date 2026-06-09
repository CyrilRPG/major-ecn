'use client';

/**
 * Composants premium réutilisables pour les pages marketing.
 * - AnimatedCounter : compteur qui s'incrémente quand visible
 * - MeshGradient : background mesh gradient CSS-only
 * - NoiseTexture : overlay SVG noise très subtile
 * - SpotlightCard : carte avec effet spotlight au hover (suit la souris)
 * - MarqueeScroll : ticker infini horizontal
 * - GlassCard : carte glassmorphism standardisée
 * - TimelineVertical : timeline verticale animée
 * - ComparisonTable : tableau comparatif premium
 */
import { useEffect, useRef, useState } from 'react';

/* ============================================================
   AnimatedCounter — compteur s'incrémentant au scroll
   ============================================================ */
export function AnimatedCounter({
  end,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
  style,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current || started) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(end);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {value.toLocaleString('fr-FR')}
      {suffix}
    </span>
  );
}

/* ============================================================
   MeshGradient — background mesh CSS via blobs flous
   ============================================================ */
export function MeshGradient({
  colors = [
    'rgba(192,17,46,0.18)',  // bordeaux
    'rgba(15,31,77,0.15)',   // navy
    'rgba(124,58,237,0.15)', // violet
    'rgba(245,200,75,0.15)', // gold
  ],
  className = '',
}: {
  colors?: string[];
  className?: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute -left-[15%] -top-[10%] h-[55%] w-[55%] rounded-full blur-3xl" style={{ background: colors[0], animation: 'mesh-breathe 9s ease-in-out infinite' }} />
      <div className="absolute right-[-10%] top-[20%] h-[45%] w-[45%] rounded-full blur-3xl" style={{ background: colors[1], animation: 'mesh-breathe 11s ease-in-out infinite reverse' }} />
      <div className="absolute -bottom-[10%] left-[20%] h-[50%] w-[50%] rounded-full blur-3xl" style={{ background: colors[2], animation: 'mesh-breathe 13s ease-in-out infinite' }} />
      {colors[3] && <div className="absolute right-[10%] bottom-[15%] h-[35%] w-[35%] rounded-full blur-3xl" style={{ background: colors[3], animation: 'mesh-breathe 15s ease-in-out infinite reverse' }} />}
      <style jsx>{`
        @keyframes mesh-breathe {
          0%, 100% { transform: scale(1) translate(0,0); }
          50% { transform: scale(1.08) translate(2%,-2%); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   NoiseTexture — overlay grain SVG très subtil
   ============================================================ */
export function NoiseTexture({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-[1]"
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        backgroundSize: '200px 200px',
      }}
    />
  );
}

/* ============================================================
   SpotlightCard — carte avec effet spotlight suivant la souris
   ============================================================ */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(192,17,46,0.18)',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--spotlight-x', `${x}px`);
    el.style.setProperty('--spotlight-y', `${y}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden ${className}`}
      style={{
        ...style,
        // @ts-expect-error custom prop
        '--spotlight-color': spotlightColor,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 40%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ============================================================
   MarqueeScroll — ticker infini horizontal
   ============================================================ */
export function MarqueeScroll({
  items,
  speed = 30,
  className = '',
  pauseOnHover = true,
}: {
  items: string[];
  /** Durée en secondes pour un cycle complet. */
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  // Double les items pour un loop seamless
  const doubled = [...items, ...items];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: 'running',
        }}
        onMouseEnter={pauseOnHover ? (e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; } : undefined}
        onMouseLeave={pauseOnHover ? (e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; } : undefined}
      >
        {doubled.map((t, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: 'inherit' }}>
            {t}
            <span aria-hidden style={{ opacity: 0.4 }}>·</span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   GlassCard — carte glassmorphism premium
   ============================================================ */
export function GlassCard({
  children,
  className = '',
  borderGradient = 'linear-gradient(135deg, rgba(192,17,46,0.25), rgba(15,31,77,0.15) 50%, rgba(124,58,237,0.20))',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  borderGradient?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative rounded-3xl p-px ${className}`}
      style={{ background: borderGradient, ...style }}
    >
      <div className="relative h-full w-full rounded-[calc(1.5rem-1px)] bg-white/85 p-6 backdrop-blur-xl sm:p-7">
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   TimelineVertical — timeline animée verticale
   ============================================================ */
export type TimelineStep = {
  n: number;
  title: string;
  description: string;
  Icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
};

export function TimelineVertical({
  steps,
  accentColor = '#C0112E',
}: {
  steps: TimelineStep[];
  accentColor?: string;
}) {
  return (
    <ol className="relative space-y-8 pl-12">
      {/* Ligne verticale */}
      <span
        aria-hidden
        className="absolute left-5 top-2 bottom-2 w-px"
        style={{ background: `linear-gradient(180deg, ${accentColor} 0%, rgba(192,17,46,0.20) 100%)` }}
      />
      {steps.map((s, i) => (
        <li key={s.n} className="relative">
          {/* Pastille numéro */}
          <span
            className="absolute -left-12 flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-extrabold text-white shadow-[0_8px_24px_-8px_rgba(192,17,46,0.45)]"
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${shade(accentColor, -20)} 100%)` }}
          >
            {s.Icon ? <s.Icon className="h-4 w-4" /> : s.n}
          </span>
          <h3 className="text-[16px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
            {s.title}
          </h3>
          <p className="mt-1 text-[14px] leading-relaxed" style={{ color: '#52607A' }}>{s.description}</p>
          {i < steps.length - 1 && <div className="mt-4" />}
        </li>
      ))}
    </ol>
  );
}

/** Assombrit/éclaircit une couleur hex (-100 à 100). */
function shade(hex: string, amount: number): string {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((h) => parseInt(h, 16));
  const fn = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amount * 255) / 100)));
  return '#' + [fn(r), fn(g), fn(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
}

/* ============================================================
   ComparisonTable — tableau comparatif premium
   ============================================================ */
export type CompareRow = {
  feature: string;
  values: (boolean | string)[];
};

export function ComparisonTable({
  columns,
  rows,
  highlightCol = -1,
  accentColor = '#C0112E',
}: {
  columns: { label: string; sub?: string; price?: string }[];
  rows: CompareRow[];
  highlightCol?: number;
  accentColor?: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm" style={{ borderColor: '#E5E9F0' }}>
      {/* Header */}
      <div className="grid border-b" style={{ borderColor: '#E5E9F0', gridTemplateColumns: `1.4fr repeat(${columns.length}, 1fr)` }}>
        <div className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: '#52607A' }}>
          Caractéristique
        </div>
        {columns.map((c, i) => {
          const highlight = i === highlightCol;
          return (
            <div
              key={i}
              className="px-4 py-4 text-center"
              style={highlight ? { background: `linear-gradient(180deg, ${accentColor}15 0%, transparent 100%)` } : {}}
            >
              <p className="text-[13px] font-black" style={{ color: highlight ? accentColor : '#0F1F4D' }}>
                {c.label}
              </p>
              {c.price && (
                <p className="mt-1 text-[18px] font-extrabold" style={{ color: highlight ? accentColor : '#0F1F4D' }}>
                  {c.price}
                </p>
              )}
              {c.sub && <p className="mt-0.5 text-[11px]" style={{ color: '#7A8499' }}>{c.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* Rows */}
      <div>
        {rows.map((r, ri) => (
          <div
            key={ri}
            className="grid items-center border-b last:border-b-0 transition-colors hover:bg-[#FAFBFD]"
            style={{ borderColor: '#F1F4F8', gridTemplateColumns: `1.4fr repeat(${columns.length}, 1fr)` }}
          >
            <div className="px-5 py-3.5 text-[13.5px] font-semibold" style={{ color: '#1F2937' }}>
              {r.feature}
            </div>
            {r.values.map((v, vi) => {
              const highlight = vi === highlightCol;
              return (
                <div
                  key={vi}
                  className="flex items-center justify-center px-4 py-3.5"
                  style={highlight ? { background: `linear-gradient(180deg, ${accentColor}08 0%, transparent 100%)` } : {}}
                >
                  {typeof v === 'boolean' ? (
                    v ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: highlight ? accentColor : '#E7F6EC', color: highlight ? 'white' : '#16793C' }}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </span>
                    ) : (
                      <span className="text-[18px]" style={{ color: '#CBD5E1' }}>—</span>
                    )
                  ) : (
                    <span className="text-[13px] font-semibold" style={{ color: highlight ? accentColor : '#1F2937' }}>{v}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
