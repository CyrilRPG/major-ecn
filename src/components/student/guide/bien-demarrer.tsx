'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Rocket, X } from 'lucide-react';
import { noterRepereAction } from '@/lib/student/guide-actions';
import { TUTORIEL_OPEN_EVENT } from '@/lib/student/tutoriel-video';
import type { PriseEnMain } from '@/lib/student/prise-en-main-core';
import { cn } from '@/lib/utils';

/**
 * « Bien démarrer » : la prise en main en six étapes, sur UNE bande compacte
 * de l'accueil (progression, étapes cochées d'après l'activité réelle,
 * prochaine étape avec son bouton). Masquable ; disparaît une fois terminée.
 */
export function BienDemarrer({ p }: { p: PriseEnMain }) {
  const [masquee, setMasquee] = useState(false);
  const [, start] = useTransition();
  if (masquee || !p.prochaine) return null;
  const n = p.prochaine;
  const pct = Math.round((p.faites / p.total) * 100);
  const masquer = () => {
    setMasquee(true);
    start(async () => { await noterRepereAction('bien-demarrer:masque'); });
  };
  const action = n.href ? (
    <Link href={n.href} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-14px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-ring">
      {n.cta} <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  ) : (
    <button type="button" onClick={() => window.dispatchEvent(new Event(TUTORIEL_OPEN_EVENT))} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-14px_rgba(228,0,43,0.9)] transition-transform hover:scale-[1.02] focus-ring">
      {n.cta} <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <section aria-labelledby="bien-demarrer" className="relative rounded-2xl border border-[#E9D8A6] bg-[linear-gradient(120deg,#FFFBEB_0%,#FFFFFF_55%,#FDF4F5_100%)] px-4 py-3.5 shadow-(--shadow-soft) sm:px-5">
      <button type="button" onClick={masquer} aria-label="Masquer « Bien démarrer »" title="Masquer" className="absolute right-2 top-2 rounded-full p-1.5 text-(--color-ink-muted) transition-colors hover:bg-black/5 hover:text-(--color-ink) focus-ring">
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        {/* Titre + progression */}
        <div className="flex shrink-0 items-center gap-3 pr-6 lg:pr-0">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#F5C84B,#B8860B)] text-[#1F1400] shadow-[0_6px_16px_-8px_rgba(184,134,11,0.8)]">
            <Rocket className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id="bien-demarrer" className="font-(family-name:--font-jakarta) text-[15px] font-extrabold text-[#14254E]">Bien démarrer</h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#F3E7C2]" role="progressbar" aria-label="Prise en main" aria-valuenow={p.faites} aria-valuemin={0} aria-valuemax={p.total}>
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#B8860B,#F5C84B)]" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[12px] font-semibold tabular-nums text-[#7A5B00]">{p.faites}/{p.total}</span>
            </div>
          </div>
        </div>

        {/* Étapes (libellés courts, raison en infobulle) */}
        <ol className="relative -mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Étapes de prise en main">
          {p.etapes.map((e, i) => {
            const courante = e.cle === n.cle;
            return (
              <li key={e.cle} title={`${e.titre} : ${e.pourquoi}`} aria-current={courante ? 'step' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-1 pr-2.5 text-[12px] font-semibold',
                  e.fait ? 'bg-green-50 text-green-800' : courante ? 'bg-white text-[#14254E] ring-2 ring-[#E4002B]/50' : 'bg-white/70 text-(--color-ink-muted) ring-1 ring-(--color-border)',
                )}>
                <span className={cn('grid h-5 w-5 place-items-center rounded-full text-[10px] font-black',
                  e.fait ? 'bg-green-600 text-white' : courante ? 'bg-[linear-gradient(135deg,#E4002B,#F97316)] text-white' : 'bg-(--color-sand-100) text-(--color-ink-muted)')}>
                  {e.fait ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {e.court}
                {e.fait && <span className="sr-only">(fait)</span>}
              </li>
            );
          })}
        </ol>

        {action}
      </div>
      <p className="mt-2 text-[12px] leading-snug text-(--color-ink-soft)">
        <span className="font-bold text-[#14254E]">Prochaine étape : {n.titre}.</span> {n.pourquoi}{' '}
        <Link href="/mode-emploi" className="whitespace-nowrap font-semibold text-[#C0112E] hover:underline">Comprendre la méthode</Link>
      </p>
    </section>
  );
}
