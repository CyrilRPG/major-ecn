'use client';

import { useState, useMemo } from 'react';
import { BookOpen, Check, CheckCircle, ChevronDown, FileText, HelpCircle, X as XIcon, XCircle } from 'lucide-react';
import type { PriveAnnale, PriveAnnaleQuestion } from '@/lib/data/prive-courses';

function md(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function QuestionCard({ q, index, onScore }: { q: PriveAnnaleQuestion; index: number; onScore: (correct: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleItem(lettre: string) {
    if (revealed) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(lettre)) next.delete(lettre); else next.add(lettre);
      return next;
    });
  }

  function reveal() {
    setRevealed(true);
    // Check if user got all correct answers and no wrong ones
    const correctLetters = new Set(q.items.filter(i => i.is_correct).map(i => i.lettre));
    const isCorrect = q.items.every(item => {
      const isSelected = selected.has(item.lettre);
      return isSelected === item.is_correct;
    });
    onScore(isCorrect);
  }

  // Compute score info after reveal
  const scoreInfo = useMemo(() => {
    if (!revealed) return null;
    const correctAnswers = q.items.filter(i => i.is_correct).map(i => i.lettre);
    const userCorrect = correctAnswers.filter(l => selected.has(l)).length;
    const userWrong = [...selected].filter(l => !correctAnswers.includes(l)).length;
    const allCorrect = userCorrect === correctAnswers.length && userWrong === 0;
    return { userCorrect, totalCorrect: correctAnswers.length, userWrong, allCorrect };
  }, [revealed, q.items, selected]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="border-b border-gray-200 bg-[#FAFBFE] px-5 py-4">
        <p className="text-[14px] font-bold text-[#0F1F4D]">
          Question {index + 1}
        </p>
        <p
          className="mt-1 text-[14px] leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: md(q.enonce) }}
        />
      </div>

      <div className="divide-y divide-gray-100">
        {q.items.map((item) => {
          const isSelected = selected.has(item.lettre);
          const isCorrect = item.is_correct;
          let bg = '';
          let textColor = 'text-gray-700';
          if (revealed) {
            if (isCorrect) { bg = 'bg-green-50'; textColor = 'text-green-800'; }
            else if (isSelected && !isCorrect) { bg = 'bg-red-50'; textColor = 'text-red-800'; }
          }

          return (
            <button
              key={item.lettre}
              onClick={() => toggleItem(item.lettre)}
              className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors ${bg} ${
                !revealed ? 'hover:bg-gray-50' : ''
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                  revealed
                    ? isCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : isSelected
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    : isSelected
                      ? 'border-[#C0112E] bg-[#C0112E] text-white'
                      : 'border-gray-300 text-gray-500'
                }`}
              >
                {revealed ? (isCorrect ? <Check className="h-3.5 w-3.5" /> : isSelected ? <XIcon className="h-3.5 w-3.5" /> : item.lettre) : item.lettre}
              </span>
              <span className={`text-[13px] leading-relaxed ${textColor}`}>
                {item.enonce}
              </span>
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <div className="border-t border-gray-200 px-5 py-3">
          <button
            onClick={reveal}
            className="rounded-xl bg-[#C0112E] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#A00F27]"
          >
            Voir la correction
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          {/* Score indicator */}
          {scoreInfo && (
            <div className={`flex items-center gap-2 px-5 py-3 ${scoreInfo.allCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              {scoreInfo.allCorrect ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-[13px] font-semibold text-green-700">Bonne reponse !</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-[13px] font-semibold text-red-700">
                    {scoreInfo.userCorrect}/{scoreInfo.totalCorrect} bonne{scoreInfo.totalCorrect > 1 ? 's' : ''} reponse{scoreInfo.totalCorrect > 1 ? 's' : ''}
                    {scoreInfo.userWrong > 0 && ` · ${scoreInfo.userWrong} erreur${scoreInfo.userWrong > 1 ? 's' : ''}`}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="bg-blue-50 px-5 py-4">
            <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-blue-600">Correction</p>
            <p
              className="text-[13px] leading-relaxed text-blue-900"
              dangerouslySetInnerHTML={{ __html: md(q.correction) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function PriveQcmViewer({ annales, titre }: { annales: PriveAnnale[]; titre: string }) {
  const [openAnnale, setOpenAnnale] = useState<number | null>(annales.length > 0 ? 0 : null);
  const [scores, setScores] = useState<Map<string, { correct: number; total: number }>>(new Map());

  function handleScore(annaleIdx: number, questionIdx: number, correct: boolean) {
    setScores(prev => {
      const next = new Map(prev);
      const key = `${annaleIdx}`;
      const current = next.get(key) ?? { correct: 0, total: 0 };
      next.set(key, {
        correct: current.correct + (correct ? 1 : 0),
        total: current.total + 1,
      });
      return next;
    });
  }

  if (annales.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-[#FAFBFE] py-16 text-center">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="text-[15px] font-medium text-gray-500">Aucune serie QCM disponible pour ce cours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0112E]/10">
          <HelpCircle className="h-5 w-5 text-[#C0112E]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C0112E]">QCM</p>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#0F1F4D]">{titre}</h1>
        </div>
      </div>

      <div className="space-y-4">
        {annales.map((annale, aIdx) => {
          const score = scores.get(`${aIdx}`);
          return (
            <div key={aIdx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenAnnale(openAnnale === aIdx ? null : aIdx)}
                className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-[#FAFBFE]"
              >
                <HelpCircle className="h-5 w-5 shrink-0 text-[#C0112E]" />
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#0F1F4D]">{annale.titre}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-gray-500">{annale.annee} · {annale.questions.length} question{annale.questions.length > 1 ? 's' : ''}</p>
                    {score && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        score.correct === score.total ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {score.correct}/{score.total}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${openAnnale === aIdx ? 'rotate-180' : ''}`} />
              </button>

              {openAnnale === aIdx && (
                <div className="border-t border-gray-200">
                  {/* Rappel de cours */}
                  <div className="border-b border-gray-200 bg-[#F0FDF4] px-6 py-4">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-green-700">
                      <BookOpen className="h-3.5 w-3.5" />
                      Rappel de cours
                    </div>
                    <div
                      className="text-[13px] leading-relaxed text-green-900"
                      dangerouslySetInnerHTML={{ __html: md(annale.rappel_cours) }}
                    />
                  </div>

                  {/* Questions */}
                  <div className="space-y-4 p-6">
                    {annale.questions.map((q, qIdx) => (
                      <QuestionCard
                        key={qIdx}
                        q={q}
                        index={qIdx}
                        onScore={(correct) => handleScore(aIdx, qIdx, correct)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
