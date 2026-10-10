'use client';

import * as React from 'react';
import { enregistrerDemande, type DemandeInput } from '@/app/admin/cockpit/actions-dossiers';
import {
  CANAUX, CANAL_LABEL, NATURES_DEMANDE, NATURE_DEMANDE_LABEL, PRIORITES, PRIORITE_LABEL, SOUS_TYPES_COMPTABLES,
  SOUS_TYPE_LABEL, STATUTS_DEMANDE, STATUT_DEMANDE_LABEL, type NatureDemande, type Priorite, type StatutDemande,
} from '@/lib/cockpit/regles';
import { Bouton, champ, Libelle } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { ChampPersonne } from './demandes/champ-personne';
import { depuisChampLocal, NoteConfidentielle, versChampLocal } from './demandes/outils';

/**
 * Fiche d'une demande client (appel, e-mail, courrier…) : identité du client
 * (base Major ECN ou saisie libre), date et heure de l'appel, nature et
 * sous-type comptable, motif, résumé, priorité, personne chargée du
 * traitement, échéance et statut. Autonome : appelle elle-même l'action
 * serveur. « Enregistrer un appel » = `initial={{ canal: 'telephone' }}`.
 */

type Canal = (typeof CANAUX)[number];
type SousType = (typeof SOUS_TYPES_COMPTABLES)[number];

export function FormulaireDemande({
  initial, id, onFini, onAnnuler, membres,
}: {
  initial?: Partial<DemandeInput>;
  id?: string;
  onFini?: (id: string) => void;
  onAnnuler?: () => void;
  membres: { id: string; nom: string }[];
}) {
  const p = React.useId();
  const [client, setClient] = React.useState<{ id: string | null; label: string }>({
    id: initial?.client_id || null,
    label: initial?.client_label ?? '',
  });
  const [contact, setContact] = React.useState(initial?.client_contact ?? '');
  const [canal, setCanal] = React.useState<Canal>((initial?.canal as Canal) ?? 'telephone');
  // Nouvelle fiche : l'appel est daté de maintenant (modifiable).
  const [recue, setRecue] = React.useState(() => (initial?.recue_at || !id ? versChampLocal(initial?.recue_at || null) : ''));
  const [nature, setNature] = React.useState<NatureDemande>((initial?.nature as NatureDemande) ?? 'administrative');
  const [sousType, setSousType] = React.useState<SousType>((initial?.sous_type as SousType) || 'facture');
  const [motif, setMotif] = React.useState(initial?.motif ?? '');
  const [resume, setResume] = React.useState(initial?.resume ?? '');
  const [priorite, setPriorite] = React.useState<Priorite>((initial?.priorite as Priorite) ?? 'normale');
  const [assignee, setAssignee] = React.useState(initial?.assignee_id ?? '');
  const [echeance, setEcheance] = React.useState(initial?.echeance ?? '');
  const [statut, setStatut] = React.useState<StatutDemande>((initial?.statut as StatutDemande) ?? 'a_traiter');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const input: DemandeInput = {
      client_id: client.id ?? '',
      client_label: client.label.trim(),
      client_contact: contact.trim() || null,
      canal,
      recue_at: depuisChampLocal(recue),
      nature,
      sous_type: nature === 'comptable' ? sousType : '',
      motif: motif.trim(),
      resume: resume.trim() || null,
      priorite,
      assignee_id: assignee,
      echeance,
      statut,
    };
    startTransition(async () => {
      const r = await enregistrerDemande(input, id);
      if (!r.ok) {
        setErreur(r.erreur);
        return;
      }
      onFini?.(r.data?.id ?? id ?? '');
    });
  }

  return (
    <form onSubmit={soumettre} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Libelle htmlFor={`${p}-client`}>Client</Libelle>
          <ChampPersonne
            id={`${p}-client`}
            valeurId={client.id}
            valeurLabel={client.label}
            requis
            onChange={(v) => {
              setClient({ id: v.id, label: v.label });
              if (v.email && !contact.trim()) setContact(v.email);
            }}
          />
        </div>
        <div>
          <Libelle htmlFor={`${p}-contact`} aide="(téléphone ou e-mail)">Coordonnées</Libelle>
          <input id={`${p}-contact`} className={champ} value={contact} onChange={(e) => setContact(e.target.value)} maxLength={300} />
        </div>
        <div className="grid grid-cols-[1fr_1.3fr] gap-2">
          <div>
            <Libelle htmlFor={`${p}-canal`}>Canal</Libelle>
            <select id={`${p}-canal`} className={champ} value={canal} onChange={(e) => setCanal(e.target.value as Canal)}>
              {CANAUX.map((c) => <option key={c} value={c}>{CANAL_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <Libelle htmlFor={`${p}-recue`}>{canal === 'telephone' ? 'Date et heure de l’appel' : 'Reçue le'}</Libelle>
            <input id={`${p}-recue`} type="datetime-local" className={champ} value={recue} onChange={(e) => setRecue(e.target.value)} />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 block text-[12.5px] font-medium text-(--color-ink-soft)">Nature de la demande</legend>
        <div className="flex flex-wrap gap-1.5">
          {NATURES_DEMANDE.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={nature === n}
              onClick={() => setNature(n)}
              className={cn(
                'h-8 rounded-full px-3 text-[13px] font-medium transition-colors focus-ring',
                nature === n ? 'bg-(--color-primary) text-white' : 'border border-(--color-border) bg-white text-(--color-ink-soft) hover:bg-(--color-primary-soft)',
              )}
            >
              {NATURE_DEMANDE_LABEL[n]}
            </button>
          ))}
        </div>
        {nature === 'comptable' && (
          <div className="mt-3 grid gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft)/60 p-3">
            <div>
              <Libelle htmlFor={`${p}-sous`}>Type de demande comptable</Libelle>
              <select id={`${p}-sous`} className={champ} value={sousType} onChange={(e) => setSousType(e.target.value as SousType)}>
                {SOUS_TYPES_COMPTABLES.map((s) => <option key={s} value={s}>{SOUS_TYPE_LABEL[s]}</option>)}
              </select>
            </div>
            <NoteConfidentielle />
          </div>
        )}
      </fieldset>

      <div>
        <Libelle htmlFor={`${p}-motif`}>Motif</Libelle>
        <input
          id={`${p}-motif`}
          className={champ}
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          maxLength={300}
          required
          placeholder="Ex. : demande de facture pour la prépa annuelle"
        />
      </div>
      <div>
        <Libelle htmlFor={`${p}-resume`} aide="(ce qui a été dit, ce qui a été promis)">Résumé</Libelle>
        <textarea id={`${p}-resume`} className={`${champ} min-h-[96px]`} value={resume} onChange={(e) => setResume(e.target.value)} maxLength={10000} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Libelle htmlFor={`${p}-prio`}>Priorité</Libelle>
          <select id={`${p}-prio`} className={champ} value={priorite} onChange={(e) => setPriorite(e.target.value as Priorite)}>
            {PRIORITES.map((x) => <option key={x} value={x}>{PRIORITE_LABEL[x]}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-assignee`}>Chargé(e) du traitement</Libelle>
          <select id={`${p}-assignee`} className={champ} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Non affectée</option>
            {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div>
          <Libelle htmlFor={`${p}-echeance`}>Échéance</Libelle>
          <input id={`${p}-echeance`} type="date" className={champ} value={echeance} onChange={(e) => setEcheance(e.target.value)} />
        </div>
        <div>
          <Libelle htmlFor={`${p}-statut`}>Statut</Libelle>
          <select id={`${p}-statut`} className={champ} value={statut} onChange={(e) => setStatut(e.target.value as StatutDemande)}>
            {STATUTS_DEMANDE.map((s) => <option key={s} value={s}>{STATUT_DEMANDE_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-(--color-border) pt-3">
        {onAnnuler && <Bouton type="button" variante="fantome" onClick={onAnnuler}>Annuler</Bouton>}
        <Bouton type="submit" enCours={enCours}>{id ? 'Enregistrer les modifications' : canal === 'telephone' ? 'Enregistrer l’appel' : 'Enregistrer la demande'}</Bouton>
      </div>
    </form>
  );
}
