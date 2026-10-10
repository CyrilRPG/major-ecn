'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, RotateCcw } from 'lucide-react';
import type { Criteres, ModeParticipants } from '@/lib/echanges/regles';
import { modifierPromotion, previsualiserCriteres } from '@/app/admin/echanges/actions';
import { Bouton, Carte, Toast, useEtatSuivi, useMessage } from '@/components/admin/cockpit/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChampsCriteres } from './champs-criteres';
import type { Specialite } from './commun';

type Personne = { id: string; nom: string; email: string | null };
type Apercu = { ajoutes: Personne[]; retires: Personne[]; exceptionsInclusion: Personne[]; exceptionsExclusion: Personne[] };

const LIMITE = 60;

function ListeApercu({ titre, aide, personnes, ton }: { titre: string; aide: string; personnes: Personne[]; ton: string }) {
  return (
    <details open={personnes.length > 0 && personnes.length <= 20} className="rounded-xl border border-(--color-border) bg-white">
      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px]">
        <span className={`min-w-8 rounded-md px-1.5 py-0.5 text-center text-[12px] font-semibold tabular-nums ${ton}`}>{personnes.length}</span>
        <span className="font-medium text-(--color-ink)">{titre}</span>
        <span className="hidden text-[12px] text-(--color-ink-muted) sm:inline">— {aide}</span>
      </summary>
      {personnes.length > 0 && (
        <ul className="max-h-48 divide-y divide-(--color-border) overflow-y-auto border-t border-(--color-border)">
          {personnes.slice(0, LIMITE).map((p) => (
            <li key={p.id} className="flex flex-wrap gap-x-2 px-3 py-1.5 text-[12.5px]">
              <span className="font-medium text-(--color-ink)">{p.nom}</span>
              {p.email && <span className="text-(--color-ink-muted)">{p.email}</span>}
            </li>
          ))}
          {personnes.length > LIMITE && <li className="px-3 py-1.5 text-[12px] text-(--color-ink-muted)">… et {personnes.length - LIMITE} autres.</li>}
        </ul>
      )}
    </details>
  );
}

/**
 * Onglet « Critères » de la fiche : modification du mode de participation et
 * des critères. Avant d'appliquer, l'aperçu montre qui entrerait, qui
 * sortirait et quelles exceptions sont conservées (§181, R50) ; il faut
 * confirmer. Les messages déjà publiés restent attachés au groupe (§178).
 */
export function OngletCriteres({
  groupeId, mode: modeInitial, criteres: criteresInitiaux, specialites, lectureSeule,
}: {
  groupeId: string;
  mode: ModeParticipants;
  criteres: Criteres;
  specialites: Specialite[];
  lectureSeule?: boolean;
}) {
  const router = useRouter();
  const cle = JSON.stringify([modeInitial, criteresInitiaux]);
  const [mode, setMode] = useEtatSuivi(modeInitial, cle);
  const [criteres, setCriteres] = useEtatSuivi(criteresInitiaux, cle);
  const [apercu, setApercu] = React.useState<Apercu | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const [message, setMessage] = useMessage();
  const modifie = JSON.stringify([mode, criteres]) !== cle;

  function previsualiser() {
    setErreur(null);
    start(async () => {
      const r = await previsualiserCriteres(groupeId, mode, criteres);
      if (!r.ok || !r.data) { setErreur(r.ok ? 'Aperçu indisponible.' : r.erreur); return; }
      setApercu(r.data);
    });
  }

  function appliquer() {
    start(async () => {
      const r = await modifierPromotion(groupeId, { modeParticipants: mode, criteres });
      if (!r.ok) { setErreur(r.erreur); setApercu(null); return; }
      setApercu(null);
      setMessage('Critères appliqués : participants synchronisés.');
      router.refresh();
    });
  }

  return (
    <Carte className="space-y-4 p-4 sm:p-5">
      <div>
        <h2 className="text-[15px] font-semibold text-(--color-ink)">Participants automatiques</h2>
        <p className="text-[12.5px] text-(--color-ink-soft)">
          Toute modification est d’abord prévisualisée : vous voyez les candidats qui seraient ajoutés ou retirés avant de confirmer.
          Les ajouts manuels et les exclusions administratives sont toujours respectés.
        </p>
      </div>
      <ChampsCriteres
        mode={mode}
        criteres={criteres}
        specialites={specialites}
        onMode={setMode}
        onCriteres={setCriteres}
        desactive={lectureSeule || enCours}
      />
      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
      {!lectureSeule && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {modifie && (
            <Bouton type="button" variante="fantome" onClick={() => { setMode(modeInitial); setCriteres(criteresInitiaux); }} disabled={enCours}>
              <RotateCcw /> Annuler les changements
            </Bouton>
          )}
          <Bouton type="button" onClick={previsualiser} enCours={enCours && !apercu} disabled={!modifie}>
            <Eye /> Prévisualiser et appliquer
          </Bouton>
        </div>
      )}

      <Dialog open={!!apercu} onOpenChange={(o) => { if (!o && !enCours) setApercu(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appliquer les nouveaux critères ?</DialogTitle>
            <DialogDescription>
              Voici l’effet de la modification sur les participants. Les messages déjà publiés restent dans la conversation.
            </DialogDescription>
          </DialogHeader>
          {apercu && (
            <div className="space-y-2">
              <ListeApercu titre="Candidats ajoutés" aide="ils accéderont à la conversation" personnes={apercu.ajoutes} ton="bg-[#E6F4EA] text-[#1F7A3E]" />
              <ListeApercu titre="Candidats retirés" aide="ils perdront l’accès" personnes={apercu.retires} ton="bg-[#FCE4E4] text-[#B42318]" />
              <ListeApercu titre="Ajouts manuels conservés" aide="exceptions d’inclusion" personnes={apercu.exceptionsInclusion} ton="bg-[#E8F0FC] text-[#2F5DA8]" />
              <ListeApercu titre="Exclusions conservées" aide="exceptions d’exclusion" personnes={apercu.exceptionsExclusion} ton="bg-[#EEF0F2] text-[#5B6470]" />
              {apercu.retires.length > 0 && (
                <p className="rounded-lg bg-[#FFF3E0] px-3 py-2 text-[12.5px] text-[#B45309]">
                  {apercu.retires.length} candidat{apercu.retires.length > 1 ? 's' : ''} perdr{apercu.retires.length > 1 ? 'ont' : 'a'} l’accès à cette promotion.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Bouton variante="fantome" onClick={() => setApercu(null)} disabled={enCours}>Revenir</Bouton>
            <Bouton onClick={appliquer} enCours={enCours}>Confirmer et appliquer</Bouton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toast message={message} />
    </Carte>
  );
}
