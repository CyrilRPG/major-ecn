'use client';

import { useRef, useState, useTransition } from 'react';
import { CheckCircle2, FileUp, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ContentRefreshDialog({ coursId, coursTitre }: { coursId: string; coursTitre: string }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFirstName(''); setLastName(''); setFile(null); setError(null); setDone(false);
  };

  const submit = () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) { setError('Indique ton prénom et ton nom.'); return; }
    if (!file) { setError('Ajoute un fichier PDF.'); return; }
    if (file.type !== 'application/pdf') { setError('Le fichier doit être un PDF.'); return; }
    start(async () => {
      const fd = new FormData();
      fd.append('coursId', coursId);
      fd.append('firstName', firstName.trim());
      fd.append('lastName', lastName.trim());
      fd.append('file', file);
      const res = await fetch('/api/content-submission', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? 'Envoi impossible. Réessaie.');
        return;
      }
      setDone(true);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="md">
          <RefreshCw className="h-4 w-4" />
          Actualiser les contenus pédagogiques
        </Button>
      </DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-(--color-primary-soft) text-(--color-accent) flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">Merci, c’est envoyé</h3>
            <p className="mt-2 text-sm text-(--color-ink-soft) max-w-sm mx-auto">
              Ta proposition pour « {coursTitre} » a bien été transmise à l’équipe pédagogique. On la relit et on met le cours à jour si besoin.
            </p>
            <Button className="mt-6" onClick={() => setOpen(false)}>Fermer</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-(--color-accent)" />
                Actualiser les contenus
              </DialogTitle>
              <DialogDescription>
                Tu as une version plus à jour de ce cours, une fiche corrigée ou un complément utile ? Envoie-le, on s’en occupe.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cr-first">Prénom</Label>
                  <Input id="cr-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cr-last">Nom</Label>
                  <Input id="cr-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Document PDF</Label>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-6 text-center transition hover:border-(--color-accent) focus-ring"
                >
                  <FileUp className="mx-auto h-7 w-7 text-(--color-accent)" />
                  <p className="mt-2 text-sm font-medium text-(--color-ink)">
                    {file ? file.name : 'Choisis un fichier PDF'}
                  </p>
                  <p className="text-xs text-(--color-ink-muted) mt-0.5">
                    {file ? `${(file.size / 1024 / 1024).toFixed(1)} Mo` : 'Glisse-le ou clique pour parcourir'}
                  </p>
                </button>
              </div>

              {error && (
                <p className="text-sm text-(--color-danger) bg-red-500/10 border border-(--color-danger)/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
              <Button onClick={submit} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <FileUp />}
                Soumettre
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
