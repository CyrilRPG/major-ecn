import { CheckCircle2, ClipboardList, FileText, Layers3, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProgressPillsState = {
  videoWatched: boolean;
  ficheRead: boolean;
  qcmAttempted: boolean;
  flashcardsReviewed: boolean;
};

const steps = [
  { key: 'videoWatched',       label: 'Cours',      Icon: PlayCircle },
  { key: 'ficheRead',          label: 'Fiche',      Icon: FileText },
  { key: 'qcmAttempted',       label: 'DP / QI',    Icon: ClipboardList },
  { key: 'flashcardsReviewed', label: 'Flashcards', Icon: Layers3 },
] as const;

export function ProgressPills({ state }: { state: ProgressPillsState }) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map(({ key, label, Icon }) => {
        const done = !!state[key];
        return (
          <span
            key={key}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
              done
                ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)'
                : 'border-(--color-border) bg-(--color-surface-soft) text-(--color-ink-soft)',
            )}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            {label}
          </span>
        );
      })}
    </div>
  );
}
