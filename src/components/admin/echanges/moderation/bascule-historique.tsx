'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Bascule « À traiter / Historique » des signalements et tentatives bloquées (paramètre ?historique=1). */
export function BasculeHistorique({ historique }: { historique: boolean }) {
  const chemin = usePathname() ?? '';
  const sp = useSearchParams();
  const p = new URLSearchParams(sp?.toString() ?? '');
  if (historique) p.delete('historique'); else p.set('historique', '1');
  const qs = p.toString();
  return (
    <Link
      href={qs ? `${chemin}?${qs}` : chemin}
      aria-pressed={historique}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-(--radius-button) border px-3 text-[13px] font-medium transition-colors focus-ring',
        historique ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)' : 'border-(--color-border) text-(--color-ink-soft) hover:text-(--color-ink)',
      )}
    >
      <History className="h-4 w-4" /> {historique ? 'Historique affiché' : 'Afficher l’historique'}
    </Link>
  );
}
