'use client';

import * as React from 'react';
import { Check, Flag, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { signalement } from '@/app/admin/echanges/actions';
import type { FileModeration } from '@/lib/echanges/serveur/admin';
import { Bouton, Carte, EnteteCarte, Etiquette, PastilleStatut, Toast, Vide } from '@/components/admin/cockpit/ui';
import { DialogueSanction, typesPermis, type CibleSanction } from './dialogue-sanction';
import { Contenu, dateParis, FenetreMotif, Personne, useActionServeur } from './outils';
import { BasculeHistorique } from './bascule-historique';

type Signalement = FileModeration['signalements'][number];
type Decision = 'traite' | 'sans_suite' | 'a_examiner';

const DECISIONS: Record<Decision, { libelle: string; titre: string; aide: string; ton: string }> = {
  traite: { libelle: 'Traité', titre: 'Marquer le signalement comme traité', aide: 'Une mesure a été prise (message supprimé, avertissement…).', ton: 'terminee' },
  sans_suite: { libelle: 'Sans suite', titre: 'Classer le signalement sans suite', aide: 'Le message ne contrevient pas aux règles.', ton: 'annulee' },
  a_examiner: { libelle: 'À réexaminer', titre: 'Remettre le signalement à examiner', aide: 'Le signalement revient dans la liste à examiner.', ton: 'a_traiter' },
};

/**
 * Signalements des participants (§57) : message signalé avec son auteur et son
 * groupe, motif et précisions, auteur du signalement. Décision tracée (note
 * interne) ; raccourci vers une mesure envers l'auteur du message.
 */
export function Signalements({ signalements, historique, peutTraiter, capacites }: {
  signalements: Signalement[];
  historique: boolean;
  peutTraiter: boolean;
  capacites: string[];
}) {
  const { message, setMessage, enCours, lancer, rafraichir } = useActionServeur();
  const [decision, setDecision] = React.useState<{ s: Signalement; statut: Decision } | null>(null);
  const [cible, setCible] = React.useState<CibleSanction | null>(null);
  const peutSanctionner = typesPermis(capacites).length > 0;

  const decider = async (note: string | null) => {
    if (!decision) return;
    const r = await lancer('decision', () => signalement(decision.s.id, decision.statut, note), `Signalement : ${DECISIONS[decision.statut].libelle.toLowerCase()}.`);
    if (r.ok) setDecision(null);
  };

  return (
    <Carte>
      <EnteteCarte
        icone={Flag}
        titre={historique ? 'Signalements — historique' : 'Signalements à examiner'}
        compteur={signalements.length}
        actions={<BasculeHistorique historique={historique} />}
      />
      {signalements.length === 0 ? (
        <Vide>{historique ? 'Aucun signalement.' : 'Aucun signalement à examiner.'}</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border)">
          {signalements.map((s) => {
            const m = s.message;
            const decisionConnue = (DECISIONS as Record<string, (typeof DECISIONS)[Decision]>)[s.statut];
            return (
              <li key={s.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                  <PastilleStatut statut={decisionConnue?.ton ?? s.statut} libelle={s.statut === 'a_examiner' ? 'À examiner' : decisionConnue?.libelle ?? s.statut} />
                  <span className="font-semibold text-(--color-ink)">{s.motif}</span>
                  <span className="text-[12px] text-(--color-ink-muted)">{dateParis(s.createdAt)}</span>
                </div>
                <p className="mt-1 text-[12.5px] text-(--color-ink-soft)">
                  Signalé par <Personne p={s.signalePar} />
                </p>
                {s.details && <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] text-(--color-ink-soft)">« {s.details} »</p>}

                <div className="mt-3 rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5">
                  {m ? (
                    <>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                        <Etiquette ton="bordeaux">{m.groupe}</Etiquette>
                        <Personne p={m.auteur} />
                        <span className="text-[12px] text-(--color-ink-muted)">{dateParis(m.createdAt)}</span>
                      </div>
                      <Contenu texte={m.contenu} className="mt-1.5" />
                    </>
                  ) : (
                    <p className="text-[13px] text-(--color-ink-muted)">Message introuvable (purgé ou hors de votre périmètre).</p>
                  )}
                </div>

                {(s.decisionNote || (s.traiteAt && s.statut !== 'a_examiner')) && (
                  <p className="mt-2 text-[12.5px] text-(--color-ink-soft)">
                    {s.traiteAt && <>Décision du {dateParis(s.traiteAt)}</>}
                    {s.decisionNote && <>{s.traiteAt ? ' — ' : ''}<span className="italic">{s.decisionNote}</span></>}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {peutTraiter && s.statut !== 'traite' && (
                    <Bouton taille="xs" onClick={() => setDecision({ s, statut: 'traite' })}><Check /> Traité</Bouton>
                  )}
                  {peutTraiter && s.statut !== 'sans_suite' && (
                    <Bouton taille="xs" variante="contour" onClick={() => setDecision({ s, statut: 'sans_suite' })}><X /> Sans suite</Bouton>
                  )}
                  {peutTraiter && s.statut !== 'a_examiner' && (
                    <Bouton taille="xs" variante="contour" onClick={() => setDecision({ s, statut: 'a_examiner' })}><RotateCcw /> À réexaminer</Bouton>
                  )}
                  {peutSanctionner && m?.auteur && m.auteur.role === 'student' && (
                    <Bouton
                      taille="xs"
                      variante="doux"
                      onClick={() => setCible({ userId: m.auteur!.id, nom: m.auteur!.nom, groupeId: m.groupeId, groupe: m.groupe })}
                    >
                      <ShieldAlert /> Mesure envers l’auteur
                    </Bouton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {decision && (
        <FenetreMotif
          titre={DECISIONS[decision.statut].titre}
          description={DECISIONS[decision.statut].aide}
          libelleMotif="Note de décision"
          aideMotif="(interne, facultative)"
          motifInitial={decision.s.decisionNote ?? ''}
          libelleAction={DECISIONS[decision.statut].libelle}
          enCours={enCours === 'decision'}
          onConfirmer={(note) => void decider(note)}
          onFermer={() => setDecision(null)}
        />
      )}
      {cible && (
        <DialogueSanction
          cible={cible}
          capacites={capacites}
          onFermer={() => setCible(null)}
          onFait={() => { setCible(null); setMessage('Mesure enregistrée.'); rafraichir(); }}
        />
      )}
      <Toast message={message} />
    </Carte>
  );
}
