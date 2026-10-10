'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Layers, ListTodo, Pencil, Unlink } from 'lucide-react';
import {
  changerStatutReclamation, rattacherReclamations, reclamationVersTache, type ReclamationInput,
} from '@/app/admin/cockpit/actions-dossiers';
import {
  CANAL_LABEL, CATEGORIE_RECLAMATION_LABEL, STATUTS_RECLAMATION, STATUT_RECLAMATION_LABEL, STATUT_AMELIORATION_LABEL,
  TYPE_PROBLEME_AIDE, TYPE_PROBLEME_LABEL,
} from '@/lib/cockpit/regles';
import { Avatar, Bouton, Etiquette, PastillePriorite, PastilleStatut, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { FormulaireReclamation } from '@/components/admin/cockpit/formulaire-reclamation';
import { cn } from '@/lib/utils';
import { BoutonAnalyseIa, BoutonReponseIa } from '../demandes/dialogues-ia';
import { dateCourte, dateHeure, Fenetre, Info, majUrl, numero3 } from '../demandes/outils';
import { MarquerRecontacte, SATISFACTION_LABEL } from './recontacter';
import { TON_CATEGORIE } from './liste-reclamations';
import type { ContexteDossiers, ReclamationLigne } from './vue-reclamations';

type StatutReclamation = (typeof STATUTS_RECLAMATION)[number];

/** Fiche d'une réclamation : lecture, statut, tâche, recontact, rattachement, IA. */
export function FicheReclamation({
  ligne, introuvable, ameliorations, noms, membres, moiId, specialites,
}: ContexteDossiers & { ligne: ReclamationLigne | null; introuvable: boolean; specialites: string[] }) {
  const [edition, setEdition] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [statutEnCours, setStatutEnCours] = React.useState<string | null>(null);
  const [tacheCreee, setTacheCreee] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  const amelioration = ligne?.amelioration_id ? ameliorations.find((a) => a.id === ligne.amelioration_id) ?? null : null;
  const tacheId = ligne?.tache_id ?? tacheCreee;

  function fermer(o: boolean) {
    if (o) return;
    setEdition(false);
    setErreur(null);
    setTacheCreee(null);
    majUrl({ r: null });
  }

  async function changerStatut(s: StatutReclamation) {
    if (!ligne || s === ligne.statut) return;
    setErreur(null);
    setStatutEnCours(s);
    const r = await changerStatutReclamation(ligne.id, s);
    setStatutEnCours(null);
    if (!r.ok) setErreur(r.erreur);
    else setMessage(`Statut : ${STATUT_RECLAMATION_LABEL[s]}`);
  }

  function versTache() {
    if (!ligne) return;
    setErreur(null);
    startTransition(async () => {
      const r = await reclamationVersTache(ligne.id);
      if (!r.ok) setErreur(r.erreur);
      else {
        setTacheCreee(r.data?.tacheId ?? null);
        setMessage('Tâche créée dans votre cockpit');
      }
    });
  }

  function detacher() {
    if (!ligne) return;
    setErreur(null);
    startTransition(async () => {
      const r = await rattacherReclamations([ligne.id], null);
      if (!r.ok) setErreur(r.erreur);
      else setMessage('Réclamation détachée de l’amélioration');
    });
  }

  return (
    <>
      <Fenetre
        ouvert={!!ligne || introuvable}
        onOuvert={fermer}
        large
        titre={ligne ? ligne.sujet : 'Réclamation'}
        sousTitre={ligne ? `Reçue le ${dateHeure(ligne.created_at)} · ${CANAL_LABEL[ligne.canal] ?? ligne.canal}` : undefined}
      >
        {!ligne ? (
          <p className="py-6 text-center text-sm text-(--color-ink-soft)">Cette réclamation est introuvable ou ne vous est pas accessible.</p>
        ) : edition ? (
          <FormulaireReclamation
            id={ligne.id}
            membres={membres}
            specialites={specialites}
            initial={versInput(ligne)}
            onAnnuler={() => setEdition(false)}
            onFini={() => {
              setEdition(false);
              setMessage('Réclamation mise à jour');
            }}
          />
        ) : (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft)/60 p-3">
              <Avatar nom={ligne.candidat_label} taille={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-(--color-ink)">{ligne.candidat_label}</p>
                <p className="truncate text-[12.5px] text-(--color-ink-soft)">{ligne.specialite ?? 'Spécialité non renseignée'}</p>
              </div>
              {ligne.candidat_id ? (
                <Link
                  href={`/admin/suivi/candidats/${ligne.candidat_id}`}
                  className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-(--color-primary) hover:underline focus-ring"
                >
                  Fiche candidat <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="text-[12px] text-(--color-ink-muted)">Saisie libre (aucun compte lié)</span>
              )}
            </div>

            <div className="rounded-xl border border-(--color-border) bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Etiquette ton={TON_CATEGORIE[ligne.categorie] ?? 'gris'}>{CATEGORIE_RECLAMATION_LABEL[ligne.categorie] ?? ligne.categorie}</Etiquette>
                <span className="text-[13.5px] font-medium text-(--color-ink)">{TYPE_PROBLEME_LABEL[ligne.type_probleme] ?? ligne.type_probleme}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-(--color-ink-soft)">{TYPE_PROBLEME_AIDE[ligne.type_probleme]}</p>
              {ligne.description && <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-(--color-ink)">{ligne.description}</p>}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Info libelle="Priorité"><PastillePriorite priorite={ligne.priorite} /></Info>
              <Info libelle="Affectée à">
                {ligne.assignee_id ? (ligne.assignee_id === moiId ? 'Moi' : noms[ligne.assignee_id] ?? '—') : <span className="text-(--color-ink-muted)">Personne</span>}
              </Info>
              <Info libelle="Saisie par">{ligne.created_by ? (ligne.created_by === moiId ? 'Moi' : noms[ligne.created_by] ?? '—') : '—'}</Info>
              <Info libelle="Recontact">
                {ligne.a_recontacter ? (
                  <span className="font-medium text-[#1F7A3E]">À recontacter</span>
                ) : ligne.recontacte_at ? (
                  <>Le {dateCourte(ligne.recontacte_at)}{ligne.satisfaction && ` · ${SATISFACTION_LABEL[ligne.satisfaction] ?? ligne.satisfaction}`}</>
                ) : '—'}
              </Info>
            </dl>

            <div>
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Statut</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Changer le statut">
                {STATUTS_RECLAMATION.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={ligne.statut === s}
                    disabled={statutEnCours !== null}
                    onClick={() => changerStatut(s)}
                    className={cn(
                      'h-8 rounded-lg px-1.5 transition-opacity focus-ring disabled:opacity-60',
                      ligne.statut === s ? 'ring-2 ring-(--color-primary)/30' : 'opacity-70 hover:opacity-100',
                    )}
                  >
                    <PastilleStatut statut={s} className={cn(statutEnCours === s && 'animate-pulse')} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-(--color-border) px-3 py-2.5">
              <Layers className="h-4 w-4 text-[#6B4FA0]" />
              {amelioration ? (
                <>
                  <button
                    type="button"
                    onClick={() => majUrl({ r: null, vue: 'ameliorations', a: amelioration.id })}
                    className="min-w-0 truncate text-left text-[13.5px] font-medium text-(--color-ink) hover:text-(--color-primary) focus-ring"
                  >
                    Amélioration n° {numero3(amelioration.numero)} — {amelioration.titre}
                  </button>
                  <PastilleStatut statut={amelioration.statut} libelle={STATUT_AMELIORATION_LABEL[amelioration.statut]} />
                  <button
                    type="button"
                    onClick={detacher}
                    disabled={enCours}
                    className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring"
                  >
                    <Unlink className="h-3.5 w-3.5" /> Détacher
                  </button>
                </>
              ) : ligne.amelioration_id ? (
                <span className="text-[13px] text-(--color-ink-soft)">Rattachée à une amélioration qui ne vous est pas accessible.</span>
              ) : (
                <span className="text-[13px] text-(--color-ink-soft)">Non regroupée — sélectionnez-la dans la liste pour la regrouper dans une amélioration.</span>
              )}
            </div>

            {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}

            <div className="flex flex-wrap items-center gap-2 border-t border-(--color-border) pt-3">
              {tacheId ? (
                <Link
                  href={`/admin/cockpit/taches?t=${tacheId}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#E6F4EA] px-3 text-[13px] font-medium text-[#1F7A3E] hover:bg-[#d7eedf] focus-ring"
                >
                  <ListTodo className="h-4 w-4" /> Voir la tâche <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Bouton type="button" taille="sm" onClick={versTache} enCours={enCours}>
                  {!enCours && <ListTodo />} Créer une tâche
                </Bouton>
              )}
              {ligne.a_recontacter && <MarquerRecontacte reclamationId={ligne.id} onFait={setMessage} />}
              <BoutonReponseIa reclamationId={ligne.id} destinataire={ligne.candidat_label} />
              <BoutonAnalyseIa type="reclamation" id={ligne.id} titre={`${ligne.candidat_label} — ${ligne.sujet}`} />
              <Bouton type="button" variante="fantome" taille="sm" className="ml-auto" onClick={() => setEdition(true)}>
                <Pencil /> Modifier
              </Bouton>
            </div>
          </div>
        )}
      </Fenetre>
      <Toast message={message} />
    </>
  );
}

function versInput(l: ReclamationLigne): Partial<ReclamationInput> {
  return {
    candidat_id: l.candidat_id ?? '',
    candidat_label: l.candidat_label,
    specialite: l.specialite,
    categorie: l.categorie as ReclamationInput['categorie'],
    type_probleme: l.type_probleme as ReclamationInput['type_probleme'],
    sujet: l.sujet,
    description: l.description,
    canal: l.canal as ReclamationInput['canal'],
    priorite: l.priorite as ReclamationInput['priorite'],
    statut: l.statut as ReclamationInput['statut'],
    assignee_id: l.assignee_id ?? '',
    amelioration_id: l.amelioration_id ?? '',
    a_recontacter: l.a_recontacter,
  };
}
