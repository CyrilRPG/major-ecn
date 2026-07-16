'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExamRunner } from '@/components/student/exam-runner';
import { ExamResults } from '@/components/student/exam-results';
import { SignaturePadScreen } from './interrogation-session';
import { saveInterrogationResult, saveSignature } from './actions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

/**
 * Interrogation de fin de parcours adossée au MOTEUR D'ÉPREUVE (QCM/QROC, DP,
 * correction auto ou IA). Rendue à l'URL `/cours/[id]/interrogation` — donc
 * compatible avec le verrou de fin de parcours du layout, sans redirection.
 *
 * Enchaînement : passation → remise (router.refresh) → résultats → signature du
 * certificat. Le score de la copie est reporté dans `parcours_completions`, puis
 * la signature renseigne `certificate_signed_at` qui lève le verrou.
 */
export function InterrogationExamFlow({
  coursId,
  coursTitre,
  firstName,
  lastName,
  exam,
  questions,
  submission,
  answers,
  collegeNames,
  alreadySigned,
}: {
  coursId: string;
  coursTitre: string;
  firstName: string;
  lastName: string;
  exam: { id: string; title: string; qroc_mode: 'self' | 'ai'; instructions: string; duration_minutes: number | null; question_order: 'fixed' | 'random' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: any[];
  submission: AnyRow | null;
  answers: AnyRow[];
  collegeNames: Record<string, string>;
  alreadySigned: boolean;
}) {
  const router = useRouter();
  const [signing, start] = useTransition();
  const [signPhase, setSignPhase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedRef = useRef(false);

  // Report du score de la copie dans le parcours (idempotent : upsert).
  useEffect(() => {
    if (!submission || savedRef.current) return;
    savedRef.current = true;
    void saveInterrogationResult({
      cours_id: coursId,
      score: Math.round(Number(submission.score ?? 0)),
      total: Math.round(Number(submission.max_score ?? 0)),
    });
  }, [submission, coursId]);

  // ── Pas encore composé → passation ──
  if (!submission) {
    return (
      <ExamRunner
        exam={{
          id: exam.id,
          title: exam.title,
          instructions: exam.instructions ?? '',
          duration_minutes: exam.duration_minutes,
          question_order: exam.question_order,
          scheduled: false,
          closesAt: null,
          startedAt: null,
        }}
        questions={questions}
      />
    );
  }

  // ── Signature du certificat ──
  if (signPhase && !alreadySigned) {
    return (
      <SignaturePadScreen
        firstName={firstName}
        lastName={lastName}
        coursTitre={coursTitre}
        onCancel={() => setSignPhase(false)}
        onConfirm={(dataUrl) => {
          setError(null);
          start(async () => {
            const r = await saveSignature({ cours_id: coursId, signature_data_url: dataUrl });
            if (r.ok) { setSignPhase(false); router.refresh(); }
            else setError(r.error);
          });
        }}
        pending={signing}
      />
    );
  }

  // ── Copie remise → résultats + signature ──
  return (
    <div className="space-y-6">
      {!alreadySigned && (
        <div className="rounded-2xl border-2 border-(--color-primary)/30 bg-(--color-primary-soft)/20 p-5 text-center">
          <Award className="mx-auto h-7 w-7 text-(--color-primary)" />
          <p className="mt-2 font-display text-lg font-bold text-(--color-ink)">Validez votre parcours</p>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Signez électroniquement le certificat pour terminer l’interrogation et débloquer la suite.
          </p>
          {error && <p className="mt-2 text-sm text-(--color-danger)">{error}</p>}
          <Button className="mt-4" onClick={() => setSignPhase(true)} disabled={signing}>
            {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Signer le certificat
          </Button>
        </div>
      )}
      {alreadySigned && (
        <div className="rounded-2xl border border-[#16A34A]/30 bg-[#E7F6EC] p-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold text-[#16793C]">
            <Check className="h-4 w-4" /> Parcours validé — certificat signé
          </p>
        </div>
      )}

      <ExamResults
        exam={{ id: exam.id, title: exam.title, qroc_mode: exam.qroc_mode }}
        submission={submission}
        questions={questions}
        answers={answers}
        collegeNames={collegeNames}
        leaderboard={null}
      />
    </div>
  );
}
