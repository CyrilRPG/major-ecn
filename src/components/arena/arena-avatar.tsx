import { cheminAvatar, estAvatarPlanche, libelleAvatar, resolveArenaAvatarSeed } from './avatars';
import { useId, type CSSProperties } from 'react';
import { avatarAppearance, AVATAR_DISTINCTIONS, rankLabel } from '@/lib/arena/avatar-appearance';
import './arena-avatar.css';

/** All distinctions are overlays on the same original character. */
export function ArenaAvatar({ seed, size = 40, className, title, rank }: {
  seed: string; size?: number; className?: string; title?: string; rank?: number | null;
}) {
  seed = resolveArenaAvatarSeed(seed);
  const appearance = avatarAppearance(rank);
  const metalId = `metal-${useId().replace(/:/g, '')}`;
  const label = `${title ?? libelleAvatar(seed) ?? 'Avatar'} — ${AVATAR_DISTINCTIONS[appearance].label}${rank ? `, ${rankLabel(rank)} au classement cumulé` : ''}`;
  return (
    <span className={`arena-avatar arena-avatar--${appearance} ${className ?? ''}`} role="img" aria-label={label}
      data-appearance={appearance} data-avatar-seed={seed} style={{ '--avatar-size': `${size}px` } as CSSProperties}>
      <span className="arena-avatar__portrait" aria-hidden><BaseAvatar seed={seed} size={size} /></span>
      {appearance !== 'standard' && <svg className="arena-avatar__overlay" viewBox="0 0 100 100" aria-hidden="true">
        <defs><linearGradient id={metalId} x1="0" y1="0" x2="1" y2="1">
          {(appearance === 'gold' ? ['#fff6b1', '#e1a72b', '#fff3a4', '#b27510'] : appearance === 'silver' ? ['#fff', '#848b98', '#f5f7ff', '#69717f'] : ['#ffe1b5', '#a95c31', '#efb67e', '#713b25']).map((color, i) => <stop key={i} offset={`${i * 100 / 3}%`} stopColor={color} />)}
        </linearGradient></defs>
        {appearance === 'gold' && <path d="M9 74Q50 100 91 74L84 90Q50 113 16 90Z" fill="#760e2d" stroke="#e6b74b" strokeWidth=".7" />}
        <circle cx="50" cy="50" r="48" fill="none" stroke={`url(#${metalId})`} strokeWidth={appearance === 'gold' ? '2.5' : '2'} />
        <circle cx="50" cy="50" r="46" fill="none" stroke={`url(#${metalId})`} strokeWidth=".5" opacity=".6" />
        {appearance === 'gold' && <g fill={`url(#${metalId})`}>
          <path d="M25 86C-1 62 5 27 29 13M75 86C101 62 95 27 71 13" fill="none" stroke={`url(#${metalId})`} strokeWidth=".8" />
          {[0, 1].map(side => <g key={side} transform={side ? 'translate(100 0) scale(-1 1)' : undefined}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <g key={i} transform={`rotate(${i * 11} 50 50)`}>
              <ellipse cx="9" cy="55" rx="2.4" ry="5.5" transform="rotate(-38 9 55)" />
              <ellipse cx="16" cy="51" rx="2.2" ry="5" transform="rotate(34 16 51)" />
            </g>)}
          </g>)}
        </g>}
        <g transform="translate(80 81)">
          <circle r="16" fill={appearance === 'gold' ? '#6c3610' : appearance === 'silver' ? '#292e39' : '#5d2f1a'} stroke={`url(#${metalId})`} strokeWidth="1.8" />
          <circle r="13.4" fill="none" stroke={`url(#${metalId})`} strokeWidth=".5" />
          {appearance === 'gold' ? <g fill="none" stroke="#ffe38c" strokeLinecap="round" strokeLinejoin="round">
            <path d="M-8-7 0-10 8-7V2Q8 8 0 11-8 8-8 2Z" fill="#8b4d0a" strokeWidth=".7" />
            <path d="M0-6V8M0-4C8-5 7 0 1 1S-5 5 0 5 5 7 1 8" strokeWidth="1.3" />
            <circle cy="-7" r="1.2" fill="#ffe38c" stroke="none" />
          </g> : <text textAnchor="middle" y="7" fill={`url(#${metalId})`} fontSize="23" fontFamily="var(--font-oswald), sans-serif" fontWeight="600">{rank}</text>}
        </g>
      </svg>}
    </span>
  );
}

/**
 * <ArenaAvatar /> — avatars EVC Arena, univers gladiateur × médecine.
 * Emblèmes vectoriels (isomorphes, déterministes pour une graine donnée) :
 * casque spartiate, bouclier au caducée, couronne de laurier au cœur, masque
 * de gladiateur au stéthoscope, glaive croisé d'une seringue, bâton d'Esculape
 * sur cimier, ECG en cimier, caducée ailé. Six palettes (or, bronze, rouge,
 * marine, olive, pourpre). Remplace les avatars génériques (demande client).
 */

const PALETTES = [
  { bg: '#1A1F26', ring: '#D4A94A', main: '#E8C878', shade: '#8E6B1F', accent: '#E4002B', ink: '#0B0F14' }, // or
  { bg: '#171A1E', ring: '#B87333', main: '#D89A5E', shade: '#7A4A1F', accent: '#F2F3F5', ink: '#0B0F14' }, // bronze
  { bg: '#1E1216', ring: '#E4002B', main: '#FF3B57', shade: '#7A0A1E', accent: '#E8C878', ink: '#0B0F14' }, // rouge
  { bg: '#121A2B', ring: '#4F7DD9', main: '#8FB2FF', shade: '#26407A', accent: '#E8C878', ink: '#0B0F14' }, // marine
  { bg: '#141D17', ring: '#5FA86A', main: '#8FD39A', shade: '#2E5C36', accent: '#E8C878', ink: '#0B0F14' }, // olive
  { bg: '#1B1426', ring: '#9B6BD9', main: '#C4A2FF', shade: '#52347A', accent: '#E8C878', ink: '#0B0F14' }, // pourpre
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function arenaAvatarParams(seed: string) {
  const h = hash(seed || 'arena');
  return { emblem: h % 8, palette: PALETTES[Math.floor(h / 8) % PALETTES.length], laurel: (h >> 6) % 3 === 0 };
}

type P = (typeof PALETTES)[number];

/* Éléments réutilisables (viewBox 0 0 100 100) */
const Helmet = ({ p, x = 50, y = 54, s = 1 }: { p: P; x?: number; y?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-50 -54)`}>
    <path d="M50 14c-13 0-22 9-22 21v3h8v-3c0-8 6-13 14-13s14 5 14 13v3h8v-3c0-12-9-21-22-21z" fill={p.accent} />
    <path d="M28 52c0-14 10-24 22-24s22 10 22 24v12l-8 10h-4V63H40v11h-4l-8-10z" fill={p.main} />
    <path d="M28 52c0-14 10-24 22-24v46h-6l-8-10z" fill={p.shade} opacity=".35" />
    <path d="M34 47h10v6H34zM56 47h10v6H56zM45 63h10v11H45z" fill={p.ink} />
  </g>
);
const Shield = ({ p }: { p: P }) => (
  <>
    <path d="M50 16 76 26v22c0 16-11 28-26 34C35 76 24 64 24 48V26z" fill={p.main} />
    <path d="M50 16 76 26v22c0 16-11 28-26 34z" fill={p.shade} opacity=".35" />
    <path d="M50 30v40" stroke={p.ink} strokeWidth="4" strokeLinecap="round" />
    <path d="M42 40c0-5 16-5 16 0s-16 6-16 11 16 5 16 0" fill="none" stroke={p.ink} strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="28" r="4" fill={p.accent} />
  </>
);
const Laurel = ({ p, open = false }: { p: P; open?: boolean }) => (
  <g fill={p.main} stroke="none">
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i * 26 - 60) * (Math.PI / 180);
      const r = 33;
      const lx = 50 + Math.cos(Math.PI + a) * r, ly = 58 + Math.sin(Math.PI + a) * r;
      const rx = 50 - Math.cos(Math.PI + a) * r, ry = ly;
      return (
        <g key={i}>
          <ellipse cx={lx} cy={ly} rx="4" ry="8" transform={`rotate(${-40 + i * 22} ${lx} ${ly})`} />
          <ellipse cx={rx} cy={ry} rx="4" ry="8" transform={`rotate(${40 - i * 22} ${rx} ${ry})`} />
        </g>
      );
    })}
    {!open && <path d="M43 72c0-2 14-2 14 0" stroke={p.shade} strokeWidth="2" fill="none" />}
  </g>
);
const Heart = ({ p }: { p: P }) => (
  <>
    <path d="M50 66 33 50c-5-5-4-14 2-17 5-3 11-1 15 4 4-5 10-7 15-4 6 3 7 12 2 17z" fill={p.accent} />
    <path d="M36 50h7l3-6 4 12 4-9 3 3h7" fill="none" stroke={p.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
const Mask = ({ p }: { p: P }) => (
  <>
    <path d="M30 34c0-10 9-16 20-16s20 6 20 16v18c0 14-9 24-20 24S30 66 30 52z" fill={p.main} />
    <path d="M50 18c11 0 20 6 20 16v18c0 14-9 24-20 24z" fill={p.shade} opacity=".35" />
    <path d="M36 44h10v5H36zM54 44h10v5H54z" fill={p.ink} />
    <path d="M42 60c4 4 12 4 16 0" stroke={p.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* stéthoscope */}
    <path d="M22 40c-2 12 6 22 16 24M78 40c2 12-6 22-16 24" stroke={p.accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="82" r="6" fill={p.accent} />
    <path d="M38 64c4 8 20 8 24 0M50 70v6" stroke={p.accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </>
);
const SwordSyringe = ({ p }: { p: P }) => (
  <>
    {/* glaive */}
    <path d="M30 78 66 42l6-14-14 6-36 36z" fill={p.main} />
    <path d="M22 70l8 8" stroke={p.shade} strokeWidth="6" strokeLinecap="round" />
    <path d="M26 66l8 8" stroke={p.accent} strokeWidth="4" strokeLinecap="round" />
    {/* seringue */}
    <path d="M70 78 34 42" stroke={p.ink} strokeWidth="9" strokeLinecap="round" />
    <path d="M70 78 34 42" stroke={p.accent} strokeWidth="6" strokeLinecap="round" />
    <path d="M46 54l8-8M52 60l8-8M58 66l8-8" stroke={p.ink} strokeWidth="1.8" />
    <path d="M34 42l-8-8" stroke={p.ink} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M72 80l6 6" stroke={p.main} strokeWidth="5" strokeLinecap="round" />
  </>
);
const Asclepius = ({ p }: { p: P }) => (
  <>
    <path d="M50 22v56" stroke={p.main} strokeWidth="6" strokeLinecap="round" />
    <path d="M50 78c-10 0-14-6-8-10s14-2 14-8-10-8-14-4 0-10 8-10" fill="none" stroke={p.accent} strokeWidth="4.5" strokeLinecap="round" />
    <path d="M40 30c6-8 14-8 20 0" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" />
    <path d="M28 40c8-16 36-16 44 0" fill="none" stroke={p.shade} strokeWidth="3" strokeLinecap="round" />
  </>
);
const HelmetEcg = ({ p }: { p: P }) => (
  <>
    <Helmet p={p} />
    <path d="M18 88h12l4-8 5 14 5-16 4 10h34" fill="none" stroke={p.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
const WingedCaduceus = ({ p }: { p: P }) => (
  <>
    {/* ailes */}
    <path d="M48 36c-10-8-22-8-30-2 6 1 10 4 12 8-6 0-10 2-12 6 6-1 12 1 16 5 4-1 8-2 14-4zM52 36c10-8 22-8 30-2-6 1-10 4-12 8 6 0 10 2 12 6-6-1-12 1-16 5-4-1-8-2-14-4z" fill={p.main} />
    {/* bâton */}
    <path d="M50 24v56" stroke={p.shade} strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="22" r="5" fill={p.accent} />
    {/* serpents */}
    <path d="M40 34c10 6 10 12 0 18s-10 12 0 18M60 34c-10 6-10 12 0 18s10 12 0 18" fill="none" stroke={p.accent} strokeWidth="3.5" strokeLinecap="round" />
    {/* croix médicale */}
    <path d="M46 84h8M50 80v8" stroke={p.main} strokeWidth="3" strokeLinecap="round" />
  </>
);

function BaseAvatar({ seed, size = 40, className, title }: { seed: string; size?: number; className?: string; title?: string }) {
  // Planche de médaillons fournie par Major ECN (09/09/2026) : elle prime sur
  // les emblèmes générés, qui restent le repli des graines historiques.
  if (estAvatarPlanche(seed)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={cheminAvatar(seed)}
        alt={title ?? libelleAvatar(seed)}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={className}
        style={{ display: 'block', borderRadius: '50%' }}
      />
    );
  }
  const { emblem, palette: p, laurel } = arenaAvatarParams(seed);
  const emblems = [
    <Helmet key="h" p={p} />,
    <Shield key="s" p={p} />,
    <><Laurel key="l" p={p} /><Heart p={p} /></>,
    <Mask key="m" p={p} />,
    <SwordSyringe key="w" p={p} />,
    <Asclepius key="a" p={p} />,
    <HelmetEcg key="e" p={p} />,
    <WingedCaduceus key="c" p={p} />,
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={title ?? 'Avatar'}>
      <defs>
        <radialGradient id={`aa-bg-${emblem}-${p.ring.slice(1)}`} cx="50%" cy="35%" r="70%">
          <stop offset="0" stopColor={p.bg} />
          <stop offset="1" stopColor="#05080D" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#aa-bg-${emblem}-${p.ring.slice(1)})`} />
      <circle cx="50" cy="50" r="47" fill="none" stroke={p.ring} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="43" fill="none" stroke={p.ring} strokeWidth="0.8" opacity=".5" />
      {laurel && emblem !== 2 && <g opacity=".55"><Laurel p={p} open /></g>}
      {emblems[emblem]}
    </svg>
  );
}
