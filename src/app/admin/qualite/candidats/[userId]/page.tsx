import { Fragment } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { dateFr, note, PRIORITE_LABEL, STATUT_RECLAMATION_LABEL } from '@/lib/qualite/format';
import { ficheCandidat } from '@/lib/qualite/serveur/admin';
import {
  FAMILLE_LABEL, NIVEAU_DIFFICULTE_LABEL, STATUT_DIFFICULTE_LABEL, STATUT_ENVOI_LABEL, TYPE_INTERVENTION_LABEL, TYPES_INTERVENTION,
  type Famille, type NiveauDifficulte, type StatutDifficulte, type StatutEnvoi, type TypeIntervention,
} from '@/lib/qualite/types';
import {
  ajouterInterventionAction, creerDifficulteAction, majCandidatAction, majDifficulteAction, majInterventionAction,
} from '../../actions';

export const dynamic = 'force-dynamic';

function Ligne({ k, v }: { k: string; v: React.ReactNode }) {
  return <><dt className="text-(--color-ink-soft)">{k}</dt><dd className="text-(--color-ink)">{v}</dd></>;
}

/** Fiche de suivi centralisée (§10) : tout le parcours du candidat sur une page. */
export default async function FicheCandidatQualitePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const f = await ficheCandidat(userId);
  if (!f) notFound();
  const c = f.ctx;
  const nom = `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || c.email || 'Candidat';
  const typesIntervention = TYPES_INTERVENTION.filter((t) => t !== 'relance').map((t) => ({ v: t, l: TYPE_INTERVENTION_LABEL[t] }));
  const majFiche = majCandidatAction.bind(null, userId);
  const commentairesPar = new Map<string, typeof f.commentaires>();
  for (const x of f.commentaires) if (x.reponse_id) (commentairesPar.get(x.reponse_id) ?? commentairesPar.set(x.reponse_id, []).get(x.reponse_id)!).push(x);
  return (
    <>
      <Link href="/admin/qualite/candidats" className="mb-3 inline-block text-sm text-(--color-ink-soft) hover:underline">← Candidats</Link>
      <EnTete
        titre={nom}
        description={<>{c.email} · {c.formules.join(' + ')}{c.voie ? ` · voie ${c.voie}` : ''} · {c.specialites.join(', ') || 'spécialité non renseignée'}</>}
        action={<div className="flex flex-wrap gap-2">
          <Link href={`/admin/suivi/eleves/${userId}`} className="text-sm text-(--color-primary) hover:underline">Suivi individuel (rendez-vous)</Link>
          <Link href={`/admin/resultats?user=${userId}`} className="text-sm text-(--color-primary) hover:underline">Résultats détaillés</Link>
        </div>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Carte titre="Formation" action={
          <BoutonAction label="Corriger" action={majFiche} champs={[
            { nom: 'debut_formation', label: 'Début de formation', type: 'date', defaut: c.debutFormation ?? '' },
            { nom: 'fin_formation', label: 'Fin de formation', type: 'date', defaut: c.finFormation ?? '' },
            { nom: 'premiere_epreuve', label: 'Première épreuve', type: 'date', defaut: c.premiereEpreuve ?? '' },
            { nom: 'derniere_epreuve', label: 'Dernière épreuve', type: 'date', defaut: c.derniereEpreuve ?? '' },
            { nom: 'exam_session_id', label: "Session d'examen", defaut: c.examSessionId ?? '' },
          ]} />}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <Ligne k="Inscription" v={dateFr(c.inscription)} />
            <Ligne k="Début" v={dateFr(c.debutFormation)} />
            <Ligne k="Fin" v={dateFr(c.finFormation)} />
            <Ligne k="Épreuves" v={<>{dateFr(c.premiereEpreuve)}{c.derniereEpreuve && c.derniereEpreuve !== c.premiereEpreuve ? ` → ${dateFr(c.derniereEpreuve)}` : ''}{c.epreuvesCorrigees ? <span className="text-xs text-(--color-ink-muted)"> (corrigé)</span> : null}</>} />
            <Ligne k="Session" v={c.examSessionId ?? '—'} />
            <Ligne k="Promotion" v={c.promotion ?? '—'} />
            <Ligne k="Statut" v={c.actif ? 'En formation' : c.expire ? 'Accès terminé' : 'Inactif'} />
          </dl>
        </Carte>
        <Carte titre="Progression & activité">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <Ligne k="Progression pédagogique" v={f.snap?.progression == null ? '—' : `${Math.round(f.snap.progression)} %`} />
            <Ligne k="Items commencés" v={f.snap ? `${f.snap.coursCommences} / ${f.snap.coursAccessibles} (${f.snap.coursTermines} terminés)` : '—'} />
            <Ligne k="Avancement calendaire" v={c.etat.progression_calendaire == null ? '—' : `${Math.round(c.etat.progression_calendaire)} %`} />
            <Ligne k="Dernière activité" v={dateFr(c.etat.derniere_activite_at, true)} />
            <Ligne k="Palier d'inactivité" v={c.etat.inactivite_palier ? `${c.etat.inactivite_palier} (le ${dateFr(c.etat.inactivite_palier_at)})` : 'aucun'} />
            <Ligne k="Séances en direct" v={`${f.presences.length} émargement(s)`} />
            <Ligne k="Replays" v={`${f.visionnages.filter((v) => v.seuil_atteint_at).length} visionné(s) au-delà du seuil`} />
          </dl>
        </Carte>
        <Carte titre="Situation particulière" action={
          <BoutonAction label="Modifier" action={majFiche} champs={[
            { nom: 'pause_du', label: 'Pause autorisée du', type: 'date', defaut: c.pause?.du ?? '' },
            { nom: 'pause_au', label: 'au', type: 'date', defaut: c.pause?.au ?? '' },
            { nom: 'pause_motif', label: 'Motif de la pause', defaut: c.pause?.motif ?? '' },
            { nom: 'sans_blocage', label: 'Aménagement : aucun questionnaire bloquant', type: 'select', options: [{ v: 'non', l: 'Non' }, { v: 'oui', l: 'Oui' }], defaut: c.sansBlocage ? 'oui' : 'non', requis: true },
            { nom: 'sans_blocage_motif', label: "Motif de l'aménagement" },
            { nom: 'exclu_relances', label: "Exclure des relances d'inactivité", type: 'select', options: [{ v: 'non', l: 'Non' }, { v: 'oui', l: 'Oui' }], defaut: c.excluRelances ? 'oui' : 'non', requis: true },
            { nom: 'niveau_suivi', label: 'Niveau de suivi', type: 'select', options: [{ v: 'aucun', l: 'Aucun' }, { v: 'ponctuel', l: 'Ponctuel' }, { v: 'persistant', l: 'Persistant' }, { v: 'prioritaire', l: 'Prioritaire' }], defaut: c.etat.niveau_suivi, requis: true },
            { nom: 'notes', label: 'Notes internes', type: 'long', defaut: c.etat.notes ?? '' },
          ]} />}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <Ligne k="Niveau de suivi" v={<Pastille ton={c.etat.niveau_suivi === 'prioritaire' ? 'critique' : c.etat.niveau_suivi === 'persistant' ? 'vigilance' : 'neutre'}>{c.etat.niveau_suivi}</Pastille>} />
            <Ligne k="Pause" v={c.pause ? `${dateFr(c.pause.du)} → ${dateFr(c.pause.au)}${c.pause.motif ? ` (${c.pause.motif})` : ''}` : 'aucune'} />
            <Ligne k="Aménagement" v={c.sansBlocage ? 'aucun blocage' : 'non'} />
            <Ligne k="Relances" v={c.excluRelances ? 'exclu' : 'oui'} />
            <Ligne k="Résultat EVC" v={c.etat.resultat_evc ? <>{c.etat.resultat_evc} <Pastille ton={c.etat.resultat_evc_statut === 'verifie' ? 'ok' : 'neutre'}>{c.etat.resultat_evc_statut === 'verifie' ? 'vérifié' : 'déclaré'}</Pastille></> : '—'} />
          </dl>
          {c.etat.notes && <p className="mt-2 whitespace-pre-wrap rounded bg-(--color-surface-soft) p-2 text-xs">{c.etat.notes}</p>}
          <div className="mt-3"><BoutonAction label="Résultat EVC" action={majFiche} champs={[
            { nom: 'resultat_evc', label: 'Résultat (rang, admis…)', defaut: c.etat.resultat_evc ?? '' },
            { nom: 'resultat_evc_statut', label: 'Source', type: 'select', requis: true, options: [{ v: 'verifie', l: 'Officiellement vérifié' }, { v: 'declare', l: 'Déclaré par le candidat' }] },
          ]} /></div>
        </Carte>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Carte titre="Difficultés signalées" description="Ponctuelle, persistante (signalée deux fois), accompagnement prioritaire (trois fois ou plus)."
          action={<BoutonAction label="Ajouter" action={creerDifficulteAction.bind(null, userId)} champs={[
            { nom: 'libelle', label: 'Difficulté', requis: true }, { nom: 'detail', label: 'Détail', type: 'long' },
            { nom: 'niveau', label: 'Niveau', type: 'select', requis: true, options: [{ v: 'ponctuelle', l: 'Ponctuelle' }, { v: 'persistante', l: 'Persistante' }, { v: 'prioritaire', l: 'Prioritaire' }] },
          ]} />}>
          {f.difficultes.length === 0 ? <Vide>Aucune difficulté.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {f.difficultes.map((d) => (
                <li key={d.id} className="flex flex-wrap items-start justify-between gap-2 py-2">
                  <div>
                    <p className="font-medium">{d.libelle} <span className="text-xs text-(--color-ink-muted)">({d.source}, ×{d.occurrences})</span></p>
                    {d.detail && <p className="text-xs text-(--color-ink-soft)">{d.detail}</p>}
                    <p className="text-xs text-(--color-ink-muted)">du {dateFr(d.premiere_at)} au {dateFr(d.derniere_at)} · {STATUT_DIFFICULTE_LABEL[d.statut as StatutDifficulte]}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pastille ton={d.niveau === 'prioritaire' ? 'critique' : d.niveau === 'persistante' ? 'vigilance' : 'neutre'}>{NIVEAU_DIFFICULTE_LABEL[d.niveau as NiveauDifficulte]}</Pastille>
                    {(d.statut === 'ouverte' || d.statut === 'en_cours') && (
                      <div className="flex gap-1">
                        <BoutonAction label="Intervention" variant="ghost" action={ajouterInterventionAction.bind(null, userId)} champs={[
                          { nom: 'difficulte_id', label: '', defaut: d.id, type: 'select', requis: true, options: [{ v: d.id, l: d.libelle }] },
                          { nom: 'type', label: 'Type', type: 'select', requis: true, options: typesIntervention },
                          { nom: 'action', label: 'Action proposée', type: 'long', requis: true },
                          { nom: 'statut', label: 'État', type: 'select', requis: true, options: [{ v: 'prevue', l: 'Prévue' }, { v: 'realisee', l: 'Réalisée' }] },
                          { nom: 'prevue_le', label: 'Date prévue', type: 'date' },
                          { nom: 'retour_demande', label: 'Demander au candidat si la solution a été utile', type: 'select', options: [{ v: 'non', l: 'Non' }, { v: 'oui', l: 'Oui' }] },
                        ]} />
                        <BoutonAction label="Clore" variant="ghost" action={majDifficulteAction.bind(null, d.id)} champs={[
                          { nom: 'statut', label: 'Issue', type: 'select', requis: true, options: [{ v: 'resolue', l: 'Résolue' }, { v: 'classee', l: 'Classée' }] },
                          { nom: 'commentaire', label: 'Commentaire' },
                        ]} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Carte>
        <Carte titre="Historique des interventions" description="Qui a traité, quelle action, quand, avec quel résultat (§13)."
          action={<BoutonAction label="Nouvelle intervention" action={ajouterInterventionAction.bind(null, userId)} champs={[
            { nom: 'type', label: 'Type', type: 'select', requis: true, options: typesIntervention },
            { nom: 'action', label: 'Action proposée', type: 'long', requis: true },
            { nom: 'signale_at', label: 'Date du signalement', type: 'date' },
            { nom: 'statut', label: 'État', type: 'select', requis: true, options: [{ v: 'prevue', l: 'Prévue' }, { v: 'realisee', l: 'Réalisée' }] },
            { nom: 'prevue_le', label: 'Date prévue', type: 'date' },
            { nom: 'resultat', label: 'Résultat', type: 'long' },
          ]} />}>
          {f.interventions.length === 0 ? <Vide>Aucune intervention.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {f.interventions.map((i) => (
                <li key={i.id} className="py-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p><span className="font-medium">{TYPE_INTERVENTION_LABEL[i.type as TypeIntervention] ?? i.type}</span> — {i.action}</p>
                    <Pastille ton={i.statut === 'realisee' ? 'ok' : i.statut === 'annulee' ? 'neutre' : 'vigilance'}>{i.statut}</Pastille>
                  </div>
                  <p className="text-xs text-(--color-ink-muted)">Signalé {dateFr(i.signale_at)} · traité par {i.traite_par_nom ?? '—'}{i.realisee_at ? ` · réalisé le ${dateFr(i.realisee_at)}` : i.prevue_le ? ` · prévu le ${dateFr(i.prevue_le)}` : ''}</p>
                  {i.resultat && <p className="text-xs">Résultat : {i.resultat}</p>}
                  {i.retour_candidat && <p className="text-xs">Avis du candidat : <strong>{i.retour_candidat.replace('_', ' ')}</strong>{i.retour_commentaire ? ` — ${i.retour_commentaire}` : ''}</p>}
                  {i.statut !== 'annulee' && i.type !== 'relance' && (
                    <BoutonAction label="Mettre à jour" variant="ghost" action={majInterventionAction.bind(null, i.id)} champs={[
                      { nom: 'statut', label: 'État', type: 'select', options: [{ v: 'prevue', l: 'Prévue' }, { v: 'realisee', l: 'Réalisée' }, { v: 'annulee', l: 'Annulée' }] },
                      { nom: 'resultat', label: 'Résultat', type: 'long' },
                      { nom: 'retour_candidat', label: 'Avis du candidat sur la solution', type: 'select', options: [{ v: 'utile', l: 'Utile' }, { v: 'partiellement', l: 'Partiellement utile' }, { v: 'pas_utile', l: 'Pas utile' }] },
                      { nom: 'retour_commentaire', label: 'Commentaire du candidat' },
                    ]} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Carte titre="Enquêtes envoyées et réponses">
          {f.envois.length === 0 ? <Vide>Aucune enquête.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {f.envois.map((e) => {
                const r = f.reponses.find((x) => x.envoi_id === e.id);
                const coms = r ? commentairesPar.get(r.id) ?? [] : [];
                return (
                  <li key={e.id} className="py-2">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span><span className="font-medium">{e.titre}</span><span className="block text-xs text-(--color-ink-muted)">{FAMILLE_LABEL[e.famille as Famille]} · {dateFr(e.programme_pour)}</span></span>
                      <span className="text-right"><Pastille ton={e.statut === 'complete' ? 'ok' : e.statut === 'expire' ? 'critique' : 'neutre'}>{STATUT_ENVOI_LABEL[e.statut as StatutEnvoi]}</Pastille>{r && <span className="block text-xs">note {note(r.note_globale)}</span>}</span>
                    </div>
                    {(e.neutralise_motif || e.dispense_motif) && <p className="text-xs text-(--color-ink-muted)">{e.neutralise_motif ?? e.dispense_motif}</p>}
                    {r && (
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer text-(--color-primary)">Réponses{r.difficulte ? ' · difficulté' : ''}{r.demande_contact ? ' · demande de contact' : ''}</summary>
                        <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
                          {r.questions.map((q) => {
                            const v = r.reponses[q.id];
                            if (v === null || v === undefined || q.type === 'texte') return null;
                            return <Fragment key={q.id}><dt className="text-(--color-ink-soft)">{q.libelle}</dt><dd>{Array.isArray(v) ? v.join(', ') : v === true ? 'Oui' : v === false ? 'Non' : String(v)}</dd></Fragment>;
                          })}
                        </dl>
                        {coms.map((cm) => <p key={cm.id} className="mt-1 rounded bg-(--color-surface-soft) p-1.5"><span className="text-(--color-ink-muted)">{cm.question_libelle} : </span>« {cm.texte} » {cm.sentiment && <Pastille ton={cm.sentiment}>{cm.sentiment}</Pastille>}</p>)}
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Carte>
        <div className="flex flex-col gap-4">
          <Carte titre="Résultats aux évaluations">
            {f.evaluations.length === 0 ? <Vide>Aucune évaluation.</Vide> : (
              <ul className="divide-y divide-(--color-border) text-sm">
                {f.evaluations.map((e) => (
                  <li key={e.cle} className="flex justify-between gap-2 py-1.5"><span>{e.intitule ?? e.type}<span className="block text-xs text-(--color-ink-muted)">{e.type} · {dateFr(e.date_evaluation)}</span></span><span>{e.pourcentage != null ? `${Math.round(e.pourcentage)} %` : e.statut}</span></li>
                ))}
              </ul>
            )}
          </Carte>
          <Carte titre="Alertes">
            {f.alertes.length === 0 ? <Vide>Aucune alerte.</Vide> : (
              <ul className="divide-y divide-(--color-border) text-sm">
                {f.alertes.map((a) => <li key={a.id} className="flex justify-between gap-2 py-1.5"><Link href={`/admin/qualite/alertes?id=${a.id}`} className="hover:underline">{a.titre}</Link><Pastille ton={a.niveau}>{a.statut}</Pastille></li>)}
              </ul>
            )}
          </Carte>
          <Carte titre="Réclamations">
            {f.reclamations.length === 0 ? <Vide>Aucune réclamation.</Vide> : (
              <ul className="divide-y divide-(--color-border) text-sm">
                {f.reclamations.map((r) => <li key={r.id} className="flex justify-between gap-2 py-1.5"><Link href={`/admin/qualite/reclamations?id=${r.id}`} className="hover:underline">{r.sujet}</Link><span className="text-xs">{STATUT_RECLAMATION_LABEL[r.statut] ?? r.statut} · {PRIORITE_LABEL[r.priorite] ?? r.priorite}</span></li>)}
              </ul>
            )}
          </Carte>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Carte titre="Participation aux séances et replays">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">Directs (émargements)</p>
              {f.presences.length === 0 ? <p className="text-xs text-(--color-ink-muted)">Aucun.</p> : <ul className="flex flex-col gap-1">{f.presences.slice(0, 15).map((p, i) => <li key={i}>{p.event_title} <span className="text-xs text-(--color-ink-muted)">{dateFr(p.event_date)}</span></li>)}</ul>}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">Replays</p>
              {f.visionnages.length === 0 ? <p className="text-xs text-(--color-ink-muted)">Aucun visionnage suivi.</p> : <ul className="flex flex-col gap-1">{f.visionnages.slice(0, 15).map((v) => <li key={v.video_id}>{v.titre} <span className="text-xs text-(--color-ink-muted)">{Math.round(v.ratio_max * 100)} %</span></li>)}</ul>}
            </div>
          </div>
        </Carte>
        <Carte titre="Échanges et traçabilité" description="Journal inaltérable et notes pédagogiques (CRM, lecture seule).">
          <ul className="max-h-96 divide-y divide-(--color-border) overflow-y-auto text-xs">
            {f.notes.map((n) => <li key={n.id} className="py-1.5"><span className="font-medium">{dateFr(n.created_at)} · Note pédagogique ({n.author_name ?? '—'})</span> — {[n.motif, n.observations, n.actions_recommandees].filter(Boolean).join(' · ')}</li>)}
            {f.journal.map((j) => <li key={j.id} className="py-1.5"><span className="font-medium">{dateFr(j.at, true)}</span> · {j.objet_type} · {j.action.replace(/_/g, ' ')} <span className="text-(--color-ink-muted)">({j.auteur_nom ?? '—'})</span></li>)}
            {f.notes.length + f.journal.length === 0 && <li className="py-2 text-(--color-ink-muted)">Rien pour l’instant.</li>}
          </ul>
        </Carte>
      </div>
    </>
  );
}
