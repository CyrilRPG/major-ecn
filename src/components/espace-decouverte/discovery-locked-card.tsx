'use client';

/**
 * Carte verrouillée dans le parcours Découverte.
 * Visuellement identique aux autres cartes du parcours, mais elle déclenche
 * la modale LockedContentModal au clic (au lieu de naviguer vers le contenu).
 */
import { useState } from 'react';
import { ArrowRight, Lock, type LucideIcon } from 'lucide-react';
import { LockedContentModal } from './locked-content-modal';

export function DiscoveryLockedCard({
  label,
  desc,
  Icon,
  accent,
  bg,
}: {
  label: string;
  desc: string;
  Icon: LucideIcon;
  accent: string;
  bg: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex min-h-[170px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-left shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus:outline-none focus-visible:ring-2"
        style={{
          // @ts-expect-error custom CSS prop
          '--tw-ring-color': '#C0112E',
        }}
      >
        {/* Halo pastel (atténué — locked) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `linear-gradient(135deg, transparent 55%, ${bg} 100%)` }}
        />
        {/* Watermark icône grise */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 bottom-0 select-none opacity-[0.08]"
          style={{ color: accent }}
        >
          <Icon className="h-44 w-44" strokeWidth={1.4} />
        </span>

        <div className="relative flex items-start justify-between">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl opacity-90"
            style={{ background: bg, color: accent }}
          >
            <Icon className="h-6 w-6" />
          </span>
          {/* Cadenas rouge top-right pour visibilité immédiate */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm"
            style={{ background: '#FDEEEF', color: '#C0112E' }}
          >
            <Lock className="h-3 w-3" />
            Réservé
          </span>
        </div>
        <div className="relative mt-5">
          <h3 className="text-lg font-bold text-(--color-ink)">{label}</h3>
          <p className="mt-1.5 max-w-[80%] text-sm leading-relaxed text-(--color-ink-soft)">{desc}</p>
        </div>
        <span
          className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: '#C0112E' }}
        >
          <Lock className="h-4 w-4" /> Débloquer
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>

      <LockedContentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
