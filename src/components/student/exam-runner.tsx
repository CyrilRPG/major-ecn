'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Loader2, PencilRuler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, formatDuration } from '@/lib/utils';
import { sanitizeFlashcardHtml } from '@/lib/flashcards/rich-text';
import { startExam, submitExam } from '@/app/(student)/epreuves-blanches/actions';
import { effectiveDeadline } from '@/lib/exams/window';

type Q = {
  id: string; format: 'qcm' | 'qroc'; enonce: string; vignette: string | null;
  images: string[]; points: number; items: { lettre: string; enonce: string }[];
};
type ExamMeta = {
  id: string; title: string; instructions: string; duration_minutes: number | null; question_order: 'fixed' | 'random';
  scheduled?: boolean; closesAt?: string | null; startedAt?: string | null;
};

export function ExamRunner({ exam, questions }: { exam: ExamMeta; questions: Q[] }) {
  const router = useRouter();
  // Reprise : si une copie est déjà en cours (started_at connu), on démarre direct.
  const [phase, setPhase] = useState<'intro' | 'running'>(exam.startedAt ? 'running' : 'intro');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [qroc, setQroc] = useState<Record<string, string>>({});
  const [startedAtMs, setStartedAtMs] = useState<number | null>(exam.startedAt ? new Date(exam.startedAt).getTime() : null);
  const [now, setNow] = useState(() => Date.now());
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ordre (mélangé une fois si demandé)
  const ordered = useMemo(() => {
    if (exam.question_order !== 'random') return questions;
    const arr = [...questions];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [questions, exam.question_order]);

  const total = ordered.length;
  const closesAt = exam.closesAt ? new Date(exam.closesAt) : null;
  const deadline = startedAtMs !== null ? effectiveDeadline(startedAtMs, exam.duration_minutes, closesAt) : null;
  const remaining = deadline ? Math.max(0, Math.floor((deadline.getTime() - now) / 1000)) : null;
  const elapsed = startedAtMs !== null ? Math.max(0, Math.floor((now - startedAtMs) / 1000)) : 0;

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const answers = ordered.map((q) => ({
      question_id: q.id,
      selected_items: Array.from(selected[q.id] ?? []),
      text_answer: qroc[q.id] ?? '',
    }));
    const res = await submitExam({ examId: exam.id, timeSpent: elapsed, answers });
    if (res.ok) router.refresh();
    else { setSubmitting(false); alert(res.error); }
  }, [submitting, ordered, selected, qroc, exam.id, elapsed, router]);

  // Horloge (tick 1s) + auto-remise à échéance
  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'running' || remaining === null) return;
    if (remaining <= 0) doSubmit();
  }, [remaining, phase, doSubmit]);

  const begin = () => {
    setStarting(true);
    startExam({ examId: exam.id }).then((res) => {
      setStarting(false);
      if (res.ok) { setStartedAtMs(new Date(res.startedAt).getTime()); setNow(Date.now()); setPhase('running'); }
      else alert(res.error);
    });
  };

  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-soft)">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)"><PencilRuler className="h-5 w-5" /></span>
        <h1 className="mt-4 font-display text-2xl font-bold text-(--color-ink)">{exam.title}</h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-(--color-ink-soft)">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-sand-100) px-3 py-1.5"><PencilRuler className="h-4 w-4" /> {total} questions</span>
          {exam.duration_minutes && <span className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-sand-100) px-3 py-1.5"><Clock className="h-4 w-4" /> {exam.duration_minutes} min</span>}
        </div>
        {exam.instructions && (
          <div className="mt-4 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4 text-sm leading-relaxed text-(--color-ink)">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">Consignes</p>
            <p className="whitespace-pre-line">{exam.instructions}</p>
          </div>
        )}
        {(exam.duration_minutes || exam.scheduled) && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#E8742C]/30 bg-[#FFF7E6] px-3 py-2 text-xs text-[#B45B00]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Une fois commencée, l’épreuve est chronométrée : le chronomètre ne peut plus être remis à zéro et la copie sera remise automatiquement à la fin du temps imparti{exam.scheduled ? ' (ou à la clôture de la session)' : ''}.
          </p>
        )}
        <Button className="mt-5" onClick={begin} disabled={total === 0 || starting}>{starting ? <Loader2 className="animate-spin" /> : null} Commencer l’épreuve <ArrowRight /></Button>
      </div>
    );
  }

  const q = ordered[index];
  const sel = selected[q.id] ?? new Set<string>();
  const toggle = (lettre: string) => setSelected((prev) => {
    const cur = new Set(prev[q.id] ?? []);
    if (cur.has(lettre)) cur.delete(lettre); else cur.add(lettre);
    return { ...prev, [q.id]: cur };
  });

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-(--color-ink-soft)">{exam.title}</span>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold',
          remaining !== null && remaining <= 60 ? 'bg-(--color-danger)/12 text-(--color-danger)' : remaining !== null && remaining <= 300 ? 'bg-(--color-warning)/15 text-(--color-warning)' : 'text-(--color-ink-soft)')}>
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">{remaining !== null ? formatDuration(remaining) : formatDuration(elapsed)}</span>
        </span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span>{q.format === 'qroc' ? 'QROC' : 'QCM'}</span>
        <span>Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-3" />

      {q.vignette && (
        <details open className="mb-3 rounded-xl border border-l-4 border-(--color-primary)/30 border-l-(--color-primary) bg-(--color-primary-soft)/40 p-3.5">
          <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-primary-deep)">Contexte clinique</summary>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">{q.vignette}</p>
        </details>
      )}

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <h2 className="text-base font-semibold leading-snug text-(--color-ink)" dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(q.enonce) }} />
        {q.images.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {q.images.map((src) => (
              <div key={src} className="relative h-32 w-32 overflow-hidden rounded-lg border border-(--color-border) bg-white"><Image src={src} alt="" fill sizes="128px" className="object-contain p-1.5" unoptimized /></div>
            ))}
          </div>
        )}
      </div>

      {q.format === 'qcm' ? (
        <div className="space-y-2">
          {q.items.map((it) => {
            const active = sel.has(it.lettre);
            return (
              <button key={it.lettre} type="button" onClick={() => toggle(it.lettre)}
                className={cn('flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors', active ? 'border-(--color-primary) bg-(--color-primary-soft)/50' : 'border-(--color-border) hover:bg-(--color-sand-100)/50')}>
                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold', active ? 'bg-(--color-primary) text-white' : 'bg-(--color-sand-100) text-(--color-ink-soft)')}>{it.lettre}</span>
                <span className="text-sm text-(--color-ink)">{it.enonce}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <textarea value={qroc[q.id] ?? ''} onChange={(e) => setQroc((p) => ({ ...p, [q.id]: e.target.value }))} rows={4}
          className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)"
          placeholder="Rédigez votre réponse…" />
      )}

      <div className="mt-4 flex items-center justify-between gap-3 pb-6">
        <Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}><ArrowLeft /> Précédent</Button>
        {index < total - 1 ? (
          <Button onClick={() => setIndex((i) => i + 1)}>Suivant <ArrowRight /></Button>
        ) : (
          <Button onClick={doSubmit} disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : null} Remettre ma copie</Button>
        )}
      </div>
    </div>
  );
}
