'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flashcard } from './flashcard';
import { DifficultyButtons } from './difficulty-buttons';
import { weightedSample, type SampleInput } from '@/lib/flashcards/weighted-sampler';
import { DIFFICULTY_WEIGHT, type Difficulty } from '@/types/domain';
import { createClient } from '@/lib/supabase/client';

export type FlashcardInput = {
  id: string;
  recto: string;
  verso: string;
  lastWeight: number | null;
};

export function FlashcardSession({
  cards,
  coursId,
  backHref,
}: {
  cards: FlashcardInput[];
  coursId: string;
  backHref: string;
}) {
  const ordered = useMemo(() => {
    const inputs: SampleInput<FlashcardInput>[] = cards.map((c) => ({ id: c.id, card: c, lastWeight: c.lastWeight }));
    return weightedSample(inputs);
  }, [cards]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const total = ordered.length;
  const card = ordered[index];

  if (!card) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-(--color-primary-soft) text-(--color-accent) flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance">Session terminée</h2>
        <p className="mt-2 text-(--color-ink-soft)">Tu as parcouru toutes les cartes de ce deck.</p>
        <Button asChild className="mt-6">
          <Link href={backHref}>Retour au cours</Link>
        </Button>
      </div>
    );
  }

  const onDifficulty = async (d: Difficulty) => {
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
    if (index === total - 1) {
      router.push(backHref);
      return;
    }
    setIndex((i) => i + 1);
    setFlipped(false);
    setSubmitting(false);
  };

  const pct = (index / total) * 100;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 lg:px-8 pt-10 pb-16 flex flex-col items-center">
      <div className="w-full flex items-center justify-between gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter
          </Link>
        </Button>
        <p className="text-sm text-(--color-ink-soft)">
          Carte <span className="font-semibold text-(--color-ink)">{index + 1}</span> / {total}
        </p>
      </div>
      <Progress value={pct} className="mb-10 w-full" />

      <motion.div
        key={card.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex justify-center"
      >
        <Flashcard recto={card.recto} verso={card.verso} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      </motion.div>

      <div className="mt-8 min-h-[100px] w-full flex justify-center">
        {flipped ? (
          <DifficultyButtons onPick={onDifficulty} disabled={submitting} />
        ) : (
          <p className="text-center text-sm text-(--color-ink-soft)">Clique sur la carte pour révéler la réponse.</p>
        )}
      </div>
    </div>
  );
}
