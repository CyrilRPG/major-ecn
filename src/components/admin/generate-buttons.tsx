'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ClipboardList, FileWarning, Layers3, Loader2, Sparkles } from 'lucide-react';
import { generateFlashcardsAction, generateQcmAction } from '@/app/admin/contenu/[cours]/actions';

type Kind = 'flashcards' | 'qcm';

const META: Record<Kind, { label: string; price: string; sub: string; Icon: typeof Layers3 }> = {
  flashcards: {
    label: 'Générer flashcards exhaustifs',
    price: '5 €',
    sub: '30 à 200 cartes, calquées EDN, justifiées, sans contenu hors-sujet',
    Icon: Layers3,
  },
  qcm: {
    label: 'Générer 20 QCM (2 séries Cours + 2 DP)',
    price: '2 €',
    sub: '4 séries de 5 questions : 2 séries de Cours (questions isolées) + 2 dossiers progressifs (vignette + 5 questions enchaînées, style annales). Format EDN.',
    Icon: ClipboardList,
  },
};

export function GenerateButton({ coursId, kind }: { coursId: string; kind: Kind }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [needsFiche, setNeedsFiche] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const m = META[kind];
  const Icon = m.Icon;

  const onClick = () => {
    if (!confirm(`Lancer "${m.label}" pour ce cours ?\n\nFacturation : ${m.price}.\nL'opération peut prendre 30 à 90 secondes.`)) return;
    setError(null); setNeedsFiche(false); setDone(null);
    start(async () => {
      const action = kind === 'flashcards' ? generateFlashcardsAction : generateQcmAction;
      const res = await action(coursId);
      if ('error' in res) {
        setError(res.error);
        if (res.needsFiche) setNeedsFiche(true);
      }
      else {
        setDone(`${res.count} ${kind === 'flashcards' ? 'cartes' : 'questions'} générées.`);
        router.refresh();
        setTimeout(() => setDone(null), 4000);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-(--color-primary)/25 bg-(--color-primary-soft)/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-primary) text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
            <Sparkles className="h-3.5 w-3.5 text-(--color-primary)" />
            Génération IA — {m.label}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-(--color-ink-soft)">{m.sub}</p>
        </div>
        <span className="rounded-full bg-(--color-primary) px-2.5 py-1 text-xs font-bold text-white">
          {m.price}
        </span>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {pending ? 'Génération en cours…' : m.label}
      </button>
      {error && !needsFiche && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-(--color-danger)">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      {needsFiche && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-(--color-warning)/35 bg-[color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))] px-3 py-2.5 text-xs text-(--color-ink)">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-(--color-warning)" />
          <div>
            <p className="font-semibold">Fiche manquante</p>
            <p className="mt-0.5 text-(--color-ink-soft)">
              {error}
            </p>
            <p className="mt-1.5 text-(--color-ink-soft)">
              👉 Va dans l’onglet <span className="font-semibold text-(--color-ink)">Fiche</span> juste au-dessus
              pour téléverser un PDF, puis relance la génération.
            </p>
          </div>
        </div>
      )}
      {done && (
        <p className="mt-3 text-xs font-semibold text-[#1F6B43]">✓ {done}</p>
      )}
    </div>
  );
}
