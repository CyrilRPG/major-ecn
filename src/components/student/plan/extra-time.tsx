'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Hourglass, Loader2, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extraTimeAction, startEvaluationAction } from '@/app/(student)/planificateur/actions';
import { EXTRA_TIME_LABEL, SESSION_KIND_LABEL, type SessionKind } from '@/lib/plan/types';
import { cn } from '@/lib/utils';

const CHOICES: { label: string; budget: number | null; hint: string }[] = [
  { label: '15 min', budget: 15, hint: 'Réactivation, QCM ou flashcards' },
  { label: '30 min', budget: 30, hint: 'Une activité courte ou une partie de la séance suivante' },
  { label: '1 h', budget: 60, hint: 'Avancer un véritable item' },
  { label: 'Continuer sans limite', budget: null, hint: 'La suite de votre planning' },
];

type Picked = { itemId: string | null; itemName: string | null; minutes: number; kind: string; reason: string; coursId: string | null };
type Ctx = { open: () => void; claim: (budget: number | null) => Promise<void> };
const ExtraTimeContext = createContext<Ctx | null>(null);

/**
 * « J'ai encore du temps » : UNE fenêtre pour toute la page (elle survit au
 * rafraîchissement qui suit l'ajout de l'activité, même si le bouton qui l'a
 * ouverte disparaît). Le moteur propose la meilleure prochaine activité
 * compatible avec le temps annoncé, qui peut venir d'un jour ultérieur.
 */
export function ExtraTimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | 'free' | 'eval' | null>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claim = useCallback(async (budget: number | null) => {
    setOpen(true); setBusy(budget ?? 'free'); setError(null); setPicked(null);
    const r = await extraTimeAction(budget);
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    setPicked({ itemId: r.itemId, itemName: r.itemName, minutes: r.minutes, kind: r.kind, reason: r.reason, coursId: r.coursId });
    router.refresh();
  }, [router]);
  const value = useMemo<Ctx>(() => ({ open: () => { setOpen(true); setPicked(null); setError(null); }, claim }), [claim]);

  async function startEvaluation() {
    if (!picked?.itemId) return;
    setBusy('eval'); setError(null);
    const r = await startEvaluationAction(picked.itemId);
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    router.push(`/planificateur/evaluation/${r.id}`);
  }

  return (
    <ExtraTimeContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{EXTRA_TIME_LABEL}</DialogTitle>
            <DialogDescription>Combien de temps souhaitez-vous encore consacrer à votre préparation ? Le planificateur choisit la prochaine activité la plus utile à cet instant.</DialogDescription>
          </DialogHeader>
          {!picked ? (
            <div className="grid grid-cols-2 gap-2">
              {CHOICES.map((c) => (
                <button key={c.label} type="button" disabled={busy !== null} onClick={() => claim(c.budget)}
                  className={cn('rounded-xl border border-(--color-border) px-3 py-3 text-left transition hover:border-[#730d31] disabled:opacity-60', c.budget === null && 'col-span-2')}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
                    {busy === (c.budget ?? 'free') && <Loader2 className="h-4 w-4 animate-spin" />}{c.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-(--color-ink-soft)">{c.hint}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)"><Sparkles className="h-4 w-4 text-[#730d31]" /> Activité ajoutée à votre journée</p>
              <p className="text-sm text-(--color-ink)">
                <strong>{picked.itemName ?? 'Révision'}</strong> — {SESSION_KIND_LABEL[picked.kind as SessionKind] ?? picked.kind}, {picked.minutes} min
              </p>
              <p className="text-xs text-(--color-ink-soft)">{picked.reason}</p>
              <div className="flex flex-wrap gap-2">
                {picked.kind === 'evaluation' && picked.itemId ? (
                  <Button size="sm" disabled={busy !== null} onClick={startEvaluation}>{busy === 'eval' ? <Loader2 className="animate-spin" /> : <ClipboardCheck />} Commencer l’évaluation</Button>
                ) : picked.coursId ? (
                  <Button size="sm" asChild><Link href={`/cours/${picked.coursId}`}><Play /> Commencer</Link></Button>
                ) : null}
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
        </DialogContent>
      </Dialog>
    </ExtraTimeContext.Provider>
  );
}

export function useExtraTime(): Ctx | null {
  return useContext(ExtraTimeContext);
}

/** Bouton permanent « J'ai encore du temps » (ouvre la fenêtre de la page). */
export function ExtraTimeButton({ className, variant = 'outline' }: { className?: string; variant?: 'outline' | 'primary' }) {
  const ctx = useExtraTime();
  return (
    <Button variant={variant} size="sm" className={className} onClick={() => ctx?.open()} disabled={!ctx}>
      <Hourglass /> {EXTRA_TIME_LABEL}
    </Button>
  );
}
