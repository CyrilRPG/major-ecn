'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';

type FailedQuestion = { id: string; enonce: string };
type Historical = { label: string; pct: number };

export function QcmResults({
  scoreCorrect,
  scoreTotal,
  totalSeconds,
  questionsCount,
  previous,
  history,
  failed,
  coursHref,
  retryHref,
}: {
  scoreCorrect: number;
  scoreTotal: number;
  totalSeconds: number;
  questionsCount: number;
  previous?: { score_correct: number; score_total: number } | null;
  history: Historical[];
  failed: FailedQuestion[];
  coursHref: string;
  retryHref: string;
}) {
  const ratio = scoreTotal > 0 ? scoreCorrect / scoreTotal : 0;
  const pct = Math.round(ratio * 100);
  const [displayed, setDisplayed] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setDisplayed(Math.round(scoreCorrect * p));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [inView, scoreCorrect]);

  const prevPct = previous && previous.score_total > 0 ? (previous.score_correct / previous.score_total) * 100 : null;
  const delta = prevPct === null ? null : pct - prevPct;
  const avg = questionsCount > 0 ? Math.round(totalSeconds / questionsCount) : 0;

  const r = 70;
  const c = 2 * Math.PI * r;
  const dash = c * ratio;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 lg:px-8 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-8">
        <Link href={coursHref}>
          <ArrowLeft />
          Retour au cours
        </Link>
      </Button>

      <motion.div
        ref={wrapRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="surface-card p-8 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="relative w-44 h-44 shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r={r} fill="none" stroke="var(--color-surface-soft)" strokeWidth="14" />
            <motion.circle
              cx="80" cy="80" r={r}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c - dash }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-semibold tracking-tight text-(--color-ink) tabular-nums">
              {displayed}
            </span>
            <span className="text-sm text-(--color-ink-soft)">/ {scoreTotal}</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="text-xs uppercase tracking-wider text-(--color-primary-deep) font-medium">Résultats</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {pct >= 80 ? 'Excellent travail' : pct >= 50 ? 'Bonne base' : 'À retravailler'}
          </h1>
          <p className="mt-2 text-(--color-ink-soft)">
            {scoreCorrect} question{scoreCorrect > 1 ? 's' : ''} juste{scoreCorrect > 1 ? 's' : ''} sur {scoreTotal} ({pct}%).
          </p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KPI label="Temps total" value={formatDuration(totalSeconds)} />
            <KPI label="Temps / question" value={`${avg}s`} />
            {delta !== null && (
              <KPI
                label="Vs. session précédente"
                value={`${delta >= 0 ? '+' : ''}${Math.round(delta)} pt`}
                trend={delta >= 0 ? 'up' : 'down'}
              />
            )}
          </div>
        </div>
      </motion.div>

      {history.length > 1 && (
        <Card className="mt-6">
          <CardContent>
            <p className="text-xs uppercase tracking-wider text-(--color-ink-soft) font-medium mb-3">Historique sur cette série</p>
            <div className="h-44 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(v) => [`${Math.round(Number(v) || 0)}%`, 'Score']}
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                  />
                  <Line type="monotone" dataKey="pct" stroke="#E11D48" strokeWidth={2.5} dot={{ r: 4, fill: '#BE123C' }} activeDot={{ r: 6, fill: '#E11D48' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {failed.length > 0 && (
        <Card className="mt-6">
          <CardContent>
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-(--color-ink-soft) font-medium">Questions à retravailler</p>
                <h2 className="text-lg font-semibold mt-0.5">{failed.length} question{failed.length > 1 ? 's' : ''}</h2>
              </div>
              <Button asChild variant="primary" size="sm">
                <Link href={retryHref}>
                  <RefreshCw />
                  Refaire uniquement les erreurs
                </Link>
              </Button>
            </div>
            <ul className="space-y-2">
              {failed.map((q) => (
                <li key={q.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 text-sm text-(--color-ink)">
                  {q.enonce}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button asChild>
          <Link href={coursHref}>
            Retour au parcours
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function KPI({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
      <p className="text-xs text-(--color-ink-soft)">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-(--color-warning)' : 'text-(--color-ink)'}`}>
        {trend === 'up' && <TrendingUp className="h-4 w-4" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4" />}
        {value}
      </p>
    </div>
  );
}
