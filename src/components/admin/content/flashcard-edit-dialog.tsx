'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { upsertFlashcardAction } from '@/app/admin/contenu/[cours]/qcm-actions';

export function FlashcardEditDialog({
  open, onOpenChange, coursId, flashcardId, initialRecto, initialVerso, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coursId: string;
  flashcardId?: string;          // si fourni → édition, sinon → création
  initialRecto?: string;
  initialVerso?: string;
  onSaved?: () => void;
}) {
  const [recto, setRecto] = useState(initialRecto ?? '');
  const [verso, setVerso] = useState(initialVerso ?? '');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRecto(initialRecto ?? '');
      setVerso(initialVerso ?? '');
      setErr(null);
    }
  }, [open, initialRecto, initialVerso]);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await upsertFlashcardAction({ id: flashcardId, coursId, recto, verso });
      if ('error' in res) setErr(res.error);
      else { onSaved?.(); onOpenChange(false); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{flashcardId ? 'Modifier la flashcard' : 'Nouvelle flashcard'}</DialogTitle>
          <DialogDescription>
            Recto : question / mot-clé. Verso : réponse complète.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fc-recto-d">Recto</Label>
            <Input id="fc-recto-d" value={recto} onChange={(e) => setRecto(e.target.value)} placeholder="Glycolyse" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-verso-d">Verso</Label>
            <Textarea
              id="fc-verso-d" rows={5} value={verso}
              onChange={(e) => setVerso(e.target.value)}
              placeholder="Voie cytosolique convertissant le glucose en 2 pyruvates…"
            />
          </div>
          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-(--color-border)">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>Annuler</Button>
          <Button type="button" onClick={submit} disabled={pending || recto.trim().length < 2 || verso.trim().length < 2}>
            {pending ? <Loader2 className="animate-spin" /> : <Pencil />}
            {flashcardId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
