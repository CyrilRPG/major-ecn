import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function MatiereCard({
  id,
  nom,
  colorHex,
  Icon,
  coursCount,
  progress,
}: {
  id: string;
  nom: string;
  colorHex: string;
  Icon: LucideIcon;
  coursCount: number;
  progress: number;
}) {
  return (
    <Link
      href={`/matieres/${id}`}
      className="group relative block focus-ring rounded-(--radius-card)"
    >
      <article className="relative overflow-hidden rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xs) p-6 flex flex-col gap-5 h-full transition-colors hover:border-(--color-accent)">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: colorHex }}
        />
        <div className="relative flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{
              background: `color-mix(in srgb, ${colorHex} 14%, var(--color-surface))`,
              color: colorHex,
            }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-(--color-ink-soft) bg-(--color-surface-soft) rounded-full px-3 py-1 border border-(--color-border)">
            {coursCount} cours
          </span>
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold tracking-tight text-(--color-ink) group-hover:text-(--color-accent-deep) transition-colors text-balance">
            {nom}
          </h3>
        </div>
        <div className="relative mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-(--color-ink-soft)">Progression</span>
            <span className="font-semibold text-(--color-ink) tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="relative flex items-center gap-1 text-xs font-medium text-(--color-accent-deep) opacity-0 group-hover:opacity-100 transition-opacity">
          Ouvrir
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </article>
    </Link>
  );
}
