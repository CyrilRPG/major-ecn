'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Lock } from 'lucide-react';

/** Écran d'attente : compte à rebours avant l'ouverture, ou message de clôture. */
export function ExamGate({ title, reason, opensAt, closesAt }: {
  title: string;
  reason: 'before' | 'after';
  opensAt: string | null;
  closesAt: string | null;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const target = reason === 'before' && opensAt ? new Date(opensAt).getTime() : null;

  useEffect(() => {
    if (reason !== 'before' || !target) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= target) router.refresh(); // ouverture atteinte
    }, 1000);
    return () => clearInterval(t);
  }, [reason, target, router]);

  const fmt = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    if (d > 0) return `${d}j ${h}h ${m}min`;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-soft)">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)">
        {reason === 'before' ? <CalendarClock className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
      </span>
      <h1 className="mt-4 font-display text-xl font-bold text-(--color-ink)">{title}</h1>
      {reason === 'before' ? (
        <>
          <p className="mt-2 text-sm text-(--color-ink-soft)">L’épreuve ouvrira le <strong className="text-(--color-ink)">{opensAt ? new Date(opensAt).toLocaleString('fr-FR') : '—'}</strong>.</p>
          {target && <p className="mt-4 font-mono text-3xl font-black tabular-nums text-(--color-primary)">{fmt(target - now)}</p>}
          {closesAt && <p className="mt-3 text-xs text-(--color-ink-muted)">Fermeture : {new Date(closesAt).toLocaleString('fr-FR')}</p>}
        </>
      ) : (
        <p className="mt-2 text-sm text-(--color-ink-soft)">La fenêtre de composition est fermée{closesAt ? ` depuis le ${new Date(closesAt).toLocaleString('fr-FR')}` : ''}.</p>
      )}
    </div>
  );
}
