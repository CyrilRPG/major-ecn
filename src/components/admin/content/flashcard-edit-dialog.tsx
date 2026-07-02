'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { FlashcardRichField } from './flashcard-rich-field';
import { upsertFlashcardAction } from '@/app/admin/contenu/[cours]/qcm-actions';
import { flashcardHasContent } from '@/lib/flashcards/rich-text';

export function FlashcardEditDialog({
  open, onOpenChange, coursId, flashcardId, initialRecto, initialVerso, insertAnchor, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  coursId: string;
  flashcardId?: string;          // si fourni → édition, sinon → création
  initialRecto?: string;
  initialVerso?: string;
  /** En création : position de la carte à côté de laquelle on insère. */
  insertAnchor?: { orderIndex: number; position: number } | null;
  onSaved?: () => void;
}) {
  const [recto, setRecto] = useState(initialRecto ?? '');
  const [verso, setVerso] = useState(initialVerso ?? '');
  const [atEnd, setAtEnd] = useState(false); // false = insérer ici, true = à la fin
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const isCreate = !flashcardId;
  const showPositionChoice = isCreate && !!insertAnchor;

  useEffect(() => {
    if (open) {
      setRecto(initialRecto ?? '');
      setVerso(initialVerso ?? '');
      setAtEnd(false);
      setErr(null);
    }
  }, [open, initialRecto, initialVerso]);

  const canSave = flashcardHasContent(recto) && flashcardHasContent(verso);

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await upsertFlashcardAction({
        id: flashcardId,
        coursId,
        recto,
        verso,
        insertAfterOrderIndex: showPositionChoice && !atEnd ? insertAnchor!.orderIndex : null,
      });
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
            Mettez en forme le texte (gras, italique, souligné, couleur) et ajoutez une image si besoin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <FlashcardRichField coursId={coursId} value={recto} onChange={setRecto} label="Recto" placeholder="Glycolyse" />
          <FlashcardRichField coursId={coursId} value={verso} onChange={setVerso} label="Verso" placeholder="Voie cytosolique convertissant le glucose en 2 pyruvates…" />

          {showPositionChoice && (
            <div className="space-y-1.5">
              <span className="text-sm font-medium text-(--color-ink)">Position</span>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${!atEnd ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                  <input type="radio" name="fc-pos" checked={!atEnd} onChange={() => setAtEnd(false)} className="h-4 w-4" />
                  Insérer ici (après la carte n°{insertAnchor!.position + 1})
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${atEnd ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}>
                  <input type="radio" name="fc-pos" checked={atEnd} onChange={() => setAtEnd(true)} className="h-4 w-4" />
                  À la fin
                </label>
              </div>
            </div>
          )}

          {err && <p className="rounded-lg bg-(--color-primary-soft) px-3 py-2 text-xs text-(--color-primary-deep)">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-(--color-border) pt-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>Annuler</Button>
          <Button type="button" onClick={submit} disabled={pending || !canSave}>
            {pending ? <Loader2 className="animate-spin" /> : (flashcardId ? <Pencil /> : <Plus />)}
            {flashcardId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
