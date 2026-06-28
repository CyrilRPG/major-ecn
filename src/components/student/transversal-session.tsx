'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, XCircle, RefreshCcw, RotateCcw, Eye, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem } from '@/components/qcm/qcm-item';
import { gradeQuestion, type ItemOutcome } from '@/lib/qcm/grade';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { recordTransversalSession, type TransversalKind } from '@/app/(student)/revisions-transversales/session/actions';

export type TransversalQuestion = {
  id: string;
  enonce: string;
  college: string;
  cours_id: string;
  items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[];
};

const BACK_HREF = '/revisions-transversales';

function isReevaluationKind(k: TransversalKind) {
  return k === 'reevaluation' || k === 'reevaluation_deep' || k === 'bilan_global';
}

export function TransversalSession({
  questions,
  kind,
}: {
  questions: TransversalQuestion[];
  kind: TransversalKind;
}) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<ItemOutcome[] | null>(null);
  const [score, setScore] = useState(0);
  const [perCours, setPerCours] = useState<Record<string, { c: number; t: number }>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);

  const total = questions.length;
  const q = questions[index];
  const isFinished = done || !q;

  useEffect(() => {
    if (!isFinished || recorded || total === 0) return;
    setRecorded(true);
    const specialty_scores: Record<string, number> = {};
    for (const [cid, v] of Object.entries(perCours)) {
      specialty_scores[cid] = v.t > 0 ? v.c / v.t : 0;
    }
    void recordTransversalSession({
      kind,
      qcm_count: total,
      score_correct: score,
      specialty_scores,
    });
  }, [isFinished, recorded, total, perCours, score, kind]);

  if (isFinished) {
    if (showCorrections) {
      return <CorrectionsView questions={questions} onBack={() => setShowCorrections(false)} />;
    }
    return (
      <CompletionScreen
        score={score}
        total={total}
        kind={kind}
        perCours={perCours}
        questions={questions}
        onRestart={() => {
          setIndex(0); setSel(new Set()); setOutcomes(null);
          setScore(0); setPerCours({}); setDone(false); setRecorded(false);
        }}
        onShowCorrections={() => setShowCorrections(true)}
      />
    );
  }

  const isValidated = outcomes != null;

  const toggle = (lettre: string) => {
    if (isValidated) return;
    setSel((prev) => {
      const n = new Set(prev);
      if (n.has(lettre)) n.delete(lettre); else n.add(lettre);
      return n;
    });
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('qcm_attempts').insert({
          user_id: user.id,
          question_id: q.id,
          selected_items: Array.from(sel),
          is_correct: isQuestionCorrect,
          time_spent_seconds: null,
        });
      }
    } catch { /* persistence non bloquante */ }
    if (isQuestionCorrect) setScore((s) => s + 1);
    setPerCours((prev) => {
      const cur = prev[q.cours_id] ?? { c: 0, t: 0 };
      return { ...prev, [q.cours_id]: { c: cur.c + (isQuestionCorrect ? 1 : 0), t: cur.t + 1 } };
    });
    setOutcomes(oc);
    setSubmitting(false);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSel(new Set());
      setOutcomes(null);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={BACK_HREF}><ArrowLeft /> Quitter</Link>
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6D28D9]">
          <RefreshCcw className="h-3.5 w-3.5" /> {kindLabel(kind)}
        </span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-(--color-ink-soft)">
        <span className="truncate">{q.college}</span>
        <span className="shrink-0">Q<span className="font-semibold text-(--color-ink)">{index + 1}</span>/{total}</span>
      </div>
      <Progress value={(index / total) * 100} className="mb-3" />

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">Énoncé</p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty">
          {q.enonce}
        </h2>
      </div>

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

      <div className="mt-4 flex items-center justify-end gap-3 pb-6">
        {!isValidated ? (
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

/* ================================================================
   COMPLETION SCREEN — conforme au cahier des charges sections 4-8
   ================================================================ */

type ScoreTier = 'green' | 'orange' | 'red';
function getScoreTier(pct: number): ScoreTier {
  if (pct >= 75) return 'green';
  if (pct >= 50) return 'orange';
  return 'red';
}

const TIER_CONFIG = {
  green: {
    Icon: CheckCircle2,
    iconBg: '#E7F6EC',
    iconFg: '#16793C',
    ringColor: '#16793C',
  },
  orange: {
    Icon: AlertTriangle,
    iconBg: '#FFF7E6',
    iconFg: '#E8742C',
    ringColor: '#E8742C',
  },
  red: {
    Icon: XCircle,
    iconBg: '#FCEAEC',
    iconFg: '#A91D2C',
    ringColor: '#A91D2C',
  },
} as const;

function getRevisionMessages(tier: ScoreTier) {
  if (tier === 'green') return {
    title: 'Tres bonne revision',
    body: 'Vos acquis ont ete entretenus aujourd\'hui.',
  };
  if (tier === 'orange') return {
    title: 'Revision moyenne',
    body: 'Revision effectuee, mais certaines reponses montrent des fragilites.',
  };
  return {
    title: 'Revision insuffisante',
    body: 'Cette revision montre des difficultes importantes. Certaines specialites doivent etre retravaillees.',
  };
}

function getReevaluationMessages(tier: ScoreTier, kind: TransversalKind) {
  const prefix = kind === 'bilan_global' ? 'Bilan global'
    : kind === 'reevaluation_deep' ? 'Reevaluation approfondie'
    : 'Reevaluation';

  if (tier === 'green') return {
    title: `${prefix} reussie`,
    body: kind === 'bilan_global'
      ? 'Votre niveau global reste correct malgre l\'interruption. Nous vous recommandons de reprendre les revisions transversales regulierement.'
      : 'Votre niveau de maintien des acquis est satisfaisant. Vous pouvez reprendre votre progression.',
  };
  if (tier === 'orange') return {
    title: `${prefix} fragile`,
    body: kind === 'bilan_global'
      ? 'Plusieurs connaissances doivent etre consolidees. Nous vous recommandons de reprendre progressivement les specialites les plus faibles.'
      : 'Vous pouvez reprendre votre progression, mais certaines specialites doivent etre consolidees.',
  };
  return {
    title: `${prefix} insuffisante`,
    body: kind === 'bilan_global'
      ? 'Votre niveau actuel montre un decrochage important. Un accompagnement pedagogique est recommande.'
      : 'Votre niveau actuel montre des difficultes importantes. Vous pouvez continuer a travailler, mais un renforcement approfondi est fortement recommande.',
  };
}

function getWeakSpecialties(
  perCours: Record<string, { c: number; t: number }>,
  questions: TransversalQuestion[],
): { name: string; pct: number }[] {
  const courseNames = new Map<string, string>();
  for (const q of questions) {
    if (!courseNames.has(q.cours_id)) courseNames.set(q.cours_id, q.college);
  }

  const weak: { name: string; pct: number }[] = [];
  for (const [cid, v] of Object.entries(perCours)) {
    if (v.t === 0) continue;
    const pct = Math.round((v.c / v.t) * 100);
    if (pct < 75) {
      weak.push({ name: courseNames.get(cid) ?? cid, pct });
    }
  }
  return weak.sort((a, b) => a.pct - b.pct);
}

function CompletionScreen({
  score,
  total,
  kind,
  perCours,
  questions,
  onRestart,
  onShowCorrections,
}: {
  score: number;
  total: number;
  kind: TransversalKind;
  perCours: Record<string, { c: number; t: number }>;
  questions: TransversalQuestion[];
  onRestart: () => void;
  onShowCorrections: () => void;
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const tier = getScoreTier(pct);
  const config = TIER_CONFIG[tier];
  const isReeval = isReevaluationKind(kind);
  const messages = isReeval ? getReevaluationMessages(tier, kind) : getRevisionMessages(tier);
  const weakSpecs = getWeakSpecialties(perCours, questions);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      {/* Score circle */}
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-4"
          style={{ borderColor: config.ringColor, background: config.iconBg }}
        >
          <config.Icon className="h-10 w-10" style={{ color: config.iconFg }} />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-(--color-ink)">
          {messages.title}
        </h2>

        <p className="mt-2 text-lg font-bold tabular-nums" style={{ color: config.ringColor }}>
          Score : {pct} %
        </p>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {score}/{total} reponses correctes
        </p>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-(--color-ink-soft)">
          {messages.body}
        </p>
      </div>

      {/* Weak specialties */}
      {tier !== 'green' && weakSpecs.length > 0 && (
        <div className="mt-6 rounded-xl border p-4" style={{ borderColor: config.ringColor + '40', background: config.iconBg }}>
          <p className="text-sm font-bold" style={{ color: config.iconFg }}>
            {tier === 'red' ? 'Specialites les plus faibles :' : 'Specialites a surveiller :'}
          </p>
          <ul className="mt-2 space-y-1.5">
            {weakSpecs.slice(0, 5).map((s) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-(--color-ink)">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.pct < 50 ? '#A91D2C' : '#E8742C' }} />
                  {s.name}
                </span>
                <span className="font-bold tabular-nums" style={{ color: s.pct < 50 ? '#A91D2C' : '#E8742C' }}>
                  {s.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-col gap-3">
        {/* Primary: corrections */}
        <button
          onClick={onShowCorrections}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors hover:bg-white"
          style={{ borderColor: config.ringColor, color: config.ringColor }}
        >
          <Eye className="h-4 w-4" /> Voir mes corrections
        </button>

        {/* Reevaluation: "Reprendre ma progression" */}
        {isReeval && (
          <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#16793C' }}>
            <Link href="/revisions-transversales">
              Reprendre ma progression <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* Orange/Red: consolidation/renforcement buttons */}
        {tier === 'orange' && weakSpecs.length > 0 && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#E8742C] border-[#E8742C] hover:bg-[#FFF7E6]">
            <Link href="/revisions-transversales">
              <Shield className="h-4 w-4" /> Consolider la specialite
            </Link>
          </Button>
        )}
        {tier === 'red' && weakSpecs.length > 0 && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#A91D2C] border-[#A91D2C] hover:bg-[#FCEAEC]">
            <Link href="/revisions-transversales">
              <Zap className="h-4 w-4" /> Renforcement approfondi
            </Link>
          </Button>
        )}

        {/* Dashboard return */}
        <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
          <Link href={BACK_HREF}>
            <ArrowLeft className="h-4 w-4" /> Retour au dashboard
          </Link>
        </Button>

        {/* Recommencer */}
        {!isReeval && (
          <button
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-2 text-xs font-medium text-(--color-ink-muted) hover:text-(--color-ink)"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Recommencer
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   CORRECTIONS VIEW — affiche toutes les questions avec les réponses
   ================================================================ */

function CorrectionsView({
  questions,
  onBack,
}: {
  questions: TransversalQuestion[];
  onBack: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft /> Retour aux resultats
        </Button>
        <h2 className="text-lg font-bold text-(--color-ink)">Corrections</h2>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-(--color-ink-muted)">{q.college}</span>
              <span className="text-xs font-bold text-(--color-ink)">Q{qi + 1}</span>
            </div>
            <p className="text-sm font-semibold text-(--color-ink)">{q.enonce}</p>
            <div className="mt-3 space-y-1.5">
              {q.items.map((it) => (
                <div
                  key={it.id}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm',
                    it.is_correct
                      ? 'border-[#16793C]/30 bg-[#E7F6EC]'
                      : 'border-(--color-border) bg-(--color-surface)',
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
                        {it.enonce}
                      </p>
                      {it.justification && (
                        <p className="mt-1 text-xs text-(--color-ink-soft)">{it.justification}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft /> Retour aux resultats
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   HELPERS
   ================================================================ */

function kindLabel(k: TransversalKind): string {
  return {
    daily: 'Revision du jour',
    recommended: 'Revision recommandee',
    intensive: 'Revision intensive',
    reevaluation: 'Reevaluation',
    reevaluation_deep: 'Reevaluation approfondie',
    bilan_global: 'Bilan global',
  }[k] ?? 'Revision';
}
