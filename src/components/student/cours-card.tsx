import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressPills, type ProgressPillsState } from './progress-pills';

export type CoursCardData = {
  id: string;
  titre: string;
  description: string | null;
  orderIndex: number;
  state: ProgressPillsState;
  hasContent: boolean;
  isNew: boolean;
};

export function CoursCard({ cours }: { cours: CoursCardData }) {
  return (
    <Link
      href={`/cours/${cours.id}`}
      className="group relative block focus-ring rounded-(--radius-card)"
    >
      <article className="relative overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xs) transition hover:-translate-y-0.5 hover:border-(--color-primary)/40 hover:shadow-(--shadow-glow)">
        <span
          aria-hidden
          className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-(--color-primary) to-(--color-accent) opacity-0 group-hover:opacity-100 transition"
        />
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 p-7 md:p-8">
          <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary-deep) font-mono font-semibold text-lg">
            {String(cours.orderIndex).padStart(2, '0')}
          </div>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg md:text-xl font-semibold tracking-tight text-(--color-ink) leading-snug text-balance">
                {cours.titre}
              </h2>
              {cours.isNew && (
                <Badge variant="primary" className="px-2.5 py-1">
                  <Sparkles className="h-3 w-3" />
                  Nouveau
                </Badge>
              )}
              {!cours.hasContent && <Badge variant="muted">Contenu bientôt</Badge>}
            </div>
            {cours.description && (
              <p className="text-sm text-(--color-ink-soft) max-w-2xl leading-relaxed text-pretty">
                {cours.description}
              </p>
            )}
            <div className="pt-1">
              <ProgressPills state={cours.state} />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-(--color-ink-muted) group-hover:text-(--color-primary) group-hover:translate-x-1 transition shrink-0" />
        </div>
      </article>
    </Link>
  );
}
