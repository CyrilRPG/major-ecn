'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, Play, CalendarClock, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { completeSessionAction, postponeSessionAction, startEvaluationAction, startSessionAction } from '@/app/(student)/planificateur/actions';
import { PRIORITY_TIER_LABEL, SESSION_KIND_LABEL, SESSION_STATUS_LABEL, type PriorityTier, type SessionKind, type SessionStatus } from '@/lib/plan/types';
import { cn } from '@/lib/utils';

export type SessionView = {
  id: string;
  day: string;
  minutes: number;
  kind: SessionKind;
  status: SessionStatus;
  reason: string;
  priorityTier: string | null;
  part: number | null;
  parts: number | null;
  itemId: string | null;
  itemName: string;
  coursId: string | null;
  masteryScore: number | null;
  canEvaluate: boolean;
};

const TIER_CLASS: Record<PriorityTier, string> = {
  tres_elevee: 'text-(--color-danger)', elevee: 'text-amber-700 dark:text-amber-300', normale: 'text-(--color-primary)', secondaire: 'text-(--color-ink-muted)',
};

/** Séance du jour (§19) : Commencer / Terminé / Reporter, explication (§20). */
export function SessionCard({ s, compact = false }: { s: SessionView; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [askMinutes, setAskMinutes] = useState(false);
  const [minutes, setMinutes] = useState(String(s.minutes));
  const tier = (s.priorityTier ?? 'normale') as PriorityTier;
  const done = s.status === 'terminee';
  const run = (fn: () => Promise<{ ok: boolean; error?: string; id?: string }>, after?: (r: { id?: string }) => void) => start(async () => {
    setError(null);
    const r = await fn();
    if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
    after?.(r);
    router.refresh();
  });

  return (
    <li className={cn('rounded-(--radius-card) border bg-(--color-surface) p-3 sm:p-4', done ? 'border-emerald-300/60 opacity-80' : 'border-(--color-border)')}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-semibold text-(--color-ink)">
            {s.coursId ? <Link href={`/cours/${s.coursId}`} className="underline-offset-4 hover:underline">{s.itemName}</Link> : s.itemName}
            <span className="text-sm font-normal text-(--color-ink-soft)">— {s.minutes} min</span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
            <span className={cn('font-medium', TIER_CLASS[tier])}>{PRIORITY_TIER_LABEL[tier]}</span>
            <Badge variant="outline">{SESSION_KIND_LABEL[s.kind]}{s.part && s.parts && s.parts > 1 ? ` ${s.part}/${s.parts}` : ''}</Badge>
            {s.masteryScore !== null && <span className="text-(--color-ink-soft)">Maîtrise actuelle : {Math.round(s.masteryScore)} %</span>}
            {s.status !== 'planifiee' && <Badge variant={done ? 'success' : 'muted'}>{SESSION_STATUS_LABEL[s.status]}</Badge>}
          </p>
          {!compact && (
            <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1.5 inline-flex items-center gap-1 text-xs text-(--color-primary) underline-offset-4 hover:underline">
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} Pourquoi cette séance ?
            </button>
          )}
          {open && <p className="mt-1 text-xs text-(--color-ink-soft)">{s.reason}</p>}
        </div>
        {!done && (
          <div className="flex flex-wrap gap-1.5">
            {s.kind === 'evaluation' && s.canEvaluate && s.itemId ? (
              <Button size="sm" disabled={pending} onClick={() => run(() => startEvaluationAction(s.itemId!), (r) => { if (r.id) router.push(`/planificateur/evaluation/${r.id}`); })}>
                {pending ? <Loader2 className="animate-spin" /> : <ClipboardCheck />} Commencer l’évaluation
              </Button>
            ) : (
              <>
                {s.status !== 'en_cours' && s.coursId && (
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/cours/${s.coursId}`} onClick={() => { void startSessionAction(s.id); }}><Play /> Commencer</Link>
                  </Button>
                )}
                {s.status !== 'en_cours' && !s.coursId && (
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => run(() => startSessionAction(s.id))}><Play /> Commencer</Button>
                )}
              </>
            )}
            {askMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Input type="number" min={5} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="h-9 w-20 text-sm" aria-label="Minutes réellement passées" />
                <Button size="sm" disabled={pending} onClick={() => run(() => completeSessionAction(s.id, Number(minutes) || null))}>{pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider</Button>
              </span>
            ) : (
              <Button size="sm" disabled={pending} onClick={() => setAskMinutes(true)}><CheckCircle2 /> Terminé</Button>
            )}
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => postponeSessionAction(s.id))}><CalendarClock /> Reporter</Button>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-(--color-danger)" role="alert">{error}</p>}
    </li>
  );
}
