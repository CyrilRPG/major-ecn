import { useId, type CSSProperties } from 'react';
import { avatarAppearance, AVATAR_DISTINCTIONS, rankLabel } from '@/lib/arena/avatar-appearance';
import { PortraitAvatar } from '@/components/avatar/portrait-avatar';
import { decrireAvatar } from '@/lib/avatars/portraits';
import type { Distinction } from '@/lib/arena/performance';
import './arena-avatar.css';

/**
 * All distinctions are overlays on the same original character. L'habillage
 * suit la DISTINCTION cumulée (podium ET seuil de distinction) ; le rang ne
 * sert qu'au libellé accessible.
 */
export function ArenaAvatar({ seed, size = 40, className, title, rank, distinction }: {
  seed: string; size?: number; className?: string; title?: string; rank?: number | null; distinction?: Distinction | null;
}) {
  const appearance = avatarAppearance(distinction);
  const metalId = `metal-${useId().replace(/:/g, '')}`;
  const nom = title ?? decrireAvatar(seed);
  const label = `${nom} — ${AVATAR_DISTINCTIONS[appearance].label}${rank ? `, ${rankLabel(rank)} au classement cumulé` : ''}`;
  return (
    <span className={`arena-avatar arena-avatar--${appearance} ${className ?? ''}`} role="img" aria-label={label}
      data-appearance={appearance} data-avatar-seed={seed} style={{ '--avatar-size': `${size}px` } as CSSProperties}>
      <span className="arena-avatar__portrait" aria-hidden><PortraitAvatar seed={seed} size={size} decoratif /></span>
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
          </g> : <text textAnchor="middle" y="7" fill={`url(#${metalId})`} fontSize="23" fontFamily="var(--font-oswald), sans-serif" fontWeight="600">{appearance === 'silver' ? 2 : 3}</text>}
        </g>
      </svg>}
    </span>
  );
}
