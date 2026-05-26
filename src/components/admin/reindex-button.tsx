'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Loader2, RefreshCcw } from 'lucide-react';
import { reindexCoursAction } from '@/app/admin/contenu/[cours]/actions';

/**
 * Bouton « Réindexer pour l'assistant IA » — déclenche le calcul d'embeddings
 * des flashcards + items QCM du cours, stockés dans `cours_chunks`.
 *
 * Coût : ~0,01 € par cours, à refaire après tout changement de contenu.
 */
export function ReindexButton({ coursId }: { coursId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onClick = () => {
    if (!confirm("Recalculer les embeddings pour l'assistant IA ?\nCoût négligeable (~0,01 €).")) return;
    setError(null); setDone(null);
    start(async () => {
      const res = await reindexCoursAction(coursId);
      if ('error' in res) setError(res.error);
      else {
        setDone(`${res.chunks} chunks indexés (${res.tokens} tokens).`);
        router.refresh();
        setTimeout(() => setDone(null), 5000);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--color-surface) text-(--color-primary)">
          <Database className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-(--color-ink)">Index assistant IA</p>
          <p className="mt-0.5 text-xs text-(--color-ink-soft)">
            Recalcule les embeddings des flashcards et QCM pour que le chatbot du cours retrouve
            l’information pertinente. À relancer après chaque modification de contenu.
          </p>
        </div>
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-semibold text-(--color-ink) hover:border-(--color-primary)/40 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          Réindexer
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-(--color-danger)">{error}</p>}
      {done && <p className="mt-2 text-xs font-semibold text-[#1F6B43]">✓ {done}</p>}
    </div>
  );
}
