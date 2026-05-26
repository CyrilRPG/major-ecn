'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

/**
 * Suppression définitive d'un compte étudiant ou professeur.
 * Confirmation par double-frappe du nom pour éviter les erreurs.
 */
export function DeleteAccountButton({ userId, displayName }: { userId: string; displayName: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onDelete = () => {
    setError(null);
    start(async () => {
      const res = await fetch('/api/admin/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Échec de la suppression.');
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  const confirmEnabled = typed.trim().toLowerCase() === displayName.trim().toLowerCase();

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setTyped(''); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Supprimer le compte" title="Supprimer le compte">
          <Trash2 className="h-4 w-4 text-(--color-danger)" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-(--color-danger)">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le compte
          </DialogTitle>
          <DialogDescription>
            Suppression <span className="font-semibold text-(--color-ink)">définitive</span> de{' '}
            <span className="font-semibold text-(--color-ink)">{displayName}</span>. Cette action ne
            peut pas être annulée. Tout le contenu lié (sessions, réponses, flashcards révisées)
            sera supprimé par cascade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs text-(--color-ink-soft)">
            Pour confirmer, saisissez le nom complet :
            <span className="ml-1 font-mono text-(--color-ink)">{displayName}</span>
          </p>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={displayName}
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
          <Button
            type="button"
            variant="primary"
            onClick={onDelete}
            disabled={pending || !confirmEnabled}
            className="bg-(--color-danger) hover:bg-(--color-danger)/90"
          >
            {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
