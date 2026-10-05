'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { alertAckAction, alertDisplayedAction, plannerKeepAction } from '@/app/(student)/accueil/moteur-actions';
import type { AlertView, PlannerAlertView } from '@/lib/engagement/display';
import { cn } from '@/lib/utils';

/**
 * Alertes pédagogiques côté candidat (cahier « Alertes » §10 à §14, §42 à
 * §47, §55, §56) : un encart proportionné au niveau, un libellé explicite
 * (jamais la couleur seule), des faits objectifs, un CTA qui ouvre
 * directement l'activité cible. Pop-up UNIQUE au passage aux niveaux 2 et 3 ;
 * une alerte acquittée reste visible en version compacte.
 */

const TONE: Record<AlertView['tone'], { box: string; chip: string; Icon: typeof Info }> = {
  vigilance: { box: 'border-amber-300/70 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-900/15', chip: 'bg-amber-200/70 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100', Icon: Info },
  attention: { box: 'border-amber-300/70 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-900/15', chip: 'bg-amber-200/70 text-amber-950 dark:bg-amber-500/25 dark:text-amber-100', Icon: Info },
  orange: { box: 'border-orange-300 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-900/15', chip: 'bg-orange-200/80 text-orange-950 dark:bg-orange-500/25 dark:text-orange-100', Icon: AlertTriangle },
  important: { box: 'border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-900/15', chip: 'bg-red-200/80 text-red-950 dark:bg-red-500/25 dark:text-red-100', Icon: AlertTriangle },
  reprise: { box: 'border-green-300 bg-green-50 dark:border-green-500/40 dark:bg-green-900/15', chip: 'bg-green-200/80 text-green-950 dark:bg-green-500/25 dark:text-green-100', Icon: CheckCircle2 },
};

function CtaLink({ href, label, primary = true }: { href: string; label: string; primary?: boolean }) {
  return (
    <Link href={href} className={cn('inline-flex min-h-10 items-center justify-center gap-1.5 rounded-(--radius-button) px-4 py-2 text-sm font-semibold focus-ring',
      primary ? 'bg-(--color-primary) text-white hover:bg-(--color-primary-deep)' : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-surface-soft)')}>
      {label} {primary && <ArrowRight className="h-4 w-4" />}
    </Link>
  );
}

export function EngagementAlert({ alert }: { alert: AlertView }) {
  const [open, setOpen] = useState(alert.popup);
  const [acked, setAcked] = useState(alert.compact);
  const [pending, start] = useTransition();
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    // Traçabilité : encart affiché ; pop-up montrée une seule fois par niveau.
    void alertDisplayedAction(alert.episodeId, alert.popup ? alert.level : null);
  }, [alert.episodeId, alert.popup, alert.level]);
  const tone = TONE[alert.tone];
  const ack = () => start(async () => { const r = await alertAckAction(alert.episodeId); if (r.ok) setAcked(true); });
  // Encart proportionné au niveau : vigilance / attention / reprise tiennent sur une bande, faits repliables.
  const leger = alert.tone === 'vigilance' || alert.tone === 'attention' || alert.tone === 'reprise';

  return (
    <>
      <section role="status" aria-live="polite" className={cn('rounded-2xl border', leger ? 'px-4 py-3' : 'p-4 sm:p-5', tone.box)}>
        {leger && !(acked && !alert.persistent) ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide', tone.chip)}><tone.Icon className="h-3 w-3" aria-hidden /> {alert.levelLabel}</span>
                <span className="text-sm font-bold text-(--color-ink)">{alert.title}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-[13px] text-(--color-ink-soft)">{alert.body}</p>
              {alert.facts.length > 0 && (
                <details className="group mt-1 text-xs text-(--color-ink-soft)">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-semibold hover:text-(--color-ink) [&::-webkit-details-marker]:hidden">Voir les faits <span aria-hidden className="transition-transform group-open:rotate-180">▾</span></summary>
                  <ul className="mt-1 space-y-0.5">{alert.facts.map((f) => <li key={f} className="flex gap-1.5"><span aria-hidden>•</span>{f}</li>)}</ul>
                </details>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <CtaLink href={alert.cta.href} label={alert.cta.label} />
              {alert.secondary && <CtaLink href={alert.secondary.href} label={alert.secondary.label} primary={false} />}
              {!acked && alert.tone !== 'reprise' && (
                <button type="button" onClick={ack} disabled={pending} className="text-xs font-medium text-(--color-ink-soft) underline-offset-4 hover:underline focus-ring">
                  {pending ? <Loader2 className="inline h-3 w-3 animate-spin" /> : 'J’ai compris'}
                </button>
              )}
            </div>
          </div>
        ) : acked && !alert.persistent ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 text-sm font-semibold text-(--color-ink)">
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', tone.chip)}>{alert.levelLabel}</span>
              <span className="truncate">{alert.title}</span>
            </p>
            <CtaLink href={alert.cta.href} label={alert.cta.label} />
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', tone.chip)}><tone.Icon className="h-3.5 w-3.5" aria-hidden /> {alert.levelLabel}</span>
              </p>
              <h2 className="mt-2 text-base font-bold text-(--color-ink) sm:text-lg">{alert.title}</h2>
              <p className="mt-1 text-sm text-(--color-ink-soft)">{alert.body}</p>
              {alert.facts.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-(--color-ink-soft)">
                  {alert.facts.map((f) => <li key={f} className="flex gap-1.5"><span aria-hidden>•</span>{f}</li>)}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <CtaLink href={alert.cta.href} label={alert.cta.label} />
              {alert.secondary && <CtaLink href={alert.secondary.href} label={alert.secondary.label} primary={false} />}
              {!acked && alert.tone !== 'reprise' && (
                <button type="button" onClick={ack} disabled={pending} className="text-xs font-medium text-(--color-ink-soft) underline-offset-4 hover:underline focus-ring">
                  {pending ? <Loader2 className="inline h-3 w-3 animate-spin" /> : 'J’ai compris'}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <p><span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide', tone.chip)}><tone.Icon className="h-3.5 w-3.5" aria-hidden /> {alert.levelLabel}</span></p>
            <DialogTitle>{alert.title}</DialogTitle>
            <DialogDescription>{alert.body}</DialogDescription>
          </DialogHeader>
          {alert.facts.length > 0 && <ul className="space-y-1 text-sm text-(--color-ink-soft)">{alert.facts.map((f) => <li key={f}>• {f}</li>)}</ul>}
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {alert.secondary && <Button variant="outline" asChild><Link href={alert.secondary.href} onClick={() => setOpen(false)}>{alert.secondary.label}</Link></Button>}
            <Button asChild><Link href={alert.cta.href} onClick={() => setOpen(false)}>{alert.cta.label}</Link></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PlannerAlert({ alert }: { alert: PlannerAlertView }) {
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void alertDisplayedAction(alert.episodeId, null);
  }, [alert.episodeId]);
  if (hidden) return null;
  const keep = () => start(async () => {
    const r = await plannerKeepAction(alert.episodeId);
    if (r.ok) setHidden(true); else setError(r.error);
  });
  return (
    <section role="status" aria-live="polite" className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-(--shadow-soft)">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-(--color-accent)"><CalendarClock className="h-3 w-3" aria-hidden /> {alert.levelLabel}</span>
            <span className="text-sm font-bold text-(--color-ink)">{alert.title}</span>
          </p>
          {alert.body && <p className="mt-0.5 line-clamp-2 text-[13px] text-(--color-ink-soft)">{alert.body}</p>}
          {alert.facts.length > 0 && (
            <details className="group mt-1 text-xs text-(--color-ink-soft)">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-semibold hover:text-(--color-ink) [&::-webkit-details-marker]:hidden">Voir les faits <span aria-hidden className="transition-transform group-open:rotate-180">▾</span></summary>
              <ul className="mt-1 space-y-0.5">{alert.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
            </details>
          )}
          {error && <p className="mt-1 text-xs text-(--color-danger)" role="alert">{error}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <CtaLink href={alert.cta.href} label={alert.cta.label} />
          {alert.choices && (
            <Button variant="outline" onClick={keep} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null} Conserver</Button>
          )}
          {alert.secondary && <CtaLink href={alert.secondary.href} label={alert.secondary.label} primary={false} />}
        </div>
      </div>
    </section>
  );
}

export function RecoveredBanner({ text }: { text: string }) {
  return (
    <p role="status" className="flex items-center gap-2 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-semibold text-green-950 dark:border-green-500/40 dark:bg-green-900/15 dark:text-green-100">
      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> {text}
    </p>
  );
}
