'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Lightbulb, MessageSquareWarning, PhoneOutgoing, Plus, Wrench } from 'lucide-react';
import { AMELIORATION_OUVERTE, RECLAMATION_OUVERTE } from '@/lib/cockpit/regles';
import { Bouton, EntetePage } from '@/components/admin/cockpit/ui';
import { FormulaireReclamation } from '@/components/admin/cockpit/formulaire-reclamation';
import { cn } from '@/lib/utils';
import { Fenetre, majUrl, Tuile } from '../demandes/outils';
import { FormulaireAmelioration } from './formulaire-amelioration';
import { ListeReclamations } from './liste-reclamations';
import { ListeAmeliorations } from './liste-ameliorations';
import { FicheReclamation } from './fiche-reclamation';
import { FicheAmelioration } from './fiche-amelioration';

export type ReclamationLigne = {
  id: string;
  created_by: string | null;
  candidat_id: string | null;
  candidat_label: string;
  specialite: string | null;
  categorie: string;
  type_probleme: string;
  sujet: string;
  description: string | null;
  canal: string;
  priorite: string;
  statut: string;
  amelioration_id: string | null;
  assignee_id: string | null;
  tache_id: string | null;
  a_recontacter: boolean;
  recontacte_at: string | null;
  satisfaction: string | null;
  resolue_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AmeliorationLigne = {
  id: string;
  numero: number;
  titre: string;
  module: string | null;
  probleme: string | null;
  action_prevue: string | null;
  suivi: string | null;
  priorite: string;
  statut: string;
  responsable_id: string | null;
  echeance: string | null;
  tache_id: string | null;
  created_by: string | null;
  realisee_at: string | null;
  created_at: string;
  updated_at: string;
  /** Candidats DISTINCTS concernés (toutes réclamations rattachées). */
  candidats: number;
  /** Réclamations rattachées (toutes, visibles ou non). */
  reclamations: number;
  aRecontacter: number;
};

export type Membre = { id: string; nom: string };

export type ContexteDossiers = {
  reclamations: ReclamationLigne[];
  ameliorations: AmeliorationLigne[];
  noms: Record<string, string>;
  membres: Membre[];
  moiId: string;
  estAdmin: boolean;
  aujourdHui: string;
};

/** Clé d'un candidat : son compte, ou à défaut son nom saisi. */
export const cleCandidat = (r: { candidat_id: string | null; candidat_label: string }) =>
  r.candidat_id ?? `libelle:${r.candidat_label.trim().toLowerCase()}`;

const unique = (xs: (string | null | undefined)[]) =>
  [...new Set(xs.map((x) => (x ?? '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));

export function VueReclamations(props: ContexteDossiers) {
  const { reclamations, ameliorations, membres, estAdmin } = props;
  const sp = useSearchParams();
  const vue = sp.get('vue') === 'ameliorations' ? 'ameliorations' : 'reclamations';
  const reclamationId = sp.get('r');
  const ameliorationId = sp.get('a');
  const [nouveau, setNouveau] = React.useState<null | 'reclamation' | 'amelioration'>(null);

  const ouvertes = reclamations.filter((r) => RECLAMATION_OUVERTE(r.statut));
  const amelOuvertes = ameliorations.filter((a) => AMELIORATION_OUVERTE(a.statut));
  const aRecontacter = new Set(reclamations.filter((r) => r.a_recontacter).map(cleCandidat)).size;
  const urgentes = ouvertes.filter((r) => r.priorite === 'urgente' || r.priorite === 'haute').length;
  const aValider = ameliorations.filter((a) => a.statut === 'a_valider').length;

  const specialites = unique(reclamations.map((r) => r.specialite));
  const modules = unique(ameliorations.map((a) => a.module));

  const reclamation = reclamationId ? reclamations.find((r) => r.id === reclamationId) ?? null : null;
  const amelioration = ameliorationId ? ameliorations.find((a) => a.id === ameliorationId) ?? null : null;

  const pluriel = (n: number, s: string, p: string) => `${n} ${n > 1 ? p : s}`;

  return (
    <>
      <EntetePage
        titre="Réclamations & Améliorations"
        sousTitre="Chaque retour de candidat est suivi individuellement ; les reproches récurrents sont regroupés en améliorations à piloter, puis les candidats sont recontactés."
        actions={(
          <>
            {estAdmin && (
              <Bouton variante="contour" onClick={() => setNouveau('amelioration')}><Lightbulb /> Nouvelle amélioration</Bouton>
            )}
            <Bouton onClick={() => setNouveau('reclamation')}><Plus /> Nouvelle réclamation</Bouton>
          </>
        )}
      />

      <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Tuile
          icone={MessageSquareWarning}
          libelle="Retours ouverts"
          valeur={ouvertes.length}
          ton="orange"
          actif={vue === 'reclamations'}
          onClick={() => majUrl({ vue: null })}
        />
        <Tuile
          icone={Wrench}
          libelle="Améliorations en cours"
          valeur={amelOuvertes.length}
          ton="bleu"
          actif={vue === 'ameliorations'}
          onClick={() => majUrl({ vue: 'ameliorations' })}
        />
        <Tuile
          icone={PhoneOutgoing}
          libelle="Clients à recontacter"
          valeur={aRecontacter}
          ton="vert"
          onClick={() => majUrl({ vue: null, filtre: 'recontacter' })}
        />
      </div>
      <p className="mb-5 text-[12.5px] text-(--color-ink-soft)">
        {pluriel(urgentes, 'réclamation urgente', 'réclamations urgentes')}
        {' · '}
        {pluriel(aValider, 'amélioration à valider', 'améliorations à valider')}
        {' · '}
        {pluriel(aRecontacter, 'client à recontacter', 'clients à recontacter')}
      </p>

      <div role="tablist" aria-label="Vues" className="mb-4 inline-flex rounded-xl border border-(--color-border) bg-(--color-surface) p-1">
        {([
          ['reclamations', 'Réclamations clients', ouvertes.length],
          ['ameliorations', 'Améliorations', amelOuvertes.length],
        ] as const).map(([cle, libelle, n]) => (
          <button
            key={cle}
            type="button"
            role="tab"
            aria-selected={vue === cle}
            onClick={() => majUrl({ vue: cle === 'reclamations' ? null : cle })}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13.5px] font-medium transition-colors focus-ring',
              vue === cle ? 'bg-(--color-primary) text-white shadow-sm' : 'text-(--color-ink-soft) hover:bg-(--color-primary-soft) hover:text-(--color-primary)',
            )}
          >
            {libelle}
            <span className={cn('rounded-full px-1.5 text-[11.5px]', vue === cle ? 'bg-white/20' : 'bg-[#F3EEF0] text-(--color-ink-soft)')}>{n}</span>
          </button>
        ))}
      </div>

      {vue === 'reclamations'
        ? <ListeReclamations {...props} filtreRecontacter={sp.get('filtre') === 'recontacter'} />
        : <ListeAmeliorations {...props} />}

      <Fenetre
        ouvert={nouveau !== null}
        onOuvert={(o) => { if (!o) setNouveau(null); }}
        titre={nouveau === 'amelioration' ? 'Nouvelle amélioration' : 'Nouvelle réclamation'}
        sousTitre={nouveau === 'amelioration'
          ? 'Une correction à piloter, à laquelle vous rattacherez les réclamations concernées.'
          : 'Un retour de candidat, suivi individuellement jusqu’à sa résolution.'}
        large
      >
        {nouveau === 'reclamation' && (
          <FormulaireReclamation
            membres={membres}
            specialites={specialites}
            onAnnuler={() => setNouveau(null)}
            onFini={(id) => {
              setNouveau(null);
              majUrl({ vue: null, a: null, r: id || null });
            }}
          />
        )}
        {nouveau === 'amelioration' && (
          <FormulaireAmelioration
            membres={membres}
            modules={modules}
            onAnnuler={() => setNouveau(null)}
            onFini={(id) => {
              setNouveau(null);
              majUrl({ vue: 'ameliorations', r: null, a: id || null });
            }}
          />
        )}
      </Fenetre>

      <FicheReclamation
        key={`r-${reclamationId ?? ''}`}
        {...props}
        ligne={reclamation}
        introuvable={!!reclamationId && !reclamation}
        specialites={specialites}
      />
      <FicheAmelioration
        key={`a-${ameliorationId ?? ''}`}
        {...props}
        ligne={reclamationId ? null : amelioration}
        introuvable={!!ameliorationId && !amelioration && !reclamationId}
        modules={modules}
      />
    </>
  );
}
