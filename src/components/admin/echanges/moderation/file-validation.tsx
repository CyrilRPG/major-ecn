'use client';

import * as React from 'react';
import { Check, Clock, Paperclip, X } from 'lucide-react';
import { refuser, valider } from '@/app/admin/echanges/actions';
import type { MessageModere } from '@/lib/echanges/serveur/admin';
import { Bouton, Carte, EnteteCarte, Etiquette, Toast, Vide } from '@/components/admin/cockpit/ui';
import { BarreSelection, CaseACocher, Contenu, dateParis, FenetreMotif, Personne, useActionServeur, useSelection } from './outils';

/**
 * File de validation (modération préalable, §45-47) : messages retenus avant
 * publication. Valider les publie ; refuser ne les publie pas et prévient
 * l'auteur (avec le motif s'il est saisi).
 */
export function FileValidation({ messages, peutModerer }: { messages: MessageModere[]; peutModerer: boolean }) {
  const sel = useSelection(messages.map((m) => m.id));
  const { message, enCours, lancer } = useActionServeur();
  const [refus, setRefus] = React.useState<string[] | null>(null);

  const validerIds = async (ids: string[], cle: string) => {
    const r = await lancer(cle, () => valider(ids), (d) => {
      const n = d?.valides ?? 0;
      return n === 0 ? 'Aucun message à valider (déjà traité ?).' : `${n} message${n > 1 ? 's' : ''} publié${n > 1 ? 's' : ''}.`;
    });
    if (r.ok) sel.vider();
  };

  const refuserIds = async (motif: string | null) => {
    if (!refus) return;
    const r = await lancer('refus', () => refuser(refus, motif), (d) => {
      const n = d?.refuses ?? 0;
      return n === 0 ? 'Aucun message à refuser (déjà traité ?).' : `${n} message${n > 1 ? 's' : ''} refusé${n > 1 ? 's' : ''} : ${n > 1 ? 'leurs auteurs sont prévenus' : 'son auteur est prévenu'}.`;
    });
    if (r.ok) { sel.vider(); setRefus(null); }
  };

  return (
    <Carte>
      <EnteteCarte icone={Clock} titre="File de validation" compteur={messages.length} />
      <p className="px-4 pb-3 text-[13px] text-(--color-ink-soft) sm:px-5">
        Messages retenus avant publication (promotion en modération préalable, mot sensible, coordonnées détectées…). Ils ne sont visibles que de leur auteur tant qu’ils ne sont pas validés.
      </p>
      {messages.length === 0 ? (
        <Vide>Aucun message en attente de validation.</Vide>
      ) : (
        <>
          {peutModerer && (
            <BarreSelection total={messages.length} choisis={sel.choisis.length} tous={sel.tous} onTous={sel.basculerTous}>
              <Bouton taille="sm" disabled={sel.choisis.length === 0} enCours={enCours === 'valider-lot'} onClick={() => void validerIds(sel.choisis, 'valider-lot')}>
                <Check /> Valider
              </Bouton>
              <Bouton taille="sm" variante="contour" disabled={sel.choisis.length === 0} onClick={() => setRefus(sel.choisis)}>
                <X /> Refuser
              </Bouton>
            </BarreSelection>
          )}
          <ul className="divide-y divide-(--color-border)">
            {messages.map((m) => (
              <li key={m.id} className="flex gap-3 px-4 py-3.5 sm:px-5">
                {peutModerer && <CaseACocher coche={sel.estChoisi(m.id)} onChange={() => sel.basculer(m.id)} libelle="Sélectionner ce message" className="mt-1" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                    <Etiquette ton="bordeaux">{m.groupe}</Etiquette>
                    <Personne p={m.auteur} />
                    <span className="text-[12px] text-(--color-ink-muted)">{dateParis(m.createdAt)}</span>
                  </div>
                  <Contenu texte={m.contenu} className="mt-2" />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {m.motif && <Etiquette ton="orange">Retenu : {m.motif}</Etiquette>}
                    {m.nbPieces > 0 && (
                      <Etiquette ton="gris"><Paperclip className="mr-1 h-3 w-3" /> {m.nbPieces} pièce{m.nbPieces > 1 ? 's' : ''} jointe{m.nbPieces > 1 ? 's' : ''}</Etiquette>
                    )}
                  </div>
                </div>
                {peutModerer && (
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:items-start">
                    <Bouton taille="xs" enCours={enCours === `valider-${m.id}`} onClick={() => void validerIds([m.id], `valider-${m.id}`)} aria-label="Valider ce message">
                      <Check /> <span className="hidden sm:inline">Valider</span>
                    </Bouton>
                    <Bouton taille="xs" variante="contour" onClick={() => setRefus([m.id])} aria-label="Refuser ce message">
                      <X /> <span className="hidden sm:inline">Refuser</span>
                    </Bouton>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      {refus && (
        <FenetreMotif
          titre={refus.length > 1 ? `Refuser ${refus.length} messages` : 'Refuser ce message'}
          description="Le message ne sera pas publié. Son auteur reçoit une notification « Votre message n’a pas été publié », avec le motif s’il est renseigné."
          libelleMotif="Motif communiqué à l’auteur"
          placeholder="Ex. : le partage de coordonnées personnelles n’est pas autorisé."
          libelleAction="Refuser"
          variante="danger"
          enCours={enCours === 'refus'}
          onConfirmer={(motif) => void refuserIds(motif)}
          onFermer={() => setRefus(null)}
        />
      )}
      <Toast message={message} />
    </Carte>
  );
}
