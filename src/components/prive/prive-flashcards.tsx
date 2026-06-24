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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-[#0F1F4D]">
            <Zap className="mr-2 inline h-5 w-5 text-[#F59E0B]" />
            Flashcards — {titre}
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            {idx + 1} / {total} · {remaining} restante{remaining !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={shuffle} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Mélanger">
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={reset} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" title="Recommencer">
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

      {/* Card */}
      <div
        onClick={flip}
        className={`relative min-h-[320px] cursor-pointer rounded-2xl border-2 p-8 shadow-sm transition-all ${
          isMastered ? 'border-green-300 bg-green-50' : flipped ? 'border-[#C0112E]/30 bg-[#FFF5F6]' : 'border-gray-200 bg-white'
        }`}
        style={{ perspective: '1000px' }}
      >
        <div className="absolute right-4 top-4 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
          {flipped ? 'VERSO' : 'RECTO'}
        </div>

        <div className="flex min-h-[280px] items-center justify-center">
          <div
            className={`text-center text-[16px] leading-relaxed ${flipped ? 'text-gray-700' : 'text-[#0F1F4D] font-bold text-[18px]'}`}
            dangerouslySetInnerHTML={{ __html: renderContent(flipped ? current.verso : current.recto) }}
          />
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400">
          Cliquez ou appuyez sur Espace pour retourner
        </p>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> Précédente
        </button>

        <button
          onClick={markMastered}
          className={`rounded-xl px-5 py-2.5 text-[13px] font-bold transition-colors ${
            isMastered
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMastered ? '✓ Maîtrisée' : 'Marquer maîtrisée'}
        </button>

        <button
          onClick={next}
          disabled={idx === total - 1}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30"
        >
          Suivante <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-[11px] text-gray-400">
        <span>← → Naviguer</span>
        <span>Espace : Retourner</span>
        <span>M : Maîtrisée</span>
      </div>
    </div>
  );
}
