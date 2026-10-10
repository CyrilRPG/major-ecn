'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, ListTodo, Pencil, PhoneOutgoing, Unlink } from 'lucide-react';
import {
  ameliorationVersTache, changerStatutAmelioration, rattacherReclamations, type AmeliorationInput,
} from '@/app/admin/cockpit/actions-dossiers';
import { STATUTS_AMELIORATION, STATUT_AMELIORATION_LABEL, libelleEcheance } from '@/lib/cockpit/regles';
import { Avatar, Bouton, PastillePriorite, PastilleStatut, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { cn } from '@/lib/utils';
import { BoutonAnalyseIa } from '../demandes/dialogues-ia';
import { dateCourte, estEnRetard, Fenetre, Info, majUrl, numero3 } from '../demandes/outils';
import { FormulaireAmelioration } from './formulaire-amelioration';
import { MarquerRecontacte, SATISFACTION_LABEL } from './recontacter';
import type { AmeliorationLigne, ContexteDossiers, ReclamationLigne } from './vue-reclamations';

const cleCandidat = (r: ReclamationLigne) => r.candidat_id ?? `libelle:${r.candidat_label.trim().toLowerCase()}`;

type StatutAmelioration = (typeof STATUTS_AMELIORATION)[number];

/**
 * Fiche d'une amélioration : problème / action / suivi, statut, tâche de
 * pilotage, réclamations rattachées (chacune vers sa fiche candidat) et
 * candidats à recontacter une fois la correction réalisée.
 */
export function FicheAmelioration({
  ligne, introuvable, reclamations, noms, membres, moiId, aujourdHui, modules,
}: ContexteDossiers & { ligne: AmeliorationLigne | null; introuvable: boolean; modules: string[] }) {
  const [edition, setEdition] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [statutEnCours, setStatutEnCours] = React.useState<string | null>(null);
  const [tacheCreee, setTacheCreee] = React.useState<string | null>(null);
  const [enCours, startTransition] = React.useTransition();

  const liees = ligne ? reclamations.filter((r) => r.amelioration_id === ligne.id) : [];
  const aRecontacter = liees.filter((r) => r.a_recontacter);
  const recontactes = liees.filter((r) => r.recontacte_at);
  const masquees = ligne ? Math.max(0, ligne.reclamations - liees.length) : 0;
  const tacheId = ligne?.tache_id ?? tacheCreee;

  function fermer(o: boolean) {
    if (o) return;
    setEdition(false);
    setErreur(null);
    setTacheCreee(null);
    majUrl({ a: null });
  }

  async function changerStatut(s: StatutAmelioration) {
    if (!ligne || s === ligne.statut) return;
    setErreur(null);
    setStatutEnCours(s);
    const r = await changerStatutAmelioration(ligne.id, s);
    setStatutEnCours(null);
    if (!r.ok) setErreur(r.erreur);
    else setMessage(s === 'realisee' || s === 'verifiee'
      ? `${STATUT_AMELIORATION_LABEL[s]} : les candidats concernés sont à recontacter`
      : `Statut : ${STATUT_AMELIORATION_LABEL[s]}`);
  }

  function versTache() {
    if (!ligne) return;
    setErreur(null);
    startTransition(async () => {
      const r = await ameliorationVersTache(ligne.id);
      if (!r.ok) setErreur(r.erreur);
      else {
        setTacheCreee(r.data?.tacheId ?? null);
        setMessage('Tâche de pilotage créée');
      }
    });
  }

  function detacher(id: string) {
    setErreur(null);
    startTransition(async () => {
      const r = await rattacherReclamations([id], null);
      if (!r.ok) setErreur(r.erreur);
      else setMessage('Réclamation détachée');
    });
  }

  return (
    <>
      <Fenetre
        ouvert={!!ligne || introuvable}
        onOuvert={fermer}
        large
        titre={ligne ? <>Amélioration n° {numero3(ligne.numero)} — {ligne.titre}</> : 'Amélioration'}
        sousTitre={ligne ? (
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {ligne.module && <span>{ligne.module} ·</span>}
            <PastilleStatut statut={ligne.statut} />
            <PastillePriorite priorite={ligne.priorite} />
          </span>
        ) : undefined}
      >
        {!ligne ? (
          <p className="py-6 text-center text-sm text-(--color-ink-soft)">Cette amélioration est introuvable ou ne vous est pas accessible.</p>
        ) : edition ? (
          <FormulaireAmelioration
            id={ligne.id}
            membres={membres}
            modules={modules}
            initial={versInput(ligne)}
            onAnnuler={() => setEdition(false)}
            onFini={() => {
              setEdition(false);
              setMessage('Amélioration mise à jour');
            }}
          />
        ) : (
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-2">
              <Chiffre valeur={ligne.candidats} libelle={`candidat${ligne.candidats > 1 ? 's' : ''} concerné${ligne.candidats > 1 ? 's' : ''}`} fort />
              <Chiffre valeur={ligne.reclamations} libelle={`réclamation${ligne.reclamations > 1 ? 's' : ''} rattachée${ligne.reclamations > 1 ? 's' : ''}`} />
              <Chiffre valeur={ligne.aRecontacter} libelle="à recontacter" />
            </div>

            <dl className="grid gap-3">
              <Bloc titre="Problème" texte={ligne.probleme} />
              <Bloc titre="Action" texte={ligne.action_prevue} />
              <Bloc titre="Suivi" texte={ligne.suivi} />
            </dl>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Info libelle="Responsable">
                {ligne.responsable_id ? (ligne.responsable_id === moiId ? 'Moi' : noms[ligne.responsable_id] ?? '—') : <span className="text-(--color-ink-muted)">Personne</span>}
              </Info>
              <Info libelle="Échéance">
                <span className={cn(estEnRetard({ echeance: ligne.echeance, statut: ['realisee', 'verifiee', 'abandonnee'].includes(ligne.statut) ? 'terminee' : 'ouverte' }, aujourdHui) && 'font-medium text-[#B42318]')}>
                  {libelleEcheance(ligne.echeance, aujourdHui)}
                </span>
              </Info>
              <Info libelle="Réalisée le">{ligne.realisee_at ? dateCourte(ligne.realisee_at) : '—'}</Info>
            </dl>

            <div>
              <p className="mb-1.5 text-[11.5px] font-medium uppercase tracking-wide text-(--color-ink-muted)">Statut</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Changer le statut">
                {STATUTS_AMELIORATION.map((s) => (
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
              <p className="mt-1 text-[11.5px] text-(--color-ink-muted)">Passer en « Réalisée » met automatiquement les candidats concernés « à recontacter ».</p>
            </div>

            {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-[13px] text-[#B42318]">{erreur}</p>}

            <div className="flex flex-wrap items-center gap-2 border-y border-(--color-border) py-3">
              {tacheId ? (
                <Link
                  href={`/admin/cockpit/taches?t=${tacheId}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#E6F4EA] px-3 text-[13px] font-medium text-[#1F7A3E] hover:bg-[#d7eedf] focus-ring"
                >
                  <ListTodo className="h-4 w-4" /> Voir la tâche de pilotage <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Bouton type="button" taille="sm" onClick={versTache} enCours={enCours} title="La tâche est confiée au responsable (par exemple le développeur)">
                  {!enCours && <ListTodo />} Créer la tâche de pilotage
                </Bouton>
              )}
              <BoutonAnalyseIa type="amelioration" id={ligne.id} titre={`Amélioration n° ${numero3(ligne.numero)} — ${ligne.titre}`} />
              <Bouton type="button" variante="fantome" taille="sm" className="ml-auto" onClick={() => setEdition(true)}>
                <Pencil /> Modifier
              </Bouton>
            </div>

            {(aRecontacter.length > 0 || recontactes.length > 0) && (
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-(--color-ink)">
                  <PhoneOutgoing className="h-4 w-4 text-[#1F7A3E]" /> Candidats à recontacter
                  <span className="font-normal text-(--color-ink-muted)">({new Set(aRecontacter.map(cleCandidat)).size})</span>
                </h3>
                <ul className="grid gap-2">
                  {aRecontacter.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#CFE8D7] bg-[#F3FAF5] px-3 py-2">
                      <Avatar nom={r.candidat_label} taille={28} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-(--color-ink)">{r.candidat_label}</span>
                        <span className="block truncate text-[12px] text-(--color-ink-soft)">{r.specialite ?? '—'} · {r.sujet}</span>
                      </span>
                      <MarquerRecontacte reclamationId={r.id} taille="xs" onFait={setMessage} />
                    </li>
                  ))}
                  {recontactes.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 px-3 py-1 text-[12.5px] text-(--color-ink-soft)">
                      <span className="font-medium text-(--color-ink)">{r.candidat_label}</span>
                      recontacté le {dateCourte(r.recontacte_at)}
                      {r.satisfaction && <> · {SATISFACTION_LABEL[r.satisfaction] ?? r.satisfaction}</>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h3 className="mb-2 text-[13.5px] font-semibold text-(--color-ink)">
                Réclamations rattachées <span className="font-normal text-(--color-ink-muted)">({ligne.reclamations})</span>
              </h3>
              {liees.length === 0 ? (
                <p className="text-[13px] text-(--color-ink-muted)">
                  {masquees > 0 ? 'Les réclamations rattachées ne vous sont pas accessibles.' : 'Aucune réclamation rattachée : sélectionnez-les dans la liste des réclamations puis « Regrouper ».'}
                </p>
              ) : (
                <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-white">
                  {liees.map((r) => <LigneLiee key={r.id} r={r} onDetacher={() => detacher(r.id)} enCours={enCours} />)}
                </ul>
              )}
              {masquees > 0 && liees.length > 0 && (
                <p className="mt-1.5 text-[12px] text-(--color-ink-muted)">
                  + {masquees} réclamation{masquees > 1 ? 's' : ''} qui ne vous {masquees > 1 ? 'sont' : 'est'} pas accessible{masquees > 1 ? 's' : ''}.
                </p>
              )}
            </section>
          </div>
        )}
      </Fenetre>
      <Toast message={message} />
    </>
  );
}

function LigneLiee({ r, onDetacher, enCours }: { r: ReclamationLigne; onDetacher: () => void; enCours: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-2.5 px-3 py-2.5">
      <Avatar nom={r.candidat_label} taille={30} />
      <button type="button" onClick={() => majUrl({ a: null, r: r.id })} className="min-w-0 flex-1 text-left focus-ring">
        <span className="block truncate text-[13.5px] font-medium text-(--color-ink) hover:text-(--color-primary)">
          {r.candidat_label} {r.specialite && <span className="font-normal text-(--color-ink-muted)">({r.specialite})</span>}
        </span>
        <span className="block truncate text-[12px] text-(--color-ink-soft)">{r.sujet} · {dateCourte(r.created_at)}</span>
      </button>
      <PastilleStatut statut={r.statut} />
      {r.candidat_id && (
        <Link
          href={`/admin/suivi/candidats/${r.candidat_id}`}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12.5px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
        >
          Fiche candidat <ExternalLink className="h-3 w-3" />
        </Link>
      )}
      <button
        type="button"
        onClick={onDetacher}
        disabled={enCours}
        aria-label={`Détacher la réclamation de ${r.candidat_label}`}
        title="Détacher de l’amélioration"
        className="rounded-md p-1.5 text-(--color-ink-muted) hover:bg-(--color-surface-soft) hover:text-(--color-ink) focus-ring disabled:opacity-50"
      >
        <Unlink className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function Chiffre({ valeur, libelle, fort }: { valeur: number; libelle: string; fort?: boolean }) {
  return (
    <div className={cn('rounded-xl border px-3 py-2', fort ? 'border-(--color-primary)/20 bg-(--color-primary-soft)/60' : 'border-(--color-border) bg-white')}>
      <p className={cn('text-[22px] font-semibold leading-none', fort ? 'text-(--color-primary)' : 'text-(--color-ink)')}>{valeur}</p>
      <p className="mt-1 text-[11.5px] leading-tight text-(--color-ink-soft)">{libelle}</p>
    </div>
  );
}

function Bloc({ titre, texte }: { titre: string; texte: string | null }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-white px-3 py-2.5">
      <dt className="text-[11.5px] font-semibold uppercase tracking-wide text-(--color-primary)">{titre}</dt>
      <dd className={cn('mt-1 whitespace-pre-wrap text-[13.5px] leading-relaxed', texte ? 'text-(--color-ink)' : 'text-(--color-ink-muted)')}>{texte || 'Non renseigné'}</dd>
    </div>
  );
}

function versInput(a: AmeliorationLigne): Partial<AmeliorationInput> {
  return {
    titre: a.titre,
    module: a.module,
    probleme: a.probleme,
    action_prevue: a.action_prevue,
    suivi: a.suivi,
    priorite: a.priorite as AmeliorationInput['priorite'],
    statut: a.statut as AmeliorationInput['statut'],
    responsable_id: a.responsable_id ?? '',
    echeance: a.echeance ?? '',
  };
}
