'use client';

import { useState } from 'react';
import { BookOpen, Check, ChevronDown, FileText, HelpCircle, X as XIcon } from 'lucide-react';
import type { PriveAnnale, PriveAnnaleQuestion } from '@/lib/data/prive-courses';

function md(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function QuestionCard({ q, index }: { q: PriveAnnaleQuestion; index: number }) {
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
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
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
            className="rounded-lg bg-[#0F1F4D] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#1A2E5C]"
          >
            Voir la correction
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-200 bg-blue-50 px-5 py-4">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-blue-600">Correction</p>
          <p
            className="text-[13px] leading-relaxed text-blue-900"
            dangerouslySetInnerHTML={{ __html: md(q.correction) }}
          />
        </div>
      )}
    </div>
  );
}

export function PriveAnnalesViewer({ annales, titre }: { annales: PriveAnnale[]; titre: string }) {
  const [openAnnale, setOpenAnnale] = useState<number | null>(annales.length > 0 ? 0 : null);

  if (annales.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="text-[15px] font-medium text-gray-500">Aucune annale disponible pour ce cours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-[#C0112E]" />
        <h1 className="text-[22px] font-extrabold tracking-tight text-[#0F1F4D]">Annales — {titre}</h1>
      </div>

      <div className="space-y-4">
        {annales.map((annale, aIdx) => (
          <div key={aIdx} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => setOpenAnnale(openAnnale === aIdx ? null : aIdx)}
              className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-gray-50"
            >
              <HelpCircle className="h-5 w-5 shrink-0 text-[#C0112E]" />
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#0F1F4D]">{annale.titre}</p>
                <p className="text-[13px] text-gray-500">{annale.annee} · {annale.questions.length} question{annale.questions.length > 1 ? 's' : ''}</p>
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
                    <QuestionCard key={qIdx} q={q} index={qIdx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
