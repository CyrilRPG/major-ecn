'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TYPE_COULEUR, TYPE_COURT, TYPES_ORDRE, formatPourcentage, type EvalType, type PointCourbe } from '@/lib/evaluations/historique-core';

const AXE = '#9AA1AE';
const GRILLE = 'rgba(148,163,184,0.22)';
const JOUR = 86_400_000;

const jourCourt = (t: number) => new Date(t).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit' });
const jourLong = (t: number) => new Date(t).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', year: 'numeric' });

function Bulle({ active, payload }: { active?: boolean; payload?: { payload: PointCourbe }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const vus = new Set<string>();
  const points = payload.map((p) => p.payload).filter((p) => (vus.has(p.cle) ? false : (vus.add(p.cle), true)));
  return (
    <div className="max-w-[260px] rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-xs shadow-(--shadow-soft)">
      {points.map((p) => (
        <div key={p.cle} className="py-0.5">
          <p className="flex items-center gap-1.5 font-semibold text-(--color-ink)">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_COULEUR[p.type] }} aria-hidden />
            {p.intitule}
          </p>
          <p className="mt-0.5 text-(--color-ink-soft)">
            {jourLong(p.t)} · <span className="font-bold tabular-nums text-(--color-ink)">{formatPourcentage(p.pourcentage)}</span>
            {p.note ? <span className="text-(--color-ink-muted)"> ({p.note})</span> : null}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Courbe de progression : abscisse = dates, ordonnée = résultat en % (une
 * même échelle pour toutes les natures). Une couleur et une ligne par nature
 * d'évaluation : un Check-up se compare au Check-up précédent, une épreuve
 * blanche à la précédente. Chaque nouveau résultat s'y ajoute tout seul.
 */
export function CourbeProgression({ points, hauteur = 280 }: { points: PointCourbe[]; hauteur?: number }) {
  if (points.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 text-center text-sm text-(--color-ink-soft)" style={{ height: Math.min(hauteur, 180) }}>
        La courbe apparaîtra dès votre première évaluation notée.
      </div>
    );
  }
  const series = TYPES_ORDRE.map((type) => ({ type, data: points.filter((p) => p.type === type) })).filter((s) => s.data.length > 0);
  const min = points[0].t, max = points[points.length - 1].t;
  const marge = Math.max(JOUR, (max - min) * 0.04);

  return (
    <figure className="space-y-3">
      <div className="-mx-1" style={{ height: hauteur }} role="img" aria-label={`Courbe de progression : ${points.length} évaluation${points.length > 1 ? 's' : ''} notée${points.length > 1 ? 's' : ''}, de ${formatPourcentage(points[0].pourcentage)} à ${formatPourcentage(points[points.length - 1].pourcentage)}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRILLE} vertical={false} />
            <XAxis
              dataKey="t" type="number" scale="time" domain={[min - marge, max + marge]}
              tickFormatter={jourCourt} stroke={AXE} fontSize={11} tickLine={false} axisLine={false} minTickGap={28}
              allowDuplicatedCategory={false}
            />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v} %`} stroke={AXE} fontSize={11} tickLine={false} axisLine={false} width={52} />
            <Tooltip content={<Bulle />} cursor={{ stroke: GRILLE }} />
            {series.map((s) => (
              <Line
                key={s.type} data={s.data} dataKey="pourcentage" name={TYPE_COURT[s.type]} type="monotone"
                stroke={TYPE_COULEUR[s.type]} strokeWidth={2.5} isAnimationActive={false}
                dot={{ r: 4, fill: TYPE_COULEUR[s.type], stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-(--color-ink-soft)">
        {series.map((s) => (
          <span key={s.type} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: TYPE_COULEUR[s.type as EvalType] }} aria-hidden />
            {TYPE_COURT[s.type]} <span className="tabular-nums text-(--color-ink-muted)">({s.data.length})</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
