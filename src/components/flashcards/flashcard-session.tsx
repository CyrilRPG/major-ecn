'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from './flashcard';
import { DifficultyButtons, DIFFICULTY_ORDER } from './difficulty-buttons';
import { themeFor } from './flashcard-theme';
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
  collegeName,
}: {
  cards: FlashcardInput[];
  total: number;
  coursId: string;
  backHref: string;
  collegeName?: string;
}) {
  const theme = themeFor(collegeName);
  const ThemeIcon = theme.Icon;
  const [queue, setQueue] = useState<FlashcardInput[]>(() =>
    cards.filter((c) => c.score < FLASHCARD_MASTERY_THRESHOLD).sort((a, b) => a.score - b.score),
  );
  const [mastered, setMastered] = useState(
    () => cards.filter((c) => c.score >= FLASHCARD_MASTERY_THRESHOLD).length,
  );
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
    const restart = () => {
      setQueue(cards.map((c) => ({ ...c, score: 0 })));
      setMastered(0);
      setFlipped(false);
    };
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
        <div className="mx-auto mt-6 flex w-full max-w-xs flex-col gap-2.5">
          <Button asChild>
            <Link href={backHref}>Retour à l’item</Link>
          </Button>
          {cards.length > 0 && (
            <Button variant="outline" onClick={restart}>
              <RotateCcw />
              Recommencer les flashcards
            </Button>
          )}
        </div>
      </div>
    );
  }

  const pct = total === 0 ? 100 : (mastered / total) * 100;

  return (
    <div
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-2 sm:px-6"
      style={{ background: `linear-gradient(135deg, ${theme.bg} 0%, transparent 65%)` }}
    >
      {/* Icône organe floue en arrière-plan (à droite). Décorative, n'inter-
          fère pas avec le contenu. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none opacity-[0.10] blur-[1px]"
        style={{ color: theme.accent }}
      >
        <ThemeIcon className="h-72 w-72" strokeWidth={1.2} />
      </span>

      <div className="relative mb-3 flex w-full items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter
          </Link>
        </Button>
        {collegeName && (
          <span
            className="hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
            style={{ background: theme.bg, color: theme.accent }}
          >
            {collegeName}
          </span>
        )}
        <p className="text-sm text-(--color-ink-soft)">
          <span className="font-semibold text-(--color-ink)">{mastered}</span> / {total} acquise{mastered > 1 ? 's' : ''}
        </p>
      </div>
      <Progress value={pct} className="relative mb-4 w-full" />

      <motion.div
        key={`${card.id}-${card.score}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative flex w-full justify-center"
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
