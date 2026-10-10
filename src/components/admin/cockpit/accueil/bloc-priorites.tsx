'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Flame, Pin } from 'lucide-react';
import type { TacheVisible } from '@/lib/cockpit/server/taches';
import { definirPriorites } from '@/app/admin/cockpit/actions-taches';
import { deplacer, libelleCategorie, libelleEcheance } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { useActionsCockpit } from '../actions-globales';
import { Bouton, Carte, EnteteCarte, Etiquette, useEtatSuivi, DEGRADE } from '../ui';

type Priorite = TacheVisible & { suggeree: boolean };

const TON_CATEGORIE: Record<string, 'bleu' | 'vert' | 'orange' | 'violet' | 'bordeaux' | 'gris'> = {
  pedagogie: 'bleu', enseignants: 'bleu', contenus: 'violet', client: 'vert', commercial: 'vert', finances: 'orange',
  developpement: 'violet', marketing: 'bordeaux', administration: 'gris',
};

/** « Mes 3 priorités du jour », réordonnables (§2). */
export function BlocPriorites({
  priorites, urgentes, aujourdHui, onMessage, className,
}: {
  priorites: Priorite[];
  urgentes: number;
  aujourdHui: string;
  onMessage: (m: string) => void;
  className?: string;
}) {
  const router = useRouter();
  const { ouvrir } = useActionsCockpit();
  const [ordre, setOrdre] = useEtatSuivi(priorites.map((p) => p.id), priorites.map((p) => p.id).join(','));
  const [, start] = React.useTransition();
  const parId = new Map(priorites.map((p) => [p.id, p]));
  const liste = ordre.map((id) => parId.get(id)).filter((p): p is Priorite => !!p);

  const enregistrer = (ids: string[], msg: string) => {
    setOrdre(ids);
    start(async () => {
      const r = await definirPriorites(ids);
      onMessage(r.ok ? msg : r.erreur);
      router.refresh();
    });
  };

  return (
    <Carte className={cn('flex flex-col', className)}>
      <EnteteCarte
        icone={Flame}
        titre="Mes 3 priorités du jour"
        badge={urgentes > 0 ? <span className="rounded-full bg-[#D92D3A] px-2.5 py-0.5 text-[12px] font-semibold text-white">{urgentes} urgente{urgentes > 1 ? 's' : ''}</span> : null}
        lien="/admin/cockpit/taches"
        lienLabel="Voir toutes"
      />
      <ol className="flex-1 space-y-2.5 px-4 pb-4 sm:px-5">
        {liste.length === 0 && (
          <li className="rounded-xl border border-dashed border-(--color-border) px-4 py-6 text-center text-sm text-(--color-ink-muted)">
            Aucune priorité pour aujourd’hui.
            <button type="button" onClick={() => ouvrir('tache', { echeance: aujourdHui, priorite: 'haute' })} className="mt-2 block w-full text-[13px] font-medium text-(--color-primary) hover:underline">
              + Ajouter une tâche pour aujourd’hui
            </button>
          </li>
        )}
        {liste.map((t, i) => (
          <li key={t.id} className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-(--color-surface) px-3.5 py-3.5 ring-1 ring-(--color-border) transition-all duration-300 hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) hover:ring-(--color-primary)/25">
            <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', DEGRADE)} />
            <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-[15px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(228,0,43,0.7)]', DEGRADE)}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/cockpit/taches?t=${t.id}`} className="block truncate text-[14.5px] font-medium text-(--color-ink) hover:text-(--color-primary)">{t.titre}</Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-(--color-ink-soft)">
                <Etiquette ton={TON_CATEGORIE[t.categorie] ?? 'gris'}>{libelleCategorie(t.categorie)}</Etiquette>
                <span className={cn(t.echeance && t.echeance < aujourdHui && 'font-medium text-[#C0262D]')}>
                  {t.echeance ? `Échéance ${libelleEcheance(t.echeance, aujourdHui, t.heure).toLowerCase()}` : 'Sans échéance'}
                </span>
                {t.suggeree && <span className="text-[11.5px] italic text-(--color-ink-muted)">suggérée</span>}
              </div>
            </div>
            <div className="hidden flex-col opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
              <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => enregistrer(deplacer(ordre, i, -1), 'Priorités réordonnées.')} className="rounded p-0.5 text-(--color-ink-soft) hover:bg-white disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" aria-label="Descendre" disabled={i === liste.length - 1} onClick={() => enregistrer(deplacer(ordre, i, 1), 'Priorités réordonnées.')} className="rounded p-0.5 text-(--color-ink-soft) hover:bg-white disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
            </div>
            {t.suggeree && (
              <button type="button" title="Épingler dans mes priorités" aria-label="Épingler" onClick={() => enregistrer(ordre, 'Priorités du jour enregistrées.')} className="hidden rounded p-1 text-(--color-ink-muted) hover:bg-white hover:text-(--color-primary) sm:block">
                <Pin className="h-4 w-4" />
              </button>
            )}
            <ActionPrincipale tache={t} />
          </li>
        ))}
      </ol>
    </Carte>
  );
}

function ActionPrincipale({ tache }: { tache: TacheVisible }) {
  const { ouvrir } = useActionsCockpit();
  const router = useRouter();
  if (tache.lien_type === 'enseignant' && tache.lien_id && tache.niveau === 'proprietaire') {
    return (
      <Bouton taille="sm" onClick={() => ouvrir('relance', { type: 'enseignant', personneId: tache.lien_id!, personneLabel: tache.lien_label ?? undefined, sujet: tache.titre, mission: tache.titre, tacheId: tache.id })}>
        Relancer
      </Bouton>
    );
  }
  const cible =
    tache.lien_type === 'reclamation' ? `/admin/cockpit/reclamations?r=${tache.lien_id}`
      : tache.lien_type === 'demande' ? `/admin/cockpit/demandes?d=${tache.lien_id}`
        : tache.lien_type === 'conversation' ? `/admin/cockpit/messagerie/${tache.lien_id}`
          : tache.lien_type === 'amelioration' ? `/admin/cockpit/reclamations?vue=ameliorations&a=${tache.lien_id}`
            : null;
  return (
    <Bouton taille="sm" onClick={() => router.push(cible ?? `/admin/cockpit/taches?t=${tache.id}`)}>
      {cible ? 'Voir' : 'Traiter'}
    </Bouton>
  );
}
