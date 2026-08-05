'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { FlashcardRichField } from './flashcard-rich-field';
import { updateSerieVignetteAction } from '@/app/admin/contenu/[cours]/qcm-actions';

export function VignetteEditorDialog({
  open, onOpenChange, coursId, serieId, initial, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coursId: string;
  serieId: string;
  initial?: string | null;
  onSaved?: () => void;
}) {
  const [text, setText] = useState(initial ?? '');
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setText(initial ?? ''); setErr(null); }
  }, [open, initial]);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await updateSerieVignetteAction({ serieId, coursId, vignette: text });
      if ('error' in res) setErr(res.error);
      else { onSaved?.(); onOpenChange(false); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier le contexte clinique</DialogTitle>
          <DialogDescription>
            Vignette clinique commune à toutes les questions du DP. Affichée
            au-dessus de chaque question dans la vue étudiant. Laissez vide pour
            la retirer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Contexte clinique</Label>
          <FlashcardRichField
            coursId={coursId}
            value={text}
            onChange={setText}
            placeholder="Mme R., 68 ans, BPCO post-tabagique, consulte aux urgences pour une dyspnée d'aggravation progressive…"
            minHeight={160}
          />
          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-(--color-border)">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Pencil />}
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
