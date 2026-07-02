'use client';

import { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichText } from '@/components/qcm/rich-text';
import { cn } from '@/lib/utils';

export type EngineQuestion = {
  id: string;
  enonce: string;
  cours_id: string;
  college: string;
  items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[];
};

export type EngineResult = {
  score: number;
  total: number;
  perCours: Record<string, { c: number; t: number }>;
};

export function QcmEngine({
  questions,
  title,
  onComplete,
}: {
  questions: EngineQuestion[];
  title: string;
  onComplete: (result: EngineResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Set<string>>>(new Map());
  const [validated, setValidated] = useState(false);

  const q = questions[index];
  if (!q) return null;

  const sel = answers.get(q.id) ?? new Set<string>();
  const total = questions.length;
  const pct = Math.round(((index + (validated ? 1 : 0)) / total) * 100);

  const toggle = (lettre: string) => {
    if (validated) return;
    setAnswers((prev) => {
      const next = new Map(prev);
      const s = new Set(next.get(q.id) ?? []);
      if (s.has(lettre)) s.delete(lettre);
      else s.add(lettre);
      next.set(q.id, s);
      return next;
    });
  };

  const validate = () => setValidated(true);

  const next = () => {
    if (index === total - 1) {
      let score = 0;
      const perCours: Record<string, { c: number; t: number }> = {};
      for (const question of questions) {
        const s = answers.get(question.id) ?? new Set<string>();
        const ok = question.items.every((it) =>
          it.is_correct ? s.has(it.lettre) : !s.has(it.lettre),
        );
        if (ok) score++;
        const prev = perCours[question.cours_id] ?? { c: 0, t: 0 };
        perCours[question.cours_id] = { c: prev.c + (ok ? 1 : 0), t: prev.t + 1 };
      }
      onComplete({ score, total, perCours });
    } else {
      setIndex((i) => i + 1);
      setValidated(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-(--color-ink-muted)">{title}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-(--color-border)">
            <div
              className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-(--color-ink-soft)">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          {q.college}
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-(--color-ink) sm:text-base">
          <RichText html={q.enonce} />
        </p>

        {/* Items */}
        <div className="mt-5 space-y-2.5">
          {q.items.map((it) => {
            const picked = sel.has(it.lettre);
            const correct = it.is_correct;
            let ring = 'border-(--color-border)';
            let bg = '';
            if (validated) {
              if (correct) { ring = 'border-[#16793C]'; bg = 'bg-[#ECFDF3]'; }
              else if (picked && !correct) { ring = 'border-[#A91D2C]'; bg = 'bg-[#FEF2F2]'; }
            } else if (picked) {
              ring = 'border-[#6D28D9]'; bg = 'bg-[#F5F3FF]';
            }
            return (
              <button
                key={it.id}
                onClick={() => toggle(it.lettre)}
                disabled={validated}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors',
                  ring, bg,
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    picked && !validated && 'border-[#6D28D9] bg-[#6D28D9] text-white',
                    validated && correct && 'border-[#16793C] bg-[#16793C] text-white',
                    validated && picked && !correct && 'border-[#A91D2C] bg-[#A91D2C] text-white',
                    !picked && !validated && 'border-(--color-border) text-(--color-ink-soft)',
                    !picked && validated && !correct && 'border-(--color-border) text-(--color-ink-soft)',
                  )}
                >
                  {validated && correct ? <Check className="h-3.5 w-3.5" /> :
                   validated && picked && !correct ? <X className="h-3.5 w-3.5" /> :
                   it.lettre}
                </span>
                <span className="flex-1"><RichText html={it.enonce} /></span>
              </button>
            );
          })}
        </div>

        {/* Justifications after validation */}
        {validated && (
          <div className="mt-4 space-y-2 rounded-xl bg-(--color-surface) p-4">
            {q.items.filter((it) => it.justification).map((it) => (
              <div key={it.id} className="flex items-start gap-2 text-xs text-(--color-ink-soft)">
                <span className={cn('mt-0.5 font-bold', it.is_correct ? 'text-[#16793C]' : 'text-[#A91D2C]')}>
                  {it.lettre}.
                </span>
                <span><RichText html={it.justification} /></span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="mt-6 flex justify-end">
        {!validated ? (
          <Button
            onClick={validate}
            disabled={sel.size === 0}
            className="rounded-xl px-6 py-3 text-sm font-bold"
            style={{ background: '#6D28D9' }}
          >
            Valider
          </Button>
        ) : (
          <Button
            onClick={next}
            className="rounded-xl px-6 py-3 text-sm font-bold"
            style={{ background: '#6D28D9' }}
          >
            {index === total - 1 ? 'Terminer' : 'Question suivante'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
