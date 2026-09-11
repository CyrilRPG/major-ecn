'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Pencil, RotateCcw, X } from 'lucide-react';
import { renameRubriqueAction } from '@/app/admin/videos/actions';
import { rubriqueParDefaut } from '@/lib/videos/rubriques';

/**
 * Crayon à côté d'un intitulé de rubrique vidéo (« Séance intensive »,
 * « Séances approfondies… ») dans la vue étudiant : le personnel renomme la
 * rubrique sans passer par l'administration. Le nouveau libellé est posé sur
 * toutes les vidéos de ce type de l'item ; vide = libellé par défaut.
 * Rendu uniquement pour l'admin et les professeurs (le serveur revérifie).
 */
export function RubriqueEditor({ coursId, type, value, className = '' }: { coursId: string; type: 'cours' | 'seance_approfondie'; value: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const defaut = rubriqueParDefaut(type);

  const save = (libelle: string) => {
    setError(null);
    start(async () => {
      const r = await renameRubriqueAction({ coursId, type, rubrique: libelle });
      if ('error' in r) { setError(r.error); return; }
      setOpen(false);
      router.refresh();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setDraft(value); setOpen(true); }}
        title="Renommer cette rubrique (personnel)"
        aria-label={`Renommer la rubrique « ${value} »`}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-(--color-ink-muted) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-primary) ${className}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <form
      className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}
      onSubmit={(e) => { e.preventDefault(); save(draft); }}
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={120}
        placeholder={defaut}
        aria-label="Nouvel intitulé de la rubrique"
        className="h-8 w-64 max-w-full rounded-md border border-(--color-border) bg-(--color-surface) px-2 text-sm font-medium normal-case tracking-normal text-(--color-ink) outline-none focus:border-(--color-primary)"
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
      />
      <button type="submit" disabled={pending} title="Enregistrer" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-(--color-primary) text-white disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </button>
      {value !== defaut && (
        <button type="button" disabled={pending} onClick={() => save('')} title={`Revenir au libellé par défaut « ${defaut} »`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-sand-100)">
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button type="button" onClick={() => setOpen(false)} title="Annuler" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border) text-(--color-ink-soft) hover:bg-(--color-sand-100)">
        <X className="h-4 w-4" />
      </button>
      {error && <span className="w-full text-xs font-semibold normal-case tracking-normal text-(--color-danger)">{error}</span>}
    </form>
  );
}
