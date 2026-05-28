'use client';

import { useTransition } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { toggleFormActiveAction, deleteFormAction } from '@/app/admin/formulaires/actions';

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(async () => { await toggleFormActiveAction(id, !active); })}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs text-(--color-ink-soft) hover:text-(--color-ink)"
      title={active ? 'Désactiver' : 'Activer'}
    >
      {active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {active ? 'Désactiver' : 'Activer'}
    </button>
  );
}

export function DeleteFormButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  const onClick = () => {
    if (!confirm(`Supprimer le formulaire « ${title} » et toutes ses réponses ?`)) return;
    start(async () => { await deleteFormAction(id); });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs text-(--color-danger) hover:bg-(--color-danger)/10"
      title="Supprimer"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Supprimer
    </button>
  );
}
