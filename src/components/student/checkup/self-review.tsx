'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CircleDashed, Loader2, MinusCircle, XCircle } from 'lucide-react';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom, ZoomableImage } from '@/components/qcm/image-zoom';
import { VariantesAcceptees } from '@/components/qcm/variantes-acceptees';
import { reponseModele } from '@/lib/qcm/grade';
import { selfGradeAction } from '@/app/(student)/checkup/actions';
import { cn } from '@/lib/utils';

export type ReviewItem = {
  position: number;
  enonce: string;
  images: string[];
  vignette: string | null;
  dossierLabel: string | null;
  answer: string;
  reponseAttendue: string | null;
  correction: string | null;
  commentaire: string | null;
  grade: 'correct' | 'partial' | 'incorrect' | null;
};

const GRADES = [
  { id: 'correct' as const, label: 'Correcte', hint: '1 point', Icon: CheckCircle2, on: 'border-green-600 bg-green-600 text-white', off: 'border-green-600/40 text-green-700 dark:text-green-300' },
  { id: 'partial' as const, label: 'Partielle', hint: '0,5 point', Icon: MinusCircle, on: 'border-amber-500 bg-amber-500 text-white', off: 'border-amber-500/50 text-amber-700 dark:text-amber-300' },
  { id: 'incorrect' as const, label: 'Incorrecte', hint: '0 point', Icon: XCircle, on: 'border-red-600 bg-red-600 text-white', off: 'border-red-600/40 text-red-700 dark:text-red-300' },
];

/**
 * Auto-correction des QROC (§14 à §16) : la réponse du candidat est FIGÉE,
 * la correction Major ECN s'affiche à côté, le candidat se note (correcte = 1,
 * partielle = 0,5, incorrecte = 0). Aucune IA. Le score définitif, l'analyse
 * et le plan de reprise ne sont calculés qu'une fois TOUTES les réponses
 * rédigées auto-corrigées.
 */
export function SelfReview({ sessionId, items, emptyCount }: { sessionId: string; items: ReviewItem[]; emptyCount: number }) {
  const router = useRouter();
  const [grades, setGrades] = useState<Record<number, ReviewItem['grade']>>(() => Object.fromEntries(items.map((i) => [i.position, i.grade])));
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const done = Object.values(grades).filter(Boolean).length;

  const grade = (position: number, g: 'correct' | 'partial' | 'incorrect') => start(async () => {
    setBusy(position);
    setError(null);
    const r = await selfGradeAction(sessionId, position, g);
    setBusy(null);
    if (!r.ok) { setError(r.error); return; }
    setGrades((cur) => ({ ...cur, [position]: g }));
    if (r.completed) router.replace(`/checkup/${sessionId}/resultat`);
  });

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-3 border-b border-(--color-border) bg-(--color-surface)/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-(--color-ink)">{done} / {items.length} réponse{items.length > 1 ? 's' : ''} corrigée{done > 1 ? 's' : ''}</p>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--color-border)" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Progression de la correction">
          <div className="h-full rounded-full bg-(--color-primary) transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
        {emptyCount > 0 && <p className="mt-1.5 text-xs text-(--color-ink-muted)">{emptyCount} QROC laissée{emptyCount > 1 ? 's' : ''} vide{emptyCount > 1 ? 's' : ''} : 0 point automatiquement, sans correction à faire.</p>}
      </div>
      {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
      <ol className="space-y-4">
        {items.map((it, k) => {
          const g = grades[it.position];
          return (
            <li key={it.position} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) sm:p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-(--color-ink-muted)">
                {g ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <CircleDashed className="h-4 w-4" />} Question {k + 1}{it.dossierLabel ? ` · ${it.dossierLabel}` : ''}
              </p>
              {it.vignette && <details className="mt-2 rounded-xl bg-(--color-surface-soft) p-3 text-sm"><summary className="cursor-pointer font-medium text-(--color-ink)">Énoncé du dossier</summary><RichTextZoom><div className="mt-2 whitespace-pre-line text-(--color-ink-soft)"><RichText html={it.vignette} /></div></RichTextZoom></details>}
              <RichTextZoom><p className="mt-2 whitespace-pre-line text-[15px] font-medium text-(--color-ink)"><RichText html={it.enonce} /></p></RichTextZoom>
              {it.images.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{it.images.map((src) => <ZoomableImage key={src} src={src} className="h-32 w-32" sizes="128px" />)}</div>}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-(--color-border) p-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Votre réponse (figée)</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-(--color-ink)">{it.answer}</p>
                </div>
                <div className="rounded-xl border border-green-600/30 bg-green-50/50 p-3 dark:bg-green-900/10">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-green-700 dark:text-green-300">Correction Major ECN</p>
                  {it.reponseAttendue && <p className="mt-1 text-sm font-semibold text-(--color-ink)">{reponseModele(it.reponseAttendue)}</p>}
                  {it.reponseAttendue && <VariantesAcceptees reponseAttendue={it.reponseAttendue} className="mt-0.5 text-xs text-(--color-ink-muted)" />}
                  {it.correction && <RichTextZoom><div className="mt-2 whitespace-pre-line text-sm text-(--color-ink-soft)"><RichText html={it.correction} /></div></RichTextZoom>}
                  {it.commentaire && <p className="mt-2 text-xs italic text-(--color-ink-muted)">{it.commentaire}</p>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Votre auto-correction">
                {GRADES.map((x) => (
                  <button key={x.id} type="button" role="radio" aria-checked={g === x.id} disabled={busy !== null}
                    onClick={() => grade(it.position, x.id)}
                    className={cn('flex flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-2 text-sm font-semibold transition focus-ring disabled:opacity-60', g === x.id ? x.on : `bg-(--color-surface) ${x.off} hover:bg-(--color-surface-soft)`)}>
                    <span className="flex items-center gap-1.5">{busy === it.position && g !== x.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <x.Icon className="h-4 w-4" />}{x.label}</span>
                    <span className="text-[11px] font-normal opacity-80">{x.hint}</span>
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
