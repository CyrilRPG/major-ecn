'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Eye, Pencil, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem, type QcmItemView } from './qcm-item';
import { QrocItem, type QrocOutcome } from './qroc-item';
import { gradeQuestion, gradeQroc, type ItemOutcome } from '@/lib/qcm/grade';
import { sanitizeFlashcardHtml, sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { createClient } from '@/lib/supabase/client';
import { cn, formatDuration } from '@/lib/utils';
import { QcmQuestionEditor, type QcmQuestionDraft } from '@/components/admin/content/qcm-question-editor';
import { VignetteEditorDialog } from '@/components/admin/content/vignette-editor-dialog';

type Question = {
  id: string;
  enonce: string;
  order_index: number;
  format?: 'qcm' | 'qroc';
  reponse_attendue?: string | null;
  correction_generale?: string | null;
  images?: string[] | null;
  items: (QcmItemView & { is_correct: boolean })[];
};

export function QcmSession({
  sessionId,
  coursId,
  serieId,
  serieLabel,
  serieKind,
  vignette = null,
  questions,
  backHref,
  mode = 'live',
  durationMinutes = null,
  editable = false,
  savedQuestionIds = [],
  initialIndex = 0,
}: {
  sessionId: string;
  coursId: string;
  serieId?: string;
  serieLabel: string;
  serieKind: 'qcm' | 'annale' | 'seance';
  /** IDs des questions déjà enregistrées dans « Questions à revoir » par l'élève. */
  savedQuestionIds?: string[];
  /** Index de la question à afficher en premier (deep-link « Questions à revoir »). */
  initialIndex?: number;
  /** Vignette clinique commune à toutes les questions (DP / annale).
   *  Affichée dans un encadré séparé au-dessus de chaque question. */
  vignette?: string | null;
  questions: Question[];
  backHref: string;
  mode?: 'live' | 'training';
  durationMinutes?: number | null;
  /** Mode édition prof : affiche un bouton crayon sur chaque question
   *  pour ouvrir l'éditeur de question depuis la vue étudiant. */
  editable?: boolean;
}) {
  const [editingQ, setEditingQ] = useState<QcmQuestionDraft | null>(null);
  const [editingVignette, setEditingVignette] = useState(false);
  const isTraining = mode === 'training';
  const isSeance = serieKind === 'seance';
  const totalSeconds = durationMinutes ? durationMinutes * 60 : null;
  const router = useRouter();
  const [index, setIndex] = useState(() =>
    Number.isFinite(initialIndex) ? Math.min(Math.max(0, initialIndex), Math.max(0, questions.length - 1)) : 0,
  );
  // QCM state
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [validated, setValidated] = useState<Record<string, ItemOutcome[] | null>>({});
  // QROC state
  const [qrocAnswers, setQrocAnswers] = useState<Record<string, string>>({});
  const [qrocOutcomes, setQrocOutcomes] = useState<Record<string, QrocOutcome>>({});
  // Séance QROC: reveal + self-grade
  const [seanceRevealed, setSeanceRevealed] = useState<Record<string, boolean>>({});
  const [seanceSelfGrade, setSeanceSelfGrade] = useState<Record<string, 'bon' | 'faux'>>({});
  // Shared state
  const [questionCorrect, setQuestionCorrect] = useState<Record<string, boolean | null>>({});
  const [elapsed, setElapsed] = useState(0);
  const [perQuestionStart, setPerQuestionStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  // « Questions à revoir » : ensemble des question_id enregistrés par l'élève.
  const [saved, setSaved] = useState<Set<string>>(() => new Set(savedQuestionIds));
  const [savingStar, setSavingStar] = useState(false);
  // Ref to scroll bottom buttons into view after QROC reveal on mobile
  const bottomActionsRef = useRef<HTMLDivElement>(null);

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
  // Tous les QROC (séance ET séries de cours) fonctionnent en « révéler la
  // réponse puis auto-évaluation Bon/Faux par l'élève » — pas de correction
  // automatique. On garde la notation auto uniquement pour les épreuves
  // chronométrées (annales, mode training) où le corrigé n'apparaît qu'à la fin.
  const isSeanceQroc = isQroc && !isTraining;
  const sel = selected[q.id] ?? new Set<string>();
  const isValidated = isSeanceQroc
    ? seanceSelfGrade[q.id] != null
    : isQroc ? qrocOutcomes[q.id] != null : validated[q.id] != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSelected((prev) => {
      const cur = new Set(prev[q.id] ?? []);
      if (cur.has(lettre)) cur.delete(lettre); else cur.add(lettre);
      return { ...prev, [q.id]: cur };
    });
  };

  const canValidate = isSeanceQroc
    ? true
    : isQroc
    ? (qrocAnswers[q.id] ?? '').trim().length > 0
    : sel.size > 0;

  // Ajoute / retire la question courante des « Questions à revoir » (toggle).
  const toggleSaved = async () => {
    if (savingStar) return;
    const questionId = q.id;
    const wasSaved = saved.has(questionId);
    // Optimiste
    setSaved((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(questionId); else next.add(questionId);
      return next;
    });
    setSavingStar(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (wasSaved) {
        await supabase
          .from('student_saved_questions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId);
      } else {
        await supabase
          .from('student_saved_questions')
          .upsert({
            user_id: user.id,
            question_id: questionId,
            serie_id: serieId ?? null,
            cours_id: coursId,
          }, { onConflict: 'user_id,question_id' });
      }
    } catch {
      // rollback en cas d'échec réseau
      setSaved((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(questionId); else next.delete(questionId);
        return next;
      });
    } finally {
      setSavingStar(false);
    }
  };

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

  const revealSeanceAnswer = () => {
    setSeanceRevealed((prev) => ({ ...prev, [q.id]: true }));
    // After the correction content expands (framer-motion ~250ms), scroll the
    // action buttons into view so mobile users can reach Bon/Faux.
    setTimeout(() => {
      bottomActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 320);
  };

  const selfGradeSeance = async (grade: 'bon' | 'faux') => {
    if (submitting) return;
    setSubmitting(true);
    const isCorrect = grade === 'bon';
    setSeanceSelfGrade((prev) => ({ ...prev, [q.id]: grade }));
    setQuestionCorrect((prev) => ({ ...prev, [q.id]: isCorrect }));

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const timeSpent = Math.round((Date.now() - perQuestionStart) / 1000);
    if (user) {
      await supabase.from('qcm_attempts').insert({
        user_id: user.id,
        session_id: sessionId,
        question_id: q.id,
        selected_items: [],
        is_correct: isCorrect,
        time_spent_seconds: timeSpent,
        text_answer: (qrocAnswers[q.id] ?? '').trim(),
      } as any);
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
  const isRevealed = seanceRevealed[q.id] ?? false;
  const selfGrade = seanceSelfGrade[q.id] ?? null;

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
          <span className="font-semibold text-(--color-ink)">{serieKind === 'seance' ? 'Séance du prof' : serieKind === 'annale' ? 'Annale' : 'Série'}</span> · {serieLabel}
        </span>
        <span className="shrink-0">
          Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}
        </span>
      </div>
      <Progress value={progressPct} className="mb-3" />

      {/* Vignette clinique commune à toutes les questions (DP / annale) —
          <details> natif ouvert par défaut : visible sur tous les écrans
          (y compris mobile), repliable après lecture pour gagner de la
          place quand l'élève enchaîne les questions du DP. */}
      {(vignette || (editable && serieId)) && (
        <details
          open
          className={cn(
            "group mb-3 block rounded-xl border border-l-4 p-3.5 shadow-sm",
            isSeance
              ? "border-[#7C3AED]/30 border-l-[#7C3AED] bg-[#F3EAFF]/40 open:bg-[#F3EAFF]/30"
              : "border-(--color-primary)/30 border-l-(--color-primary) bg-(--color-primary-soft)/40 open:bg-(--color-primary-soft)/30"
          )}
        >
          <summary className="flex cursor-pointer items-center justify-between gap-2 list-none [&::-webkit-details-marker]:hidden">
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.16em]",
              isSeance ? "text-[#5B21B6]" : "text-(--color-primary-deep)"
            )}>
              {vignette ? 'Contexte clinique du dossier' : 'Pas de contexte clinique'}
            </span>
            <span className="flex items-center gap-2">
              {editable && serieId && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setEditingVignette(true); }}
                  className="inline-flex items-center gap-1 rounded-md border border-(--color-border) bg-white px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)"
                  title="Modifier le contexte clinique (mode prof)"
                >
                  <Pencil className="h-3 w-3" /> Éditer
                </button>
              )}
              {vignette && (
                <span className="text-[11px] font-medium text-(--color-primary-deep) underline-offset-2 group-open:no-underline group-[:not([open])]:underline">
                  <span className="group-open:hidden">Afficher</span>
                  <span className="hidden group-open:inline">Réduire</span>
                </span>
              )}
            </span>
          </summary>
          {vignette && (
            <div
              className="mt-2 break-words text-sm leading-relaxed text-(--color-ink) [&_strong]:font-semibold [&_strong]:text-(--color-ink)"
              dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(vignette) }}
            />
          )}
        </details>
      )}

      <motion.div
        key={q.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)"
      >
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            isSeance ? "text-[#7C3AED]" : "text-(--color-accent-deep)"
          )}>
            {isQroc
              ? `${isSeance ? 'QROC Séance' : 'QROC'} — Question ${index + 1}`
              : vignette
                ? `Question ${index + 1}`
                : 'Énoncé'}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSaved}
            disabled={savingStar}
            aria-pressed={saved.has(q.id)}
            title={saved.has(q.id) ? 'Retirer des questions à revoir' : 'Ajouter aux questions à revoir'}
            className={cn(
              'inline-flex items-center justify-center rounded-md border p-1.5 transition-colors',
              saved.has(q.id)
                ? 'border-[#E0A400] bg-[#FFF7E0] text-[#B47E00]'
                : 'border-(--color-border) bg-white text-(--color-ink-soft) hover:border-[#E0A400] hover:text-[#B47E00]'
            )}
          >
            <Star className={cn('h-4 w-4', saved.has(q.id) && 'fill-current')} />
          </button>
          {editable && (
            <button
              type="button"
              onClick={() => setEditingQ({
                id: q.id,
                format: q.format ?? 'qcm',
                enonce: q.enonce,
                reponse_attendue: q.reponse_attendue ?? '',
                correction_generale: q.correction_generale ?? '',
                images: q.images ?? [],
                items: q.items.map((it) => ({
                  lettre: it.lettre as 'A'|'B'|'C'|'D'|'E',
                  enonce: it.enonce,
                  is_correct: it.is_correct,
                  justification: it.justification ?? '',
                  images: it.images ?? [],
                })),
              })}
              title="Modifier cette question (mode prof)"
              className="inline-flex items-center gap-1 rounded-md border border-(--color-border) bg-white px-2 py-1 text-[11px] font-semibold text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)"
            >
              <Pencil className="h-3 w-3" /> Éditer
            </button>
          )}
          </div>
        </div>
        <h2
          className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty whitespace-pre-line [&_img]:my-2 [&_img]:max-h-56 [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.enonce) }}
        />
        {(q.images?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {q.images!.map((src) => (
              <div key={src} className="relative h-32 w-32 overflow-hidden rounded-lg border border-(--color-border) bg-white sm:h-40 sm:w-40">
                <Image src={src} alt="" fill sizes="160px" className="object-contain p-1.5" unoptimized />
              </div>
            ))}
          </div>
        )}
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

      {/* ─── QROC input (séance = reveal + self-grade) ─── */}
      {isSeanceQroc ? (
        <div className="space-y-3">
          <div className={cn(
            'rounded-xl border px-3.5 py-3 transition',
            isRevealed ? 'border-[#7C3AED]/30 bg-[#F3EAFF]/50' : 'border-(--color-border) bg-(--color-surface)',
          )}>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
              Votre réponse (optionnel)
            </label>
            <textarea
              value={qrocAnswers[q.id] ?? ''}
              onChange={(e) => setQrocAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              disabled={isRevealed}
              placeholder="Rédigez votre réponse avant de révéler la correction…"
              rows={3}
              className="w-full resize-none bg-transparent text-sm leading-snug text-(--color-ink) placeholder:text-(--color-ink-muted)/50 focus:outline-none disabled:cursor-default"
            />
          </div>

          {isRevealed && (q.correction_generale || q.reponse_attendue) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border-2 border-[#7C3AED]/40 bg-[#F3EAFF] p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5B21B6]">
                {isSeance ? 'Correction du professeur' : 'Réponse et correction'}
              </p>
              {!isSeance && q.reponse_attendue && (
                <p className="mt-2 text-sm leading-relaxed text-(--color-ink)">
                  <span className="font-semibold">Réponse attendue : </span>
                  {q.reponse_attendue.split('|').map((a) => a.trim()).join(' ou ')}
                </p>
              )}
              {(q.correction_generale || (isSeance && q.reponse_attendue)) && (
                <div
                  className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-(--color-ink) [&_img]:my-2 [&_img]:max-h-56 [&_img]:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.correction_generale || q.reponse_attendue || '') }}
                />
              )}
            </motion.div>
          )}

          {isRevealed && selfGrade && (
            <div className={cn(
              'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium',
              selfGrade === 'bon'
                ? 'border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
                : 'border-(--color-danger)/40 bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))] text-(--color-danger)',
            )}>
              {selfGrade === 'bon' ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
              {selfGrade === 'bon' ? 'Marqué comme bon' : 'Marqué comme faux'}
            </div>
          )}
        </div>
      ) : isQroc ? (
        <QrocItem
          value={qrocAnswers[q.id] ?? ''}
          onChange={(v) => setQrocAnswers((prev) => ({ ...prev, [q.id]: v }))}
          outcome={isTraining ? null : qrocOutcome}
          reponseAttendue={q.reponse_attendue ?? null}
          disabled={isValidated}
        />
      ) : null}

      {/* ─── Feedback ─── */}
      {isValidated && !isTraining && !isSeanceQroc && (
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

      {/* Corrigé général de la question — visible après validation, mode 'live'. */}
      {isValidated && !isTraining && !isSeanceQroc && q.correction_generale && (
        <div className="mt-3 rounded-xl border border-(--color-border) bg-(--color-primary-soft)/40 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-primary-deep)">
            Corrigé général
          </p>
          <div
            className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-(--color-ink) [&_img]:my-2 [&_img]:max-h-56 [&_img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.correction_generale) }}
          />
        </div>
      )}

      <div ref={bottomActionsRef} className="mt-4 flex items-center justify-end gap-3 pb-6">
        {isSeanceQroc ? (
          !isRevealed ? (
            <Button onClick={revealSeanceAnswer} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
              <Eye className="h-4 w-4" />
              Révéler la réponse
            </Button>
          ) : !selfGrade ? (
            <>
              <Button onClick={() => selfGradeSeance('faux')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={submitting}>
                <ThumbsDown className="h-4 w-4" />
                Faux
              </Button>
              <Button onClick={() => selfGradeSeance('bon')} className="bg-[#2E8B57] hover:bg-[#256B45]" disabled={submitting}>
                <ThumbsUp className="h-4 w-4" />
                Bon
              </Button>
            </>
          ) : (
            <Button onClick={next}>
              {index < total - 1 ? 'Question suivante' : 'Voir les résultats'}
              <ArrowRight />
            </Button>
          )
        ) : !isValidated ? (
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

      {/* Dialog d'édition prof (vue étudiant → édition directe) */}
      {editable && serieId && (
        <>
          <QcmQuestionEditor
            open={!!editingQ}
            onOpenChange={(v) => { if (!v) setEditingQ(null); }}
            coursId={coursId}
            serieId={serieId}
            initial={editingQ}
          />
          <VignetteEditorDialog
            open={editingVignette}
            onOpenChange={setEditingVignette}
            coursId={coursId}
            serieId={serieId}
            initial={vignette}
            onSaved={() => router.refresh()}
          />
        </>
      )}
    </div>
  );
}
