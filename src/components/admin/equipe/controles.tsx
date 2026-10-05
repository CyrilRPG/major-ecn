'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Petites commandes du dialogue « Équipe & Permissions » : interrupteur,
 * pastille cochable, champ libellé. Accessibles au clavier (rôles ARIA
 * switch / checkbox), sans dépendance supplémentaire.
 */

export function Interrupteur({
  actif, onChange, label, disabled, className,
}: { actif: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!actif)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        actif ? 'bg-(--color-primary)' : 'bg-(--color-border)',
        className,
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', actif ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

/** Ligne « titre + aide » avec son interrupteur à droite. */
export function LigneInterrupteur({
  titre, aide, actif, onChange, disabled, icone,
}: { titre: string; aide?: string; actif: boolean; onChange: (v: boolean) => void; disabled?: boolean; icone?: React.ReactNode }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', disabled && 'opacity-60')}>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-(--color-ink)">{icone}{titre}</p>
        {aide && <p className="mt-0.5 text-xs leading-relaxed text-(--color-ink-muted)">{aide}</p>}
      </div>
      <Interrupteur actif={actif} onChange={onChange} label={titre} disabled={disabled} />
    </div>
  );
}

/** Pastille cochable : un droit, un type de contenu, une formule. */
export function Pastille({
  coche, onChange, children, title, disabled, taille = 'md',
}: { coche: boolean; onChange: (v: boolean) => void; children: React.ReactNode; title?: string; disabled?: boolean; taille?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={coche}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!coche)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        taille === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
        coche
          ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
          : 'border-(--color-border) bg-(--color-surface) text-(--color-ink-soft) hover:border-(--color-primary)/40 hover:text-(--color-ink)',
      )}
    >
      <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full', coche ? 'bg-(--color-primary) text-white' : 'border border-(--color-border)')}>
        {coche && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

export function Champ({ label, aide, children, className }: { label: string; aide?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-xs font-semibold text-(--color-ink-soft)">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-[11px] text-(--color-ink-muted)">{aide}</span>}
    </label>
  );
}

export const INPUT = 'h-10 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink) outline-none transition-colors placeholder:text-(--color-ink-muted) focus:border-(--color-primary)';
