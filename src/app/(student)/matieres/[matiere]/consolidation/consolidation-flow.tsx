'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Eye, RefreshCcw, Shield, Target, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QcmEngine, type EngineQuestion, type EngineResult } from '@/components/student/qcm-engine';
import { saveConsolidationSession } from '../evaluation/actions';
import { saveSpecialtyEvaluation } from '../evaluation/actions';

type Phase = 'intro' | 'qcm' | 'qcm_done' | 'mini_eval' | 'result';

const STATUS = {
  green: { label: 'Spécialité validée', color: '#16793C', bg: '#ECFDF3', Icon: CheckCircle2,
    title: 'Progression confirmée', body: 'Votre niveau est désormais satisfaisant.' },
  orange: { label: 'Spécialité fragile', color: '#E8742C', bg: '#FFF7E6', Icon: Shield,
    title: 'Progression partielle', body: 'La spécialité reste fragile. Nous vous recommandons de poursuivre les révisions.' },
  red: { label: 'Spécialité insuffisamment maîtrisée', color: '#A91D2C', bg: '#FCEAEC', Icon: Zap,
    title: 'Les difficultés persistent', body: 'Un renforcement approfondi est recommandé.' },
} as const;

export function ConsolidationFlow({
  matiereId,
  matiereName,
  consolidationQuestions,
  miniEvalQuestions,
}: {
  matiereId: string;
  matiereName: string;
  consolidationQuestions: EngineQuestion[];
  miniEvalQuestions: EngineQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [consolResult, setConsolResult] = useState<EngineResult | null>(null);
  const [evalResult, setEvalResult] = useState<EngineResult | null>(null);
  const [, startTransition] = useTransition();

  const handleConsolComplete = (r: EngineResult) => {
    setConsolResult(r);
    setPhase('qcm_done');
    startTransition(async () => {
      await saveConsolidationSession({
        matiere_id: matiereId,
        phase: 'qcm',
        qcm_count: r.total,
        score_correct: r.score,
      });
    });
  };

  const handleEvalComplete = (r: EngineResult) => {
    setEvalResult(r);
    setPhase('result');
    startTransition(async () => {
      await saveConsolidationSession({
        matiere_id: matiereId,
        phase: 'mini_eval',
        qcm_count: r.total,
        score_correct: r.score,
      });
      await saveSpecialtyEvaluation({
        matiere_id: matiereId,
        eval_type: 'consolidation_mini_eval',
        score_correct: r.score,
        score_total: r.total,
      });
    });
  };

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF7E6]">
          <Target className="h-8 w-8 text-[#E8742C]" />
        </div>
        <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
          Consolidation {matiereName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
          Cette session vise à renforcer les notions fragiles de la spécialité.
          Elle repose sur des QCM ciblés, notamment des questions jamais vues, anciennes ou déjà ratées.
        </p>
        <p className="mt-4 text-xs text-(--color-ink-muted)">
          {consolidationQuestions.length} QCM ciblés · 30 à 40 minutes
        </p>
        <div className="mt-8">
          <Button onClick={() => setPhase('qcm')} className="rounded-xl px-8 py-3 text-sm font-bold" style={{ background: '#E8742C' }}>
            Commencer la consolidation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'qcm') {
    return (
      <QcmEngine
        questions={consolidationQuestions}
        title={`Consolidation ${matiereName}`}
        onComplete={handleConsolComplete}
      />
    );
  }

  if (phase === 'qcm_done') {
    const pct = consolResult ? Math.round((consolResult.score / consolResult.total) * 100) : 0;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <CheckCircle2 className="h-8 w-8 text-[#6D28D9]" />
        </div>
        <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
          Consolidation terminée
        </h1>
        <p className="mt-2 text-lg font-bold tabular-nums text-[#6D28D9]">
          Score : {pct} %
        </p>
        <p className="mt-4 text-sm leading-relaxed text-(--color-ink-soft)">
          Pour vérifier votre progression, une mini-évaluation de {miniEvalQuestions.length} QCM vous est proposée.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setPhase('mini_eval')} className="rounded-xl px-8 py-3 text-sm font-bold" style={{ background: '#6D28D9' }}>
            Lancer la mini-évaluation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" className="rounded-xl py-3 text-sm font-bold">
            <Link href="/revisions-transversales">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'mini_eval') {
    return (
      <QcmEngine
        questions={miniEvalQuestions}
        title={`Mini-évaluation ${matiereName}`}
        onComplete={handleEvalComplete}
      />
    );
  }

  // Result phase
  const pct = evalResult ? Math.round((evalResult.score / evalResult.total) * 100) : 0;
  const tier = pct >= 75 ? 'green' : pct >= 50 ? 'orange' : 'red';
  const config = STATUS[tier];

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
        {tier === 'red' && (
          <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#A91D2C' }}>
            <Link href={`/matieres/${matiereId}/renforcement`}>
              <Zap className="mr-2 h-4 w-4" /> Lancer un renforcement approfondi
            </Link>
          </Button>
        )}
        {tier === 'orange' && (
          <Button asChild variant="outline" className="w-full rounded-xl py-3 text-sm font-bold text-[#E8742C] border-[#E8742C]">
            <Link href={`/matieres/${matiereId}/consolidation`}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refaire une consolidation plus tard
            </Link>
          </Button>
        )}
        {tier === 'green' && (
          <Button asChild className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#16793C' }}>
            <Link href={`/matieres/${matiereId}`}>
              <ArrowRight className="mr-2 h-4 w-4" /> Continuer ma progression
            </Link>
          </Button>
        )}
        <Button asChild variant="ghost" className="w-full rounded-xl py-3 text-sm font-bold">
          <Link href="/accueil">
            Retour au dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
