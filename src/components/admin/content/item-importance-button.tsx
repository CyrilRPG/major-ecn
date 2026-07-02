'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { setCoursImportanceAction } from '@/app/admin/contenu/actions';
import { cn } from '@/lib/utils';

const RED = '#C0112E';

/** Affichage lecture seule de l'importance (étoiles rouges Major ECN). */
export function ImportanceStars({ value, className }: { value: number; className?: string }) {
  if (!value) return null;
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} title={`Importance ${value}/5`}>
      {Array.from({ length: value }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5" style={{ fill: RED, color: RED }} />
      ))}
    </span>
  );
}

export function ItemImportanceButton({
  coursId,
  titre,
  importance,
}: {
  coursId: string;
  titre: string;
  importance: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(importance);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shown = hover ?? value;

  const save = () => {
    setError(null);
    start(async () => {
      const res = await setCoursImportanceAction({ coursId, importance: value });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setValue(importance);
          setHover(null);
          setError(null);
          setOpen(true);
        }}
        aria-label="Régler l'importance"
        title="Régler l'importance"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-(--color-ink-muted) transition-colors hover:bg-[#FCEAEC] hover:text-[#C0112E]"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" style={{ fill: RED, color: RED }} />
              Importance de l&rsquo;item
            </DialogTitle>
            <DialogDescription className="truncate">{titre}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(null)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= shown;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setValue((v) => (v === n ? 0 : n))}
                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                    className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0112E]/40"
                  >
                    <Star
                      className="h-8 w-8 transition-colors"
                      style={{
                        fill: filled ? RED : 'transparent',
                        color: filled ? RED : '#D8B9C0',
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-sm font-medium text-(--color-ink-soft)">
              {value === 0 ? 'Aucune importance (par défaut)' : `${value} / 5`}
            </p>
            <button
              type="button"
              onClick={() => setValue(0)}
              className="text-xs text-(--color-ink-muted) underline-offset-2 hover:underline"
            >
              Réinitialiser à 0
            </button>
          </div>

          {error && <p className="text-sm text-(--color-danger)">{error}</p>}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Annuler
            </Button>
            <Button onClick={save} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
