'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, ListTodo, Lock, Pencil, Send } from 'lucide-react';
import { changerStatutDemande, demandeVersTache, type DemandeInput } from '@/app/admin/cockpit/actions-dossiers';
import {
  CANAL_LABEL, NATURE_DEMANDE_LABEL, SOUS_TYPE_LABEL, STATUTS_DEMANDE, STATUT_DEMANDE_LABEL, libelleEcheance,
  type NatureDemande, type StatutDemande,
} from '@/lib/cockpit/regles';
import { Avatar, Bouton, PastillePriorite, PastilleStatut, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { FormulaireDemande } from '@/components/admin/cockpit/formulaire-demande';
import { cn } from '@/lib/utils';
import { BoutonReponseIa } from './dialogues-ia';
import { dateHeure, estEnRetard, Fenetre, IconeCanal, Info, NoteConfidentielle, numero3 } from './outils';
import type { DemandeLigne, Membre } from './vue-demandes';

/** Fiche d'une demande client : lecture, statut en un clic, tâche, réponse préparée par l'IA. */
export function FicheDemande({
  ligne, introuvable, noms, membres, moiId, aujourdHui, onFermer,
}: {
  ligne: DemandeLigne | null;
  introuvable: boolean;
  noms: Record<string, string>;
  membres: Membre[];
  moiId: string;
  aujourdHui: string;
  onFermer: () => void;
}) {
  const [edition, setEdition] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [statutEnCours, setStatutEnCours] = React.useState<string | null>(null);
  const [tacheEnCours, startTache] = React.useTransition();
  const [tacheCreee, setTacheCreee] = React.useState<string | null>(null);

  const ouvert = !!ligne || introuvable;

  function fermer(o: boolean) {
    if (o) return;
    setEdition(false);
    setErreur(null);
    setTacheCreee(null);
    onFermer();
  }

  async function changerStatut(s: StatutDemande) {
    if (!ligne || s === ligne.statut) return;
    setErreur(null);
    setStatutEnCours(s);
    const r = await changerStatutDemande(ligne.id, s);
    setStatutEnCours(null);
    if (!r.ok) setErreur(r.erreur);
    else setMessage(`Statut : ${STATUT_DEMANDE_LABEL[s]}`);
  }

  function versTache() {
    if (!ligne) return;
    setErreur(null);
    startTache(async () => {
      const r = await demandeVersTache(ligne.id);
      if (!r.ok) setErreur(r.erreur);
      else {
        setTacheCreee(r.data?.tacheId ?? null);
        setMessage('Tâche créée dans votre cockpit');
      }
    });
  }

  const tacheId = ligne?.tache_id ?? tacheCreee;
  const comptable = ligne?.nature === 'comptable';

  return (
    <>
      <Fenetre
        ouvert={ouvert}
        onOuvert={fermer}
        large
        titre={ligne ? (
          <span className="flex flex-wrap items-center gap-x-2">
            <span>Demande n° {numero3(ligne.numero)}</span>
            <span className="text-(--color-ink-muted)">·</span>
            <span className="text-(--color-primary)">{ligne.sous_type ? SOUS_TYPE_LABEL[ligne.sous_type] : NATURE_DEMANDE_LABEL[ligne.nature as NatureDemande]}</span>
          </span>
        ) : 'Demande'}
        sousTitre={ligne ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {comptable && <Lock className="h-3.5 w-3.5 text-(--color-primary)" />}
            {NATURE_DEMANDE_LABEL[ligne.nature as NatureDemande]} · reçue {dateHeure(ligne.recue_at)} par {CANAL_LABEL[ligne.canal]?.toLowerCase() ?? ligne.canal}
          </span>
        ) : undefined}
      >
        {!ligne ? (
          <p className="py-6 text-center text-sm text-(--color-ink-soft)">Cette demande est introuvable ou ne vous est pas accessible.</p>
        ) : edition ? (
          <FormulaireDemande
            id={ligne.id}
            membres={membres}
            initial={versInput(ligne)}
            onAnnuler={() => setEdition(false)}
            onFini={() => {
              setEdition(false);
              setMessage('Demande mise à jour');
            }}
          />
        ) : (
          <div className="grid gap-4">
            {/* Client */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface-soft)/60 p-3">
              <Avatar nom={ligne.client_label} taille={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-(--color-ink)">{ligne.client_label}</p>
                <p className="flex items-center gap-1 truncate text-[12.5px] text-(--color-ink-soft)">
                  <IconeCanal canal={ligne.canal} className="h-3.5 w-3.5" />
                  {ligne.client_contact || 'Coordonnées non renseignées'}
                </p>
              </div>
              {ligne.client_id && (
                <Link
                  href={`/admin/suivi/candidats/${ligne.client_id}`}
                  className="inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-(--color-primary) hover:underline focus-ring"
                >
                  Fiche candidat <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div>
              <p className="text-[11.5px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Motif</p>
              <p className="mt-0.5 text-[15px] font-medium text-(--color-ink)">{ligne.motif}</p>
              {ligne.resume && <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-(--color-ink-soft)">{ligne.resume}</p>}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Info libelle="Priorité"><PastillePriorite priorite={ligne.priorite} /></Info>
              <Info libelle="Chargé(e)">
                {ligne.assignee_id ? (ligne.assignee_id === moiId ? 'Moi' : noms[ligne.assignee_id] ?? '—') : <span className="text-(--color-ink-muted)">Non affectée</span>}
              </Info>
              <Info libelle="Échéance">
                <span className={cn(estEnRetard(ligne, aujourdHui) && 'font-medium text-[#B42318]')}>
                  {libelleEcheance(ligne.echeance, aujourdHui)}{estEnRetard(ligne, aujourdHui) && ' · en retard'}
                </span>
              </Info>
              <Info libelle="Saisie par">{ligne.created_by === moiId ? 'Moi' : noms[ligne.created_by] ?? '—'}</Info>
            </dl>

            <div>
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Statut</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Changer le statut">
                {STATUTS_DEMANDE.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={ligne.statut === s}
                    disabled={statutEnCours !== null}
                    onClick={() => changerStatut(s)}
                    className={cn(
                      'h-8 rounded-lg px-3 text-[13px] font-medium transition-colors focus-ring disabled:opacity-60',
                      ligne.statut === s ? 'ring-2 ring-(--color-primary)/30' : 'opacity-70 hover:opacity-100',
                    )}
                  >
                    <PastilleStatut statut={s} className={cn(statutEnCours === s && 'animate-pulse')} />
                  </button>
                ))}
              </div>
              {ligne.statut === 'terminee' && ligne.cloturee_at && (
                <p className="mt-1 text-[12px] text-(--color-ink-soft)">Terminée le {dateHeure(ligne.cloturee_at)}</p>
              )}
            </div>

            {comptable && <NoteConfidentielle />}
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
                <Bouton type="button" taille="sm" onClick={versTache} enCours={tacheEnCours}>
                  {!tacheEnCours && <ListTodo />} Transformer en tâche
                </Bouton>
              )}
              <BoutonReponseIa
                demandeId={ligne.id}
                destinataire={ligne.client_label}
                lienEcrire={`/admin/cockpit/messagerie?relance=demande&d=${ligne.id}`}
              />
              <Link
                href={`/admin/cockpit/messagerie?relance=demande&d=${ligne.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
              >
                <Send className="h-4 w-4" /> Écrire au client
              </Link>
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

function versInput(l: DemandeLigne): Partial<DemandeInput> {
  return {
    client_id: l.client_id ?? '',
    client_label: l.client_label,
    client_contact: l.client_contact,
    canal: l.canal as DemandeInput['canal'],
    recue_at: l.recue_at,
    nature: l.nature as DemandeInput['nature'],
    sous_type: (l.sous_type ?? '') as DemandeInput['sous_type'],
    motif: l.motif,
    resume: l.resume,
    priorite: l.priorite as DemandeInput['priorite'],
    assignee_id: l.assignee_id ?? '',
    echeance: l.echeance ?? '',
    statut: l.statut as DemandeInput['statut'],
  };
}
