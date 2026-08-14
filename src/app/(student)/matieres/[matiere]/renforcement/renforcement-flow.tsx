'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ExternalLink,
  FileText, Layers3, MessageCircle, Shield, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QcmEngine, type EngineQuestion, type EngineResult } from '@/components/student/qcm-engine';
import { saveRenforcementStep, saveSpecialtyEvaluation } from '../evaluation/actions';

type Phase = 'intro' | 'fiches' | 'flashcards' | 'qcm' | 'qcm_done' | 'eval' | 'result';

const STEPS = [
  { n: 1, label: 'Revoir les fiches essentielles', Icon: FileText },
  { n: 2, label: 'Travailler les flashcards', Icon: Layers3 },
  { n: 3, label: 'Faire une série renforcée de QCM', Icon: BookOpen },
  { n: 4, label: 'Passer une nouvelle évaluation', Icon: CheckCircle2 },
];

const RESULT = {
  green: { label: 'Spécialité validée', color: '#16793C', bg: '#ECFDF3', Icon: CheckCircle2,
    title: 'Très bonne progression', body: 'Cette spécialité est désormais considérée comme validée.' },
  orange: { label: 'Spécialité fragile', color: '#E8742C', bg: '#FFF7E6', Icon: Shield,
    title: 'Votre niveau a progressé, mais certaines notions restent fragiles',
    body: 'Une consolidation est recommandée.' },
  red: { label: 'Spécialité toujours insuffisamment maîtrisée', color: '#A91D2C', bg: '#FCEAEC', Icon: Zap,
    title: 'Votre niveau reste insuffisant sur cette spécialité',
    body: 'Nous vous recommandons de reprendre le parcours de renforcement ou de demander un accompagnement pédagogique.' },
} as const;

export function RenforcementFlow({
  matiereId,
  matiereName,
  coursFiches,
  coursFlashcards,
  qcmQuestions,
  evalQuestions,
  initialCompleted = [],
}: {
  matiereId: string;
  matiereName: string;
  /** Cours de la spécialité disposant d'une fiche (étape 1). */
  coursFiches: { id: string; titre: string }[];
  /** Cours de la spécialité disposant de flashcards (étape 2). */
  coursFlashcards: { id: string; titre: string }[];
  qcmQuestions: EngineQuestion[];
  evalQuestions: EngineQuestion[];
  /** Étapes déjà terminées (reprise d'un parcours en cours — renforcement_progress). */
  initialCompleted?: number[];
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set(initialCompleted));
  const [startedSteps, setStartedSteps] = useState<Set<number>>(new Set());
  const [evalResult, setEvalResult] = useState<EngineResult | null>(null);
  const [, startTransition] = useTransition();

  const markStep = (step: number) => setCompletedSteps((prev) => new Set([...prev, step]));

  // Statut d'étape (spec section 12) : Non commencé / En cours / Terminé.
  const stepStatus = (n: number): 'done' | 'ongoing' | 'todo' =>
    completedSteps.has(n) ? 'done' : startedSteps.has(n) ? 'ongoing' : 'todo';

  const handleQcmComplete = (r: EngineResult) => {
    markStep(3);
    setPhase('qcm_done');
    startTransition(async () => {
      await saveRenforcementStep({ matiere_id: matiereId, step: 'qcm', score: r.score, total: r.total });
    });
  };

  const handleEvalComplete = (r: EngineResult) => {
    markStep(4);
    setEvalResult(r);
    setPhase('result');
    startTransition(async () => {
      await saveRenforcementStep({ matiere_id: matiereId, step: 'eval', score: r.score, total: r.total });
      // Évaluation OFFICIELLE : change le statut + déroule la chaîne d'alertes.
      await saveSpecialtyEvaluation({
        matiere_id: matiereId,
        eval_type: 'renforcement_eval',
        score_correct: r.score,
        score_total: r.total,
      });
    });
  };

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FCEAEC]">
            <Zap className="h-8 w-8 text-[#A91D2C]" />
          </div>
          <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
            Renforcement approfondi — {matiereName}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
            Votre niveau actuel montre que les bases de cette spécialité doivent être retravaillées.
            Ce parcours vous aide à reprendre les points essentiels avant une nouvelle évaluation.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {STEPS.map((s) => {
            const st = stepStatus(s.n);
            return (
              <div
                key={s.n}
                className={cn(
                  'flex items-center gap-4 rounded-xl border px-4 py-3',
                  st === 'done' ? 'border-[#16793C] bg-[#ECFDF3]' : st === 'ongoing' ? 'border-[#E8742C] bg-[#FFF7E6]' : 'border-(--color-border)',
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  st === 'done' ? 'bg-[#16793C] text-white' : st === 'ongoing' ? 'bg-[#E8742C] text-white' : 'bg-(--color-surface) text-(--color-ink-soft)',
                )}>
                  {st === 'done' ? <Check className="h-4 w-4" /> : s.n}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-(--color-ink)">
                    <s.Icon className="h-4 w-4 shrink-0 text-(--color-ink-soft)" />
                    {s.label}
                  </div>
                  <p className="mt-0.5 text-[11px] font-semibold" style={{ color: st === 'done' ? '#16793C' : st === 'ongoing' ? '#B45B00' : 'var(--color-ink-muted)' }}>
                    {st === 'done' ? 'Terminé' : st === 'ongoing' ? 'En cours' : 'Non commencé'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {!completedSteps.has(1) && (
            <Button
              onClick={() => { setStartedSteps((p) => new Set([...p, 1])); setPhase('fiches'); }}
              className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}
            >
              Commencer le renforcement approfondi <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {completedSteps.has(1) && !completedSteps.has(2) && (
            <Button
              onClick={() => { setStartedSteps((p) => new Set([...p, 2])); setPhase('flashcards'); }}
              className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}
            >
              Étape 2 : Flashcards <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {completedSteps.has(2) && !completedSteps.has(3) && (
            <Button onClick={() => setPhase('qcm')} className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}>
              Étape 3 : QCM de renforcement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {completedSteps.has(3) && !completedSteps.has(4) && (
            <Button onClick={() => setPhase('eval')} className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#6D28D9' }}>
              Étape 4 : Passer la nouvelle évaluation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
            <Link href={`/matieres/${matiereId}`}><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'fiches') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
            <FileText className="h-8 w-8 text-[#2563EB]" />
          </div>
          <h2 className="mt-6 text-xl font-black text-(--color-ink)">
            Revoir les fiches essentielles de {matiereName}
          </h2>
          <p className="mt-3 text-sm text-(--color-ink-soft)">
            Prenez le temps de relire les fiches de cours pour consolider les notions clés,
            puis validez l&apos;étape.
          </p>
        </div>

        {coursFiches.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-(--color-border) p-4 text-center text-sm text-(--color-ink-muted)">
            Aucune fiche disponible dans cette spécialité pour le moment.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {coursFiches.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cours/${c.id}/fiche`}
                  target="_blank"
                  className="flex items-center justify-between gap-3 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-ink) transition-colors hover:border-[#2563EB]/50 hover:bg-[#EFF6FF]/50"
                >
                  <span className="min-w-0 flex-1 truncate">{c.titre}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => { markStep(1); setPhase('intro'); startTransition(async () => { await saveRenforcementStep({ matiere_id: matiereId, step: 'fiches' }); }); }}
            className="rounded-xl py-3 text-sm font-bold" style={{ background: '#2563EB' }}
          >
            <Check className="mr-2 h-4 w-4" /> J&apos;ai terminé cette étape
          </Button>
          <Button onClick={() => setPhase('intro')} variant="ghost" className="rounded-xl py-3 text-sm font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au parcours
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'flashcards') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F3FF]">
            <Layers3 className="h-8 w-8 text-[#6D28D9]" />
          </div>
          <h2 className="mt-6 text-xl font-black text-(--color-ink)">
            Réactiver les notions clés
          </h2>
          <p className="mt-3 text-sm text-(--color-ink-soft)">
            20 à 30 flashcards recommandées pour réactiver les connaissances,
            puis validez l&apos;étape.
          </p>
        </div>

        {coursFlashcards.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-(--color-border) p-4 text-center text-sm text-(--color-ink-muted)">
            Aucune flashcard disponible dans cette spécialité pour le moment.
          </p>
        ) : (
          <ul className="mt-6 space-y-2">
            {coursFlashcards.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/cours/${c.id}/flashcards`}
                  target="_blank"
                  className="flex items-center justify-between gap-3 rounded-xl border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-ink) transition-colors hover:border-[#6D28D9]/50 hover:bg-[#F5F3FF]/50"
                >
                  <span className="min-w-0 flex-1 truncate">{c.titre}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-(--color-ink-muted)" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => { markStep(2); setPhase('intro'); startTransition(async () => { await saveRenforcementStep({ matiere_id: matiereId, step: 'flashcards' }); }); }}
            className="rounded-xl py-3 text-sm font-bold" style={{ background: '#6D28D9' }}
          >
            <Check className="mr-2 h-4 w-4" /> J&apos;ai terminé cette étape
          </Button>
          <Button onClick={() => setPhase('intro')} variant="ghost" className="rounded-xl py-3 text-sm font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au parcours
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'qcm') {
    return (
      <QcmEngine
        questions={qcmQuestions}
        title={`QCM de renforcement ${matiereName}`}
        onComplete={handleQcmComplete}
      />
    );
  }

  if (phase === 'qcm_done') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <CheckCircle2 className="h-8 w-8 text-[#6D28D9]" />
        </div>
        <h2 className="mt-6 text-xl font-black text-(--color-ink)">
          Vous avez terminé le parcours de renforcement
        </h2>
        <p className="mt-3 text-sm text-(--color-ink-soft)">
          Une nouvelle évaluation de {evalQuestions.length} QCM est proposée pour mesurer votre progression.
        </p>
        <div className="mt-8">
          <Button onClick={() => setPhase('eval')} className="rounded-xl px-8 py-3 text-sm font-bold" style={{ background: '#6D28D9' }}>
            Passer la nouvelle évaluation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'eval') {
    return (
      <QcmEngine
        questions={evalQuestions}
        title={`Évaluation ${matiereName}`}
        onComplete={handleEvalComplete}
      />
    );
  }

  // Result phase
  const pct = evalResult ? Math.round((evalResult.score / evalResult.total) * 100) : 0;
  const tier = pct >= 75 ? 'green' : pct >= 50 ? 'orange' : 'red';
  const config = RESULT[tier];

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
        {config.title}
      </h2>
      <p className="mt-2 text-lg font-bold tabular-nums" style={{ color: config.color }}>
        Score : {pct} %
      </p>
      <p className="mt-1 text-sm text-(--color-ink-soft)">
        {evalResult?.score}/{evalResult?.total} réponses correctes
      </p>
      <p className="mt-4 max-w-sm mx-auto text-sm leading-relaxed text-(--color-ink-soft)">
        {config.body}
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
          <>
            <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}>
              <Link href={`/matieres/${matiereId}/renforcement`}>
                <Zap className="mr-2 h-4 w-4" /> Reprendre le renforcement
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#6D28D9] border-[#6D28D9] hover:bg-[#F5F3FF]">
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" /> Demander un accompagnement
              </Link>
            </Button>
          </>
        )}
        <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
          <Link href="/accueil">Retour au dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
