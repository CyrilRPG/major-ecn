'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Eye, Loader2, MinusCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom, ZoomableImage } from '@/components/qcm/image-zoom';
import { VariantesAcceptees } from '@/components/qcm/variantes-acceptees';
import { reponseModele } from '@/lib/qcm/grade';
import { answerTargetedAction, finishTargetedAction } from '@/app/(student)/revisions-transversales/ciblee/actions';
import type { TargetedQuestion, TargetedCorrection } from '@/lib/moteur/server/targeted';
import { STATUS_LABEL, type MasteryStatus } from '@/lib/moteur/types';
import { cn } from '@/lib/utils';

const RESULT_UI = {
  positive: { label: 'Correct', Icon: CheckCircle2, cls: 'text-green-700 dark:text-green-300' },
  partial: { label: 'Partiel', Icon: MinusCircle, cls: 'text-amber-700 dark:text-amber-300' },
  incorrect: { label: 'À revoir', Icon: XCircle, cls: 'text-red-700 dark:text-red-300' },
} as const;

/**
 * Révision ciblée : une question à la fois, correction immédiate APRÈS
 * validation (révision évaluative, formative). Chaque réponse alimente l'état
 * de l'item ; la fin de la révision ferme les besoins satisfaits.
 */
export function TargetedRunner({ token, questions }: { token: string; questions: TargetedQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState<TargetedCorrection | null>(null);
  const [qrocRevealed, setQrocRevealed] = useState<TargetedCorrection | null>(null);
  const [results, setResults] = useState<Record<string, TargetedCorrection['result']>>({});
  const [summary, setSummary] = useState<{ itemId: string; name: string; status: string; reason: string | null }[] | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const q = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;

  const submit = (extra: { selfGrade?: 'correct' | 'partial' | 'incorrect' } = {}) => start(async () => {
    setError(null);
    const r = await answerTargetedAction(token, q.id, q.format === 'qroc' ? { text, ...extra } : { selected });
    if (!r.ok) { setError(r.error); return; }
    if (q.format === 'qroc' && !extra.selfGrade) { setQrocRevealed(r.correction); return; }
    setCorrection(r.correction);
    setResults((cur) => ({ ...cur, [q.id]: r.correction.result }));
  });

  const next = () => {
    if (isLast) {
      start(async () => {
        const r = await finishTargetedAction(token);
        if (!r.ok) { setError(r.error); return; }
        setSummary(r.items);
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setText('');
    setCorrection(null);
    setQrocRevealed(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (summary) {
    const counts = Object.values(results).reduce((m, r) => ({ ...m, [r]: (m[r] ?? 0) + 1 }), {} as Record<string, number>);
    return (
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) sm:p-6">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <h2 className="mt-3 text-xl font-bold text-(--color-ink)">Révision terminée</h2>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{counts.positive ?? 0} correcte{(counts.positive ?? 0) > 1 ? 's' : ''} · {counts.partial ?? 0} partielle{(counts.partial ?? 0) > 1 ? 's' : ''} · {counts.incorrect ?? 0} à revoir. Votre profil et votre programme sont mis à jour.</p>
        <ul className="mt-4 space-y-2">
          {summary.map((s) => (
            <li key={s.itemId} className="rounded-xl border border-(--color-border) px-3 py-2.5 text-sm">
              <p className="flex flex-wrap items-center justify-between gap-2"><Link href={`/mes-priorites/${s.itemId}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{s.name}</Link><span className="rounded-full bg-(--color-surface-soft) px-2.5 py-0.5 text-xs font-semibold text-(--color-ink)">{STATUS_LABEL[s.status as MasteryStatus] ?? s.status}</span></p>
              {s.reason && <p className="mt-0.5 text-xs text-(--color-ink-muted)">{s.reason}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild><Link href="/accueil">Retour à mon programme du jour</Link></Button>
          <Button asChild variant="outline"><Link href="/mes-priorites">Mes priorités</Link></Button>
        </div>
      </section>
    );
  }

  const revealed = !!correction;
  const truth = new Map((correction?.items ?? []).map((i) => [i.lettre, i]));
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-(--color-ink)">Question {index + 1} / {total}</span>
        <span className="truncate pl-3 text-xs text-(--color-ink-muted)">{q.itemName}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-(--color-border)" aria-hidden><div className="h-full bg-(--color-primary)" style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }} /></div>
      {q.dossier && q.vignette && (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-primary)">Dossier · question {q.dossier.position} / {q.dossier.total}</p>
          <RichTextZoom><div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)"><RichText html={q.vignette} /></div></RichTextZoom>
        </div>
      )}
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
        <RichTextZoom><p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-(--color-ink)"><RichText html={q.enonce} /></p></RichTextZoom>
        {q.images.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{q.images.map((src) => <ZoomableImage key={src} src={src} className="h-40 w-40" sizes="160px" />)}</div>}
        {q.format === 'qcm' ? (
          <div className="mt-4 space-y-2">
            {q.items.map((it) => {
              const t = truth.get(it.lettre);
              const on = selected.includes(it.lettre);
              return (
                <QcmItem key={it.lettre} item={{ id: it.lettre, lettre: it.lettre, enonce: it.enonce, justification: t?.justification ?? null, images: it.images }}
                  selected={on} disabled={revealed || pending} isCorrect={t ? t.is_correct : null}
                  outcome={revealed ? (t && t.is_correct === on ? 'correct' : 'wrong') : null}
                  onToggle={() => setSelected((cur) => (cur.includes(it.lettre) ? cur.filter((x) => x !== it.lettre) : [...cur, it.lettre].sort()))} />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <textarea value={text} onChange={(e) => setText(e.target.value)} readOnly={!!qrocRevealed} rows={4} maxLength={5000} aria-label="Votre réponse"
              className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) p-3 text-sm text-(--color-ink) focus-ring read-only:bg-(--color-surface-soft)" placeholder="Rédigez votre réponse…" />
            {qrocRevealed && (
              <div className="rounded-xl border border-green-600/30 bg-green-50/50 p-3 dark:bg-green-900/10">
                <p className="text-[11px] font-bold uppercase text-green-700 dark:text-green-300">Correction Major ECN</p>
                {qrocRevealed.reponseAttendue && <p className="mt-1 text-sm font-semibold text-(--color-ink)">{reponseModele(qrocRevealed.reponseAttendue)}</p>}
                {qrocRevealed.reponseAttendue && <VariantesAcceptees reponseAttendue={qrocRevealed.reponseAttendue} className="mt-0.5 text-xs text-(--color-ink-muted)" />}
                {qrocRevealed.correction && <RichTextZoom><div className="mt-2 whitespace-pre-line text-sm text-(--color-ink-soft)"><RichText html={qrocRevealed.correction} /></div></RichTextZoom>}
              </div>
            )}
          </div>
        )}
        {revealed && correction && q.format === 'qcm' && correction.correction && <RichTextZoom><div className="mt-3 whitespace-pre-line rounded-lg bg-(--color-surface-soft) p-3 text-xs text-(--color-ink-soft)"><RichText html={correction.correction} /></div></RichTextZoom>}
        {revealed && correction && (
          <p className={cn('mt-3 flex items-center gap-1.5 text-sm font-semibold', RESULT_UI[correction.result].cls)}>
            {(() => { const R = RESULT_UI[correction.result]; return <><R.Icon className="h-4 w-4" /> {R.label}</>; })()}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        {q.format === 'qcm' && !revealed && <Button onClick={() => submit()} disabled={pending || selected.length === 0}>{pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Valider</Button>}
        {q.format === 'qroc' && !qrocRevealed && !revealed && <Button onClick={() => submit()} disabled={pending || text.trim().length === 0}>{pending ? <Loader2 className="animate-spin" /> : <Eye />} Voir la correction</Button>}
        {q.format === 'qroc' && qrocRevealed && !revealed && (
          <div className="flex flex-wrap justify-end gap-2" role="group" aria-label="Votre auto-correction">
            <Button variant="outline" onClick={() => submit({ selfGrade: 'incorrect' })} disabled={pending}><XCircle /> Incorrecte</Button>
            <Button variant="outline" onClick={() => submit({ selfGrade: 'partial' })} disabled={pending}><MinusCircle /> Partielle</Button>
            <Button onClick={() => submit({ selfGrade: 'correct' })} disabled={pending}><CheckCircle2 /> Correcte</Button>
          </div>
        )}
        {revealed && <Button onClick={next} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <ArrowRight />} {isLast ? 'Terminer la révision' : 'Question suivante'}</Button>}
      </div>
    </section>
  );
}
