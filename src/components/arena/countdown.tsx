'use client';

import { useEffect, useState } from 'react';
import { ARENA, BODY, HEADLINE, TABULAR } from './arena-ui';
import { browserTimezone, parisAndLocalLabel, remainingLabel } from '@/lib/arena/time';

/**
 * Compte à rebours en temps restant (§5.1) : « ouvre dans 3 j 12 h ». Rendu
 * neutre côté serveur (tirets) pour éviter tout décalage d'hydratation, puis
 * tick chaque seconde ; `onZero` permet de rafraîchir la page à l'échéance.
 */
export function Countdown({
  target, label, big = false, onZero,
}: { target: string; label: string; big?: boolean; onZero?: () => void }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  const targetMs = new Date(target).getTime();
  const diff = now === null ? null : Math.max(0, targetMs - now);
  useEffect(() => {
    if (diff === 0 && onZero) onZero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff === 0]);

  const cell = (v: number | null) => (v === null ? '--' : v.toString().padStart(2, '0'));
  const s = diff === null ? null : Math.floor(diff / 1000);
  const parts = s === null ? [null, null, null, null] : [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];

  if (!big) {
    return (
      <span style={{ ...TABULAR, color: ARENA.text }}>
        {label} {diff === null ? '…' : remainingLabel(diff)}
      </span>
    );
  }
  return (
    <div className="text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{label}</p>
      <div className="mt-3 flex items-end justify-center gap-2 sm:gap-4">
        {(['j', 'h', 'min', 's'] as const).map((u, i) => (
          <div key={u} className="flex items-end gap-2 sm:gap-4">
            {i > 0 && <span aria-hidden className="pb-4 text-3xl" style={{ color: ARENA.redDeep, fontFamily: HEADLINE }}>:</span>}
            <div className="text-center">
              <span className="block text-[2.8rem] leading-none sm:text-[4rem]" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', textShadow: '0 0 24px rgba(228,0,43,0.35)' }}>{cell(parts[i])}</span>
              <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{u}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** « 20 septembre à 09h00 (heure de Paris) — soit 08h00 chez vous », calculé dans le navigateur. */
export function LocalTime({ iso, withYear = false, className, style }: { iso: string; withYear?: boolean; className?: string; style?: React.CSSProperties }) {
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => setTz(browserTimezone()), 0);
    return () => window.clearTimeout(t);
  }, []);
  return <span className={className} style={style}>{parisAndLocalLabel(new Date(iso), tz, withYear)}</span>;
}
