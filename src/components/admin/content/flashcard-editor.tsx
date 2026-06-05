'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FlashcardEditDialog } from './flashcard-edit-dialog';
import { deleteFlashcardAction, upsertFlashcardAction } from '@/app/admin/contenu/[cours]/qcm-actions';

export type FlashcardRow = { id: string; recto: string; verso: string; order_index: number };

export function FlashcardEditor({ coursId, initial }: { coursId: string; initial: FlashcardRow[] }) {
  const [recto, setRecto] = useState('');
  const [verso, setVerso] = useState('');
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<FlashcardRow | null>(null);
  const router = useRouter();

  const add = () => {
    if (!recto.trim() || !verso.trim()) return;
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fc-recto">Recto (question / mot-clé)</Label>
          <Input id="fc-recto" value={recto} onChange={(e) => setRecto(e.target.value)} placeholder="Glycolyse" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fc-verso">Verso (réponse complète)</Label>
          <Textarea id="fc-verso" value={verso} onChange={(e) => setVerso(e.target.value)} placeholder="Voie cytosolique convertissant le glucose en 2 pyruvates avec un bilan net de 2 ATP…" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={add} disabled={pending || !recto.trim() || !verso.trim()}>
          {pending ? <Loader2 className="animate-spin" /> : <Plus />}
          Ajouter la carte
        </Button>
      </div>

      <div className="space-y-2 mt-6">
        {initial.length === 0 ? (
          <p className="text-sm text-(--color-ink-soft) italic">Aucune flashcard pour ce cours.</p>
        ) : (
          initial.map((c) => (
            <div key={c.id} className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-(--color-ink) text-sm">{c.recto}</p>
                <p className="text-sm text-(--color-ink-soft) mt-0.5">{c.verso}</p>
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
