'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowRight, CalendarPlus, CheckCircle2, AlertTriangle, XCircle, MessageCircle, RefreshCcw, RotateCcw, Eye, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QcmItem } from '@/components/qcm/qcm-item';
import { RichText } from '@/components/qcm/rich-text';
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
  targetCount,
}: {
  questions: TransversalQuestion[];
  kind: TransversalKind;
  targetCount?: number;
}) {
  const [index, setIndex] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [outcomes, setOutcomes] = useState<ItemOutcome[] | null>(null);
  const [score, setScore] = useState(0);
  const [perCours, setPerCours] = useState<Record<string, { c: number; t: number }>>({});
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [recordError, setRecordError] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());

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
    recordTransversalSession({
      kind,
      qcm_count: total,
      score_correct: score,
      specialty_scores,
      started_at: startedAt,
    }).then((res) => {
      if (!res.ok) setRecordError(true);
    }).catch(() => setRecordError(true));
  }, [isFinished, recorded, total, perCours, score, kind, startedAt]);

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
        recordError={recordError}
        onRestart={() => {
          setIndex(0); setSel(new Set()); setOutcomes(null);
          setScore(0); setPerCours({}); setDone(false); setRecorded(false);
          setRecordError(false);
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

      {targetCount && total < targetCount && index === 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#E8742C]/30 bg-[#FFF7E6] px-3 py-2 text-xs text-[#B45B00]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Session adaptée : {total} QCM disponibles sur les {targetCount} prévus. Révisez davantage de spécialités pour débloquer plus de questions.
        </div>
      )}

      <div className="mb-3 rounded-xl border border-(--color-border) bg-(--color-surface) p-3.5 shadow-(--shadow-soft)">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-accent-deep)">Énoncé</p>
        <h2 className="mt-1 text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-pretty">
          <RichText html={q.enonce} />
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
    title: 'Très bonne révision',
    body: 'Vos acquis ont été entretenus aujourd’hui.',
  };
  if (tier === 'orange') return {
    title: 'Révision moyenne',
    body: 'Révision effectuée, mais certaines réponses montrent des fragilités.',
  };
  return {
    title: 'Révision insuffisante',
    body: 'Cette révision montre des difficultés importantes. Certaines spécialités doivent être retravaillées.',
  };
}

function getReevaluationMessages(tier: ScoreTier, kind: TransversalKind) {
  if (tier === 'green') {
    if (kind === 'bilan_global') return {
      title: 'Bilan global satisfaisant',
      body: 'Votre niveau global reste correct malgré l’interruption. Nous vous recommandons de reprendre les révisions transversales régulièrement.',
    };
    if (kind === 'reevaluation_deep') return {
      title: 'Réévaluation approfondie satisfaisante',
      body: 'Votre reprise est satisfaisante. Continuez avec des révisions transversales régulières.',
    };
    return {
      title: 'Réévaluation réussie',
      body: 'Votre niveau de maintien des acquis est satisfaisant. Vous pouvez reprendre votre progression.',
    };
  }
  if (tier === 'orange') {
    if (kind === 'bilan_global') return {
      title: 'Bilan global fragile',
      body: 'Plusieurs connaissances doivent être consolidées. Nous vous recommandons de reprendre progressivement les spécialités les plus faibles.',
    };
    if (kind === 'reevaluation_deep') return {
      title: 'Réévaluation approfondie fragile',
      body: 'Votre niveau reste partiel. Certaines spécialités nécessitent une consolidation.',
    };
    return {
      title: 'Réévaluation fragile',
      body: 'Vous pouvez reprendre votre progression, mais certaines spécialités doivent être consolidées.',
    };
  }
  if (kind === 'bilan_global') return {
    title: 'Bilan global insuffisant',
    body: 'Votre niveau actuel montre un décrochage important. Un accompagnement pédagogique est recommandé.',
  };
  if (kind === 'reevaluation_deep') return {
    title: 'Réévaluation approfondie insuffisante',
    body: 'Votre niveau actuel est préoccupant. Un renforcement approfondi est recommandé sur les spécialités les plus faibles.',
  };
  return {
    title: 'Réévaluation insuffisante',
    body: 'Votre niveau actuel montre des difficultés importantes. Vous pouvez continuer à travailler, mais un renforcement approfondi est fortement recommandé.',
  };
}

function getWeakSpecialties(
  perCours: Record<string, { c: number; t: number }>,
  questions: TransversalQuestion[],
): { name: string; pct: number; coursId: string }[] {
  const courseNames = new Map<string, string>();
  for (const q of questions) {
    if (!courseNames.has(q.cours_id)) courseNames.set(q.cours_id, q.college);
  }

  const weak: { name: string; pct: number; coursId: string }[] = [];
  for (const [cid, v] of Object.entries(perCours)) {
    if (v.t === 0) continue;
    const pct = Math.round((v.c / v.t) * 100);
    if (pct < 75) {
      weak.push({ name: courseNames.get(cid) ?? cid, pct, coursId: cid });
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
  recordError,
  onRestart,
  onShowCorrections,
}: {
  score: number;
  total: number;
  kind: TransversalKind;
  perCours: Record<string, { c: number; t: number }>;
  questions: TransversalQuestion[];
  recordError: boolean;
  onRestart: () => void;
  onShowCorrections: () => void;
}) {
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const tier = getScoreTier(pct);
  const config = TIER_CONFIG[tier];
  const isReeval = isReevaluationKind(kind);
  const messages = isReeval ? getReevaluationMessages(tier, kind) : getRevisionMessages(tier);

  const handleSchedule = async () => {
    if (!scheduleDate || scheduling) return;
    setScheduling(true);
    try {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        await (supabase as unknown as {
          from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: unknown }> };
        }).from('user_agenda_events').insert({
          user_id: u.id,
          title: 'Révision transversale',
          date: scheduleDate,
          start_time: '09:00',
          end_time: '10:00',
          category: 'Révision',
          color_key: 'purple',
          notes: `Prochaine révision transversale programmée après ${kindLabel(kind)}`,
        });
        setScheduled(true);
      }
    } catch { /* non bloquant */ }
    setScheduling(false);
  };
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
          {score}/{total} réponses correctes
        </p>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-(--color-ink-soft)">
          {messages.body}
        </p>

        {recordError && (
          <p className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#FCEAEC] px-3 py-2 text-xs font-medium text-[#A91D2C]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Erreur lors de l&apos;enregistrement de la session. Vos résultats n&apos;ont pas été sauvegardés.
          </p>
        )}
      </div>

      {/* Weak specialties */}
      {tier !== 'green' && weakSpecs.length > 0 && (
        <div className="mt-6 rounded-xl border p-4" style={{ borderColor: config.ringColor + '40', background: config.iconBg }}>
          <p className="text-sm font-bold" style={{ color: config.iconFg }}>
            {tier === 'red' ? 'Spécialités les plus faibles :' : 'Spécialités à surveiller :'}
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

        {/* Orange/Red: consolidation/renforcement buttons → link to weakest specialty */}
        {tier === 'orange' && weakSpecs.length > 0 && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#E8742C] border-[#E8742C] hover:bg-[#FFF7E6]">
            <Link href={`/cours/${weakSpecs[0].coursId}`}>
              <Shield className="h-4 w-4" /> Consolider la spécialité
            </Link>
          </Button>
        )}
        {tier === 'red' && weakSpecs.length > 0 && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#A91D2C] border-[#A91D2C] hover:bg-[#FCEAEC]">
            <Link href={`/cours/${weakSpecs[0].coursId}`}>
              <Zap className="h-4 w-4" /> Renforcement approfondi
            </Link>
          </Button>
        )}

        {/* Programmer prochaine révision */}
        {isReeval && !scheduled && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
              className="flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
            <Button
              onClick={handleSchedule}
              disabled={!scheduleDate || scheduling}
              variant="outline"
              className="shrink-0 rounded-xl py-2.5 text-sm font-bold text-[#6D28D9] border-[#6D28D9] hover:bg-[#F5F3FF]"
            >
              <CalendarPlus className="mr-1.5 h-4 w-4" /> Programmer
            </Button>
          </div>
        )}
        {isReeval && scheduled && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-[#16793C]/30 bg-[#ECFDF3] px-4 py-2.5 text-sm font-medium text-[#16793C]">
            <CheckCircle2 className="h-4 w-4" /> Révision programmée le {new Date(scheduleDate).toLocaleDateString('fr-FR')}
          </p>
        )}

        {/* Demander un accompagnement — bilan global rouge */}
        {kind === 'bilan_global' && tier === 'red' && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#6D28D9] border-[#6D28D9] hover:bg-[#F5F3FF]">
            <Link href="/contact">
              <MessageCircle className="h-4 w-4" /> Demander un accompagnement
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
            <p className="text-sm font-semibold text-(--color-ink)"><RichText html={q.enonce} /></p>
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
    daily: 'Révision du jour',
    recommended: 'Révision recommandée',
    intensive: 'Révision intensive',
    reevaluation: 'Réévaluation',
    reevaluation_deep: 'Réévaluation approfondie',
    bilan_global: 'Bilan global',
  }[k] ?? 'Révision';
}
