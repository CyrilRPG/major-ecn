'use client';

import * as React from 'react';
import { Frown, Meh, PhoneOutgoing, Smile } from 'lucide-react';
import { marquerRecontacte } from '@/app/admin/cockpit/actions-dossiers';
import { Bouton } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';

export const SATISFACTION_LABEL: Record<string, string> = { satisfait: 'Satisfait', neutre: 'Neutre', insatisfait: 'Insatisfait' };

type Satisfaction = 'satisfait' | 'neutre' | 'insatisfait' | null;

/** « Marquer recontacté » : le candidat a été rappelé après correction, avec son ressenti. */
export function MarquerRecontacte({
  reclamationId, onFait, taille = 'sm',
}: {
  reclamationId: string;
  onFait?: (message: string) => void;
  taille?: 'xs' | 'sm';
}) {
  const [choix, setChoix] = React.useState(false);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function valider(s: Satisfaction) {
    setErreur(null);
    startTransition(async () => {
      const r = await marquerRecontacte(reclamationId, s);
      if (!r.ok) setErreur(r.erreur);
      else {
        setChoix(false);
        onFait?.('Candidat marqué comme recontacté');
      }
    });
  }

  if (!choix) {
    return (
      <Bouton type="button" variante="contour" taille={taille} onClick={() => setChoix(true)}>
        <PhoneOutgoing /> Marquer recontacté
      </Bouton>
    );
  }

  const options: { v: Satisfaction; libelle: string; icone: React.ComponentType<{ className?: string }>; ton: string }[] = [
    { v: 'satisfait', libelle: 'Satisfait', icone: Smile, ton: 'text-[#1F7A3E] hover:bg-[#E6F4EA]' },
    { v: 'neutre', libelle: 'Neutre', icone: Meh, ton: 'text-[#2F5DA8] hover:bg-[#E8F0FC]' },
    { v: 'insatisfait', libelle: 'Insatisfait', icone: Frown, ton: 'text-[#B42318] hover:bg-[#FCE4E4]' },
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-(--color-border) bg-white p-1" role="group" aria-label="Ressenti du candidat">
      <span className="px-1.5 text-[12px] text-(--color-ink-soft)">Ressenti :</span>
      {options.map(({ v, libelle, icone: I, ton }) => (
        <button
          key={libelle}
          type="button"
          disabled={enCours}
          onClick={() => valider(v)}
          className={cn('inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium focus-ring disabled:opacity-50', ton)}
        >
          <I className="h-3.5 w-3.5" /> {libelle}
        </button>
      ))}
      <button
        type="button"
        disabled={enCours}
        onClick={() => valider(null)}
        className="inline-flex h-7 items-center rounded-md px-2 text-[12.5px] text-(--color-ink-soft) hover:bg-(--color-surface-soft) focus-ring disabled:opacity-50"
      >
        Sans avis
      </button>
      <button type="button" onClick={() => setChoix(false)} className="h-7 rounded-md px-2 text-[12.5px] text-(--color-ink-muted) hover:bg-(--color-surface-soft) focus-ring">
        Annuler
      </button>
      {erreur && <span role="alert" className="w-full px-1.5 text-[12px] text-[#B42318]">{erreur}</span>}
    </div>
  );
}
