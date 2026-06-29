'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Eye, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QcmEngine, type EngineQuestion, type EngineResult } from '@/components/student/qcm-engine';
import { saveSpecialtyEvaluation, checkAdminAlerts } from './actions';

type Phase = 'intro' | 'quiz' | 'result';

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
}: {
  matiereId: string;
  matiereName: string;
  questions: EngineQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<EngineResult | null>(null);
  const [, startTransition] = useTransition();

  const handleComplete = (r: EngineResult) => {
    setResult(r);
    setPhase('result');
    startTransition(async () => {
      await saveSpecialtyEvaluation({
        matiere_id: matiereId,
        eval_type: 'fin_specialite',
        score_correct: r.score,
        score_total: r.total,
      });
      await checkAdminAlerts(matiereId);
    });
  };

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2FF]">
          <Award className="h-8 w-8 text-[#6D28D9]" />
        </div>
        <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">
          Vous avez terminé le parcours {matiereName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">
          Une interrogation officielle Major EVC est disponible afin d'évaluer votre niveau et de valider cette spécialité.
        </p>
        <p className="mt-4 text-xs text-(--color-ink-muted)">
          {questions.length} QCM · 15 à 20 minutes
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => setPhase('quiz')} className="rounded-xl py-3 text-sm font-bold" style={{ background: '#6D28D9' }}>
            Passer l'interrogation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" className="rounded-xl py-3 text-sm font-bold">
            <Link href={`/matieres/${matiereId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Plus tard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    return (
      <QcmEngine
        questions={questions}
        title={`Interrogation ${matiereName}`}
        onComplete={handleComplete}
      />
    );
  }

  const pct = result ? Math.round((result.score / result.total) * 100) : 0;
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
        {result?.score}/{result?.total} réponses correctes
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
