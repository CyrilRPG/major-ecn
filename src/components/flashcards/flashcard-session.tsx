'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from './flashcard';
import { DifficultyButtons } from './difficulty-buttons';
import {
  DIFFICULTY_SCORE,
  DIFFICULTY_WEIGHT,
  FLASHCARD_MASTERY_THRESHOLD,
  type Difficulty,
} from '@/types/domain';
import { createClient } from '@/lib/supabase/client';

export type FlashcardInput = {
  id: string;
  recto: string;
  verso: string;
  score: number;
};

export function FlashcardSession({
  cards,
  total,
  backHref,
}: {
  cards: FlashcardInput[];
  total: number;
  coursId: string;
  backHref: string;
}) {
  // Lowest score first so the hardest cards come back sooner.
  const [queue, setQueue] = useState<FlashcardInput[]>(() =>
    [...cards].sort((a, b) => a.score - b.score),
  );
  const [mastered, setMastered] = useState(total - cards.length);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const card = queue[0];

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-accent)">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Deck acquis</h2>
        <p className="mt-2 text-(--color-ink-soft)">
          {total > 0
            ? 'Toutes les cartes ont atteint le score de maîtrise. Revenez plus tard pour les revoir.'
            : 'Aucune carte à réviser pour le moment.'}
        </p>
        <Button asChild className="mt-6">
          <Link href={backHref}>Retour à l’item</Link>
        </Button>
      </div>
    );
  }

  const onDifficulty = async (d: Difficulty) => {
    if (submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('flashcard_reviews').insert({
        user_id: user.id,
        flashcard_id: card.id,
        difficulty: d,
        weight: DIFFICULTY_WEIGHT[d],
      });
    }

    const newScore = card.score + DIFFICULTY_SCORE[d];
    setFlipped(false);
    setSubmitting(false);

    // Reapparition spacing: how many other cards before this one comes back.
    const REAPPEAR_AFTER: Record<Difficulty, number> = {
      tres_difficile: 3,
      difficile: 5,
      facile: 8,
      tres_facile: 12,
    };

    setQueue((prev) => {
      const [, ...rest] = prev;
      if (newScore >= FLASHCARD_MASTERY_THRESHOLD) {
        setMastered((m) => m + 1);
        return rest;
      }
      const pos = Math.min(REAPPEAR_AFTER[d], rest.length);
      const next = [...rest];
      next.splice(pos, 0, { ...card, score: newScore });
      return next;
    });
  };

  const pct = total === 0 ? 100 : (mastered / total) * 100;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-3 sm:px-6">
      <div className="mb-3 flex w-full items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter
          </Link>
        </Button>
        <p className="text-sm text-(--color-ink-soft)">
          <span className="font-semibold text-(--color-ink)">{mastered}</span> / {total} acquise{mastered > 1 ? 's' : ''}
        </p>
      </div>
      <Progress value={pct} className="mb-4 w-full" />

      <motion.div
        key={`${card.id}-${card.score}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full justify-center"
      >
        <Flashcard recto={card.recto} verso={card.verso} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </motion.div>

      <div className="mt-4 flex min-h-[88px] w-full justify-center">
        {flipped ? (
          <DifficultyButtons onPick={onDifficulty} disabled={submitting} />
        ) : (
          <p className="text-center text-sm text-(--color-ink-soft)">
            Cliquez sur la carte pour révéler la réponse.
          </p>
        )}
      </div>
    </div>
  );
}
