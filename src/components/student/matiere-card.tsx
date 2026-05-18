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
      <article className="relative overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xs) p-7 flex flex-col gap-5 h-full transition hover:-translate-y-1 hover:border-(--color-primary)/50 hover:shadow-(--shadow-glow)">
        <span
          aria-hidden
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${colorHex} 35%, transparent), transparent 70%)` }}
        />
        <div className="relative flex items-start justify-between">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${colorHex} 22%, var(--color-surface)) 0%, color-mix(in srgb, ${colorHex} 8%, var(--color-surface)) 100%)`,
              color: colorHex,
              border: `1px solid color-mix(in srgb, ${colorHex} 30%, transparent)`,
            }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <span className="text-xs font-medium text-(--color-ink-soft) bg-(--color-surface-soft) rounded-full px-3 py-1 border border-(--color-border)">
            {coursCount} cours
          </span>
        </div>
        <div className="relative">
          <h3 className="text-lg font-semibold tracking-tight text-(--color-ink) group-hover:text-(--color-primary-deep) transition text-balance">
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
        <div className="relative flex items-center gap-1 text-xs font-medium text-(--color-primary-deep) opacity-0 group-hover:opacity-100 transition">
          Ouvrir
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </article>
    </Link>
  );
}
