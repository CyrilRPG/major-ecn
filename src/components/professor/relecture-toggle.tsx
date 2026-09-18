'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { basculerRelectureCoursAction, basculerRelectureSerieAction } from '@/app/admin/relectures/actions';
import { libelleRelecture, type Relecture } from '@/lib/data/relectures-pure';
import { cn } from '@/lib/utils';

/**
 * Case « relu » du professeur, posée depuis la vue élève.
 *
 * `cible` = une série (« Marquer comme relue ») ou l'item entier (« J'ai fini
 * de tout relire »). Une fois cochée, la case dit qui et quand ; recliquer
 * retire la marque. L'état vient du serveur (la page le charge), la bascule
 * met à jour localement puis rafraîchit la route.
 */
export function RelectureToggle({
  cible,
  initial,
  libelleCoche = 'Marquer comme relue',
  libelleFait,
  taille = 'sm',
  className,
}: {
  cible: { coursId: string; serieId: string } | { coursId: string };
  initial: Relecture | null;
  /** Libellé de la case quand rien n'est encore marqué. */
  libelleCoche?: string;
  /** Libellé une fois marqué (défaut : « Relue par X le d/m »). */
  libelleFait?: string;
  taille?: 'sm' | 'md';
  className?: string;
}) {
  const router = useRouter();
  const [relecture, setRelecture] = useState<Relecture | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Après `router.refresh()`, le serveur renvoie l'état réel de la marque :
  // la case s'y réaligne (deux cases de la même série peuvent coexister le
  // temps d'une transition — chacune suit alors le serveur, pas son clic).
  const cleInitiale = initial?.reviewedAt ?? '';
  const [cleVue, setCleVue] = useState(cleInitiale);
  if (cleInitiale !== cleVue) {
    setCleVue(cleInitiale);
    setRelecture(initial);
  }
  const fait = !!relecture;
  const feminin = 'serieId' in cible;

  const basculer = () => {
    setError(null);
    start(async () => {
      const r = 'serieId' in cible
        ? await basculerRelectureSerieAction({ coursId: cible.coursId, serieId: cible.serieId })
        : await basculerRelectureCoursAction({ coursId: cible.coursId });
      if ('error' in r) { setError(r.error); return; }
      setRelecture(r.relecture);
      router.refresh();
    });
  };

  return (
    <span className={cn('inline-flex flex-col items-start gap-1', className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={fait}
        onClick={basculer}
        disabled={pending}
        title={fait ? 'Retirer la marque de relecture' : libelleCoche}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border font-semibold transition-colors focus-ring disabled:opacity-60',
          taille === 'md' ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-xs',
          fait
            ? 'border-[#16793C]/30 bg-[#E7F6EC] text-[#16793C]'
            : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:border-(--color-border-strong) hover:text-(--color-ink)',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
            fait ? 'border-[#16793C] bg-[#16793C] text-white' : 'border-(--color-border-strong) bg-white',
          )}
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : fait ? <Check className="h-3 w-3" /> : null}
        </span>
        <span className="whitespace-nowrap">
          {fait && relecture ? (libelleFait ?? libelleRelecture(relecture, feminin)) : libelleCoche}
        </span>
      </button>
      {error && <span className="text-[11px] font-medium text-red-600">{error}</span>}
    </span>
  );
}
