'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export type TQuestion = {
  id: string;
  enonce: string;
  college: string;
  items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[];
};

export function TargetedSession({ questions, backHref }: { questions: TQuestion[]; backHref: string }) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<ItemOutcome[] | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = questions.length;
  const q = questions[index];

  if (done || !q) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-(--color-ink)">Entraînement terminé</h2>
        <p className="mt-2 text-(--color-ink-soft)">
          Score : <span className="font-semibold text-(--color-ink)">{score}/{total}</span> ({pct}%)
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href={backHref}><ArrowLeft /> Retour</Link>
          </Button>
          <Button onClick={() => { setIndex(0); setSel(new Set()); setOutcomes(null); setScore(0); setDone(false); }}>
            <RotateCcw /> Recommencer
          </Button>
        </div>
      </div>
    );
  }

  const isValidated = outcomes != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(lettre)) n.delete(lettre); else n.add(lettre);
      return n;
    });
  };

  const validate = async () => {
    if (isValidated || sel.size === 0 || submitting) return;
    setSubmitting(true);
    const { perItem, isQuestionCorrect } = gradeQuestion(
      q.items.map((it) => ({ lettre: it.lettre, is_correct: it.is_correct, selected: sel.has(it.lettre) })),
    );
    const oc = q.items.map((it) => perItem[it.lettre]);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('qcm_attempts').insert({
          user_id: user.id,
          question_id: q.id,
          selected_items: Array.from(sel),
          is_correct: isQuestionCorrect,
          time_spent_seconds: null,
        });
      }
    } catch { /* practice mode — ignore persistence errors */ }
    if (isQuestionCorrect) setScore((s) => s + 1);
    setOutcomes(oc);
    setSubmitting(false);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSel(new Set());
      setOutcomes(null);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}><ArrowLeft /> Quitter</Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-(--color-primary)">
          <Target className="h-3.5 w-3.5" /> Entraînement ciblé
        </span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span className="truncate">{q.college}</span>
        <span className="shrink-0">Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-3" />

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">Énoncé</p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty">
          <RichText html={q.enonce} />
        </h2>
      </div>

      <div className="space-y-2">
        {q.items.map((it, i) => (
          <QcmItem
            key={it.id}
            item={it}
            selected={sel.has(it.lettre)}
            outcome={outcomes?.[i] ?? null}
            disabled={isValidated}
            isCorrect={it.is_correct}
            onToggle={() => toggle(it.lettre)}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 pb-2">
        {!isValidated ? (
          <Button onClick={validate} disabled={sel.size === 0 || submitting}>Valider</Button>
        ) : (
          <Button onClick={next}>
            {index < total - 1 ? 'Question suivante' : 'Terminer'}
            <ArrowRight />
          </Button>
        )}
      </div>
      <span className={cn('sr-only')} aria-live="polite">{isValidated ? 'Question corrigée' : ''}</span>
    </div>
  );
}
