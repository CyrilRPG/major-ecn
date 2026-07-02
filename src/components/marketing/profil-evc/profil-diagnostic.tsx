'use client';

import { useState, useCallback } from 'react';
import { ProfilIntro } from './profil-intro';
import { ProfilInfoForm, type DiagInfo } from './profil-info-form';
import { ProfilQuestions } from './profil-questions';
import { ProfilResult } from './profil-result';
import {
  computeScore, computeProfile, answerLabel, answerLabels, MAX_SCORE, type Answers, type ProfileKey,
} from '@/lib/diagnostic/scoring';

type Step = 'intro' | 'form' | 'questions' | 'result';

export type DiagResult = {
  score: number;
  profileKey: ProfileKey;
  profileLabel: string;
};

function trackEvent(name: string, data?: Record<string, string | number>) {
  try {
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).dataLayer?.push({ event: name, ...data });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && 'gtag' in window) (window as any).gtag('event', name, data);
  } catch {}
}

export function ProfilDiagnostic({
  startStep = 'intro',
  onResult,
}: {
  startStep?: Step;
  /** Notifie le parent (popup) quand le résultat est atteint (pour ajuster l'UI). */
  onResult?: (r: DiagResult) => void;
}) {
  const [step, setStep] = useState<Step>(startStep);
  const [info, setInfo] = useState<DiagInfo | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<DiagResult | null>(null);

  const handleInfo = useCallback((data: DiagInfo) => {
    setInfo(data);
    setStep('questions');
    trackEvent('profil_evc_started');
  }, []);

  const handleComplete = useCallback((finalAnswers: Answers) => {
    const score = computeScore(finalAnswers);
    const profile = computeProfile(score, finalAnswers);
    setAnswers(finalAnswers);
    const r: DiagResult = { score, profileKey: profile.key, profileLabel: profile.label };
    setResult(r);
    setStep('result');
    onResult?.(r);
    trackEvent('profil_evc_completed', { score, profile: profile.key });

    // Enregistrement du lead (best-effort, n'interrompt jamais l'affichage du résultat).
    if (info) {
      const [firstName, ...rest] = info.fullName.split(' ');
      const q10 = finalAnswers['q10_obstacle'];
      const obstacle = q10?.values?.length
        ? answerLabels('q10_obstacle', q10.values)
        : answerLabel('q10_obstacle', q10?.value ?? '');
      const answersReadable: Record<string, string> = {};
      for (const [qid, a] of Object.entries(finalAnswers)) {
        const label = a.values?.length ? answerLabels(qid, a.values) : answerLabel(qid, a.value);
        answersReadable[qid] = label + (a.detail ? ` — ${a.detail}` : '');
      }
      fetch('/api/diagnostic-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || info.fullName,
          lastName: rest.join(' '),
          email: info.email,
          phone: info.phone,
          specialty: info.specialty,
          voie: info.voie,
          sessionEvc: info.sessionEvc,
          score,
          maxScore: MAX_SCORE,
          profileKey: profile.key,
          profileLabel: profile.label,
          obstacle,
          answers: answersReadable,
        }),
      }).catch(() => {});
    }
  }, [info, onResult]);

  if (step === 'intro') return <ProfilIntro onStart={() => setStep('form')} />;
  if (step === 'form') return <ProfilInfoForm initial={info ?? undefined} onSubmit={handleInfo} />;
  if (step === 'questions') {
    return (
      <ProfilQuestions
        initial={answers}
        onComplete={handleComplete}
        onBack={() => setStep('form')}
      />
    );
  }
  return <ProfilResult profileKey={result!.profileKey} />;
}
