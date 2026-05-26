'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { ClipboardList, SkipForward, X } from 'lucide-react';
import { skipSatisfactionAction } from '@/app/(student)/formulaires/[id]/actions';

export function SatisfactionBanner({
  form,
}: {
  form: { id: string; title: string; intro_text: string | null };
}) {
  const [pending, start] = useTransition();
  const onSkip = () => start(async () => { await skipSatisfactionAction(form.id); });

  return (
    <div className="border-b border-(--color-border) bg-(--color-primary-soft)/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-white">
          <ClipboardList className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-(--color-ink)">{form.title}</p>
          {form.intro_text && (
            <p className="line-clamp-1 text-xs text-(--color-ink-soft)">{form.intro_text}</p>
          )}
        </div>
        <Link
          href={`/formulaires/${form.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-primary) px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
        >
          Répondre
        </Link>
        <button
          type="button"
          onClick={onSkip}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs text-(--color-ink-soft) hover:text-(--color-ink)"
          title="Passer"
        >
          <SkipForward className="h-3 w-3" />
          Passer
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={pending}
          className="rounded-md p-1 text-(--color-ink-muted) hover:bg-(--color-surface)"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
