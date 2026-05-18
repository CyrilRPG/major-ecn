'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem, type QcmItemView } from './qcm-item';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { createClient } from '@/lib/supabase/client';
import { cn, formatDuration } from '@/lib/utils';

type Question = {
  id: string;
  enonce: string;
  order_index: number;
  items: (QcmItemView & { is_correct: boolean })[];
};

export function QcmSession({
  sessionId,
  coursId,
  serieLabel,
  serieKind,
  questions,
  backHref,
}: {
  sessionId: string;
  coursId: string;
  serieLabel: string;
  serieKind: 'qcm' | 'annale';
  questions: Question[];
  backHref: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [validated, setValidated] = useState<Record<string, ItemOutcome[] | null>>({});
  const [questionCorrect, setQuestionCorrect] = useState<Record<string, boolean | null>>({});
  const [elapsed, setElapsed] = useState(0);
  const [perQuestionStart, setPerQuestionStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => setPerQuestionStart(Date.now()), [index]);

  const total = questions.length;
  const q = questions[index];
  const sel = selected[q.id] ?? new Set<string>();
  const isValidated = validated[q.id] != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSelected((prev) => {
      const cur = new Set(prev[q.id] ?? []);
      if (cur.has(lettre)) cur.delete(lettre); else cur.add(lettre);
      return { ...prev, [q.id]: cur };
    });
  };

  const validate = async () => {
    if (isValidated || sel.size === 0 || submitting) return;
    setSubmitting(true);
    const gradeInput = q.items.map((it) => ({
      lettre: it.lettre,
      is_correct: it.is_correct,
      selected: sel.has(it.lettre),
    }));
    const { perItem, isQuestionCorrect } = gradeQuestion(gradeInput);
    const outcomes: ItemOutcome[] = q.items.map((it) => perItem[it.lettre]);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('qcm_attempts').insert({
        user_id: user.id,
        session_id: sessionId,
        question_id: q.id,
        selected_items: Array.from(sel),
        is_correct: isQuestionCorrect,
        time_spent_seconds: Math.round((Date.now() - perQuestionStart) / 1000),
      });
    }

    setValidated((prev) => ({ ...prev, [q.id]: outcomes }));
    setQuestionCorrect((prev) => ({ ...prev, [q.id]: isQuestionCorrect }));
    setSubmitting(false);
  };

  const next = async () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    // Finish session
    const correctCount = Object.values(questionCorrect).filter(Boolean).length;
    const supabase = createClient();
    await supabase
      .from('qcm_sessions')
      .update({
        finished_at: new Date().toISOString(),
        score_correct: correctCount,
        score_total: total,
      })
      .eq('id', sessionId);
    router.push(`/cours/${coursId}/resultats/${sessionId}`);
  };

  const outcomes = validated[q.id];
  const qOk = questionCorrect[q.id];

  const progressPct = useMemo(() => (index / total) * 100, [index, total]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 lg:px-8 pt-10 pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter
          </Link>
        </Button>
        <div className="flex items-center gap-4 text-sm">
          <div className="inline-flex items-center gap-1.5 text-(--color-ink-soft)">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatDuration(elapsed)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="text-(--color-ink-soft)">
          <span className="font-semibold text-(--color-ink)">{serieKind === 'annale' ? 'Annale' : 'Série'}</span> · {serieLabel}
        </p>
        <p className="text-(--color-ink-soft)">
          Question <span className="font-semibold text-(--color-ink)">{index + 1}</span> / {total}
        </p>
      </div>
      <Progress value={progressPct} className="mb-8" />

      <motion.div
        key={q.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="surface-card-lg mb-6"
      >
        <p className="eyebrow">Énoncé</p>
        <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-(--color-ink) leading-snug text-balance">
          {q.enonce}
        </h2>
        <p className="mt-3 text-sm text-(--color-ink-soft)">
          Coche toutes les propositions vraies, puis valide.
        </p>
      </motion.div>

      <div className="space-y-3">
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

      {isValidated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'mt-6 rounded-(--radius-card) border p-5 md:p-6 flex items-start gap-4',
            qOk
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/20'
              : 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20',
          )}
        >
          {qOk ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">Question juste</p>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  Toutes tes coches correspondent à la correction.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-700 dark:text-amber-300">À retravailler</p>
                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">
                  Au moins un item ne correspond pas à la correction (notation EDN, sans demi-point par item).
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        {!isValidated ? (
          <Button size="lg" onClick={validate} disabled={sel.size === 0 || submitting}>
            Valider
          </Button>
        ) : (
          <Button size="lg" onClick={next}>
            {index < total - 1 ? 'Question suivante' : 'Voir les résultats'}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
