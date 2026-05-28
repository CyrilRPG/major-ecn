'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem, type QcmItemView } from './qcm-item';
import { QrocItem, type QrocOutcome } from './qroc-item';
import { gradeQuestion, gradeQroc, type ItemOutcome } from '@/lib/qcm/grade';
import { createClient } from '@/lib/supabase/client';
import { cn, formatDuration } from '@/lib/utils';

type Question = {
  id: string;
  enonce: string;
  order_index: number;
  format?: 'qcm' | 'qroc';
  reponse_attendue?: string | null;
  items: (QcmItemView & { is_correct: boolean })[];
};

export function QcmSession({
  sessionId,
  coursId,
  serieLabel,
  serieKind,
  questions,
  backHref,
  mode = 'live',
  durationMinutes = null,
}: {
  sessionId: string;
  coursId: string;
  serieLabel: string;
  serieKind: 'qcm' | 'annale';
  questions: Question[];
  backHref: string;
  mode?: 'live' | 'training';
  durationMinutes?: number | null;
}) {
  const isTraining = mode === 'training';
  const totalSeconds = durationMinutes ? durationMinutes * 60 : null;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  // QCM state
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [validated, setValidated] = useState<Record<string, ItemOutcome[] | null>>({});
  // QROC state
  const [qrocAnswers, setQrocAnswers] = useState<Record<string, string>>({});
  const [qrocOutcomes, setQrocOutcomes] = useState<Record<string, QrocOutcome>>({});
  // Shared state
  const [questionCorrect, setQuestionCorrect] = useState<Record<string, boolean | null>>({});
  const [elapsed, setElapsed] = useState(0);
  const [perQuestionStart, setPerQuestionStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!totalSeconds) return;
    if (elapsed < totalSeconds) return;
    const finish = async () => {
      const correctCount = Object.values(questionCorrect).filter(Boolean).length;
      const supabase = createClient();
      await supabase
        .from('qcm_sessions')
        .update({ finished_at: new Date().toISOString(), score_correct: correctCount, score_total: total })
        .eq('id', sessionId);
      router.push(`/cours/${coursId}/resultats/${sessionId}`);
    };
    finish();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, totalSeconds]);

  useEffect(() => setPerQuestionStart(Date.now()), [index]);

  const total = questions.length;
  const q = questions[index];
  const isQroc = q.format === 'qroc';
  const sel = selected[q.id] ?? new Set<string>();
  const isValidated = isQroc ? qrocOutcomes[q.id] != null : validated[q.id] != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSelected((prev) => {
      const cur = new Set(prev[q.id] ?? []);
      if (cur.has(lettre)) cur.delete(lettre); else cur.add(lettre);
      return { ...prev, [q.id]: cur };
    });
  };

  const canValidate = isQroc
    ? (qrocAnswers[q.id] ?? '').trim().length > 0
    : sel.size > 0;

  const validate = async () => {
    if (isValidated || !canValidate || submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const timeSpent = Math.round((Date.now() - perQuestionStart) / 1000);

    if (isQroc) {
      // ─── QROC grading ───
      const userAnswer = (qrocAnswers[q.id] ?? '').trim();
      const isCorrect = q.reponse_attendue ? gradeQroc(userAnswer, q.reponse_attendue) : false;

      setQrocOutcomes((prev) => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'wrong' }));
      setQuestionCorrect((prev) => ({ ...prev, [q.id]: isCorrect }));

      if (user) {
        // text_answer column added via migration, not in generated types
        await supabase.from('qcm_attempts').insert({
          user_id: user.id,
          session_id: sessionId,
          question_id: q.id,
          selected_items: [],
          is_correct: isCorrect,
          time_spent_seconds: timeSpent,
          text_answer: userAnswer,
        } as any);
      }
    } else {
      // ─── QCM grading ───
      const gradeInput = q.items.map((it) => ({
        lettre: it.lettre,
        is_correct: it.is_correct,
        selected: sel.has(it.lettre),
      }));
      const { perItem, isQuestionCorrect } = gradeQuestion(gradeInput);
      const outcomes: ItemOutcome[] = q.items.map((it) => perItem[it.lettre]);

      setValidated((prev) => ({ ...prev, [q.id]: outcomes }));
      setQuestionCorrect((prev) => ({ ...prev, [q.id]: isQuestionCorrect }));

      if (user) {
        await supabase.from('qcm_attempts').insert({
          user_id: user.id,
          session_id: sessionId,
          question_id: q.id,
          selected_items: Array.from(sel),
          is_correct: isQuestionCorrect,
          time_spent_seconds: timeSpent,
        });
      }
    }

    setSubmitting(false);
  };

  const next = async () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    const correctCount = Object.values(questionCorrect).filter(Boolean).length;
    const supabase = createClient();
    await supabase
      .from('qcm_sessions')
      .update({ finished_at: new Date().toISOString(), score_correct: correctCount, score_total: total })
      .eq('id', sessionId);
    router.push(`/cours/${coursId}/resultats/${sessionId}`);
  };

  const outcomes = validated[q.id];
  const qrocOutcome = qrocOutcomes[q.id] ?? null;
  const qOk = questionCorrect[q.id];

  const progressPct = useMemo(() => (index / total) * 100, [index, total]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Quitter
          </Link>
        </Button>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-xs',
            totalSeconds && totalSeconds - elapsed <= 60
              ? 'rounded-full bg-(--color-danger)/12 px-2 py-1 font-semibold text-(--color-danger)'
              : totalSeconds && totalSeconds - elapsed <= 300
              ? 'rounded-full bg-(--color-warning)/15 px-2 py-1 font-semibold text-(--color-warning)'
              : 'text-(--color-ink-soft)',
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">
            {totalSeconds ? formatDuration(Math.max(0, totalSeconds - elapsed)) : formatDuration(elapsed)}
          </span>
          {totalSeconds && <span className="text-(--color-ink-muted)">/ {durationMinutes} min</span>}
        </div>
      </div>

      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span className="truncate">
          <span className="font-semibold text-(--color-ink)">{serieKind === 'annale' ? 'Annale' : 'Série'}</span> · {serieLabel}
        </span>
        <span className="shrink-0">
          Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}
        </span>
      </div>
      <Progress value={progressPct} className="mb-3" />

      <motion.div
        key={q.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">
          {isQroc ? 'QROC — Réponse courte' : 'Énoncé'}
        </p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty whitespace-pre-line">
          {q.enonce}
        </h2>
      </motion.div>

      {/* ─── QCM items ─── */}
      {!isQroc && (
        <div className="space-y-2">
          {q.items.map((it, i) => (
            <QcmItem
              key={it.id}
              item={it}
              selected={sel.has(it.lettre)}
              outcome={isTraining ? null : outcomes?.[i] ?? null}
              disabled={isValidated}
              isCorrect={it.is_correct}
              onToggle={() => toggle(it.lettre)}
            />
          ))}
        </div>
      )}

      {/* ─── QROC input ─── */}
      {isQroc && (
        <QrocItem
          value={qrocAnswers[q.id] ?? ''}
          onChange={(v) => setQrocAnswers((prev) => ({ ...prev, [q.id]: v }))}
          outcome={isTraining ? null : qrocOutcome}
          reponseAttendue={q.reponse_attendue ?? null}
          disabled={isValidated}
        />
      )}

      {/* ─── Feedback ─── */}
      {isValidated && !isTraining && (
        <div
          className={cn(
            'mt-3 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm',
            qOk
              ? 'border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
              : 'border-(--color-danger)/40 bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))] text-(--color-danger)',
          )}
        >
          {qOk ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span className="font-medium">
            {qOk
              ? (isQroc ? 'Bonne réponse !' : 'Question juste — toutes les coches correspondent.')
              : (isQroc ? 'Réponse incorrecte — consultez la correction ci-dessus.' : 'À retravailler — au moins un item ne correspond pas (notation EVC).')}
          </span>
        </div>
      )}
      {isValidated && isTraining && (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3.5 py-2.5 text-sm text-(--color-ink-soft)">
          <Clock className="h-4 w-4 shrink-0 text-(--color-primary)" />
          <span className="font-medium">Réponse enregistrée. Vous verrez le corrigé à la fin de l'épreuve.</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-3 pb-2">
        {!isValidated ? (
          <Button onClick={validate} disabled={!canValidate || submitting}>
            Valider
          </Button>
        ) : (
          <Button onClick={next}>
            {index < total - 1 ? 'Question suivante' : 'Voir les résultats'}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
