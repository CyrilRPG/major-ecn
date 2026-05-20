'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from './flashcard';
import { DifficultyButtons, DIFFICULTY_ORDER } from './difficulty-buttons';
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

const REAPPEAR_AFTER: Record<Difficulty, number> = {
  tres_difficile: 3,
  difficile: 5,
  facile: 8,
  tres_facile: 12,
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
  const [queue, setQueue] = useState<FlashcardInput[]>(() =>
    [...cards].sort((a, b) => a.score - b.score),
  );
  const [mastered, setMastered] = useState(total - cards.length);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const card = queue[0];

  const onDifficulty = useCallback(
    async (d: Difficulty) => {
      if (submitting || !card) return;
      setSubmitting(true);
      try {
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
      } catch { /* ignore persistence errors */ }

      const newScore = card.score + DIFFICULTY_SCORE[d];
      setFlipped(false);
      setSubmitting(false);
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
    },
    [card, submitting],
  );

  // Keyboard: Espace = retourner ; ←/→ + 1-4 = difficulté (carte retournée).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); onDifficulty(DIFFICULTY_ORDER[0]); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onDifficulty(DIFFICULTY_ORDER[3]); }
      else if (e.key >= '1' && e.key <= '4') { e.preventDefault(); onDifficulty(DIFFICULTY_ORDER[Number(e.key) - 1]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, flipped, onDifficulty]);

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
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

  const pct = total === 0 ? 100 : (mastered / total) * 100;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-2 sm:px-6">
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
        <Flashcard
          recto={card.recto}
          verso={card.verso}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          index={mastered}
          total={total}
        />
      </motion.div>

      <div className="mt-4 flex min-h-[96px] w-full flex-col items-center gap-2">
        {flipped ? (
          <>
            <DifficultyButtons onPick={onDifficulty} disabled={submitting} />
            <p className="flex items-center gap-1.5 text-xs text-(--color-ink-muted)">
              Utilise
              <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5">←</kbd>
              <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5">→</kbd>
              ou
              <span className="font-mono">1 2 3 4</span>
            </p>
          </>
        ) : (
          <p className="text-center text-sm text-(--color-ink-soft)">
            Retourne la carte (clic ou <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5">Espace</kbd>) pour révéler la réponse.
          </p>
        )}
      </div>
    </div>
  );
}
