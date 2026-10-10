'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Archive, BellRing, CalendarClock, Check, MoreHorizontal, Pencil, Pin, PinOff, Send, Undo2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { archiverTache, basculerTerminee, definirPriorites, reporterTache } from '@/app/admin/cockpit/actions-taches';
import type { TacheVisible } from '@/lib/cockpit/server/taches';
import { peut, peutAdministrer } from '@/lib/cockpit/regles';
import { useActionsCockpit } from './actions-globales';

/**
 * Actions rapides d'une tâche (§3) : cocher, modifier, reporter à demain,
 * programmer un rappel, écrire à l'enseignant lié, épingler dans les
 * priorités du jour, archiver.
 */
export function MenuTache({
  tache, prioritesDuJour, onModifier, onRetour,
}: {
  tache: TacheVisible;
  /** Ids actuellement épinglés aujourd'hui (pour épingler / désépingler). */
  prioritesDuJour?: string[];
  onModifier: (t: TacheVisible) => void;
  onRetour?: (message: string) => void;
}) {
  const router = useRouter();
  const { ouvrir } = useActionsCockpit();
  const [, start] = React.useTransition();
  const modifiable = peut(tache.niveau, 'modification');
  const executer = (f: () => Promise<{ ok: boolean; erreur?: string }>, ok: string) =>
    start(async () => {
      const r = await f();
      onRetour?.(r.ok ? ok : (r.erreur ?? 'Action impossible.'));
      router.refresh();
    });
  const epinglee = prioritesDuJour?.includes(tache.id) ?? false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Actions de la tâche" className="grid h-7 w-7 place-items-center rounded-md text-(--color-ink-soft) hover:bg-(--color-surface-soft) focus-ring">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {modifiable && (
          <DropdownMenuItem onClick={() => executer(() => basculerTerminee(tache.id), tache.statut === 'terminee' ? 'Tâche rouverte.' : 'Tâche terminée.')}>
            {tache.statut === 'terminee' ? <Undo2 /> : <Check />}
            {tache.statut === 'terminee' ? 'Rouvrir' : 'Marquer comme terminée'}
          </DropdownMenuItem>
        )}
        {modifiable && (
          <DropdownMenuItem onClick={() => onModifier(tache)}>
            <Pencil /> Modifier / fiche détaillée
          </DropdownMenuItem>
        )}
        {modifiable && (
          <DropdownMenuItem onClick={() => executer(() => reporterTache(tache.id), 'Tâche reportée à demain.')}>
            <CalendarClock /> Reporter à demain
          </DropdownMenuItem>
        )}
        {modifiable && (
          <DropdownMenuItem onClick={() => onModifier(tache)}>
            <BellRing /> Programmer un rappel
          </DropdownMenuItem>
        )}
        {tache.lien_type === 'enseignant' && tache.lien_id && peutAdministrer(tache.niveau) && (
          <DropdownMenuItem
            onClick={() => ouvrir('relance', { type: 'enseignant', personneId: tache.lien_id!, personneLabel: tache.lien_label ?? undefined, sujet: tache.titre, mission: tache.titre, tacheId: tache.id })}
          >
            <Send /> Écrire à cet enseignant
          </DropdownMenuItem>
        )}
        {modifiable && prioritesDuJour && (
          <DropdownMenuItem
            onClick={() => executer(
              () => definirPriorites(epinglee ? prioritesDuJour.filter((x) => x !== tache.id) : [...prioritesDuJour, tache.id].slice(-3)),
              epinglee ? 'Retirée des priorités du jour.' : 'Ajoutée aux priorités du jour.',
            )}
          >
            {epinglee ? <PinOff /> : <Pin />}
            {epinglee ? 'Retirer des priorités du jour' : 'Épingler en priorité du jour'}
          </DropdownMenuItem>
        )}
        {peutAdministrer(tache.niveau) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => executer(() => archiverTache(tache.id), tache.archivee_at ? 'Tâche désarchivée.' : 'Tâche archivée.')}>
              <Archive /> {tache.archivee_at ? 'Désarchiver' : 'Archiver'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
