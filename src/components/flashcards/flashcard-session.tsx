'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Pencil, RotateCcw } from 'lucide-react';
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
import { FlashcardEditDialog } from '@/components/admin/content/flashcard-edit-dialog';
import { EditHintTooltip } from '@/components/professor/edit-hint-tooltip';
import { useRouter } from 'next/navigation';

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
  matiereName,
  coursId,
  editable = false,
}: {
  cards: FlashcardInput[];
  total: number;
  coursId: string;
  backHref: string;
  collegeName?: string;
  /** Nom du collège (matière) — utilisé en repli pour le thème graphique
   *  quand le titre du cours ne correspond pas à une ambiance connue. */
  matiereName?: string;
  /** Mode prof : affiche un bouton crayon pour éditer la carte courante. */
  editable?: boolean;
}) {
  const router = useRouter();
  const [editingCard, setEditingCard] = useState<FlashcardInput | null>(null);
  const theme = themeFor(collegeName, matiereName);
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

  // Keyboard: plus de raccourci pour retourner la carte (Espace/Entrée
  // désactivés sur demande, pour éviter les flips accidentels). Seuls
  // ←/→ et 1-4 restent actifs, et UNIQUEMENT côté verso pour noter la
  // difficulté.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card || !flipped) return;
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
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-3 py-2 sm:px-6">
      {/* Header session — gère le wrap sur mobile : Quitter à gauche,
          compteur à droite, badge collège masqué <sm pour économiser
          l'espace. */}
      <div className="mb-3 flex w-full items-center justify-between gap-2 sm:gap-4">
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={backHref}>
            <ArrowLeft />
            <span className="hidden sm:inline">Quitter</span>
          </Link>
        </Button>
        {collegeName && (
          <span
            className="hidden truncate rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
            style={{ background: theme.bg, color: theme.accent }}
          >
            {collegeName}
          </span>
        )}
        <p className="shrink-0 text-xs text-(--color-ink-soft) sm:text-sm">
          <span className="font-semibold text-(--color-ink)">{mastered}</span> / {total}{' '}
          <span className="hidden sm:inline">acquise{mastered > 1 ? 's' : ''}</span>
        </p>
      </div>
      <Progress value={pct} className="mb-4 w-full" />

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
          theme={theme}
        />
        {editable && (
          <div className="absolute right-3 top-3 z-30">
            <EditHintTooltip contentType="flashcard" align="right" message="Modifiez le recto et le verso de chaque flashcard en cliquant ici.">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditingCard(card); }}
                title="Modifier cette flashcard (mode prof)"
                className="inline-flex items-center gap-1 rounded-md border border-(--color-border) bg-white/95 px-2 py-1 text-[11px] font-semibold text-(--color-ink-soft) shadow-sm hover:border-(--color-primary) hover:text-(--color-primary)"
              >
                <Pencil className="h-3 w-3" /> Éditer
              </button>
            </EditHintTooltip>
          </div>
        )}
      </motion.div>

      {editable && editingCard && (
        <FlashcardEditDialog
          open={!!editingCard}
          onOpenChange={(v) => { if (!v) setEditingCard(null); }}
          coursId={coursId}
          flashcardId={editingCard.id}
          initialRecto={editingCard.recto}
          initialVerso={editingCard.verso}
          onSaved={() => router.refresh()}
        />
      )}

      <div className="mt-3 flex min-h-[96px] w-full flex-col items-center gap-2 sm:mt-4">
        {flipped ? (
          <>
            <DifficultyButtons onPick={onDifficulty} disabled={submitting} />
            <p className="hidden flex-wrap items-center justify-center gap-1.5 text-xs text-(--color-ink-muted) sm:flex">
              Utilise
              <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5">←</kbd>
              <kbd className="rounded border border-(--color-border) bg-(--color-surface) px-1.5 py-0.5">→</kbd>
              ou
              <span className="font-mono">1 2 3 4</span>
            </p>
          </>
        ) : (
          <p className="text-center text-xs text-(--color-ink-soft) sm:text-sm">
            Clique sur la carte pour la retourner et révéler la réponse.
          </p>
        )}
      </div>
    </div>
  );
}
