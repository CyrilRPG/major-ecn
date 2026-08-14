'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Eye } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ImpersonateAction({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirm = () => {
    setError(null);
    start(async () => {
      // Jeton frais + Bearer : un cookie expiré (onglet admin resté ouvert)
      // ne peut plus répondre « Non authentifié » — cf. fresh-token.ts.
      const res = await fetchAvecJetonFrais('/api/admin/impersonate', {
        user_id: studentId,
        name: studentName,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Erreur lors de l’impersonation.');
        return;
      }
      setOpen(false);
      router.push('/app');
      router.refresh();
    });
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <LogIn className="h-3.5 w-3.5" />
        Se connecter en tant que
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-(--color-primary)" />
              Mode impersonation
            </DialogTitle>
            <DialogDescription>
              Tu vas voir l’interface telle que <strong>{studentName}</strong> la perçoit. Tu pourras revenir au panel admin à tout moment via le bandeau orange en haut de l’écran.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-(--color-danger)">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
            <Button onClick={handleConfirm} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
              Démarrer l’impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
