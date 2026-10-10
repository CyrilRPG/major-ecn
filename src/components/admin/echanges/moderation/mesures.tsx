'use client';

import * as React from 'react';
import { Gavel, Undo2, UserCheck } from 'lucide-react';
import { lever, reintegrerCandidat } from '@/app/admin/echanges/actions';
import type { FileModeration } from '@/lib/echanges/serveur/admin';
import { LIBELLE_SANCTION } from '@/lib/echanges/moderation-textes';
import { Bouton, Carte, EnteteCarte, Etiquette, Toast, Vide } from '@/components/admin/cockpit/ui';
import { dateParis, FenetreMotif, Personne, useActionServeur } from './outils';

type Mesure = FileModeration['sanctions'][number];

const TON: Record<string, 'orange' | 'violet' | 'bordeaux' | 'gris' | 'bleu'> = {
  lecture_seule: 'orange', restriction_tag: 'violet', suspension: 'bordeaux', exclusion: 'bordeaux', avertissement: 'bleu',
};

/**
 * Mesures en cours (§49-53) : restrictions actives des candidats. « Lever »
 * clôt une mesure ; « Réintégrer » lève toutes les restrictions du candidat
 * pour la promotion (et une exclusion forcée du groupe), sans nouveau compte.
 */
export function Mesures({ mesures, peutSanctionner, maintenant }: { mesures: Mesure[]; peutSanctionner: boolean; maintenant: number }) {
  const { message, enCours, lancer } = useActionServeur();
  const [action, setAction] = React.useState<{ type: 'lever' | 'reintegrer'; m: Mesure } | null>(null);

  const confirmer = async (motif: string | null) => {
    if (!action) return;
    const { m } = action;
    const r = action.type === 'lever'
      ? await lancer('action', () => lever(m.id, motif), 'Mesure levée.')
      : await lancer('action', () => reintegrerCandidat(m.auteur?.id ?? '', m.groupeId, motif), 'Candidat réintégré : il est prévenu dans Major ECN.');
    if (r.ok) setAction(null);
  };

  return (
    <Carte>
      <EnteteCarte icone={Gavel} titre="Mesures en cours" compteur={mesures.length} />
      {mesures.length === 0 ? (
        <Vide>Aucune mesure active.</Vide>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-[13px]">
            <thead className="border-y border-(--color-border) bg-(--color-surface-soft) text-[12px] text-(--color-ink-muted)">
              <tr>
                <th className="px-4 py-2 font-medium sm:px-5">Mesure</th>
                <th className="px-3 py-2 font-medium">Candidat</th>
                <th className="px-3 py-2 font-medium">Portée</th>
                <th className="px-3 py-2 font-medium">Depuis</th>
                <th className="px-3 py-2 font-medium">Jusqu’au</th>
                <th className="px-3 py-2 font-medium">Par</th>
                {peutSanctionner && <th className="px-4 py-2 sm:px-5"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {mesures.map((m) => {
                const echue = !!m.fin && new Date(m.fin).getTime() <= maintenant;
                return (
                  <tr key={m.id} className="align-top">
                    <td className="px-4 py-3 sm:px-5">
                      <Etiquette ton={TON[m.type] ?? 'gris'}>{LIBELLE_SANCTION[m.type] ?? m.type}</Etiquette>
                      {m.motif && <p className="mt-1 max-w-[16rem] break-words text-[12px] text-(--color-ink-soft)">{m.motif}</p>}
                    </td>
                    <td className="px-3 py-3"><Personne p={m.auteur} /></td>
                    <td className="px-3 py-3 text-(--color-ink-soft)">{m.groupeId ? m.groupe ?? '—' : 'Toutes ses messageries'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-(--color-ink-soft)">{dateParis(m.debut)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-(--color-ink-soft)">
                      {m.fin ? dateParis(m.fin) : 'Sans échéance'}
                      {echue && <Etiquette ton="gris" className="ml-1.5">Échue</Etiquette>}
                    </td>
                    <td className="px-3 py-3 text-(--color-ink-soft)">{m.creePar?.nom ?? '—'}</td>
                    {peutSanctionner && (
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex justify-end gap-1.5">
                          <Bouton taille="xs" variante="contour" onClick={() => setAction({ type: 'lever', m })}><Undo2 /> Lever</Bouton>
                          {m.auteur && (
                            <Bouton taille="xs" variante="doux" onClick={() => setAction({ type: 'reintegrer', m })}><UserCheck /> Réintégrer</Bouton>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {action && (
        <FenetreMotif
          titre={action.type === 'lever' ? `Lever : ${LIBELLE_SANCTION[action.m.type] ?? action.m.type}` : `Réintégrer ${action.m.auteur?.nom ?? 'le candidat'}`}
          description={action.type === 'lever'
            ? 'Cette mesure prend fin immédiatement. Les autres mesures éventuelles du candidat restent actives.'
            : `Toutes les restrictions actives du candidat ${action.m.groupeId ? `pour « ${action.m.groupe ?? 'cette promotion'} » et ses mesures générales` : 'dans toutes ses messageries'} sont levées, ainsi qu’une exclusion forcée du groupe. Il en est prévenu dans Major ECN.`}
          libelleMotif="Motif"
          aideMotif="(interne, facultatif)"
          libelleAction={action.type === 'lever' ? 'Lever la mesure' : 'Réintégrer'}
          enCours={enCours === 'action'}
          onConfirmer={(motif) => void confirmer(motif)}
          onFermer={() => setAction(null)}
        />
      )}
      <Toast message={message} />
    </Carte>
  );
}
