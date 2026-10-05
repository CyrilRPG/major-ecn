'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChartPoint } from '@/lib/plan/suivi';
import { MoonSolid } from '../icons';

/**
 * Évolution de la réalisation du planning (maquette « Suivi ») : un point par
 * journée PLANIFIÉE (plein = réalisée, creux = 0 %), une bande grise par jour
 * OFF (aucune disponibilité : jamais 0 %, hors moyenne et hors régularité), la
 * courbe interrompue à chaque jour OFF.
 */

const WEEKDAY = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const dayParts = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { wd: WEEKDAY[wd], dm: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`, monday: wd === 1 };
};

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    setW(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const PLOT_TOP = 24;
const PLOT_H = 144;
const LEFT = 74;
const RIGHT_PAD = 14;
const HEIGHT = 214;

export function CompletionChart({ points }: { points: ChartPoint[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const n = points.length;
  // Petit écran : axe des pourcentages plus étroit, libellés plus petits.
  const narrow = width > 0 && width < 520;
  const left = narrow ? 48 : LEFT;
  const fontSize = narrow ? 12 : 14;
  const plotW = Math.max(0, width - left - RIGHT_PAD);
  const step = n > 0 ? plotW / n : 0;
  const xOf = (i: number) => left + step * (i + 0.5);
  const yOf = (r: number) => PLOT_TOP + PLOT_H * (1 - Math.max(0, Math.min(1, r)));
  // Un libellé de jour toutes les `every` journées, pour qu'ils ne se chevauchent jamais (≈ 46 px chacun) ;
  // au-delà de 4 jours d'écart, cadence hebdomadaire calée sur les lundis.
  const every = Math.max(1, Math.ceil((narrow ? 40 : 46) / Math.max(step, 0.5)));
  const weeks = every > 4 || n > 31 ? Math.max(1, Math.ceil(every / 7)) : 0;
  const mondays = points.map((p, i) => (dayParts(p.day).monday ? i : -1)).filter((i) => i >= 0);
  const shownMondays = new Set(mondays.filter((_, k) => (mondays.length - 1 - k) % Math.max(1, weeks) === 0));
  const showLabel = (i: number) => (weeks > 0 ? shownMondays.has(i) : (n - 1 - i) % every === 0);
  const bandW = Math.min(70, step * 0.82);
  // Segments continus de journées planifiées (interrompus par un jour OFF ou une journée sans donnée).
  const segments: { i: number; r: number }[][] = [];
  let cur: { i: number; r: number }[] = [];
  points.forEach((p, i) => {
    if (p.off || p.rate === null) { if (cur.length) segments.push(cur); cur = []; return; }
    cur.push({ i, r: p.rate });
  });
  if (cur.length) segments.push(cur);
  const showValues = step >= 31;
  const valueSize = step >= 46 ? 14 : 12.5;
  const rateLabel = (r: number) => `${Math.round(r * 100)} %`;
  const described = points.filter((p) => !p.off && p.rate !== null).map((p) => `${dayParts(p.day).dm} : ${rateLabel(p.rate!)}`).join(', ');

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={`Réalisation quotidienne du planning. ${described || 'Aucune journée planifiée sur la période.'}`} className="block">
          <defs>
            <linearGradient id="pl-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--pl-area-top)" />
              <stop offset="100%" stopColor="var(--pl-area-bottom)" />
            </linearGradient>
          </defs>
          {/* Grille horizontale et graduations */}
          {[1, 0.75, 0.5, 0.25, 0].map((v) => (
            <g key={v}>
              <line x1={left} x2={width - RIGHT_PAD} y1={yOf(v)} y2={yOf(v)} stroke={v === 0 ? '#d9dbe3' : 'var(--pl-grid)'} strokeWidth={1} />
              <text x={left - (narrow ? 10 : 21)} y={yOf(v) + 5} textAnchor="end" fontSize={fontSize} className="fill-(--pl-text)">{`${Math.round(v * 100)} %`}</text>
            </g>
          ))}
          {/* Grille verticale, bandes OFF */}
          {points.map((p, i) => (
            <g key={p.day}>
              {!p.off && <line x1={xOf(i)} x2={xOf(i)} y1={PLOT_TOP} y2={PLOT_TOP + PLOT_H} stroke="var(--pl-grid)" strokeWidth={0.8} opacity={0.6} />}
              {p.off && (
                <g>
                  <rect x={xOf(i) - bandW / 2} y={PLOT_TOP + 1} width={bandW} height={PLOT_H - 1} rx={2} fill="var(--pl-off)" />
                  {bandW >= 22 && (
                    <foreignObject x={xOf(i) - bandW / 2} y={PLOT_TOP + 40} width={bandW} height={64}>
                      <div className="flex flex-col items-center text-center text-[14px] leading-[19px] text-(--pl-text)">
                        <MoonSolid className="mb-[5px] h-[16px] w-[16px] text-[#8a93a6]" />
                        {bandW >= 46 && <span>Jour<br />OFF</span>}
                      </div>
                    </foreignObject>
                  )}
                </g>
              )}
            </g>
          ))}
          {/* Aires et courbe */}
          {segments.map((seg, k) => {
            const line = seg.map((s, j) => `${j === 0 ? 'M' : 'L'}${xOf(s.i).toFixed(1)},${yOf(s.r).toFixed(1)}`).join(' ');
            const area = `${line} L${xOf(seg[seg.length - 1].i).toFixed(1)},${yOf(0)} L${xOf(seg[0].i).toFixed(1)},${yOf(0)} Z`;
            return (
              <g key={k}>
                <path d={area} fill="url(#pl-area)" />
                {seg.length > 1 && <path d={line} fill="none" stroke="var(--pl-crimson)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
              </g>
            );
          })}
          {/* Points et valeurs */}
          {points.map((p, i) => {
            if (p.off || p.rate === null) return null;
            const done = p.rate > 0;
            return (
              <g key={`pt-${p.day}`}>
                <circle cx={xOf(i)} cy={yOf(p.rate)} r={done ? 5.6 : 5} fill={done ? 'var(--pl-crimson)' : 'var(--pl-card)'} stroke="var(--pl-crimson)" strokeWidth={done ? 0 : 2} />
                {showValues && (
                  <text x={xOf(i)} y={yOf(p.rate) - 12} textAnchor="middle" fontSize={valueSize} className="fill-(--pl-crimson) font-bold">{rateLabel(p.rate)}</text>
                )}
              </g>
            );
          })}
          {/* Jours */}
          {points.map((p, i) => {
            if (!showLabel(i)) return null;
            const { wd, dm } = dayParts(p.day);
            return (
              <g key={`lb-${p.day}`} className="fill-(--pl-text)" fontSize={fontSize}>
                <text x={xOf(i)} y={PLOT_TOP + PLOT_H + 26} textAnchor="middle">{wd}</text>
                <text x={xOf(i)} y={PLOT_TOP + PLOT_H + 44} textAnchor="middle">{dm}</text>
              </g>
            );
          })}
        </svg>
      )}
      {width === 0 && <div style={{ height: HEIGHT }} />}
    </div>
  );
}
