'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Check, Crown, Loader2, PenLine, RotateCcw, Sparkles, Trophy, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { submitParcoursAction } from '@/app/(student)/parcours/actions';
import { BAND_META, computeScore10, type ParcoursBand } from '@/lib/parcours/parcours';

export type RunnerItem = { lettre: string; texte: string; correct: boolean };
export type RunnerQuestion = {
  id: string;
  section: 'qcm' | 'cas_clinique';
  format: 'qcm' | 'qroc';
  enonceHtml: string;
  imageUrl: string | null;
  items: RunnerItem[];
  reponseAttendue: string | null;
  explicationHtml: string | null;
};

type Answer = { selected: string[]; validated: boolean; text: string; revealed: boolean; self?: 'correct' | 'wrong' };

/** Rendu HTML riche (énoncés / corrections) — même classe prose que le reste. */
function Rich({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn('prose prose-sm max-w-none text-(--color-ink) prose-p:my-1.5 prose-li:my-0.5 prose-img:rounded-xl prose-img:my-2', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Enveloppe le runner d'un écran de lancement : le rappel méthodo est affiché
 * AU-DESSUS (côté serveur), puis l'élève clique pour démarrer les QCM/QROC.
 */
export function ParcoursExercices(props: {
  parcoursId: string;
  numero: number;
  nextNumero: number | null;
  questions: RunnerQuestion[];
  dejaFait?: { score: number; band: ParcoursBand } | null;
}) {
  const [started, setStarted] = useState(false);
  if (props.questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-8 text-center text-sm text-(--color-ink-muted)">
        Les exercices de ce parcours seront ajoutés prochainement.
      </div>
    );
  }
  if (started) return <ParcoursRunner {...props} />;

  const nbQcm = props.questions.filter((q) => q.format === 'qcm').length;
  const nbQroc = props.questions.filter((q) => q.format === 'qroc').length;
  const meta = props.dejaFait ? BAND_META[props.dejaFait.band] : null;
  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-center shadow-(--shadow-soft)">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#E4002B,#F97316)] text-white shadow-lg">
        <PenLine className="h-7 w-7" />
      </span>
      <h2 className="mt-3 text-lg font-bold text-(--color-ink)">Prêt pour les exercices ?</h2>
      <p className="mt-1 text-sm text-(--color-ink-soft)">
        {nbQcm > 0 && `${nbQcm} QCM`}{nbQcm > 0 && nbQroc > 0 ? ' · ' : ''}{nbQroc > 0 && `${nbQroc} question(s) à réponse courte`}.
        {' '}Note finale sur 10.
      </p>
      {props.dejaFait && meta && (
        <p className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-semibold" style={{ background: meta.bg, color: meta.color }}>
          Déjà fait : {props.dejaFait.score.toFixed(1)}/10 · {meta.label}
        </p>
      )}
      <div className="mt-4">
        <Button size="lg" onClick={() => setStarted(true)}>
          {props.dejaFait ? 'Refaire le parcours' : 'Commencer les exercices'} <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

export function ParcoursRunner({
  parcoursId,
  numero,
  nextNumero,
  questions,
}: {
  parcoursId: string;
  numero: number;
  nextNumero: number | null;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, { selected: [], validated: false, text: '', revealed: false }])),
  );
  const [finished, setFinished] = useState<{ score: number; band: ParcoursBand } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = questions.length;
  const q = questions[i];
  const a = answers[q?.id];

  // Aperçu du score en direct (le serveur fait foi à l'enregistrement).
  const correctSoFar = useMemo(() => questions.reduce((n, qq) => {
    const ans = answers[qq.id];
    if (qq.format === 'qcm') {
      if (!ans?.validated) return n;
      const bonnes = new Set(qq.items.filter((it) => it.correct).map((it) => it.lettre));
      const sel = new Set(ans.selected);
      const ok = bonnes.size === sel.size && [...bonnes].every((l) => sel.has(l));
      return n + (ok ? 1 : 0);
    }
    return n + (ans?.self === 'correct' ? 1 : 0);
  }, 0), [answers, questions]);

  function patch(id: string, next: Partial<Answer>) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...next } }));
  }

  function toggleLetter(letter: string) {
    if (a.validated) return;
    patch(q.id, { selected: a.selected.includes(letter) ? a.selected.filter((l) => l !== letter) : [...a.selected, letter] });
  }

  const isLast = i === total - 1;
  // Question « répondue » : QCM validé, ou QROC auto-évalué.
  const answered = q && (q.format === 'qcm' ? a?.validated : !!a?.self);

  async function finish() {
    setSaving(true);
    setError(null);
    const payload = Object.fromEntries(
      questions.map((qq) => {
        const ans = answers[qq.id];
        return qq.format === 'qcm'
          ? [qq.id, { selected: ans.selected }]
          : [qq.id, { self: ans.self ?? 'wrong', text: ans.text }];
      }),
    );
    const res = await submitParcoursAction({ parcoursId, answers: payload });
    setSaving(false);
    if ('error' in res) { setError(res.error); return; }
    setFinished({ score: res.score, band: res.band });
    router.refresh();
  }

  // ── Écran de résultat ──────────────────────────────────────────────────
  if (finished) {
    const meta = BAND_META[finished.band];
    return (
      <div className="mx-auto max-w-2xl">
        <div
          className="relative overflow-hidden rounded-3xl border px-6 py-8 text-center"
          style={{ borderColor: meta.ring, background: `linear-gradient(160deg, ${meta.bg}, var(--color-surface))` }}
        >
          <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 opacity-15">
            <Crown className="h-40 w-40" style={{ color: meta.color }} strokeWidth={1.2} />
          </span>
          <span
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${meta.color}, color-mix(in srgb, ${meta.color} 65%, #000))` }}
          >
            {finished.band === 'maitrise' ? <Trophy className="h-8 w-8" /> : <Sparkles className="h-8 w-8" />}
          </span>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: meta.color }}>
            Parcours {numero} terminé
          </p>
          <p className="mt-2 text-5xl font-black tabular-nums text-(--color-ink)">
            {finished.score.toFixed(1)}<span className="text-2xl text-(--color-ink-muted)">/10</span>
          </p>
          <p className="mt-2 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold" style={{ background: meta.color, color: '#fff' }}>
            {meta.label}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-(--color-ink-soft)">
            {finished.band === 'maitrise'
              ? 'Excellent ! Vous maîtrisez ce parcours. Continuez sur cette lancée.'
              : finished.band === 'en_bonne_voie'
                ? 'Vous êtes en bonne voie. Reprenez les points manqués pour viser la maîtrise.'
                : 'À retravailler : reprenez la correction, puis retentez le parcours.'}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => { setFinished(null); setI(0); }}>
              <RotateCcw /> Recommencer
            </Button>
            <Button asChild variant="secondary">
              <Link href="/parcours">Retour au chemin</Link>
            </Button>
            {nextNumero && (
              <Button asChild>
                <Link href={`/parcours/${nextNumero}`}>Parcours suivant <ArrowRight /></Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const previewScore = computeScore10(correctSoFar, total);

  // ── Runner ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl">
      {/* Barre de progression */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-[12px] font-medium text-(--color-ink-soft)">
          <span>Question {i + 1} / {total}</span>
          <span className="tabular-nums">Score en cours : {previewScore.toFixed(1)}/10</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-(--color-surface-soft)">
          <div className="h-full rounded-full transition-all" style={{ width: `${((i + 1) / total) * 100}%`, background: 'linear-gradient(90deg,#E4002B,#F97316)' }} />
        </div>
      </div>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: q.format === 'qcm' ? '#7C3AED' : '#C0112E' }}>
          {q.section === 'cas_clinique' ? 'Cas clinique — QROC' : 'QCM'}
        </p>
        {q.enonceHtml && <Rich html={q.enonceHtml} className="mb-3 font-medium" />}
        {q.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.imageUrl} alt="" className="mb-3 max-h-[420px] w-auto rounded-xl border border-(--color-border)" />
        )}

        {q.format === 'qcm' ? (
          <ul className="space-y-2">
            {q.items.map((it) => {
              const selected = a.selected.includes(it.lettre);
              const showState = a.validated;
              const good = it.correct;
              return (
                <li key={it.lettre}>
                  <button
                    type="button"
                    disabled={a.validated}
                    onClick={() => toggleLetter(it.lettre)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition',
                      !showState && selected && 'border-[#7C3AED] bg-[#F3EAFF]',
                      !showState && !selected && 'border-(--color-border) bg-(--color-surface) hover:bg-(--color-sand-100)',
                      showState && good && 'border-[#059669] bg-[#ECFDF5]',
                      showState && !good && selected && 'border-[#DC2626] bg-[#FEF2F2]',
                      showState && !good && !selected && 'border-(--color-border) bg-(--color-surface) opacity-70',
                    )}
                  >
                    <span className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      showState && good ? 'bg-[#059669] text-white'
                        : showState && selected ? 'bg-[#DC2626] text-white'
                          : selected ? 'bg-[#7C3AED] text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)',
                    )}>
                      {showState && good ? <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        : showState && selected ? <X className="h-3.5 w-3.5" strokeWidth={3} />
                          : it.lettre}
                    </span>
                    <span className="flex-1 pt-0.5 text-sm text-(--color-ink)">{it.texte}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">Votre réponse</label>
            <textarea
              value={a.text}
              disabled={a.revealed}
              onChange={(e) => patch(q.id, { text: e.target.value })}
              rows={4}
              placeholder="Rédigez votre réponse, puis comparez à la correction…"
              className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm focus:border-[#C0112E] focus:outline-none focus:ring-1 focus:ring-[#C0112E]"
            />
          </div>
        )}

        {/* Correction (QCM validé ou QROC révélé) */}
        {((q.format === 'qcm' && a.validated) || (q.format === 'qroc' && a.revealed)) && (
          <div className="mt-3 rounded-xl border border-[#E9D8A6] bg-[#FFFBEB] p-3.5">
            {q.format === 'qroc' && q.reponseAttendue && (
              <p className="mb-1 text-sm"><span className="font-bold text-[#7A5B00]">Réponse attendue : </span>{q.reponseAttendue}</p>
            )}
            {q.explicationHtml
              ? <Rich html={q.explicationHtml} className="text-[13.5px]" />
              : q.format === 'qcm'
                ? <p className="text-[13px] text-[#8A6D1F]">Bonnes réponses : <strong>{q.items.filter((it) => it.correct).map((it) => it.lettre).join(', ') || '—'}</strong></p>
                : null}
          </div>
        )}

        {/* Auto-évaluation QROC */}
        {q.format === 'qroc' && a.revealed && !a.self && (
          <div className="mt-3">
            <p className="mb-1.5 text-[12.5px] font-semibold text-(--color-ink)">Évaluez-vous honnêtement :</p>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#059669] text-[#059669] hover:bg-[#ECFDF5]" onClick={() => patch(q.id, { self: 'correct' })}>
                <Check /> J’avais juste
              </Button>
              <Button variant="outline" className="border-[#DC2626] text-[#DC2626] hover:bg-[#FEF2F2]" onClick={() => patch(q.id, { self: 'wrong' })}>
                <X /> Je m’étais trompé
              </Button>
            </div>
          </div>
        )}
        {q.format === 'qroc' && a.self && (
          <p className={cn('mt-3 flex items-center gap-1.5 text-sm font-semibold', a.self === 'correct' ? 'text-[#059669]' : 'text-[#DC2626]')}>
            {a.self === 'correct' ? <><Check className="h-4 w-4" /> Comptée comme réussie</> : <><X className="h-4 w-4" /> Comptée comme manquée</>}
          </p>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" disabled={i === 0} onClick={() => setI((v) => Math.max(0, v - 1))}>Précédent</Button>
          <div className="flex gap-2">
            {q.format === 'qcm' && !a.validated && (
              <Button disabled={a.selected.length === 0} onClick={() => patch(q.id, { validated: true })}>
                Valider
              </Button>
            )}
            {q.format === 'qroc' && !a.revealed && (
              <Button onClick={() => patch(q.id, { revealed: true })}>
                <PenLine /> Voir la correction
              </Button>
            )}
            {answered && !isLast && (
              <Button onClick={() => setI((v) => Math.min(total - 1, v + 1))}>
                Suivant <ArrowRight />
              </Button>
            )}
            {answered && isLast && (
              <Button onClick={finish} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Trophy />} Terminer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
