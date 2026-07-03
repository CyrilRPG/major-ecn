'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Info,
  RefreshCw,
  RotateCcw,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import type { PriveFlashcard } from '@/lib/data/prive-courses';

/* ─── helpers ─── */

function renderContent(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/<b>(.+?)<\/b>/g, '<b>$1</b>')
    .replace(/\n/g, '<br/>');
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function pastelBg(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * 0.85)}, ${Math.round(g + (255 - g) * 0.85)}, ${Math.round(b + (255 - b) * 0.85)})`;
}

/* ─── difficulty config ─── */
/* Système simple : « Facile » → la carte est acquise (n'apparaît plus).
 * « Difficile » → la carte réapparaît 3 cartes plus loin. Aucun autre bouton. */

type Difficulty = 'facile' | 'difficile';

/** Nombre de cartes après lesquelles une carte « Difficile » réapparaît. */
const REAPPEAR_AFTER = 3;

const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  subtitle: string;
  accent: string;
  bg: string;
  icon: typeof X;
}[] = [
  {
    key: 'facile',
    label: 'Facile',
    subtitle: 'Je la connais',
    accent: '#15803D',
    bg: '#DCF1E2',
    icon: Check,
  },
  {
    key: 'difficile',
    label: 'Difficile',
    subtitle: 'À revoir',
    accent: '#E11D48',
    bg: '#FCE7EB',
    icon: RotateCcw,
  },
];

/* ─── internal card state ─── */

type QueueCard = {
  card: PriveFlashcard;
};

/* ─── card face ─── */

function CardFace({
  side,
  text,
  index,
  total,
  onFlip,
  back = false,
  accentColor,
  bgColor,
}: {
  side: 'recto' | 'verso';
  text: string;
  index: number;
  total: number;
  onFlip: () => void;
  back?: boolean;
  accentColor: string;
  bgColor: string;
}) {
  return (
    <div
      className={`${back ? 'absolute inset-0' : 'relative'} flex w-full flex-col overflow-hidden rounded-2xl border shadow-lg`}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back
          ? 'rotateY(180deg) translateZ(1px)'
          : 'rotateY(0deg) translateZ(1px)',
        background: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 60%)`,
        borderColor: accentColor + '33',
        height: 'clamp(240px, 46vh, 520px)',
      }}
    >
      {/* Watermark logo */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025]"
      >
        <Image
          src="/major-ecn-logo.png"
          alt=""
          width={420}
          height={420}
          className="h-auto w-[60%] max-w-[420px] object-contain sm:w-[55%]"
          priority={false}
        />
      </span>

      {/* Theme icon watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-1/2 z-10 -translate-y-1/2 select-none opacity-[0.12] sm:-right-4"
        style={{ color: accentColor }}
      >
        <Zap className="h-44 w-44 sm:h-60 sm:w-60 md:h-80 md:w-80" strokeWidth={2} />
      </span>

      {/* Left accent bar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 sm:w-1.5"
        style={{ background: accentColor }}
      />

      {/* Badge + counter */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{
            background: side === 'verso' ? accentColor + '18' : accentColor + '12',
            color: accentColor,
          }}
        >
          {side === 'verso' ? 'Verso' : 'Recto'}
        </span>
        <span className="font-mono text-xs text-gray-400 sm:text-sm">
          {index + 1} / {total}
        </span>
      </div>

      {/* Centered content */}
      <div className="relative z-20 flex flex-1 items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
        <p
          className="max-w-full text-center text-base font-semibold leading-snug tracking-tight text-[#0F1F4D] text-balance sm:max-w-[80%] sm:text-xl md:text-2xl"
          dangerouslySetInnerHTML={{ __html: renderContent(text) }}
        />
      </div>

      {/* Footer */}
      <div className="relative z-20 flex flex-col items-stretch gap-2 border-t bg-white/80 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3.5"
        style={{ borderColor: accentColor + '20' }}
      >
        <span className="flex items-center gap-1.5 text-xs text-gray-400 sm:text-sm">
          <Info className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="line-clamp-1">
            {side === 'verso' ? 'Évaluez votre difficulté ci-dessous' : 'Cliquez pour retourner la carte'}
          </span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-xl border bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:self-auto sm:px-4 sm:py-2 sm:text-sm"
          style={{ borderColor: accentColor + '55' }}
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: accentColor }} />
          Retourner
        </button>
      </div>

      {/* Brand mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 hidden -translate-x-1/2 select-none text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300 sm:block"
      >
        Major <span style={{ color: accentColor + '88' }}>ECN</span>
      </span>
    </div>
  );
}

/* ─── component ─── */

export function PriveFlashcardSession({
  cards,
  titre,
  themeColor,
}: {
  cards: PriveFlashcard[];
  titre: string;
  themeColor?: string;
}) {
  const accent = themeColor ?? '#C0112E';
  const bg = pastelBg(accent);

  /* --- state --- */
  const [queue, setQueue] = useState<QueueCard[]>(() =>
    cards.map((c) => ({ card: c })),
  );
  const [flipped, setFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalCards = cards.length;

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

      setIsTransitioning(true);
      setFlipped(false);

      setTimeout(() => {
        setQueue((prev) => {
          const rest = prev.slice(1);
          // Facile → acquise (n'apparaît plus).
          if (d === 'facile') {
            setMasteredCount((c) => c + 1);
            return rest;
          }
          // Difficile → réapparaît 3 cartes plus loin.
          const insertAt = Math.min(REAPPEAR_AFTER, rest.length);
          const next = [...rest];
          next.splice(insertAt, 0, { card: current.card });
          return next;
        });
        setIsTransitioning(false);
      }, 350);
    },
    [current, isTransitioning],
  );

  /* --- restart --- */
  const restart = useCallback(() => {
    setQueue(cards.map((c) => ({ card: c })));
    setFlipped(false);
    setMasteredCount(0);
    setIsTransitioning(false);
  }, [cards]);

  /* --- keyboard --- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (allMastered) return;
      if (flipped && !isTransitioning) {
        if (e.key === '1') { e.preventDefault(); rateDifficulty('facile'); }
        if (e.key === '2') { e.preventDefault(); rateDifficulty('difficile'); }
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flipped, isTransitioning, allMastered, rateDifficulty]);

  /* --- all mastered screen --- */
  if (allMastered) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border py-16"
          style={{ borderColor: '#15803D33', background: 'linear-gradient(135deg, #DCF1E2 0%, #FFFFFF 60%)' }}
        >
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
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: accent }}
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: accent + '18' }}
          >
            <Zap className="h-5 w-5" style={{ color: accent }} />
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
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%`, background: accent }}
        />
      </div>

      {/* Card — premium 3D flip */}
      <div className="flex justify-center">
        <div
          onClick={flip}
          className="w-full max-w-5xl cursor-pointer"
          style={{ perspective: '1600px', WebkitPerspective: 1600 }}
        >
          <div
            className="relative w-full"
            style={{
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transitionDuration: '0.5s',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transitionProperty: 'transform',
              height: 'clamp(240px, 46vh, 520px)',
            }}
          >
            <CardFace
              side="recto"
              text={current.card.recto}
              index={masteredCount}
              total={totalCards}
              onFlip={flip}
              accentColor={accent}
              bgColor={bg}
            />
            <CardFace
              side="verso"
              text={current.card.verso}
              index={masteredCount}
              total={totalCards}
              onFlip={flip}
              back
              accentColor={accent}
              bgColor={bg}
            />
          </div>
        </div>
      </div>

      {/* Difficulty buttons — only when flipped */}
      <div
        className="mt-6 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: flipped ? '200px' : '0px',
          opacity: flipped ? 1 : 0,
        }}
      >
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
          {DIFFICULTIES.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.key}
                onClick={(e) => {
                  e.stopPropagation();
                  rateDifficulty(d.key);
                }}
                disabled={isTransitioning}
                className="flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
                style={{ backgroundColor: d.bg, borderColor: d.accent + '30' }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
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
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">1</kbd>
          Facile
          <span className="mx-1 text-gray-300">·</span>
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono">2</kbd>
          Difficile
        </span>
      </div>
    </div>
  );
}
