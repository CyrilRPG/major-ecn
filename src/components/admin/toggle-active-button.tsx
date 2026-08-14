'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';

export function ToggleActiveButton({
  userId,
  displayName,
  isActive,
}: {
  userId: string;
  displayName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const next = !isActive;

  const onConfirm = () => {
    setError(null);
    start(async () => {
      const res = await fetchAvecJetonFrais('/api/admin/toggle-active', { userId, isActive: next });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Échec de la mise à jour.');
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
          aria-label={isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
        >
          {isActive
            ? <Power className="h-4 w-4 text-(--color-success)" />
            : <PowerOff className="h-4 w-4 text-(--color-ink-muted)" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {next ? 'Réactiver le compte' : 'Désactiver le compte'}
          </DialogTitle>
          <DialogDescription>
            {next ? (
              <>
                Réactiver l&rsquo;accès de <span className="font-semibold text-(--color-ink)">{displayName}</span>.
                Le mot de passe d&rsquo;origine continuera à fonctionner — comme s&rsquo;il n&rsquo;y avait jamais eu de
                désactivation.
              </>
            ) : (
              <>
                Bloquer l&rsquo;accès de <span className="font-semibold text-(--color-ink)">{displayName}</span>.
                Aucune donnée n&rsquo;est supprimée. Vous pourrez réactiver le compte plus tard ; le mot de
                passe d&rsquo;origine fonctionnera à nouveau.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">{error}</p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={pending}
            className={next ? '' : 'bg-(--color-danger) hover:bg-(--color-danger)/90'}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : next ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
            {next ? 'Réactiver' : 'Désactiver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
