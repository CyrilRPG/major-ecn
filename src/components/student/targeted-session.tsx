'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, RotateCcw, Target, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom, ZoomableImage } from '@/components/qcm/image-zoom';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { createClient } from '@/lib/supabase/client';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { cn } from '@/lib/utils';

export type TQuestion = {
  id: string;
  enonce: string;
  college: string;
  images?: string[] | null;
  vignette?: string | null;
  items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean; images?: string[] | null }[];
  /** QROC (voie externe) : saisie libre + révéler + auto-évaluation. */
  format?: 'qcm' | 'qroc';
  reponse_attendue?: string | null;
  correction_generale?: string | null;
  commentaire_enseignant?: string | null;
};

export function TargetedSession({ questions, backHref }: { questions: TQuestion[]; backHref: string }) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<ItemOutcome[] | null>(null);
  const [qrocText, setQrocText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [selfGrade, setSelfGrade] = useState<'bon' | 'faux' | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = questions.length;
  const q = questions[index];
  const isQroc = !!q && q.format === 'qroc';

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
          <Button onClick={() => { setIndex(0); setSel(new Set()); setOutcomes(null); setQrocText(''); setRevealed(false); setSelfGrade(null); setScore(0); setDone(false); }}>
            <RotateCcw /> Recommencer
          </Button>
        </div>
      </div>
    );
  }

  const isValidated = isQroc ? selfGrade != null : outcomes != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(lettre)) n.delete(lettre); else n.add(lettre);
      return n;
    });
  };

  const selfEvalQroc = async (grade: 'bon' | 'faux') => {
    if (isValidated || submitting) return;
    setSubmitting(true);
    const isCorrect = grade === 'bon';
    try {
      const supabase = createClient();
      const user = await getVerifiedUser(supabase);
      if (user) {
        await supabase.from('qcm_attempts').insert({
          user_id: user.id,
          question_id: q.id,
          selected_items: [],
          is_correct: isCorrect,
          time_spent_seconds: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          text_answer: qrocText.trim(),
        } as any);
      }
    } catch { /* practice mode — ignore persistence errors */ }
    if (isCorrect) setScore((s) => s + 1);
    setSelfGrade(grade);
    setSubmitting(false);
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
      const user = await getVerifiedUser(supabase);
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
      setQrocText(''); setRevealed(false); setSelfGrade(null);
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

      {q.vignette && (
        <details open className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) shadow-(--shadow-soft)">
          <summary className="cursor-pointer px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-(--color-ink-muted) select-none">
            Contexte clinique du dossier
          </summary>
          <RichTextZoom>
            <div
              className="break-words px-3.5 pb-3 text-sm leading-relaxed text-(--color-ink) [&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(q.vignette) }}
            />
          </RichTextZoom>
        </details>
      )}

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">
          {isQroc ? 'QROC' : 'Énoncé'}
        </p>
        <RichTextZoom>
          <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty whitespace-pre-line [&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded-lg">
            <RichText html={q.enonce} />
          </h2>
        </RichTextZoom>
        {(q.images?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {q.images!.map((src) => (
              <ZoomableImage key={src} src={src} className="h-48 w-48 sm:h-64 sm:w-64" sizes="256px" />
            ))}
          </div>
        )}
      </div>

      {isQroc ? (
        <div className="space-y-3">
          <div className={cn(
            'rounded-xl border px-3.5 py-3 transition',
            revealed ? 'border-[#00695C]/30 bg-[#E0F2F1]/40' : 'border-(--color-border) bg-(--color-surface)',
          )}>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">Votre réponse</label>
            <textarea
              value={qrocText}
              onChange={(e) => setQrocText(e.target.value)}
              disabled={revealed}
              placeholder="Rédigez votre réponse avant de révéler la correction…"
              rows={3}
              className="w-full resize-none bg-transparent text-sm leading-snug text-(--color-ink) placeholder:text-(--color-ink-muted)/50 focus:outline-none disabled:cursor-default"
            />
          </div>
          {revealed && (q.reponse_attendue || q.correction_generale || q.commentaire_enseignant) && (
            <div className="rounded-xl border-2 border-[#00695C]/40 bg-[#E0F2F1]/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00695C]">Réponse et correction</p>
              {q.reponse_attendue && (
                <p className="mt-2 text-sm leading-relaxed text-(--color-ink)">
                  <span className="font-semibold">Réponse attendue : </span>
                  {q.reponse_attendue.split('|').map((a) => a.trim()).join(' ou ')}
                </p>
              )}
              {q.correction_generale && (
                <div className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)"><RichText html={q.correction_generale} /></div>
              )}
              {q.commentaire_enseignant && (
                <div className="mt-3 border-t border-[#00695C]/25 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00695C]">Commentaire de l’enseignant</p>
                  <div className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)"><RichText html={q.commentaire_enseignant} /></div>
                </div>
              )}
            </div>
          )}
          {selfGrade && (
            <div className={cn(
              'flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium',
              selfGrade === 'bon'
                ? 'border-[#2E8B57]/40 bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))] text-[#1F6B43]'
                : 'border-(--color-danger)/40 bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))] text-(--color-danger)',
            )}>
              {selfGrade === 'bon' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {selfGrade === 'bon' ? 'Marqué comme bon' : 'Marqué comme faux'}
            </div>
          )}
        </div>
      ) : (
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
      )}

      <div className="mt-4 flex items-center justify-end gap-3 pb-2">
        {isQroc ? (
          !revealed ? (
            <Button onClick={() => setRevealed(true)} className="bg-[#00695C] hover:bg-[#004D40]">
              <Eye className="h-4 w-4" /> Révéler la réponse
            </Button>
          ) : !selfGrade ? (
            <>
              <Button onClick={() => selfEvalQroc('faux')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" disabled={submitting}>
                <XCircle className="h-4 w-4" /> Faux
              </Button>
              <Button onClick={() => selfEvalQroc('bon')} className="bg-[#2E8B57] hover:bg-[#256B45]" disabled={submitting}>
                <CheckCircle2 className="h-4 w-4" /> Bon
              </Button>
            </>
          ) : (
            <Button onClick={next}>
              {index < total - 1 ? 'Question suivante' : 'Terminer'}
              <ArrowRight />
            </Button>
          )
        ) : !isValidated ? (
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
