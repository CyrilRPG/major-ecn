'use client';

import { useState, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { acknowledgeFirstPlanAction, acknowledgeInsufficientAction, closeDayAction } from '@/app/(student)/planificateur/actions';
import { useExtraTime } from './extra-time';
import { INSUFFICIENT_EDIT, INSUFFICIENT_KEEP, INSUFFICIENT_TEXT } from '@/lib/plan/types';
import type { TimeFigures } from '@/lib/plan/figures';
import { DayDoneModal, FirstPlanModal, InsufficientTimeModal } from './plan-modals';

const dismissKey = (day: string) => `plan-bravo-vu-${day}`;
const noSubscribe = () => () => {};
function readDismissed(day: string): boolean {
  try { return window.sessionStorage.getItem(dismissKey(day)) === '1'; } catch { return false; }
}
function writeDismissed(day: string) {
  try { window.sessionStorage.setItem(dismissKey(day), '1'); } catch { /* stockage indisponible : sans effet */ }
}

/**
 * Pop-ups de l'écran « Aujourd'hui » :
 *  1. première génération non encore validée → message obligatoire (§8), ou
 *     « temps limité » (§10) si le temps ne suffit pas — bouton « Créer mon planning » ;
 *  2. programme du jour terminé → « Bravo… Il vous reste du temps ? ».
 */
export function PlanPopups({ today, firstPending, insufficient, figures, dayDone }: {
  today: string; firstPending: boolean; insufficient: boolean; figures: TimeFigures; dayDone: boolean;
}) {
  const router = useRouter();
  const extra = useExtraTime();
  // Le message obligatoire ne se ferme que par « Créer mon planning » (ou « Modifier mes disponibilités »).
  const [acked, setAcked] = useState(false);
  const firstOpen = firstPending && !acked;
  const setFirstOpen = () => {};
  // « Bravo » : une fois par jour et par onglet (fermé = on ne le réimpose pas à chaque rafraîchissement).
  const storedDismissed = useSyncExternalStore(noSubscribe, () => readDismissed(today), () => true);
  const [bravoClosed, setBravoClosed] = useState(false);
  const bravoOpen = !firstPending && !acked && dayDone && !storedDismissed && !bravoClosed;
  const setBravoOpen = (v: boolean) => setBravoClosed(!v);
  const [pending, setPending] = useState<'first' | 'continue' | 'stop' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createPlan() {
    setPending('first'); setError(null);
    const r = await acknowledgeFirstPlanAction(insufficient);
    setPending(null);
    if (!r.ok) { setError(r.error); return; }
    setAcked(true);
    router.refresh();
  }
  async function continueWork() {
    // La prochaine activité choisie s'affiche dans la fenêtre « J'ai encore du temps » (avec « Commencer »).
    writeDismissed(today);
    setBravoOpen(false);
    await extra?.claim(null);
  }
  async function stopDay() {
    setPending('stop'); setError(null);
    const r = await closeDayAction();
    setPending(null);
    writeDismissed(today);
    setBravoOpen(false);
    if (!r.ok) { setError(r.error); return; }
    router.refresh();
  }

  return (
    <>
      {firstPending && (insufficient ? (
        <InsufficientTimeModal open={firstOpen} onOpenChange={setFirstOpen} figures={figures} first dismissable={false}
          onPrimary={createPlan} onEdit={() => router.push('/planificateur/parametres')} pending={pending === 'first'} />
      ) : (
        <FirstPlanModal open={firstOpen} onOpenChange={setFirstOpen} onCreate={createPlan} pending={pending === 'first'} />
      ))}
      {firstPending && error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
      <DayDoneModal open={bravoOpen} onOpenChange={(v) => { setBravoOpen(v); if (!v) writeDismissed(today); }}
        onContinue={continueWork} onStop={stopDay} pending={pending === 'continue' || pending === 'stop' ? pending : null} />
      {!firstPending && error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
    </>
  );
}

/** Rappel « temps insuffisant » tant que le candidat n'a pas choisi (addendum §10). */
export function InsufficientBanner() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="rounded-(--radius-card) border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-900/15 dark:text-amber-100">
      <p className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{INSUFFICIENT_TEXT}</span></p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => start(async () => { const r = await acknowledgeInsufficientAction(); if (!r.ok) { setError(r.error); return; } router.refresh(); })}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#730d31] px-4 text-sm font-semibold text-white disabled:opacity-70">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}{INSUFFICIENT_KEEP}
        </button>
        <button type="button" onClick={() => router.push('/planificateur/parametres')} className="inline-flex h-9 items-center rounded-full border border-current px-4 text-sm font-semibold">
          {INSUFFICIENT_EDIT}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-(--color-danger)" role="alert">{error}</p>}
    </div>
  );
}
