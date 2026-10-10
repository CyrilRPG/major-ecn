'use client';

import * as React from 'react';
import type { EnseignantGroupe, Participant } from '@/lib/echanges/serveur/admin';
import type { Criteres, ModeParticipants } from '@/lib/echanges/regles';
import { cn } from '@/lib/utils';
import { ONGLETS_FICHE, type OngletFiche, type Specialite, type ValeursPromotion } from './commun';
import { EnseignantsPromotion, type MembreEquipe } from './enseignants-promotion';
import { FormulairePromotion } from './formulaire-promotion';
import { OngletCriteres } from './onglet-criteres';
import { ParticipantsPromotion } from './participants-promotion';
import { QuestionsAReaffecter, type QuestionAReaffecter } from './questions-reaffecter';
import { SynthesePromotion, type Compteurs, type Epingle, type SyntheseGroupe } from './synthese-promotion';

/**
 * Fiche d'une promotion (§83) : onglets Synthèse, Paramètres, Critères,
 * Participants, Enseignants, Questions à réaffecter. L'onglet courant est
 * reflété dans l'adresse (?onglet=…) sans recharger la page. Une promotion
 * archivée est consultable en lecture seule.
 */
export function FichePromotion({
  ongletInitial, groupe, compteurs, relanceHeures, epingles, peutRgpd, valeurs, mode, criteres, specialites,
  participants, enseignants, equipe, questions,
}: {
  ongletInitial: OngletFiche;
  groupe: SyntheseGroupe;
  compteurs: Compteurs;
  relanceHeures: number;
  epingles: Epingle[];
  peutRgpd: boolean;
  valeurs: ValeursPromotion;
  mode: ModeParticipants;
  criteres: Criteres;
  specialites: Specialite[];
  participants: Participant[];
  enseignants: EnseignantGroupe[];
  equipe: MembreEquipe[];
  questions: QuestionAReaffecter[];
}) {
  const [onglet, setOnglet] = React.useState<OngletFiche>(ongletInitial);
  const lectureSeule = groupe.statut === 'archivee';
  const enAttente = enseignants.reduce((n, e) => n + e.questionsEnAttente, 0);
  const actifs = participants.filter((p) => p.statut === 'actif' && !p.exclusionForcee).length;

  const libelles: Record<OngletFiche, React.ReactNode> = {
    synthese: 'Synthèse',
    parametres: 'Paramètres',
    criteres: 'Critères',
    participants: <>Participants <span className="text-(--color-ink-muted)">{actifs.toLocaleString('fr-FR')}</span></>,
    enseignants: <>Enseignants <span className="text-(--color-ink-muted)">{enseignants.filter((e) => e.actif).length}</span></>,
    questions: questions.length > 0
      ? <>Questions à réaffecter <span className="rounded-full bg-[#FFF0E1] px-1.5 text-[11.5px] font-semibold text-[#C2570C]">{questions.length}</span></>
      : 'Questions à réaffecter',
  };

  function changer(o: OngletFiche) {
    setOnglet(o);
    const url = new URL(window.location.href);
    if (o === 'synthese') url.searchParams.delete('onglet'); else url.searchParams.set('onglet', o);
    window.history.replaceState(window.history.state, '', url);
  }

  return (
    <div>
      {lectureSeule && (
        <p className="mb-3 rounded-xl bg-[#F1EDF7] px-3 py-2 text-[13px] text-[#6B4FA0]">
          Promotion archivée : consultation seule. Les paramètres, participants et enseignants ne sont plus modifiables.
        </p>
      )}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-(--color-surface-soft) p-1" role="tablist" aria-label="Rubriques de la promotion">
        {ONGLETS_FICHE.map((o) => (
          <button
            key={o}
            type="button"
            role="tab"
            aria-selected={onglet === o}
            onClick={() => changer(o)}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-ring',
              onglet === o ? 'bg-white text-(--color-primary) shadow-sm' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
            )}
          >
            {libelles[o]}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {onglet === 'synthese' && (
          <SynthesePromotion
            groupe={groupe}
            compteurs={compteurs}
            relanceHeures={relanceHeures}
            aReaffecter={questions.length}
            enAttente={enAttente}
            epingles={epingles}
            peutRgpd={peutRgpd}
          />
        )}
        {onglet === 'parametres' && (
          <FormulairePromotion groupeId={groupe.id} initial={valeurs} specialites={specialites} lectureSeule={lectureSeule} />
        )}
        {onglet === 'criteres' && (
          <OngletCriteres groupeId={groupe.id} mode={mode} criteres={criteres} specialites={specialites} lectureSeule={lectureSeule} />
        )}
        {onglet === 'participants' && <ParticipantsPromotion groupeId={groupe.id} liste={participants} lectureSeule={lectureSeule} />}
        {onglet === 'enseignants' && <EnseignantsPromotion groupeId={groupe.id} enseignants={enseignants} equipe={equipe} lectureSeule={lectureSeule} />}
        {onglet === 'questions' && <QuestionsAReaffecter questions={questions} enseignants={enseignants} lectureSeule={lectureSeule} />}
      </div>
    </div>
  );
}
