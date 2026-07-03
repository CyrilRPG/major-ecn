'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle,
  FileText,
  HelpCircle,
  X as XIcon,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import type { PriveAnnale, PriveAnnaleQuestion } from '@/lib/data/prive-courses';

function md(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FlatQuestion = {
  index: number;
  question: PriveAnnaleQuestion;
  rappelCours: string;
};

type QueueEntry = {
  flat: FlatQuestion;
};

type SessionState = {
  queue: QueueEntry[];
  totalQuestions: number;
  correctCount: number;
  firstTryCorrect: number;
  attemptedOnce: Set<number>;
};

// ---------------------------------------------------------------------------
// Flatten all annales into one list
// ---------------------------------------------------------------------------

function flattenAnnales(annales: PriveAnnale[]): FlatQuestion[] {
  const out: FlatQuestion[] = [];
  let idx = 0;
  for (const a of annales) {
    for (const q of a.questions) {
      out.push({ index: idx++, question: q, rappelCours: a.rappel_cours });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Spaced-repetition session hook (works on flat question list)
// ---------------------------------------------------------------------------

function useSpacedRepetition(questions: FlatQuestion[]) {
  const [session, setSession] = useState<SessionState>(() => initSession(questions));
  const [phase, setPhase] = useState<'answering' | 'review'>('answering');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    question: PriveAnnaleQuestion;
  } | null>(null);

  function initSession(qs: FlatQuestion[]): SessionState {
    return {
      queue: qs.map((f) => ({ flat: f })),
      totalQuestions: qs.length,
      correctCount: 0,
      firstTryCorrect: 0,
      attemptedOnce: new Set(),
    };
  }

  const currentEntry = session.queue[0] ?? null;
  const isFinished = session.queue.length === 0;

  const toggleItem = useCallback((lettre: string) => {
    if (phase !== 'answering') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lettre)) next.delete(lettre);
      else next.add(lettre);
      return next;
    });
  }, [phase]);

  const validate = useCallback(() => {
    if (!currentEntry) return;
    const q = currentEntry.flat.question;
    const isCorrect = q.items.every(
      (item) => selected.has(item.lettre) === item.is_correct
    );
    setLastResult({ isCorrect, question: q });
    setPhase('review');

    // On ne modifie PAS la file ici : le choix « Facile / Difficile » (rate)
    // décide si la question réapparaît. On enregistre juste la réussite au 1er
    // essai (pour le score final).
    setSession((prev) => {
      const idx = currentEntry.flat.index;
      if (prev.attemptedOnce.has(idx)) return prev;
      const newAttempted = new Set(prev.attemptedOnce);
      newAttempted.add(idx);
      return {
        ...prev,
        attemptedOnce: newAttempted,
        firstTryCorrect: prev.firstTryCorrect + (isCorrect ? 1 : 0),
      };
    });
  }, [currentEntry, selected]);

  // Facile → la question est acquise (n'apparaît plus). Difficile → réapparaît
  // 3 questions plus loin. Aucun autre bouton.
  const rate = useCallback((difficulty: 'facile' | 'difficile') => {
    setSession((prev) => {
      const newQueue = [...prev.queue];
      const removed = newQueue.shift();
      if (!removed) return prev;
      if (difficulty === 'difficile') {
        newQueue.splice(Math.min(3, newQueue.length), 0, removed);
        return { ...prev, queue: newQueue };
      }
      return { ...prev, queue: newQueue, correctCount: prev.correctCount + 1 };
    });
    setSelected(new Set());
    setLastResult(null);
    setPhase('answering');
  }, []);

  const restart = useCallback(() => {
    setSession(initSession(questions));
    setSelected(new Set());
    setLastResult(null);
    setPhase('answering');
  }, [questions]);

  return {
    currentEntry,
    isFinished,
    session,
    phase,
    selected,
    lastResult,
    toggleItem,
    validate,
    rate,
    restart,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({
  current,
  total,
  correctCount,
  accentColor,
}: {
  current: number;
  total: number;
  correctCount: number;
  accentColor: string;
}) {
  const pct = total > 0 ? ((total - current) / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="font-semibold text-[#0F1F4D]">
            Question {total - current + (current > 0 ? 1 : 0)} / {total}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 font-semibold"
            style={{ background: '#DCF1E2', color: '#15803D' }}
          >
            {correctCount} acquise{correctCount > 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionView({
  entry,
  titre,
  session,
  phase,
  selected,
  lastResult,
  onToggle,
  onValidate,
  onRate,
  accentColor,
}: {
  entry: QueueEntry;
  titre: string;
  session: SessionState;
  phase: 'answering' | 'review';
  selected: Set<string>;
  lastResult: { isCorrect: boolean; question: PriveAnnaleQuestion } | null;
  onToggle: (lettre: string) => void;
  onValidate: () => void;
  onRate: (difficulty: 'facile' | 'difficile') => void;
  accentColor: string;
}) {
  const q = entry.flat.question;
  const bg = pastelBg(accentColor);

  const scoreInfo = useMemo(() => {
    if (!lastResult) return null;
    const correctAnswers = q.items.filter((i) => i.is_correct).map((i) => i.lettre);
    const userCorrect = correctAnswers.filter((l) => selected.has(l)).length;
    const userWrong = [...selected].filter((l) => !correctAnswers.includes(l)).length;
    const allCorrect = userCorrect === correctAnswers.length && userWrong === 0;
    return { userCorrect, totalCorrect: correctAnswers.length, userWrong, allCorrect };
  }, [lastResult, q.items, selected]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: accentColor + '18' }}
        >
          <HelpCircle className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            QCM
          </p>
          <h1 className="text-[18px] font-extrabold tracking-tight text-[#0F1F4D]">
            {titre}
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar
          current={session.queue.length}
          total={session.totalQuestions}
          correctCount={session.correctCount}
          accentColor={accentColor}
        />
      </div>

      {/* Question Card — premium design */}
      <div
        className="relative overflow-hidden rounded-2xl border shadow-lg"
        style={{ borderColor: accentColor + '30' }}
      >
        {/* Watermark logo */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.015]"
        >
          <Image
            src="/major-ecn-logo.png"
            alt=""
            width={300}
            height={300}
            className="h-auto w-[50%] max-w-[300px] object-contain"
            priority={false}
          />
        </span>

        {/* Left accent bar */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1 sm:w-1.5"
          style={{ background: accentColor }}
        />

        {/* Question header */}
        <div
          className="relative border-b px-5 py-4 sm:px-6"
          style={{
            background: `linear-gradient(135deg, ${bg} 0%, #FFFFFF 80%)`,
            borderColor: accentColor + '20',
          }}
        >
          <p
            className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accentColor }}
          >
            Question {entry.flat.index + 1}
          </p>
          <p
            className="text-[14px] font-bold leading-relaxed text-[#0F1F4D]"
            dangerouslySetInnerHTML={{ __html: md(q.enonce) }}
          />
        </div>

        {/* Answer items */}
        <div className="relative divide-y divide-gray-100 bg-white">
          {q.items.map((item) => {
            const isSelected = selected.has(item.lettre);
            const isCorrect = item.is_correct;
            const inReview = phase === 'review';

            let itemBg = '';
            if (inReview) {
              if (isCorrect && isSelected) itemBg = 'bg-green-50';
              else if (isCorrect && !isSelected) itemBg = 'bg-green-50/60';
              else if (!isCorrect && isSelected) itemBg = 'bg-red-50';
            }

            let circleStyle = 'border-gray-300 text-gray-500';
            let circleContent: React.ReactNode = item.lettre;

            if (inReview) {
              if (isCorrect) {
                circleStyle = 'border-green-500 bg-green-500 text-white';
                circleContent = <Check className="h-3.5 w-3.5" />;
              } else if (isSelected) {
                circleStyle = 'border-red-500 bg-red-500 text-white';
                circleContent = <XIcon className="h-3.5 w-3.5" />;
              }
            } else if (isSelected) {
              circleStyle = 'text-white';
            }

            return (
              <button
                key={item.lettre}
                onClick={() => onToggle(item.lettre)}
                disabled={inReview}
                className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-all sm:px-6 ${itemBg} ${
                  !inReview ? 'hover:bg-gray-50/80 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-all ${circleStyle}`}
                  style={
                    !inReview && isSelected
                      ? { background: accentColor, borderColor: accentColor }
                      : undefined
                  }
                >
                  {circleContent}
                </span>
                <span
                  className={`text-[13px] leading-relaxed ${
                    inReview
                      ? isCorrect
                        ? 'text-green-800 font-medium'
                        : isSelected
                          ? 'text-red-800'
                          : 'text-gray-700'
                      : 'text-gray-700'
                  }`}
                >
                  {item.enonce}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action area */}
        {phase === 'answering' ? (
          <div className="relative border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
            <button
              onClick={onValidate}
              disabled={selected.size === 0}
              className="w-full rounded-xl px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: accentColor }}
            >
              Valider
            </button>
          </div>
        ) : (
          <div className="relative border-t" style={{ borderColor: accentColor + '20' }}>
            {/* Score banner */}
            {scoreInfo && (
              <div
                className={`flex items-center gap-2.5 px-5 py-3.5 sm:px-6 ${
                  scoreInfo.allCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {scoreInfo.allCorrect ? (
                  <>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-[13px] font-bold text-green-700">
                      Bonne réponse !
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-[13px] font-bold text-red-700">
                      {scoreInfo.userCorrect}/{scoreInfo.totalCorrect} bonne
                      {scoreInfo.totalCorrect > 1 ? 's' : ''} réponse
                      {scoreInfo.totalCorrect > 1 ? 's' : ''}
                      {scoreInfo.userWrong > 0 &&
                        ` · ${scoreInfo.userWrong} erreur${scoreInfo.userWrong > 1 ? 's' : ''}`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Correction */}
            <div className="bg-blue-50/80 px-5 py-4 sm:px-6">
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">
                <Sparkles className="h-3 w-3" />
                Correction
              </p>
              <p
                className="text-[13px] leading-relaxed text-blue-900"
                dangerouslySetInnerHTML={{ __html: md(q.correction) }}
              />
            </div>

            {/* Rappel de cours */}
            {entry.flat.rappelCours && (
              <div className="bg-[#F0FDF4] px-5 py-4 border-t border-green-100 sm:px-6">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-green-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  Rappel de cours
                </div>
                <div
                  className="text-[13px] leading-relaxed text-green-900"
                  dangerouslySetInnerHTML={{ __html: md(entry.flat.rappelCours) }}
                />
              </div>
            )}

            {/* Auto-évaluation : Facile → acquise · Difficile → réapparaît (3). */}
            <div className="grid grid-cols-2 gap-2.5 border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
              <button
                onClick={() => onRate('facile')}
                className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#DCF1E2', borderColor: '#15803D30', color: '#15803D' }}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Facile
              </button>
              <button
                onClick={() => onRate('difficile')}
                className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#FCE7EB', borderColor: '#E11D4830', color: '#E11D48' }}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
                Difficile
              </button>
            </div>
          </div>
        )}

        {/* Brand mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-1/2 z-20 hidden -translate-x-1/2 select-none text-[8px] font-bold uppercase tracking-[0.18em] text-gray-300 sm:block"
        >
          Major <span style={{ color: accentColor + '55' }}>ECN</span>
        </span>
      </div>
    </div>
  );
}

function CompletionScreen({
  session,
  titre,
  onRestart,
  accentColor,
}: {
  session: SessionState;
  titre: string;
  onRestart: () => void;
  accentColor: string;
}) {
  const pct = session.totalQuestions > 0
    ? Math.round((session.firstTryCorrect / session.totalQuestions) * 100)
    : 0;
  const isGood = pct >= 80;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div
        className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border py-16 px-8 text-center shadow-lg"
        style={{
          borderColor: isGood ? '#15803D33' : accentColor + '33',
          background: isGood
            ? 'linear-gradient(135deg, #DCF1E2 0%, #FFFFFF 60%)'
            : `linear-gradient(135deg, ${pastelBg(accentColor)} 0%, #FFFFFF 60%)`,
        }}
      >
        {/* Watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.02]"
        >
          <Image
            src="/major-ecn-logo.png"
            alt=""
            width={300}
            height={300}
            className="h-auto w-[50%] max-w-[300px] object-contain"
            priority={false}
          />
        </span>

        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: isGood ? '#DCF1E2' : accentColor + '18' }}>
          <CheckCircle className="h-8 w-8" style={{ color: isGood ? '#15803D' : accentColor }} />
        </div>
        <div className="relative z-10">
          <h2 className="text-[22px] font-extrabold text-[#0F1F4D]">
            QCM terminés !
          </h2>
          <p className="mt-1 text-[15px] text-gray-500">{titre}</p>
        </div>
        <div className="relative z-10 rounded-xl border border-gray-100 bg-white/80 px-6 py-3 backdrop-blur">
          <p className="text-[14px] font-semibold text-[#0F1F4D]">
            <span style={{ color: isGood ? '#15803D' : accentColor }}>{session.firstTryCorrect}</span> /{' '}
            {session.totalQuestions} au premier essai
            <span className="ml-2 text-[12px] text-gray-400">({pct}%)</span>
          </p>
        </div>
        <div className="relative z-10 mt-4 w-full max-w-xs">
          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold text-white shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: accentColor }}
          >
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export function PriveQcmViewer({
  annales,
  titre,
  themeColor,
}: {
  annales: PriveAnnale[];
  titre: string;
  themeColor?: string;
}) {
  const accent = themeColor ?? '#C0112E';
  const allQuestions = useMemo(() => flattenAnnales(annales), [annales]);

  const {
    currentEntry,
    isFinished,
    session,
    phase,
    selected,
    lastResult,
    toggleItem,
    validate,
    rate,
    restart,
  } = useSpacedRepetition(allQuestions);

  if (annales.length === 0 || allQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-[#FAFBFE] py-16 text-center">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="text-[15px] font-medium text-gray-500">
            Aucun QCM disponible pour ce cours.
          </p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <CompletionScreen
        session={session}
        titre={titre}
        onRestart={restart}
        accentColor={accent}
      />
    );
  }

  if (!currentEntry) return null;

  return (
    <QuestionView
      entry={currentEntry}
      titre={titre}
      session={session}
      phase={phase}
      selected={selected}
      lastResult={lastResult}
      onToggle={toggleItem}
      onValidate={validate}
      onRate={rate}
      accentColor={accent}
    />
  );
}
