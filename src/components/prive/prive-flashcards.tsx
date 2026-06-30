'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  Info,
  Minus,
  RefreshCw,
  RotateCcw,
  X,
  Zap,
} from 'lucide-react';
import type { PriveFlashcard } from '@/lib/data/prive-courses';

/* ─── helpers ─── */

function renderContent(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/<b>(.+?)<\/b>/g, '<b>$1</b>')
    .replace(/\n/g, '<br/>');
}

/* ─── difficulty config ─── */

type Difficulty = 'a_revoir' | 'difficile' | 'bien' | 'parfait';

const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  subtitle: string;
  score: number;
  weight: number;
  reappearAfter: number;
  accent: string;
  bg: string;
  icon: typeof X;
}[] = [
  {
    key: 'a_revoir',
    label: 'À revoir',
    subtitle: 'Je ne la savais pas',
    score: -5,
    weight: 4,
    reappearAfter: 3,
    accent: '#E11D48',
    bg: '#FCE7EB',
    icon: X,
  },
  {
    key: 'difficile',
    label: 'Difficile',
    subtitle: "J'hésite encore",
    score: -3,
    weight: 3,
    reappearAfter: 5,
    accent: '#E08900',
    bg: '#FCEED1',
    icon: Minus,
  },
  {
    key: 'bien',
    label: 'Bien',
    subtitle: 'Je la savais',
    score: 3,
    weight: 2,
    reappearAfter: 8,
    accent: '#2563EB',
    bg: '#DEEAFE',
    icon: Check,
  },
  {
    key: 'parfait',
    label: 'Parfait',
    subtitle: 'Connaissance solide',
    score: 5,
    weight: 1,
    reappearAfter: 12,
    accent: '#15803D',
    bg: '#DCF1E2',
    icon: CheckCheck,
  },
];

const MASTERY_THRESHOLD = 5;

/* ─── internal card state ─── */

type QueueCard = {
  card: PriveFlashcard;
  score: number;
};

/* ─── component ─── */

export function PriveFlashcardSession({
  cards,
  titre,
}: {
  cards: PriveFlashcard[];
  titre: string;
}) {
  /* --- state --- */
  const [queue, setQueue] = useState<QueueCard[]>(() =>
    cards.map((c) => ({ card: c, score: 0 })),
  );
  const [flipped, setFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalCards = cards.length;
  const cardRef = useRef<HTMLDivElement>(null);

  /* current card */
  const current = queue[0] ?? null;
  const allMastered = queue.length === 0;

  /* --- flip --- */
  const flip = useCallback(() => {
    if (isTransitioning) return;
    setFlipped((f) => !f);
  }, [isTransitioning]);

  /* --- difficulty rating --- */
  const rateDifficulty = useCallback(
    (d: Difficulty) => {
      if (!current || isTransitioning) return;
      const diff = DIFFICULTIES.find((x) => x.key === d)!;
      const newScore = current.score + diff.score;

      setIsTransitioning(true);
      setFlipped(false);

      // Wait for flip-back animation before updating queue
      setTimeout(() => {
        setQueue((prev) => {
          const rest = prev.slice(1);
          if (newScore >= MASTERY_THRESHOLD) {
            // Card mastered
            setMasteredCount((c) => c + 1);
            return rest;
          }
          // Insert back at reappearAfter position
          const insertAt = Math.min(diff.reappearAfter, rest.length);
          const updated: QueueCard = { card: current.card, score: newScore };
          const next = [...rest];
          next.splice(insertAt, 0, updated);
          return next;
        });
        setIsTransitioning(false);
      }, 350);
    },
    [current, isTransitioning],
  );

  /* --- restart --- */
  const restart = useCallback(() => {
    setQueue(cards.map((c) => ({ card: c, score: 0 })));
    setFlipped(false);
    setMasteredCount(0);
    setIsTransitioning(false);
  }, [cards]);

  /* --- keyboard --- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (allMastered) return;
      // Only 1-4 when flipped
      if (flipped && !isTransitioning) {
        if (e.key === '1') {
          e.preventDefault();
          rateDifficulty('a_revoir');
        }
        if (e.key === '2') {
          e.preventDefault();
          rateDifficulty('difficile');
        }
        if (e.key === '3') {
          e.preventDefault();
          rateDifficulty('bien');
        }
        if (e.key === '4') {
          e.preventDefault();
          rateDifficulty('parfait');
        }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, isTransitioning, allMastered, rateDifficulty]);

  /* --- all mastered screen --- */
  if (allMastered) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50/50 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-1 text-xl font-bold text-[#0F1F4D]">
            Deck acquis
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Vous avez maîtrisé les {totalCards} carte
            {totalCards > 1 ? 's' : ''} de ce deck.
          </p>
          <button
            onClick={restart}
            className="flex items-center gap-2 rounded-xl bg-[#C0112E] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#A00F27]"
          >
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  /* --- no cards at all --- */
  if (!current) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Aucune flashcard disponible.</p>
      </div>
    );
  }

  const progressPercent = (masteredCount / totalCards) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0112E]/10">
            <Zap className="h-5 w-5 text-[#C0112E]" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-[#0F1F4D]">
              Flashcards
            </h1>
            <p className="text-[13px] text-gray-500">
              {masteredCount} / {totalCards} acquise
              {masteredCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        onClick={flip}
        className="relative cursor-pointer"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full transition-transform"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transitionDuration: '0.5s',
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {/* ---- RECTO ---- */}
          <div
            className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              height: 'clamp(240px, 46vh, 520px)',
            }}
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 h-full w-[2px] bg-[#C0112E]" />

            {/* Recto badge */}
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="rounded-full bg-[#0F1F4D]/10 px-3 py-1 text-[11px] font-bold tracking-wide text-[#0F1F4D]">
                RECTO
              </span>
              <span className="text-[13px] font-medium text-gray-400">
                {masteredCount + 1} / {totalCards}
              </span>
            </div>

            {/* Centered content */}
            <div className="flex flex-1 items-center justify-center px-8">
              <div
                className="text-center text-xl leading-relaxed text-[#0F1F4D] md:text-2xl font-bold"
                dangerouslySetInnerHTML={{
                  __html: renderContent(current.card.recto),
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Info className="h-3.5 w-3.5" />
                <span>Cliquez pour retourner</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  flip();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retourner
              </button>
            </div>
          </div>

          {/* ---- VERSO ---- */}
          <div
            className="absolute inset-0 flex w-full flex-col overflow-hidden rounded-2xl border border-[#C0112E]/20 bg-white shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              height: 'clamp(240px, 46vh, 520px)',
            }}
          >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 h-full w-[2px] bg-[#C0112E]" />

            {/* Verso badge */}
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="rounded-full bg-[#C0112E]/10 px-3 py-1 text-[11px] font-bold tracking-wide text-[#C0112E]">
                VERSO
              </span>
              <span className="text-[13px] font-medium text-gray-400">
                {masteredCount + 1} / {totalCards}
              </span>
            </div>

            {/* Centered content */}
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-8">
              <div
                className="text-center text-base leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: renderContent(current.card.verso),
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Info className="h-3.5 w-3.5" />
                <span>Évaluez votre réponse ci-dessous</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  flip();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retourner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty buttons — only when flipped */}
      <div
        className="mt-4 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: flipped ? '200px' : '0px',
          opacity: flipped ? 1 : 0,
        }}
      >
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {DIFFICULTIES.map((d, i) => {
            const Icon = d.icon;
            return (
              <button
                key={d.key}
                onClick={(e) => {
                  e.stopPropagation();
                  rateDifficulty(d.key);
                }}
                disabled={isTransitioning}
                className="flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
                style={{ backgroundColor: d.bg }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
                  style={{
                    boxShadow: `inset 0 0 0 2px ${d.accent}`,
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: d.accent }}
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className="text-[13px] font-bold"
                  style={{ color: d.accent }}
                >
                  {d.label}
                </span>
                <span className="text-[11px] text-gray-500">
                  {d.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 rounded-xl bg-[#FAFBFE] px-4 py-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">
            1
          </kbd>
          -
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">
            4
          </kbd>
          Évaluer (verso)
        </span>
      </div>
    </div>
  );
}
