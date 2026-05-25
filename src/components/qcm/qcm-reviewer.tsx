'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem, type QcmItemView } from './qcm-item';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';

type Question = {
  id: string;
  enonce: string;
  items: (QcmItemView & { is_correct: boolean })[];
};

export function QcmReviewer({
  questions,
  attemptsByQ,
  filterLabel,
  serieLabel,
  backHref,
}: {
  questions: Question[];
  attemptsByQ: Record<string, string[]>;
  filterLabel: string;
  serieLabel: string;
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const total = questions.length;
  const q = questions[index];

  const { outcomes, isQuestionCorrect, selected } = useMemo(() => {
    const sel = new Set(attemptsByQ[q.id] ?? []);
    const gradeInput = q.items.map((it) => ({
      lettre: it.lettre,
      is_correct: it.is_correct,
      selected: sel.has(it.lettre),
    }));
    const { perItem, isQuestionCorrect } = gradeQuestion(gradeInput);
    const outs: ItemOutcome[] = q.items.map((it) => perItem[it.lettre]);
    return { outcomes: outs, isQuestionCorrect, selected: sel };
  }, [q, attemptsByQ]);

  if (total === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Rien à revoir</h2>
        <p className="mt-2 text-(--color-ink-soft)">
          Aucune question ne correspond à ce filtre. Bravo !
        </p>
        <Button asChild className="mt-6">
          <Link href={backHref}>Retour aux résultats</Link>
        </Button>
      </div>
    );
  }

  const progressPct = ((index + 1) / total) * 100;
  const atLast = index === total - 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter le corrigé
          </Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-2.5 py-1 text-xs font-semibold text-(--color-primary)">
          <Eye className="h-3.5 w-3.5" />
          Corrigé · {filterLabel}
        </span>
      </div>

      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span className="truncate">
          <span className="font-semibold text-(--color-ink)">Annale</span> · {serieLabel}
        </span>
        <span className="shrink-0">
          Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}
        </span>
      </div>
      <Progress value={progressPct} className="mb-3" />

      <motion.div
        key={q.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">Énoncé</p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty">
          {q.enonce}
        </h2>
        <p className="mt-2 text-xs text-(--color-ink-muted)">
          {isQuestionCorrect ? 'Question juste — tes coches correspondent.' : 'Tu avais cette question fausse — revois bien les justifications.'}
        </p>
      </motion.div>

      <div className="space-y-2">
        {q.items.map((it, i) => (
          <QcmItem
            key={it.id}
            item={it}
            selected={selected.has(it.lettre)}
            outcome={outcomes[i]}
            disabled
            isCorrect={it.is_correct}
            onToggle={() => undefined}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 pb-2">
        {atLast ? (
          <Button asChild>
            <Link href={backHref}>
              Terminer le corrigé
              <ArrowRight />
            </Link>
          </Button>
        ) : (
          <Button onClick={() => setIndex((i) => i + 1)}>
            Question suivante
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
