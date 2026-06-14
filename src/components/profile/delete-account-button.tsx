'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

/**
 * Permet à l'utilisateur connecté de supprimer son propre compte. Demande
 * une confirmation explicite via la saisie du mot « SUPPRIMER » pour éviter
 * un clic accidentel. Après suppression, signe out et redirige vers /.
 */
export function DeleteAccountButton({ disabled = false }: { disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const CONFIRM = 'SUPPRIMER';
  const enabled = typed === CONFIRM;

  const onDelete = () => {
    setError(null);
    start(async () => {
      const res = await fetch('/api/profile/delete', { method: 'POST' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors de la suppression.');
        return;
      }
      // Sign out côté client puis redirection.
      try { await createClient().auth.signOut(); } catch { /* ignore */ }
      router.push('/?account_deleted=1');
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setTyped(''); setError(null); } }}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} className="text-(--color-danger)">
          <Trash2 className="h-3.5 w-3.5" />
          Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-(--color-danger)">
            <AlertTriangle className="h-5 w-5" />
            Supprimer mon compte
          </DialogTitle>
          <DialogDescription>
            Cette action est <span className="font-semibold text-(--color-ink)">irréversible</span>.
            Toutes vos données (progression, sessions, flashcards, réponses) seront définitivement
            supprimées.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs text-(--color-ink-soft)">
            Pour confirmer, saisissez <span className="font-mono font-bold text-(--color-ink)">{CONFIRM}</span> :
          </p>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM}
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
          <Button
            type="button"
            variant="primary"
            onClick={onDelete}
            disabled={pending || !enabled}
            className="bg-(--color-danger) hover:bg-(--color-danger)/90"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
