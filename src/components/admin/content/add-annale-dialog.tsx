'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addAnnaleAction } from '@/app/admin/contenu/[cours]/actions';

export function AddAnnaleDialog({ coursId }: { coursId: string }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [annee, setAnnee] = useState<string>(String(new Date().getFullYear()));
  const [duration, setDuration] = useState<string>('180');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addAnnaleAction({
        coursId,
        label: label.trim(),
        annee: Number(annee) || null,
        duration_minutes: Number(duration) || null,
      });
      if ('error' in res) setError(res.error);
      else {
        setOpen(false);
        setLabel('');
        router.refresh();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          Ajouter une annale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-(--color-primary)" />
            Nouvelle annale
          </DialogTitle>
          <DialogDescription>
            La durée définie ici sera utilisée comme chrono pour le mode « Entraînement en
            conditions réelles ». Les questions s’ajoutent ensuite depuis Supabase ou via l’IA.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="annale-label">Intitulé</Label>
            <Input
              id="annale-label"
              placeholder="ex. EDN 2024 · Session 1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="annale-annee">Année</Label>
              <Input
                id="annale-annee"
                type="number"
                min={2000}
                max={2099}
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="annale-duration" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-(--color-primary)" />
                Durée (min)
              </Label>
              <Input
                id="annale-duration"
                type="number"
                min={5}
                max={600}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="180"
                required
              />
            </div>
          </div>
          <p className="text-xs text-(--color-ink-muted)">
            Conseil : 180 min pour une épreuve EDN standard, 90 min pour un examen blanc rapide.
          </p>

          {error && (
            <p className="rounded-lg border border-(--color-danger)/30 bg-red-50 px-3 py-2 text-sm text-(--color-danger)">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
            <Button type="submit" disabled={pending || !label.trim() || !duration}>
              {pending ? <Loader2 className="animate-spin" /> : <Plus />}
              Créer l’annale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
