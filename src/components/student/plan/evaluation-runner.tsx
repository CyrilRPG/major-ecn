'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { submitEvaluationAction } from '@/app/(student)/planificateur/actions';
import type { EvalAnswer, EvalQuestion } from '@/lib/plan/assessment';
import { EVALUATION_RESULT_LABEL, type EvaluationResult } from '@/lib/plan/types';
import { cn } from '@/lib/utils';

/**
 * Évaluation courte d'un item (§14) : QCM corrigés automatiquement, questions
 * rédactionnelles auto-corrigées après lecture de la réponse attendue.
 */
export function EvaluationRunner({ evaluationId, itemName, questions }: { evaluationId: string; itemName: string; questions: EvalQuestion[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, EvalAnswer>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ pct: number; result: EvaluationResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const answered = questions.filter((q) => {
    const a = answers[q.id];
    return a && (a.kind === 'qcm' ? a.selected.length > 0 : true);
  }).length;

  if (result) {
    return (
      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-6 text-center">
        <CheckCircle2 className={cn('mx-auto h-8 w-8', result.result === 'maitrise' ? 'text-emerald-600' : result.result === 'consolidation' ? 'text-amber-600' : 'text-(--color-primary)')} />
        <p className="mt-2 text-2xl font-semibold text-(--color-ink)">{result.pct} %</p>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{EVALUATION_RESULT_LABEL[result.result]}</p>
        <p className="mt-3 text-xs text-(--color-ink-muted)">Votre niveau sur « {itemName} » est mis à jour et votre planning recalculé.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button asChild><Link href="/planificateur">Retour à aujourd’hui</Link></Button>
          <Button variant="outline" asChild><Link href="/planificateur/programme">Programme complet</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {questions.map((q, idx) => {
          const a = answers[q.id];
          return (
            <li key={q.id} className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
              <p className="text-xs text-(--color-ink-muted)">Question {idx + 1}/{questions.length} · {q.serie_label}</p>
              <p className="mt-1 whitespace-pre-line text-sm font-medium text-(--color-ink)">{q.enonce}</p>
              {q.format === 'qcm' ? (
                <ul className="mt-3 space-y-1.5">
                  {q.items.map((it) => {
                    const sel = a?.kind === 'qcm' && a.selected.includes(it.lettre);
                    return (
                      <li key={it.lettre}>
                        <button type="button" onClick={() => {
                          const cur = a?.kind === 'qcm' ? a.selected : [];
                          const next = sel ? cur.filter((l) => l !== it.lettre) : [...cur, it.lettre];
                          setAnswers({ ...answers, [q.id]: { kind: 'qcm', selected: next } });
                        }} className={cn('flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm', sel ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) hover:border-(--color-primary)')}>
                          <span className="font-semibold text-(--color-ink)">{it.lettre}.</span><span className="text-(--color-ink)">{it.enonce}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="mt-3 space-y-2">
                  <Textarea rows={3} placeholder="Votre réponse…" value={a?.kind === 'qroc' ? a.text : ''} onChange={(e) => setAnswers({ ...answers, [q.id]: { kind: 'qroc', text: e.target.value, self: a?.kind === 'qroc' ? a.self : 'faux' } })} />
                  {!revealed.has(q.id) ? (
                    <Button size="sm" variant="outline" onClick={() => setRevealed(new Set([...revealed, q.id]))}>Afficher la réponse attendue</Button>
                  ) : (
                    <div className="rounded-lg bg-(--color-surface-soft) p-3 text-sm">
                      <p className="whitespace-pre-line text-(--color-ink)">{q.reponse_attendue ?? q.correction_generale}</p>
                      <p className="mt-2 text-xs text-(--color-ink-muted)">Comparez avec votre réponse puis évaluez-vous honnêtement :</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(['juste', 'partiel', 'faux'] as const).map((s) => (
                          <button key={s} type="button" onClick={() => setAnswers({ ...answers, [q.id]: { kind: 'qroc', text: a?.kind === 'qroc' ? a.text : '', self: s } })}
                            className={cn('rounded-full border px-3 py-1 text-xs', a?.kind === 'qroc' && a.self === s && revealed.has(q.id) ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) text-(--color-ink-soft)')}>
                            {s === 'juste' ? 'Juste' : s === 'partiel' ? 'Partiellement juste' : 'Faux'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-(--color-ink-soft)">{answered}/{questions.length} réponses</span>
        <Button disabled={pending || answered < questions.length} onClick={() => start(async () => {
          setError(null);
          const r = await submitEvaluationAction(evaluationId, answers);
          if (!r.ok) { setError(r.error); return; }
          setResult({ pct: r.pct, result: r.result as EvaluationResult });
          router.refresh();
        })}>{pending && <Loader2 className="animate-spin" />} Valider l’évaluation</Button>
      </div>
    </div>
  );
}
