'use client';

import * as React from 'react';
import { enregistrerAmelioration, type AmeliorationInput } from '@/app/admin/cockpit/actions-dossiers';
import {
  PRIORITES, PRIORITE_LABEL, STATUTS_AMELIORATION, STATUT_AMELIORATION_LABEL, type Priorite,
} from '@/lib/cockpit/regles';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';

type Statut = (typeof STATUTS_AMELIORATION)[number];

/**
 * Amélioration (correction à piloter) : problème constaté, action prévue,
 * suivi, priorité, statut, responsable et échéance. `reclamationIds` :
 * réclamations à rattacher à l'enregistrement (regroupement).
 */
export function FormulaireAmelioration({
  initial, id, reclamationIds = [], modules = [], onFini, onAnnuler, membres,
}: {
  initial?: Partial<AmeliorationInput>;
  id?: string;
  reclamationIds?: string[];
  modules?: string[];
  onFini?: (id: string) => void;
  onAnnuler?: () => void;
  membres: { id: string; nom: string }[];
}) {
  const p = React.useId();
  const [titre, setTitre] = React.useState(initial?.titre ?? '');
  const [module, setModule] = React.useState(initial?.module ?? '');
  const [probleme, setProbleme] = React.useState(initial?.probleme ?? '');
  const [action, setAction] = React.useState(initial?.action_prevue ?? '');
  const [suivi, setSuivi] = React.useState(initial?.suivi ?? '');
  const [priorite, setPriorite] = React.useState<Priorite>((initial?.priorite as Priorite) ?? 'normale');
  const [statut, setStatut] = React.useState<Statut>((initial?.statut as Statut) ?? 'a_planifier');
  const [responsable, setResponsable] = React.useState(initial?.responsable_id ?? '');
  const [echeance, setEcheance] = React.useState(initial?.echeance ?? '');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const input: AmeliorationInput = {
      titre: titre.trim(),
      module: module.trim() || null,
      probleme: probleme.trim() || null,
      action_prevue: action.trim() || null,
      suivi: suivi.trim() || null,
      priorite,
      statut,
      responsable_id: responsable,
      echeance,
    };
    startTransition(async () => {
      const r = await enregistrerAmelioration(input, id, reclamationIds);
      if (!r.ok) {
        setErreur(r.erreur);
        return;
      }
      onFini?.(r.data?.id ?? id ?? '');
    });
  }

  const realiseeBientot = (statut === 'realisee' || statut === 'verifiee') && initial?.statut !== 'realisee' && initial?.statut !== 'verifiee';

  return (
    <form onSubmit={soumettre} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <Libelle htmlFor={`${p}-titre`}>Titre</Libelle>
          <input
            id={`${p}-titre`}
            className={champ}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
            maxLength={300}
            placeholder="Ex. : Planificateur trop chargé"
          />
        </div>
        <div>
          <Libelle htmlFor={`${p}-module`}>Module concerné</Libelle>
          <input
            id={`${p}-module`}
            className={champ}
            value={module}
            onChange={(e) => setModule(e.target.value)}
            maxLength={120}
            list={modules.length > 0 ? `${p}-modules` : undefined}
            placeholder="Ex. : Planificateur adaptatif"
          />
          {modules.length > 0 && (
            <datalist id={`${p}-modules`}>
              {modules.map((m) => <option key={m} value={m} />)}
            </datalist>
          )}
        </div>
      </div>
      <div>
        <Libelle htmlFor={`${p}-pb`}>Problème</Libelle>
        <textarea id={`${p}-pb`} className={`${champ} min-h-[72px]`} value={probleme} onChange={(e) => setProbleme(e.target.value)} placeholder="Ce que les candidats constatent, et dans quel cas." />
      </div>
      <div>
        <Libelle htmlFor={`${p}-action`}>Action</Libelle>
        <textarea id={`${p}-action`} className={`${champ} min-h-[72px]`} value={action} onChange={(e) => setAction(e.target.value)} placeholder="La correction prévue (à demander au développeur, à l’équipe pédagogique…)." />
      </div>
      <div>
        <Libelle htmlFor={`${p}-suivi`}>Suivi</Libelle>
        <textarea id={`${p}-suivi`} className={`${champ} min-h-[60px]`} value={suivi} onChange={(e) => setSuivi(e.target.value)} placeholder="Où en est-on ? Comment vérifier que c’est corrigé ?" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Libelle htmlFor={`${p}-prio`}>Priorité</Libelle>
          <select id={`${p}-prio`} className={champ} value={priorite} onChange={(e) => setPriorite(e.target.value as Priorite)}>
            {PRIORITES.map((x) => <option key={x} value={x}>{PRIORITE_LABEL[x]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-statut`}>Statut</Libelle>
          <select id={`${p}-statut`} className={champ} value={statut} onChange={(e) => setStatut(e.target.value as Statut)}>
            {STATUTS_AMELIORATION.map((s) => <option key={s} value={s}>{STATUT_AMELIORATION_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-resp`}>Responsable</Libelle>
          <select id={`${p}-resp`} className={champ} value={responsable} onChange={(e) => setResponsable(e.target.value)}>
            <option value="">Non affectée</option>
            {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-ech`}>Échéance</Libelle>
          <input id={`${p}-ech`} type="date" className={champ} value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </div>
      </div>
      {realiseeBientot && id && (
        <p className="rounded-lg bg-[#E6F4EA] px-3 py-2 text-[12.5px] text-[#1F7A3E]">
          À l’enregistrement, les candidats concernés passeront « à recontacter ».
        </p>
      )}
      {reclamationIds.length > 0 && (
        <p className="text-[12.5px] text-(--color-ink-soft)">
          {reclamationIds.length > 1 ? `${reclamationIds.length} réclamations seront rattachées` : '1 réclamation sera rattachée'} à cette amélioration (chaque dossier individuel est conservé).
        </p>
      )}
      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}
      <div className="flex flex-wrap justify-end gap-2 border-t border-(--color-border) pt-3">
        {onAnnuler && <Bouton type="button" variante="fantome" onClick={onAnnuler}>Annuler</Bouton>}
        <Bouton type="submit" enCours={enCours}>{id ? 'Enregistrer les modifications' : 'Créer l’amélioration'}</Bouton>
      </div>
    </form>
  );
}
