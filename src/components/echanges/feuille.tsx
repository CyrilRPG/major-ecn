'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Feuille d'actions : glisse du bas sur téléphone (utilisable au pouce, §92),
 * fenêtre centrée sur ordinateur. Échap, clic à l'extérieur : fermeture.
 */
export function Feuille({ ouvert, onFermer, titre, children, large = false }: {
  ouvert: boolean;
  onFermer: () => void;
  titre?: string;
  children: React.ReactNode;
  large?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ouvert) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', k);
    const precedent = document.activeElement as HTMLElement | null;
    window.setTimeout(() => ref.current?.querySelector<HTMLElement>('button, [href], input, textarea, select')?.focus(), 0);
    return () => { document.removeEventListener('keydown', k); precedent?.focus?.(); };
  }, [ouvert, onFermer]);
  if (!ouvert) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={titre ?? 'Actions'}>
      <div className="absolute inset-0 bg-black/40 motion-safe:animate-[fadeIn_.15s_ease-out]" onClick={onFermer} />
      <div ref={ref} className={cn(
        'relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-(--color-surface) pb-[max(1rem,env(safe-area-inset-bottom))] shadow-(--shadow-lifted) sm:rounded-2xl sm:pb-4',
        large ? 'sm:max-w-2xl' : 'sm:max-w-md',
      )}>
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-(--color-surface) px-4 pb-2 pt-3">
          <span className="absolute left-1/2 top-1.5 h-1 w-10 -translate-x-1/2 rounded-full bg-(--color-border-strong) sm:hidden" />
          {titre && <h2 className="flex-1 pt-1 text-[15px] font-bold text-(--color-ink)">{titre}</h2>}
          <button type="button" onClick={onFermer} className="ml-auto rounded-full p-1.5 text-(--color-ink-muted) hover:bg-(--color-surface-soft)" aria-label="Fermer"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-2">{children}</div>
      </div>
    </div>
  );
}

export function ActionFeuille({ icone: Icone, libelle, onClick, danger, aide }: {
  icone: React.ComponentType<{ className?: string }>;
  libelle: string;
  onClick: () => void;
  danger?: boolean;
  aide?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={cn('flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-(--color-surface-soft)', danger ? 'text-[#E4002B]' : 'text-(--color-ink)')}>
      <Icone className="h-5 w-5 shrink-0" />
      <span className="flex-1">
        <span className="block font-medium">{libelle}</span>
        {aide && <span className="block text-[12px] text-(--color-ink-muted)">{aide}</span>}
      </span>
    </button>
  );
}
