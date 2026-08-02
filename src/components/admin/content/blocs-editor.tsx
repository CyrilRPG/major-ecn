'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BLOCS, type BlocKey } from '@/lib/student/blocs';
import { setHiddenBlocksAction } from '@/app/admin/contenu/[cours]/blocs-actions';

/**
 * Choix des blocs affichés aux élèves pour CET item. Décocher un bloc le fait
 * disparaître partout : onglet, carte d'aperçu et vue partagée.
 *
 * Ce n'est pas une permission : les droits par formule continuent de
 * s'appliquer par-dessus (un bloc coché reste invisible sans la formule).
 */
export function BlocsEditor({ coursId, hidden }: { coursId: string; hidden: BlocKey[] }) {
  const router = useRouter();
  const [etat, setEtat] = useState<BlocKey[]>(hidden);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const modifie =
    etat.length !== hidden.length || etat.some((k) => !hidden.includes(k));

  function bascule(key: BlocKey, affiche: boolean) {
    setOk(false);
    setEtat((prev) => (affiche ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function enregistrer() {
    setError(null);
    start(async () => {
      const res = await setHiddenBlocksAction({ coursId, hidden: etat });
      if ('error' in res) return setError(res.error);
      setOk(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {BLOCS.map((b) => {
          const affiche = !etat.includes(b.key);
          return (
            <li
              key={b.key}
              className="flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5"
            >
              <input
                id={`bloc-${b.key}`}
                type="checkbox"
                checked={affiche}
                onChange={(e) => bascule(b.key, e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-(--color-primary)"
              />
              <label htmlFor={`bloc-${b.key}`} className="min-w-0 flex-1 cursor-pointer">
                <span className="block text-sm font-semibold text-(--color-ink)">{b.label}</span>
                <span className="block text-xs text-(--color-ink-soft)">{b.aide}</span>
              </label>
              {!affiche && (
                <span className="shrink-0 rounded-lg bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">
                  masqué
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={enregistrer} disabled={pending || !modifie}>
          {pending ? <Loader2 className="animate-spin" /> : ok ? <CheckCircle2 /> : null}
          {ok && !modifie ? 'Enregistré' : 'Enregistrer'}
        </Button>
        {modifie && (
          <Button type="button" size="sm" variant="ghost" onClick={() => { setEtat(hidden); setOk(false); }} disabled={pending}>
            Annuler
          </Button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
