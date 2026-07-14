'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gradeExamWithAI } from '@/app/(student)/epreuves-blanches/actions';

/**
 * Écran « votre copie est en cours de correction » : déclenche automatiquement
 * la correction IA à l'arrivée, puis rafraîchit vers les résultats.
 */
export function ExamGradingLoading({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    gradeExamWithAI({ submissionId }).then((res) => {
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-10 text-center shadow-(--shadow-soft)">
      <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-[pulse-soft_2s_ease-in-out_infinite] rounded-full bg-[#8B5CF6]/15" aria-hidden />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6]/10 text-[#6D28D9]">
          {error ? <Sparkles className="h-6 w-6" /> : <Loader2 className="h-7 w-7 animate-spin" />}
        </span>
      </span>
      {error ? (
        <>
          <h1 className="mt-5 font-display text-xl font-bold text-(--color-ink)">La correction a échoué</h1>
          <p className="mt-2 text-sm text-(--color-ink-soft)">{error}</p>
          <Button className="mt-5" onClick={run}>Réessayer la correction</Button>
        </>
      ) : (
        <>
          <h1 className="mt-5 font-display text-xl font-bold text-(--color-ink)">Votre copie est en cours de correction…</h1>
          <p className="mt-2 text-sm text-(--color-ink-soft)">L’intelligence artificielle analyse vos réponses. Cela prend quelques secondes — ne fermez pas cette page.</p>
        </>
      )}
    </div>
  );
}
