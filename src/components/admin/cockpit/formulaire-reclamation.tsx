'use client';

import * as React from 'react';
import { enregistrerReclamation, type ReclamationInput } from '@/app/admin/cockpit/actions-dossiers';
import {
  CANAUX, CANAL_LABEL, CATEGORIES_RECLAMATION, CATEGORIE_RECLAMATION_LABEL, PRIORITES, PRIORITE_LABEL,
  STATUTS_RECLAMATION, STATUT_RECLAMATION_LABEL, TYPES_PROBLEME, TYPE_PROBLEME_AIDE, TYPE_PROBLEME_LABEL, type Priorite,
} from '@/lib/cockpit/regles';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { ChampPersonne } from './demandes/champ-personne';

/**
 * Fiche d'une réclamation candidat. La « nature du problème » est le champ
 * décisif : un élève qui ne comprend pas un chapitre relève d'un
 * accompagnement individuel, pas d'une correction technique. Autonome :
 * appelle elle-même l'action serveur.
 */

type Canal = (typeof CANAUX)[number];
type Categorie = (typeof CATEGORIES_RECLAMATION)[number];
type TypeProbleme = (typeof TYPES_PROBLEME)[number];
type Statut = (typeof STATUTS_RECLAMATION)[number];

export function FormulaireReclamation({
  initial, id, onFini, onAnnuler, membres, specialites = [],
}: {
  initial?: Partial<ReclamationInput>;
  id?: string;
  onFini?: (id: string) => void;
  onAnnuler?: () => void;
  membres: { id: string; nom: string }[];
  /** Suggestions de spécialités (saisie libre acceptée). */
  specialites?: string[];
}) {
  const p = React.useId();
  const [candidat, setCandidat] = React.useState<{ id: string | null; label: string }>({
    id: initial?.candidat_id || null,
    label: initial?.candidat_label ?? '',
  });
  const [specialite, setSpecialite] = React.useState(initial?.specialite ?? '');
  const [categorie, setCategorie] = React.useState<Categorie>((initial?.categorie as Categorie) ?? 'fonctionnalite');
  const [typeProbleme, setTypeProbleme] = React.useState<TypeProbleme>((initial?.type_probleme as TypeProbleme) ?? 'individuel');
  const [sujet, setSujet] = React.useState(initial?.sujet ?? '');
  const [description, setDescription] = React.useState(initial?.description ?? '');
  const [canal, setCanal] = React.useState<Canal>((initial?.canal as Canal) ?? 'telephone');
  const [priorite, setPriorite] = React.useState<Priorite>((initial?.priorite as Priorite) ?? 'normale');
  const [statut, setStatut] = React.useState<Statut>((initial?.statut as Statut) ?? 'a_traiter');
  const [assignee, setAssignee] = React.useState(initial?.assignee_id ?? '');
  const [aRecontacter, setARecontacter] = React.useState(!!initial?.a_recontacter);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const input: ReclamationInput = {
      candidat_id: candidat.id ?? '',
      candidat_label: candidat.label.trim(),
      specialite: specialite.trim() || null,
      categorie,
      type_probleme: typeProbleme,
      sujet: sujet.trim(),
      description: description.trim() || null,
      canal,
      priorite,
      statut,
      assignee_id: assignee,
      // Le rattachement à une amélioration se gère depuis la liste : on le conserve tel quel.
      amelioration_id: initial?.amelioration_id ?? '',
      a_recontacter: aRecontacter,
    };
    startTransition(async () => {
      const r = await enregistrerReclamation(input, id);
      if (!r.ok) {
        setErreur(r.erreur);
        return;
      }
      onFini?.(r.data?.id ?? id ?? '');
    });
  }

  const listeSpe = `${p}-specialites`;

  return (
    <form onSubmit={soumettre} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <Libelle htmlFor={`${p}-candidat`}>Candidat</Libelle>
          <ChampPersonne
            id={`${p}-candidat`}
            valeurId={candidat.id}
            valeurLabel={candidat.label}
            requis
            onChange={(v) => setCandidat({ id: v.id, label: v.label })}
          />
        </div>
        <div>
          <Libelle htmlFor={`${p}-spe`}>Spécialité</Libelle>
          <input
            id={`${p}-spe`}
            className={champ}
            value={specialite}
            onChange={(e) => setSpecialite(e.target.value)}
            maxLength={120}
            list={specialites.length > 0 ? listeSpe : undefined}
            placeholder="Ex. : Cardiologie, Odontologie…"
          />
          {specialites.length > 0 && (
            <datalist id={listeSpe}>
              {specialites.map((s) => <option key={s} value={s} />)}
            </datalist>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 block text-[12.5px] font-medium text-(--color-ink-soft)">
          Nature du problème
          <span className="ml-1 font-normal text-(--color-ink-muted)">— évite de demander une correction technique quand un accompagnement suffit</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TYPES_PROBLEME.map((t) => (
            <label
              key={t}
              className={cn(
                'flex cursor-pointer gap-2.5 rounded-xl border p-3 transition-colors',
                typeProbleme === t ? 'border-(--color-primary) bg-(--color-primary-soft)/50 ring-2 ring-(--color-primary)/10' : 'border-(--color-border) bg-white hover:border-(--color-border)',
              )}
            >
              <input
                type="radio"
                name={`${p}-type`}
                value={t}
                checked={typeProbleme === t}
                onChange={() => setTypeProbleme(t)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-(--color-primary)"
              />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-medium text-(--color-ink)">{TYPE_PROBLEME_LABEL[t]}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-(--color-ink-soft)">{TYPE_PROBLEME_AIDE[t]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div>
          <Libelle htmlFor={`${p}-cat`}>Catégorie</Libelle>
          <select id={`${p}-cat`} className={champ} value={categorie} onChange={(e) => setCategorie(e.target.value as Categorie)}>
            {CATEGORIES_RECLAMATION.map((c) => <option key={c} value={c}>{CATEGORIE_RECLAMATION_LABEL[c]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-sujet`}>Sujet</Libelle>
          <input
            id={`${p}-sujet`}
            className={champ}
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            maxLength={300}
            required
            placeholder="Ex. : Planificateur trop chargé"
          />
        </div>
      </div>
      <div>
        <Libelle htmlFor={`${p}-desc`} aide="(ce que vit le candidat, avec ses mots)">Description</Libelle>
        <textarea id={`${p}-desc`} className={`${champ} min-h-[96px]`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={10000} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Libelle htmlFor={`${p}-canal`}>Canal</Libelle>
          <select id={`${p}-canal`} className={champ} value={canal} onChange={(e) => setCanal(e.target.value as Canal)}>
            {CANAUX.map((c) => <option key={c} value={c}>{CANAL_LABEL[c]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-prio`}>Priorité</Libelle>
          <select id={`${p}-prio`} className={champ} value={priorite} onChange={(e) => setPriorite(e.target.value as Priorite)}>
            {PRIORITES.map((x) => <option key={x} value={x}>{PRIORITE_LABEL[x]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-statut`}>Statut</Libelle>
          <select id={`${p}-statut`} className={champ} value={statut} onChange={(e) => setStatut(e.target.value as Statut)}>
            {STATUTS_RECLAMATION.map((s) => <option key={s} value={s}>{STATUT_RECLAMATION_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-assignee`}>Personne affectée</Libelle>
          <select id={`${p}-assignee`} className={champ} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Non affectée</option>
            {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-(--color-ink)">
        <input type="checkbox" className="h-4 w-4 accent-(--color-primary)" checked={aRecontacter} onChange={(e) => setARecontacter(e.target.checked)} />
        Candidat à recontacter
      </label>

      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-(--color-border) pt-3">
        {onAnnuler && <Bouton type="button" variante="fantome" onClick={onAnnuler}>Annuler</Bouton>}
        <Bouton type="submit" enCours={enCours}>{id ? 'Enregistrer les modifications' : 'Enregistrer la réclamation'}</Bouton>
      </div>
    </form>
  );
}
