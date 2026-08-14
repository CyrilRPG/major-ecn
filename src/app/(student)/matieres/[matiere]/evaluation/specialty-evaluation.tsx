'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Award, CheckCircle2, Eye, Shield, XCircle, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
import { RichTextZoom } from '@/components/qcm/image-zoom';
import { sanitizeBlockHtml } from '@/lib/flashcards/rich-text';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { cn } from '@/lib/utils';
import { saveSpecialtyEvaluation } from './actions';

/** Question d'interrogation officielle : QCM ou question ouverte (QROC). */
export type InterrogationQuestion = {
  id: string;
  format: 'qcm' | 'qroc';
  enonce: string;
  /** Mini-cas clinique / contexte partagé éventuel. */
  vignette?: string | null;
  items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[];
  reponse_attendue?: string | null;
  correction_generale?: string | null;
};

type Phase = 'intro' | 'quiz' | 'result' | 'corrections';

const TIER_CONFIG = {
  green: { label: 'Spécialité validée', color: '#16793C', bg: '#ECFDF3', Icon: CheckCircle2 },
  orange: { label: 'Spécialité fragile', color: '#E8742C', bg: '#FFF7E6', Icon: Shield },
  red: { label: 'Spécialité insuffisamment maîtrisée', color: '#A91D2C', bg: '#FCEAEC', Icon: Zap },
} as const;

function getMessage(tier: 'green' | 'orange' | 'red') {
  if (tier === 'green') return {
    title: 'Très bonne maîtrise de la spécialité',
    body: 'Votre niveau actuel permet de considérer ce module comme validé.',
  };
  if (tier === 'orange') return {
    title: 'Certaines notions nécessitent encore d’être consolidées',
    body: 'Votre niveau est encourageant, mais cette spécialité mérite un renforcement.',
  };
  return {
    title: 'Les connaissances essentielles ne sont pas encore suffisamment maîtrisées',
    body: 'Nous vous recommandons un renforcement approfondi.',
  };
}

export function SpecialtyEvaluation({
  matiereId,
  matiereName,
  questions,
  finishedParcours,
}: {
  matiereId: string;
  matiereName: string;
  questions: InterrogationQuestion[];
  /** L'élève a terminé le parcours de la spécialité (spec section 9). */
  finishedParcours: boolean;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<ItemOutcome[] | null>(null);
  const [qrocText, setQrocText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [selfGrade, setSelfGrade] = useState<'bon' | 'faux' | null>(null);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  const total = questions.length;
  const q = questions[index];
  const nQcm = questions.filter((x) => x.format !== 'qroc').length;
  const nOpen = total - nQcm;

  const finishQuiz = (finalScore: number) => {
    setScore(finalScore);
    setPhase('result');
    if (!saved) {
      setSaved(true);
      startTransition(async () => {
        // La chaîne d'alertes admin est déroulée côté serveur par cette action.
        await saveSpecialtyEvaluation({
          matiere_id: matiereId,
          eval_type: 'fin_specialite',
          score_correct: finalScore,
          score_total: total,
        });
      });
    }
  };

  /* ─── Intro (spec section 9) ─── */
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <Award className="h-8 w-8 text-[#6D28D9]" />
        </div>
        <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
          {finishedParcours
            ? `Vous avez terminé le parcours ${matiereName}`
            : `Interrogation officielle — ${matiereName}`}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
          Une interrogation officielle Major EVC est disponible afin d&apos;évaluer votre niveau
          et de valider cette spécialité.
        </p>
        <p className="mt-4 text-xs text-(--color-ink-muted)">
          {nQcm} QCM{nOpen > 0 ? ` · ${nOpen} question${nOpen > 1 ? 's' : ''} ouverte${nOpen > 1 ? 's' : ''}` : ''} · 15 à 20 minutes
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setPhase('quiz')} className="rounded-xl py-3 text-sm font-bold" style={{ background: '#6D28D9' }}>
            Passer l&apos;interrogation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" className="rounded-xl py-3 text-sm font-bold">
            <Link href={`/matieres/${matiereId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Plus tard
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-[11px] text-(--color-ink-muted)">
          « Plus tard » laisse la spécialité en <strong>Validation en attente</strong> — vous pouvez
          continuer à travailler et repasser ici quand vous le souhaitez.
        </p>
      </div>
    );
  }

  /* ─── Corrections ─── */
  if (phase === 'corrections') {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center gap-3">
          <Button onClick={() => setPhase('result')} variant="ghost" size="sm">
            <ArrowLeft /> Retour aux résultats
          </Button>
          <h2 className="text-lg font-bold text-(--color-ink)">Corrections</h2>
        </div>
        <div className="space-y-6">
          {questions.map((cq, qi) => (
            <div key={cq.id} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-(--color-ink-muted)">{cq.format === 'qroc' ? 'Question ouverte' : 'QCM'}</span>
                <span className="text-xs font-bold text-(--color-ink)">Q{qi + 1}</span>
              </div>
              <p className="text-sm font-semibold text-(--color-ink)"><RichText html={cq.enonce} /></p>
              {cq.format === 'qroc' ? (
                <div className="mt-3 rounded-lg border border-[#00695C]/30 bg-[#E0F2F1]/50 px-3 py-2 text-sm">
                  {cq.reponse_attendue && (
                    <p className="text-(--color-ink)">
                      <span className="font-semibold text-[#00695C]">Réponse attendue : </span>
                      {cq.reponse_attendue.split('|').map((a) => a.trim()).join(' ou ')}
                    </p>
                  )}
                  {cq.correction_generale && (
                    <div className="mt-1.5 text-(--color-ink-soft)"><RichText html={cq.correction_generale} /></div>
                  )}
                </div>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {cq.items.map((it) => (
                    <div
                      key={it.id}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm',
                        it.is_correct ? 'border-[#16793C]/30 bg-[#E7F6EC]' : 'border-(--color-border) bg-(--color-surface)',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                          it.is_correct ? 'bg-[#16793C] text-white' : 'bg-(--color-sand-100) text-(--color-ink-muted)',
                        )}>
                          {it.lettre}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={cn(it.is_correct ? 'font-medium text-[#16793C]' : 'text-(--color-ink)')}>
                            <RichText html={it.enonce} />
                          </p>
                          {it.justification && (
                            <p className="mt-1 text-xs text-(--color-ink-soft)"><RichText html={it.justification} /></p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Résultat (spec section 10) ─── */
  if (phase === 'result') {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const tier = pct >= 75 ? 'green' : pct >= 50 ? 'orange' : 'red';
    const config = TIER_CONFIG[tier];
    const msg = getMessage(tier);

    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center sm:px-6">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4"
          style={{ borderColor: config.color, background: config.bg }}
        >
          <config.Icon className="h-9 w-9" style={{ color: config.color }} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider" style={{ color: config.color }}>
          {config.label}
        </p>
        <h2 className="mt-3 text-xl font-black tracking-tight text-(--color-ink)">
          {msg.title}
        </h2>
        <p className="mt-2 text-lg font-bold tabular-nums" style={{ color: config.color }}>
          Score : {pct} %
        </p>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {score}/{total} réponses correctes
        </p>
        <p className="mt-4 max-w-sm mx-auto text-sm leading-relaxed text-(--color-ink-soft)">
          {msg.body}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {tier === 'orange' && (
            <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#E8742C' }}>
              <Link href={`/matieres/${matiereId}/consolidation`}>
                <Shield className="mr-2 h-4 w-4" /> Consolider la spécialité
              </Link>
            </Button>
          )}
          {tier === 'red' && (
            <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}>
              <Link href={`/matieres/${matiereId}/renforcement`}>
                <Zap className="mr-2 h-4 w-4" /> Renforcement approfondi
              </Link>
            </Button>
          )}
          <Button onClick={() => setPhase('corrections')} variant="outline" className="w-full rounded-xl py-3 text-sm font-bold" style={{ borderColor: config.color, color: config.color }}>
            <Eye className="mr-2 h-4 w-4" /> Voir mes corrections
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
            <Link href="/accueil">
              Retour au dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
            <Link href={`/matieres/${matiereId}`}>
              <ArrowRight className="mr-2 h-4 w-4" /> Continuer ma progression
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Quiz (QCM + questions ouvertes auto-évaluées) ─── */
  if (!q) return null;
  const isQroc = q.format === 'qroc';
  const isValidated = isQroc ? selfGrade != null : outcomes != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(lettre)) n.delete(lettre); else n.add(lettre);
      return n;
    });
  };

  const validateQcm = () => {
    if (isValidated || sel.size === 0) return;
    const { perItem, isQuestionCorrect } = gradeQuestion(
      q.items.map((it) => ({ lettre: it.lettre, is_correct: it.is_correct, selected: sel.has(it.lettre) })),
    );
    setOutcomes(q.items.map((it) => perItem[it.lettre]));
    if (isQuestionCorrect) setScore((s) => s + 1);
  };

  const selfEval = (grade: 'bon' | 'faux') => {
    if (isValidated) return;
    if (grade === 'bon') setScore((s) => s + 1);
    setSelfGrade(grade);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSel(new Set());
      setOutcomes(null);
      setQrocText(''); setRevealed(false); setSelfGrade(null);
    } else {
      // `score` est déjà à jour (validations synchrones) — on fige le total.
      finishQuiz(scoreRef());
    }
  };
  // Le score de la dernière question vient d'être appliqué de façon synchrone
  // par setScore — au moment de « Terminer », l'état `score` est déjà correct.
  const scoreRef = () => score;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/matieres/${matiereId}`}><ArrowLeft /> Quitter</Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6D28D9]">
          <Award className="h-3.5 w-3.5" /> Interrogation {matiereName}
        </span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span className="truncate">{isQroc ? 'Question ouverte' : 'QCM'}</span>
        <span className="shrink-0">Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-3" />

      {q.vignette && (
        <details open className="group mb-3 block rounded-xl border border-l-4 border-(--color-accent)/30 border-l-(--color-accent) bg-(--color-accent-soft)/40 p-3.5 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">
              Cas clinique
            </span>
            <span className="text-[11px] font-medium text-(--color-accent-deep)">
              <span className="group-open:hidden">Afficher</span>
              <span className="hidden group-open:inline">Réduire</span>
            </span>
          </summary>
          <RichTextZoom>
            <div
              className="mt-2 break-words text-sm leading-relaxed text-(--color-ink) [&_strong]:font-semibold [&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeBlockHtml(q.vignette) }}
            />
          </RichTextZoom>
        </details>
      )}

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">
          {isQroc ? 'Question ouverte' : 'Énoncé'}
        </p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty">
          <RichTextZoom><RichText html={q.enonce} /></RichTextZoom>
        </h2>
      </div>

      {isQroc ? (
        <div className="space-y-3">
          <div className={cn(
            'rounded-xl border px-3.5 py-3 transition',
            revealed ? 'border-[#00695C]/30 bg-[#E0F2F1]/40' : 'border-(--color-border) bg-(--color-surface)',
          )}>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
              Votre réponse
            </label>
            <textarea
              value={qrocText}
              onChange={(e) => setQrocText(e.target.value)}
              disabled={revealed}
              placeholder="Rédigez votre réponse avant de révéler la correction…"
              rows={3}
              className="w-full resize-none bg-transparent text-sm leading-snug text-(--color-ink) placeholder:text-(--color-ink-muted)/50 focus:outline-none disabled:cursor-default"
            />
          </div>

          {revealed && (q.reponse_attendue || q.correction_generale) && (
            <div className="rounded-xl border-2 border-[#00695C]/40 bg-[#E0F2F1]/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00695C]">Réponse et correction</p>
              {q.reponse_attendue && (
                <p className="mt-2 text-sm leading-relaxed text-(--color-ink)">
                  <span className="font-semibold">Réponse attendue : </span>
                  {q.reponse_attendue.split('|').map((a) => a.trim()).join(' ou ')}
                </p>
              )}
              {q.correction_generale && (
                <div className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
                  <RichText html={q.correction_generale} />
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

      <div className="mt-4 flex items-center justify-end gap-3 pb-6">
        {isQroc ? (
          !revealed ? (
            <Button onClick={() => setRevealed(true)} className="bg-[#00695C] hover:bg-[#004D40]">
              <Eye className="h-4 w-4" /> Révéler la réponse
            </Button>
          ) : !selfGrade ? (
            <>
              <Button onClick={() => selfEval('faux')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4" /> Faux
              </Button>
              <Button onClick={() => selfEval('bon')} className="bg-[#2E8B57] hover:bg-[#256B45]">
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
          <Button onClick={validateQcm} disabled={sel.size === 0}>Valider</Button>
        ) : (
          <Button onClick={next}>
            {index < total - 1 ? 'Question suivante' : 'Terminer'}
            <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
