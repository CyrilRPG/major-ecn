'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CalendarPlus, Check, Dumbbell, ListChecks, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToPlanningAction, addToRevisionsAction } from '@/app/(student)/checkup/actions';
import { TEXTS } from '@/lib/checkup/types';

/**
 * Prescription pédagogique (§23) : Revoir mes items ; M'entraîner sur mes
 * lacunes ; Ajouter à mes révisions ; si le planificateur est actif, Ajouter à
 * mon planning (sans jamais dépasser la charge maximale — le planificateur
 * relit les besoins du moteur central).
 */
export function ResultActions({ sessionId, lacuneItemIds, plannerActive }: { sessionId: string; lacuneItemIds: string[]; plannerActive: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [doneRev, setDoneRev] = useState(false);
  const [donePlan, setDonePlan] = useState(false);
  const has = lacuneItemIds.length > 0;
  const trainHref = `/revisions-transversales/ciblee?items=${lacuneItemIds.slice(0, 12).join(',')}&motif=checkup`;
  const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" size="lg"><Link href={`/mes-priorites?checkup=${sessionId}`}><ListChecks /> {TEXTS.ctaReviewItems}</Link></Button>
        {has ? (
          <Button asChild size="lg"><Link href={trainHref}><Dumbbell /> {TEXTS.ctaTrainGaps}</Link></Button>
        ) : (
          <Button size="lg" disabled><Dumbbell /> {TEXTS.ctaTrainGaps}</Button>
        )}
        <Button variant="secondary" size="lg" disabled={!has || pending || doneRev} onClick={() => start(async () => {
          setErr(null);
          const r = await addToRevisionsAction(sessionId);
          if (!r.ok) { setErr(r.error); return; }
          setDoneRev(true);
          setMsg(r.count > 0 ? `${r.count} item${r.count > 1 ? 's' : ''} dans vos révisions${r.firstDue ? ` · première réactivation le ${fmt(r.firstDue)}` : ''}.` : 'Aucune lacune à ajouter.');
        })}>
          {pending && !doneRev ? <Loader2 className="animate-spin" /> : doneRev ? <Check /> : <RefreshCcw />} {TEXTS.ctaAddRevisions}
        </Button>
        {plannerActive && (
          <Button variant="secondary" size="lg" disabled={!has || pending || donePlan} onClick={() => start(async () => {
            setErr(null);
            const r = await addToPlanningAction(sessionId);
            if (!r.ok) { setErr(r.error); return; }
            setDonePlan(true);
            setMsg('Votre planning a été ajusté après votre Check-up, dans la limite de votre charge quotidienne maximale.');
          })}>
            {pending && !donePlan ? <Loader2 className="animate-spin" /> : donePlan ? <Check /> : <CalendarPlus />} {TEXTS.ctaAddPlanning}
          </Button>
        )}
      </div>
      {msg && <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300" role="status">{msg}</p>}
      {err && <p className="text-sm text-(--color-danger)" role="alert">{err}</p>}
    </div>
  );
}
