'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RichText } from './rich-text';
import { createClient } from '@/lib/supabase/client';
import { getVerifiedUser } from '@/lib/auth/verified-user';

type TextQuestion = {
  id: string;
  enonce: string;
  order_index: number;
};

export function TextAnnaleViewer({
  serieLabel,
  vignette,
  questions,
  backHref,
  isDP,
}: {
  serieLabel: string;
  vignette: string | null;
  questions: TextQuestion[];
  backHref: string;
  isDP: boolean;
}) {
  const [expandedVignette, setExpandedVignette] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;
  const allAnswered = answeredCount === questions.length;

  const verify = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Persiste les brouillons dans qcm_attempts.text_answer (sans is_correct,
      // qui sera défini ultérieurement quand la correction sera ajoutée).
      const supabase = createClient();
      const user = await getVerifiedUser(supabase);
      if (user) {
        await Promise.all(
          questions.map((q) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase as any).from('qcm_attempts').insert({
              user_id: user.id,
              session_id: null,
              question_id: q.id,
              selected_items: [],
              is_correct: false, // correction manuelle à venir
              time_spent_seconds: 0,
              text_answer: answers[q.id]?.trim() ?? '',
            }),
          ),
        );
      }
    } catch {
      /* best-effort */
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      // Remonte en haut pour voir le bandeau de confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft />
            Retour aux annales
          </Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary-soft) px-3 py-1 text-xs font-semibold text-(--color-primary)">
          {isDP ? <Stethoscope className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
          {isDP ? 'Dossier progressif' : 'Connaissances fondamentales'}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-(--color-ink-soft)">
        <span>
          <span className="font-semibold text-(--color-ink)">Annale</span> · {serieLabel}
        </span>
        {!submitted && (
          <span className="rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 font-semibold tabular-nums text-(--color-ink)">
            {answeredCount}/{questions.length} répondues
          </span>
        )}
      </div>

      {submitted && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_10%,var(--color-surface))] px-4 py-3 text-sm text-[#1F6B43]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Réponses enregistrées ({answeredCount}/{questions.length})</p>
            <p className="mt-0.5 text-xs">
              La correction détaillée sera disponible prochainement. En attendant, consultez vos cours
              pour confirmer vos réponses.
            </p>
          </div>
        </div>
      )}

      {isDP && vignette && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 overflow-hidden rounded-xl border border-(--color-primary)/25 bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-surface))] shadow-(--shadow-soft)"
        >
          <button
            type="button"
            onClick={() => setExpandedVignette((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-primary)/12 text-(--color-primary)">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-primary-deep)">
                Vignette clinique
              </p>
              <p className="mt-0.5 text-xs text-(--color-ink-soft)">
                {expandedVignette ? 'Cliquez pour réduire' : 'Cliquez pour développer le cas clinique'}
              </p>
            </div>
            {expandedVignette ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
            )}
          </button>

          {expandedVignette && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden border-t border-(--color-primary)/15 px-4 pb-4 pt-3"
            >
              <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
                {vignette}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-accent-deep)/10 text-xs font-bold text-(--color-accent-deep)">
                {q.order_index + 1}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
                Question {q.order_index + 1}
              </span>
            </div>
            <div className="mb-3 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
              <RichText html={q.enonce} />
            </div>
            <label htmlFor={`answer-${q.id}`} className="block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
              Votre réponse
            </label>
            <textarea
              id={`answer-${q.id}`}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              disabled={submitted}
              rows={4}
              placeholder="Rédigez ici votre réponse…"
              className="mt-1 w-full resize-y rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm leading-relaxed text-(--color-ink) outline-none transition-colors focus:border-(--color-primary) disabled:bg-(--color-surface-soft) disabled:opacity-80"
            />
          </motion.div>
        ))}
      </div>

      <div className="sticky bottom-3 mt-6 flex items-center justify-end gap-3 rounded-xl border border-(--color-border) bg-(--color-surface)/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-(--color-surface)/85">
        <span className="hidden text-xs text-(--color-ink-soft) sm:inline">
          {submitted
            ? 'Réponses enregistrées.'
            : `${answeredCount}/${questions.length} répondues${allAnswered ? ' — prêt à vérifier' : ''}`}
        </span>
        <Button onClick={verify} disabled={submitted || submitting || answeredCount === 0}>
          <CheckCircle2 />
          {submitted ? 'Envoyées' : submitting ? 'Enregistrement…' : 'Vérifier'}
        </Button>
      </div>
    </div>
  );
}
