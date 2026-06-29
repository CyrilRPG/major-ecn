'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, Zap } from 'lucide-react';
import type { PriveFlashcard } from '@/lib/data/prive-courses';

function renderContent(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/<b>(.+?)<\/b>/g, '<b>$1</b>')
    .replace(/\n/g, '<br/>');
}

export function PriveFlashcardSession({ cards, titre }: { cards: PriveFlashcard[]; titre: string }) {
  const [queue, setQueue] = useState<PriveFlashcard[]>(() => [...cards]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  const current = queue[idx];
  const total = queue.length;
  const remaining = total - mastered.size;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const next = useCallback(() => {
    setFlipped(false);
    setIdx((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setFlipped(false);
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  const markMastered = useCallback(() => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(current.order_index)) next.delete(current.order_index);
      else next.add(current.order_index);
      return next;
    });
  }, [current]);

  const shuffle = useCallback(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIdx(0);
    setFlipped(false);
    setMastered(new Set());
  }, [cards]);

  const reset = useCallback(() => {
    setQueue([...cards]);
    setIdx(0);
    setFlipped(false);
    setMastered(new Set());
  }, [cards]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'm') markMastered();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flip, next, prev, markMastered]);

  if (!current) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Aucune flashcard disponible.</p>
      </div>
    );
  }

  const isMastered = mastered.has(current.order_index);

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
              {idx + 1} / {total} · {remaining} restante{remaining !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={shuffle} className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#C0112E]" title="Melanger">
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={reset} className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#C0112E]" title="Recommencer">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((idx + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #C0112E, #F97316)',
          }}
        />
      </div>

      {/* Mastered counter */}
      {mastered.size > 0 && (
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700">
            {mastered.size} maitrisee{mastered.size > 1 ? 's' : ''} sur {total}
          </span>
        </div>
      )}

      {/* Card */}
      <div
        onClick={flip}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
          isMastered ? 'border-green-300' : flipped ? 'border-[#C0112E]/20' : 'border-gray-200'
        }`}
        style={{ perspective: '1000px' }}
      >
        {/* Top border color indicator */}
        <div
          className="h-1 w-full"
          style={{
            background: isMastered
              ? '#22C55E'
              : flipped
                ? '#C0112E'
                : 'linear-gradient(90deg, #C0112E, #F97316)',
          }}
        />

        {/* Badge */}
        <div className="absolute right-4 top-5">
          <span
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide ${
              flipped
                ? 'bg-[#C0112E]/10 text-[#C0112E]'
                : 'bg-[#0F1F4D]/10 text-[#0F1F4D]'
            }`}
          >
            {flipped ? 'VERSO' : 'RECTO'}
          </span>
        </div>

        <div className="flex min-h-[320px] items-center justify-center px-8 py-10">
          <div
            className={`text-center leading-relaxed ${
              flipped
                ? 'text-[16px] text-gray-700'
                : 'text-[20px] font-bold text-[#0F1F4D]'
            }`}
            dangerouslySetInnerHTML={{ __html: renderContent(flipped ? current.verso : current.recto) }}
          />
        </div>

        <p className="pb-4 text-center text-[11px] text-gray-400">
          Cliquez ou appuyez sur Espace pour retourner
        </p>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> Precedente
        </button>

        <button
          onClick={markMastered}
          className={`rounded-xl px-5 py-2.5 text-[13px] font-bold transition-colors ${
            isMastered
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMastered ? 'Maitrisee' : 'Marquer maitrisee'}
        </button>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
        >
          Suivante <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 rounded-xl bg-[#FAFBFE] px-4 py-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">←</kbd>
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">→</kbd>
          Naviguer
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">Espace</kbd>
          Retourner
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">M</kbd>
          Maitrisee
        </span>
      </div>
    </div>
  );
}
