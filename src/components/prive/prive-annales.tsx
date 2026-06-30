'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle,
  ChevronDown,
  FileText,
  HelpCircle,
  X as XIcon,
  XCircle,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import type { PriveAnnale, PriveAnnaleQuestion } from '@/lib/data/prive-courses';

function md(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QueueEntry = {
  questionIndex: number; // original index within the annale
  question: PriveAnnaleQuestion;
};

type SessionState = {
  queue: QueueEntry[];
  totalQuestions: number;
  correctCount: number;
  firstTryCorrect: number;
  attemptedOnce: Set<number>; // tracks which questions have been attempted at least once
};

// ---------------------------------------------------------------------------
// Spaced-repetition session hook
// ---------------------------------------------------------------------------

function useSpacedRepetition(annale: PriveAnnale) {
  const [session, setSession] = useState<SessionState>(() => initSession(annale));
  const [phase, setPhase] = useState<'answering' | 'review'>('answering');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    question: PriveAnnaleQuestion;
  } | null>(null);

  function initSession(a: PriveAnnale): SessionState {
    return {
      queue: a.questions.map((q, i) => ({ questionIndex: i, question: q })),
      totalQuestions: a.questions.length,
      correctCount: 0,
      firstTryCorrect: 0,
      attemptedOnce: new Set(),
    };
  }

  const currentEntry = session.queue[0] ?? null;
  const isFinished = session.queue.length === 0;

  function toggleItem(lettre: string) {
    if (phase !== 'answering') return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lettre)) next.delete(lettre);
      else next.add(lettre);
      return next;
    });
  }

  function validate() {
    if (!currentEntry) return;
    const q = currentEntry.question;
    const isCorrect = q.items.every(
      (item) => selected.has(item.lettre) === item.is_correct
    );
    setLastResult({ isCorrect, question: q });
    setPhase('review');

    setSession((prev) => {
      const newQueue = [...prev.queue];
      const removed = newQueue.shift()!;
      const wasFirstAttempt = !prev.attemptedOnce.has(removed.questionIndex);
      const newAttempted = new Set(prev.attemptedOnce);
      newAttempted.add(removed.questionIndex);

      if (!isCorrect) {
        // Reinsert after 3 positions (or at end if queue is short)
        const insertPos = Math.min(3, newQueue.length);
        newQueue.splice(insertPos, 0, removed);
      }

      return {
        ...prev,
        queue: newQueue,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        firstTryCorrect:
          prev.firstTryCorrect + (isCorrect && wasFirstAttempt ? 1 : 0),
        attemptedOnce: newAttempted,
      };
    });
  }

  function nextQuestion() {
    setSelected(new Set());
    setLastResult(null);
    setPhase('answering');
  }

  function restart() {
    setSession(initSession(annale));
    setSelected(new Set());
    setLastResult(null);
    setPhase('answering');
  }

  return {
    currentEntry,
    isFinished,
    session,
    phase,
    selected,
    lastResult,
    toggleItem,
    validate,
    nextQuestion,
    restart,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SeriesCard({
  annale,
  index,
  onStart,
}: {
  annale: PriveAnnale;
  index: number;
  onStart: () => void;
}) {
  return (
    <button
      onClick={onStart}
      className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 text-left shadow-sm transition-all hover:border-[#C0112E]/30 hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C0112E]/10">
        <HelpCircle className="h-6 w-6 text-[#C0112E]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-[#0F1F4D] truncate">
          {annale.titre}
        </p>
        <p className="mt-0.5 text-[13px] text-gray-500">
          {annale.annee} · {annale.questions.length} question
          {annale.questions.length > 1 ? 's' : ''}
        </p>
      </div>
      <ChevronDown className="h-5 w-5 -rotate-90 text-gray-400" />
    </button>
  );
}

function ProgressBar({
  current,
  total,
  correctCount,
}: {
  current: number;
  total: number;
  correctCount: number;
}) {
  const pct = total > 0 ? ((total - current) / total) * 100 : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="font-semibold text-[#0F1F4D]">
            Question {total - current + (current > 0 ? 1 : 0)} / {total}
          </span>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-semibold text-green-700">
            {correctCount} acquise{correctCount > 1 ? 's' : ''}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-[#C0112E] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionView({
  entry,
  annale,
  session,
  phase,
  selected,
  lastResult,
  onToggle,
  onValidate,
  onNext,
  onQuit,
}: {
  entry: QueueEntry;
  annale: PriveAnnale;
  session: SessionState;
  phase: 'answering' | 'review';
  selected: Set<string>;
  lastResult: { isCorrect: boolean; question: PriveAnnaleQuestion } | null;
  onToggle: (lettre: string) => void;
  onValidate: () => void;
  onNext: () => void;
  onQuit: () => void;
}) {
  const q = entry.question;

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
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onQuit}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quitter
        </button>
        <p className="text-[13px] font-semibold text-[#0F1F4D]">
          {annale.titre}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar
          current={session.queue.length}
          total={session.totalQuestions}
          correctCount={session.correctCount}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Question header */}
        <div className="border-b border-gray-200 bg-[#FAFBFE] px-5 py-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C0112E] mb-1">
            Question {entry.questionIndex + 1}
          </p>
          <p
            className="text-[14px] font-bold leading-relaxed text-[#0F1F4D]"
            dangerouslySetInnerHTML={{ __html: md(q.enonce) }}
          />
        </div>

        {/* Answer items */}
        <div className="divide-y divide-gray-100">
          {q.items.map((item) => {
            const isSelected = selected.has(item.lettre);
            const isCorrect = item.is_correct;
            const inReview = phase === 'review';

            let bg = '';
            let ringClass = '';
            if (inReview) {
              if (isCorrect && isSelected) {
                bg = 'bg-green-50';
              } else if (isCorrect && !isSelected) {
                bg = 'bg-green-50/60';
              } else if (!isCorrect && isSelected) {
                bg = 'bg-red-50';
              }
            }

            let circleClass =
              'border-gray-300 text-gray-500';
            let circleContent: React.ReactNode = item.lettre;

            if (inReview) {
              if (isCorrect) {
                circleClass = 'border-green-500 bg-green-500 text-white';
                circleContent = <Check className="h-3.5 w-3.5" />;
              } else if (isSelected) {
                circleClass = 'border-red-500 bg-red-500 text-white';
                circleContent = <XIcon className="h-3.5 w-3.5" />;
              }
            } else if (isSelected) {
              circleClass = 'border-[#C0112E] bg-[#C0112E] text-white';
            }

            return (
              <button
                key={item.lettre}
                onClick={() => onToggle(item.lettre)}
                disabled={inReview}
                className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${bg} ${
                  !inReview ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-colors ${circleClass}`}
                >
                  {circleContent}
                </span>
                <span
                  className={`text-[13px] leading-relaxed ${
                    inReview
                      ? isCorrect
                        ? 'text-green-800'
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
          <div className="border-t border-gray-200 px-5 py-4">
            <button
              onClick={onValidate}
              disabled={selected.size === 0}
              className="w-full rounded-xl bg-[#C0112E] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#A00F27] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {/* Score banner */}
            {scoreInfo && (
              <div
                className={`flex items-center gap-2 px-5 py-3 ${
                  scoreInfo.allCorrect ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {scoreInfo.allCorrect ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-[13px] font-semibold text-green-700">
                      Bonne r&eacute;ponse !
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-[13px] font-semibold text-red-700">
                      {scoreInfo.userCorrect}/{scoreInfo.totalCorrect} bonne
                      {scoreInfo.totalCorrect > 1 ? 's' : ''} r&eacute;ponse
                      {scoreInfo.totalCorrect > 1 ? 's' : ''}
                      {scoreInfo.userWrong > 0 &&
                        ` · ${scoreInfo.userWrong} erreur${scoreInfo.userWrong > 1 ? 's' : ''}`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Correction */}
            <div className="bg-blue-50 px-5 py-4">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-blue-600">
                Correction
              </p>
              <p
                className="text-[13px] leading-relaxed text-blue-900"
                dangerouslySetInnerHTML={{ __html: md(q.correction) }}
              />
            </div>

            {/* Rappel de cours - ONLY shown after validation */}
            {annale.rappel_cours && (
              <div className="bg-[#F0FDF4] px-5 py-4 border-t border-green-100">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green-700">
                  <BookOpen className="h-3.5 w-3.5" />
                  Rappel de cours
                </div>
                <div
                  className="text-[13px] leading-relaxed text-green-900"
                  dangerouslySetInnerHTML={{ __html: md(annale.rappel_cours) }}
                />
              </div>
            )}

            {/* Next question button */}
            <div className="px-5 py-4 border-t border-gray-200">
              <button
                onClick={onNext}
                className="w-full rounded-xl bg-[#C0112E] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#A00F27]"
              >
                Question suivante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompletionScreen({
  session,
  annaleTitle,
  onRestart,
  onBackToList,
}: {
  session: SessionState;
  annaleTitle: string;
  onRestart: () => void;
  onBackToList: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white py-16 px-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-[22px] font-extrabold text-[#0F1F4D]">
            S&eacute;rie termin&eacute;e !
          </h2>
          <p className="mt-1 text-[15px] text-gray-500">{annaleTitle}</p>
        </div>
        <div className="rounded-xl bg-[#FAFBFE] px-6 py-3">
          <p className="text-[14px] font-semibold text-[#0F1F4D]">
            <span className="text-green-600">{session.firstTryCorrect}</span> /{' '}
            {session.totalQuestions} au premier essai
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C0112E] px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#A00F27]"
          >
            <RotateCcw className="h-4 w-4" />
            Recommencer
          </button>
          <button
            onClick={onBackToList}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-bold text-[#0F1F4D] transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Choisir une autre s&eacute;rie
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session wrapper (manages one annale's session lifecycle)
// ---------------------------------------------------------------------------

function QcmSession({
  annale,
  onQuit,
}: {
  annale: PriveAnnale;
  onQuit: () => void;
}) {
  const {
    currentEntry,
    isFinished,
    session,
    phase,
    selected,
    lastResult,
    toggleItem,
    validate,
    nextQuestion,
    restart,
  } = useSpacedRepetition(annale);

  if (isFinished) {
    return (
      <CompletionScreen
        session={session}
        annaleTitle={annale.titre}
        onRestart={restart}
        onBackToList={onQuit}
      />
    );
  }

  if (!currentEntry) return null;

  return (
    <QuestionView
      entry={currentEntry}
      annale={annale}
      session={session}
      phase={phase}
      selected={selected}
      lastResult={lastResult}
      onToggle={toggleItem}
      onValidate={validate}
      onNext={nextQuestion}
      onQuit={onQuit}
    />
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

export function PriveQcmViewer({
  annales,
  titre,
}: {
  annales: PriveAnnale[];
  titre: string;
}) {
  const [activeAnnaleIdx, setActiveAnnaleIdx] = useState<number | null>(
    annales.length === 1 ? 0 : null
  );

  if (annales.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-[#FAFBFE] py-16 text-center">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="text-[15px] font-medium text-gray-500">
            Aucune s&eacute;rie QCM disponible pour ce cours.
          </p>
        </div>
      </div>
    );
  }

  // Active session
  if (activeAnnaleIdx !== null) {
    return (
      <QcmSession
        key={activeAnnaleIdx}
        annale={annales[activeAnnaleIdx]}
        onQuit={() => setActiveAnnaleIdx(null)}
      />
    );
  }

  // Series selection
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0112E]/10">
          <HelpCircle className="h-5 w-5 text-[#C0112E]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C0112E]">
            QCM
          </p>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#0F1F4D]">
            {titre}
          </h1>
        </div>
      </div>

      <p className="mb-4 text-[14px] text-gray-500">
        Choisissez une s&eacute;rie pour commencer l&apos;entra&icirc;nement.
        Chaque question r&eacute;apparait jusqu&apos;&agrave; ce que vous la
        r&eacute;ussissiez.
      </p>

      <div className="space-y-3">
        {annales.map((annale, idx) => (
          <SeriesCard
            key={idx}
            annale={annale}
            index={idx}
            onStart={() => setActiveAnnaleIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
}
