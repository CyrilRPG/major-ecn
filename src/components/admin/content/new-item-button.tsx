'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCoursAction } from '@/app/admin/contenu/actions';

/**
 * Crée un item dans un collège depuis la liste Contenu. Le nouvel item est
 * placé EN TÊTE (les « Révisions … » se rangent naturellement en premier) et
 * l'administrateur est emmené directement sur sa page d'édition.
 */
export function NewItemButton({ matiereId, matiereNom }: { matiereId: string; matiereNom: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    if (!titre.trim()) return setError('Donnez un titre.');
    start(async () => {
      const res = await createCoursAction({ matiereId, titre });
      if ('error' in res) return setError(res.error);
      setOpen(false);
      setTitre('');
      router.push(`/admin/contenu/${res.coursId}`);
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Nouvel item
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        autoFocus
        type="text"
        value={titre}
        placeholder={`Titre de l’item — ${matiereNom}`}
        onChange={(e) => setTitre(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        className="w-64 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sm"
      />
      <Button type="button" size="sm" onClick={submit} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        Créer
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => { setOpen(false); setError(null); }} disabled={pending}>
        Annuler
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
