'use client';

import { useState, useSyncExternalStore } from 'react';
import { ChevronDown, ChevronRight, ImageIcon, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';
import { libelleCourtQuestion, questionAUneImage, type QuestionAvecImages } from '@/lib/qcm/images';

type QuestionIndexee = QuestionAvecImages & { id: string; enonce: string };

const REQUETE_GRAND_ECRAN = '(min-width: 640px)';
function abonnerGrandEcran(cb: () => void) {
  const mq = window.matchMedia(REQUETE_GRAND_ECRAN);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
function lireGrandEcran() {
  return window.matchMedia(REQUETE_GRAND_ECRAN).matches;
}

/**
 * « Index de la série » — mode édition du lecteur uniquement.
 *
 * Liste chaque question (numéro, dernière ligne de l'énoncé, badge « image »)
 * et permet d'y sauter directement. Repliable : ouvert par défaut sur les
 * écrans ≥ sm (colonne de droite), replié sur mobile (tiroir au-dessus).
 */
export function SerieIndexPanel({
  questions, vignette, index, onSelect, className,
}: {
  questions: QuestionIndexee[];
  /** Vignette clinique de la série : une image dans la vignette marque toutes les questions. */
  vignette?: string | null;
  index: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  // Ouvert par défaut sur grand écran, replié sur mobile ; le choix explicite
  // de l'utilisateur (clic sur l'en-tête) prime ensuite.
  const grandEcran = useSyncExternalStore(abonnerGrandEcran, lireGrandEcran, () => false);
  const [choix, setChoix] = useState<boolean | null>(null);
  const open = choix ?? grandEcran;
  const setOpen = (fn: (o: boolean) => boolean) => setChoix(fn(open));

  return (
    <aside className={cn('rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-soft)', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-soft)">
          <ListOrdered className="h-3.5 w-3.5" /> Index de la série
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-(--color-ink-muted)">
          {questions.length} question{questions.length > 1 ? 's' : ''}
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open && (
        <ol className="max-h-[50vh] overflow-y-auto border-t border-(--color-border) p-1.5 sm:max-h-[calc(100vh-7rem)]">
          {questions.map((q, i) => {
            const actif = i === index;
            const libelle = libelleCourtQuestion(q.enonce);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-current={actif ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs leading-snug transition-colors',
                    actif
                      ? 'bg-(--color-primary-soft) text-(--color-ink)'
                      : 'text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink)',
                  )}
                >
                  <span className={cn(
                    'mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold',
                    actif ? 'bg-(--color-primary) text-white' : 'bg-(--color-sand-100) text-(--color-ink-soft)',
                  )}>
                    {i + 1}
                  </span>
                  <span className="line-clamp-2 min-w-0 flex-1">
                    {libelle || <em className="text-(--color-ink-muted)">Énoncé vide</em>}
                  </span>
                  {questionAUneImage(q, vignette) && (
                    <span
                      title="Cette question comporte une image (question, item, énoncé, corrigé ou vignette)"
                      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-(--color-border) bg-white px-1.5 py-px text-[10px] font-semibold text-(--color-ink-soft)"
                    >
                      <ImageIcon className="h-3 w-3" /> image
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
