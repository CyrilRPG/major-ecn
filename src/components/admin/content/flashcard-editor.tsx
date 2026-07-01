'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlashcardRichField } from './flashcard-rich-field';
import { FlashcardEditDialog } from './flashcard-edit-dialog';
import { deleteFlashcardAction, upsertFlashcardAction } from '@/app/admin/contenu/[cours]/qcm-actions';
import { sanitizeFlashcardHtml, flashcardHasContent } from '@/lib/flashcards/rich-text';

export type FlashcardRow = { id: string; recto: string; verso: string; order_index: number };

export function FlashcardEditor({ coursId, initial }: { coursId: string; initial: FlashcardRow[] }) {
  const [recto, setRecto] = useState('');
  const [verso, setVerso] = useState('');
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<FlashcardRow | null>(null);
  const router = useRouter();

  const canAdd = flashcardHasContent(recto) && flashcardHasContent(verso);

  const add = () => {
    if (!canAdd) return;
    start(async () => {
      await upsertFlashcardAction({ coursId, recto, verso });
      setRecto(''); setVerso('');
      router.refresh();
    });
  };

  const remove = (id: string) => {
    if (!confirm('Supprimer cette flashcard ? Elle pourra être restaurée depuis les logs.')) return;
    start(async () => {
      await deleteFlashcardAction(id, coursId);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FlashcardRichField
          coursId={coursId}
          value={recto}
          onChange={setRecto}
          label="Recto (question / mot-clé)"
          placeholder="Glycolyse"
        />
        <FlashcardRichField
          coursId={coursId}
          value={verso}
          onChange={setVerso}
          label="Verso (réponse complète)"
          placeholder="Voie cytosolique convertissant le glucose en 2 pyruvates…"
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={add} disabled={pending || !canAdd}>
          {pending ? <Loader2 className="animate-spin" /> : <Plus />}
          Ajouter la carte
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {initial.length === 0 ? (
          <p className="text-sm italic text-(--color-ink-soft)">Aucune flashcard pour ce cours.</p>
        ) : (
          initial.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div
                  className="text-sm font-medium text-(--color-ink) [&_img]:mt-1 [&_img]:max-h-16 [&_img]:rounded"
                  dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(c.recto) }}
                />
                <div
                  className="text-sm text-(--color-ink-soft) [&_img]:mt-1 [&_img]:max-h-16 [&_img]:rounded"
                  dangerouslySetInnerHTML={{ __html: sanitizeFlashcardHtml(c.verso) }}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(c)} disabled={pending} title="Modifier">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove(c.id)} disabled={pending} className="text-(--color-danger)" title="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {editing && (
        <FlashcardEditDialog
          open={!!editing}
          onOpenChange={(v) => { if (!v) setEditing(null); }}
          coursId={coursId}
          flashcardId={editing.id}
          initialRecto={editing.recto}
          initialVerso={editing.verso}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
