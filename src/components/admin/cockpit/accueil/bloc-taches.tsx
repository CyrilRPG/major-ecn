'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Users } from 'lucide-react';
import type { TacheVisible } from '@/lib/cockpit/server/taches';
import { basculerTerminee } from '@/app/admin/cockpit/actions-taches';
import { ajouterJoursIso, comparerTaches, estOuverte, libelleEcheance, lundiDe, peut } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { MenuTache } from '../menu-tache';
import { Carte, EnteteCarte, PastillePriorite, Vide } from '../ui';

type Filtre = 'toutes' | 'a_faire' | 'en_cours' | 'terminees';

/**
 * « Mes tâches cette semaine » : cases à cocher et actions rapides (§2).
 * Semaine = échéance entre lundi et dimanche, plus les tâches ouvertes en
 * retard et celles terminées cette semaine.
 */
export function BlocTachesSemaine({
  taches, aujourdHui, priorites, onMessage,
}: {
  taches: TacheVisible[];
  aujourdHui: string;
  priorites: string[];
  onMessage: (m: string) => void;
}) {
  const router = useRouter();
  const [filtre, setFiltre] = React.useState<Filtre>('toutes');
  const [optimiste, setOptimiste] = React.useState<Record<string, boolean>>({});
  const [, start] = React.useTransition();
  const lundi = lundiDe(aujourdHui);
  const dimanche = ajouterJoursIso(lundi, 6);
  const semaine = taches.filter((t) => {
    if (t.statut === 'annulee') return false;
    if (t.statut === 'terminee') return !!t.terminee_at && t.terminee_at.slice(0, 10) >= lundi;
    if (!t.echeance) return false;
    return t.echeance <= dimanche;
  }).sort(comparerTaches);

  const termine = (t: TacheVisible) => optimiste[t.id] ?? t.statut === 'terminee';
  const compte = {
    toutes: semaine.length,
    a_faire: semaine.filter((t) => !termine(t) && (t.statut === 'a_faire' || t.statut === 'reportee')).length,
    en_cours: semaine.filter((t) => !termine(t) && ['en_cours', 'attente_reponse', 'reponse_recue'].includes(t.statut)).length,
    terminees: semaine.filter((t) => termine(t)).length,
  };
  const liste = semaine.filter((t) =>
    filtre === 'toutes' ? true
      : filtre === 'terminees' ? termine(t)
        : filtre === 'a_faire' ? !termine(t) && (t.statut === 'a_faire' || t.statut === 'reportee')
          : !termine(t) && ['en_cours', 'attente_reponse', 'reponse_recue'].includes(t.statut));

  const cocher = (t: TacheVisible) => {
    const suivant = !termine(t);
    setOptimiste((o) => ({ ...o, [t.id]: suivant }));
    start(async () => {
      const r = await basculerTerminee(t.id);
      if (!r.ok) {
        setOptimiste((o) => ({ ...o, [t.id]: !suivant }));
        onMessage(r.erreur);
      }
      router.refresh();
    });
  };

  return (
    <Carte className="flex flex-col">
      <EnteteCarte icone={ClipboardCheck} titre="Mes tâches cette semaine" compteur={semaine.length} lien="/admin/cockpit/taches" />
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-5" role="tablist">
        {([['toutes', 'Toutes'], ['a_faire', 'À faire'], ['en_cours', 'En cours'], ['terminees', 'Terminées']] as const).map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={filtre === v} onClick={() => setFiltre(v)}
            className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium',
              filtre === v ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) hover:bg-(--color-surface-soft)')}>
            {l}
            <span className={cn('rounded-full px-1.5 text-[11px]', filtre === v ? 'bg-white/25' : 'bg-white text-(--color-ink-soft)')}>{compte[v]}</span>
          </button>
        ))}
      </div>
      <ul className="max-h-[260px] flex-1 divide-y divide-(--color-border) overflow-y-auto px-4 pb-3 sm:px-5">
        {liste.length === 0 && <Vide>Aucune tâche ici.</Vide>}
        {liste.map((t) => {
          const fait = termine(t);
          const retard = !fait && estOuverte(t.statut) && !!t.echeance && t.echeance < aujourdHui;
          return (
            <li key={t.id} className="flex items-center gap-2.5 py-2">
              <input
                type="checkbox"
                checked={fait}
                disabled={!peut(t.niveau, 'modification')}
                onChange={() => cocher(t)}
                aria-label={fait ? 'Rouvrir la tâche' : 'Marquer la tâche comme terminée'}
                className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-(--color-ink-muted) accent-(--color-primary)"
              />
              <Link href={`/admin/cockpit/taches?t=${t.id}`} className={cn('min-w-0 flex-1 truncate text-[13.5px] text-(--color-ink) hover:text-(--color-primary)', fait && 'text-(--color-ink-muted) line-through')}>
                {t.partagee && <Users className="mr-1 inline h-3.5 w-3.5 text-[#2F5DA8]" aria-label="Tâche partagée" />}
                {t.titre}
              </Link>
              <PastillePriorite priorite={t.priorite} className="hidden sm:inline-flex" />
              <span className={cn('w-[78px] shrink-0 text-right text-[12px] text-(--color-ink-soft)', retard && 'font-medium text-[#C0262D]')}>
                {retard ? 'En retard' : libelleEcheance(t.echeance, aujourdHui)}
              </span>
              <MenuTache tache={t} prioritesDuJour={priorites} onModifier={(x) => router.push(`/admin/cockpit/taches?t=${x.id}`)} onRetour={onMessage} />
            </li>
          );
        })}
      </ul>
    </Carte>
  );
}
