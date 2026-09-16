'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { selfPositionAction, startEvaluationAction } from '@/app/(student)/planificateur/actions';
import { DECLARED_LEVELS, DECLARED_LEVEL_LABEL } from '@/lib/plan/types';

/** Actions d'un item du programme complet : évaluation courte, auto-positionnement. */
export function ItemActions({ itemId, hasQuestions }: { itemId: string; hasQuestions: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState('');
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {hasQuestions && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => {
          setError(null);
          const r = await startEvaluationAction(itemId);
          if (!r.ok) { setError(r.error); return; }
          router.push(`/planificateur/evaluation/${r.id}`);
        })}>{pending ? <Loader2 className="animate-spin" /> : <ClipboardCheck />} Évaluer</Button>
      )}
      <select
        aria-label="Me repositionner"
        value={level}
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value; setLevel(v);
          if (!v) return;
          start(async () => { setError(null); const r = await selfPositionAction(itemId, v); if (!r.ok) setError(r.error); else { setLevel(''); router.refresh(); } });
        }}
        className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-xs text-(--color-ink)"
      >
        <option value="">Me repositionner…</option>
        {DECLARED_LEVELS.map((l) => <option key={l} value={l}>{DECLARED_LEVEL_LABEL[l]}</option>)}
      </select>
      {error && <span className="text-xs text-(--color-danger)">{error}</span>}
    </span>
  );
}
