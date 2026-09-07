'use client';

import type { ReactNode } from 'react';
import { ARENA } from './arena-ui';

/**
 * Anneau de chronomètre des maquettes : piste sombre, arc rouge qui se vide,
 * contenu centré (temps restant). `progress` ∈ [0,1] = fraction restante.
 * Isomorphe et sans animation continue : l'arc suit simplement la valeur.
 */
export function Ring({
  progress, size = 132, stroke = 7, color = ARENA.red, urgent = false, children, className = '',
}: { progress: number; size?: number; stroke?: number; color?: string; urgent?: boolean; children?: ReactNode; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={urgent ? ARENA.redSoft : color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)}
          style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s', filter: urgent ? 'drop-shadow(0 0 8px rgba(228,0,43,0.8))' : 'drop-shadow(0 0 6px rgba(228,0,43,0.45))' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
