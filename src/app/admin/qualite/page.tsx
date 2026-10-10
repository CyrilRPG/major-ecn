import Link from 'next/link';
import { BoutonAction, Carte, EnTete, Kpi, Pastille, TauxTexte, Vide } from '@/components/admin/qualite/ui';
import { dateFr, note, PRIORITE_LABEL, STATUT_RECLAMATION_LABEL } from '@/lib/qualite/format';
import { vueGenerale } from '@/lib/qualite/serveur/admin';
import { CRITERE_LABEL, FAMILLE_LABEL, NIVEAU_DIFFICULTE_LABEL, STATUT_ACTION_LABEL, type Critere } from '@/lib/qualite/types';
import { lancerBalayageAction } from './actions';

export const dynamic = 'force-dynamic';

/** Vue générale (§25, §31) : indicateurs des 90 derniers jours et tout ce qui attend une décision. */
export default async function QualiteAccueilPage() {
  const v = await vueGenerale();
  const i = v.indicateurs;
  const lien = (href: string, texte: string) => <Link href={href} className="font-medium text-(--color-ink) hover:text-(--color-primary) hover:underline">{texte}</Link>;
  return (
    <>
      <EnTete
        titre="Qualité & Suivi des candidats"
        description="Enquêtes de satisfaction, suivi individuel, alertes, réclamations et actions correctives — 90 derniers jours. Chaque élément ouvre sa fiche."
        action={<BoutonAction label="Lancer un passage maintenant" action={lancerBalayageAction} />}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Participation enquêtes" valeur={i.participation.pct === null ? '—' : `${i.participation.pct} %`} detail={`${i.participation.n} réponse(s) / ${i.participation.total} attendue(s)`} href="/admin/qualite/enquetes" />
        <Kpi label="Satisfaction moyenne" valeur={i.moyenne.moyenne === null ? '—' : note(i.moyenne.moyenne)} detail={`${i.moyenne.n} note(s) globale(s)`} href="/admin/qualite/enseignants" />
        <Kpi label="Alertes à examiner" valeur={v.alertesAExaminer} detail={`${v.alertesCritiques.length} critique(s) nouvelle(s)`} href="/admin/qualite/alertes" ton={v.alertesCritiques.length ? 'alerte' : undefined} />
        <Kpi label="Actions en cours" valeur={v.actionsEnCours.length} detail={`${v.actionsEnRetard.length} en retard`} href="/admin/qualite/actions" ton={v.actionsEnRetard.length ? 'alerte' : undefined} />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Carte titre="Indicateurs séparés" description="Notes, commentaires et réclamations ne sont jamais mélangés (§17).">
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm">
            <dt className="text-(--color-ink-soft)">Satisfaction (4-5/5)</dt><dd><TauxTexte t={i.satisfaction} /></dd>
            <dt className="text-(--color-ink-soft)">Vigilance (3/5)</dt><dd><TauxTexte t={i.vigilance} /></dd>
            <dt className="text-(--color-ink-soft)">Notes défavorables (1-2/5)</dt><dd><TauxTexte t={i.defavorables} inverse /></dd>
            <dt className="text-(--color-ink-soft)">Commentaires négatifs</dt><dd><TauxTexte t={i.commentairesNegatifs} inverse /></dd>
            <dt className="text-(--color-ink-soft)">Recommandation (NPS)</dt><dd>{i.nps.score ?? '—'} <span className="text-xs text-(--color-ink-muted)">({i.nps.n})</span></dd>
            <dt className="text-(--color-ink-soft)">Candidats répondants</dt><dd>{i.repondants}</dd>
          </dl>
          <p className="mt-3 text-xs text-(--color-ink-muted)">* effectif inférieur à 10 : à interpréter avec prudence.</p>
        </Carte>
        <Carte titre="Taux de réponse par questionnaire">
          <ul className="flex flex-col gap-2 text-sm">
            {v.parFamille.map((f) => (
              <li key={f.famille} className="flex justify-between gap-2">
                <span className="text-(--color-ink-soft)">{FAMILLE_LABEL[f.famille]}</span>
                <span className={f.pct !== null && f.total >= v.params.alertes.taux_reponse_effectif_min && f.pct < v.params.alertes.taux_reponse_min ? 'text-red-600' : ''}><TauxTexte t={f} /></span>
              </li>
            ))}
          </ul>
        </Carte>
        <Carte titre="Moyennes par critère">
          {Object.keys(i.criteres).length === 0 ? <Vide>Aucune réponse sur la période.</Vide> : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {(Object.entries(i.criteres) as [Critere, { moyenne: number | null; n: number }][]).sort((a, b) => (a[1].moyenne ?? 9) - (b[1].moyenne ?? 9)).slice(0, 10).map(([c, m]) => (
                <li key={c} className="flex justify-between gap-2"><span className="text-(--color-ink-soft)">{CRITERE_LABEL[c]}</span><span>{note(m.moyenne)} <span className="text-xs text-(--color-ink-muted)">({m.n})</span></span></li>
              ))}
            </ul>
          )}
        </Carte>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Carte titre="Nouvelles alertes critiques" action={<Link href="/admin/qualite/alertes" className="text-sm text-(--color-primary)">Toutes</Link>}>
          {v.alertesCritiques.length === 0 ? <Vide>Aucune alerte critique en attente.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.alertesCritiques.slice(0, 8).map((a) => (
                <li key={a.id} className="py-2">
                  {lien(`/admin/qualite/alertes?id=${a.id}`, a.titre)}
                  <p className="text-xs text-(--color-ink-muted)">{a.user_id ? `${v.noms.get(a.user_id)?.nom ?? ''} · ` : ''}{dateFr(a.created_at, true)}</p>
                </li>
              ))}
            </ul>
          )}
        </Carte>
        <Carte titre="Problèmes récurrents" action={<Link href="/admin/qualite/remarques?vue=recurrences" className="text-sm text-(--color-primary)">Regroupements</Link>}>
          {v.recurrences.length === 0 ? <Vide>Aucune récurrence au-dessus du seuil.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.recurrences.slice(0, 8).map((a) => <li key={a.id} className="py-2">{lien(`/admin/qualite/alertes?id=${a.id}`, a.titre)}</li>)}
            </ul>
          )}
        </Carte>
        <Carte titre="Réclamations non traitées" action={<Link href="/admin/qualite/reclamations" className="text-sm text-(--color-primary)">Registre</Link>}>
          {v.reclamations.length === 0 ? <Vide>Aucune réclamation ouverte.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.reclamations.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                  <span>{lien(`/admin/qualite/reclamations?id=${r.id}`, r.sujet)}<span className="block text-xs text-(--color-ink-muted)">{r.candidat_label} · {dateFr(r.created_at)}</span></span>
                  <span className="text-right text-xs"><Pastille ton={r.priorite === 'urgente' || r.priorite === 'haute' ? 'critique' : 'neutre'}>{PRIORITE_LABEL[r.priorite] ?? r.priorite}</Pastille><br />{STATUT_RECLAMATION_LABEL[r.statut] ?? r.statut}</span>
                </li>
              ))}
            </ul>
          )}
        </Carte>
        <Carte titre="Actions correctives en retard">
          {v.actionsEnRetard.length === 0 ? <Vide>Aucune action en retard.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.actionsEnRetard.map((a) => (
                <li key={a.id} className="py-2">{lien(`/admin/qualite/actions/${a.id}`, `n° ${a.numero} — ${a.titre}`)}
                  <p className="text-xs text-red-600">Échéance {dateFr(a.echeance)} · {STATUT_ACTION_LABEL[a.statut]}{a.responsable_nom ? ` · ${a.responsable_nom}` : ''}</p></li>
              ))}
            </ul>
          )}
        </Carte>
        <Carte titre="Candidats nécessitant un accompagnement" action={<Link href="/admin/qualite/candidats?niveau=prioritaire" className="text-sm text-(--color-primary)">Liste</Link>}>
          {v.candidatsAccompagnement.length === 0 ? <Vide>Aucune difficulté persistante ou prioritaire ouverte.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.candidatsAccompagnement.slice(0, 10).map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                  <span>{lien(`/admin/qualite/candidats/${d.user_id}`, v.noms.get(d.user_id)?.nom ?? 'Candidat')}<span className="block text-xs text-(--color-ink-muted)">{d.libelle}</span></span>
                  <Pastille ton={d.niveau === 'prioritaire' ? 'critique' : 'vigilance'}>{NIVEAU_DIFFICULTE_LABEL[d.niveau as 'ponctuelle']}</Pastille>
                </li>
              ))}
            </ul>
          )}
        </Carte>
        <Carte titre="Améliorations en attente de validation">
          {v.ameliorationsAValider.length === 0 && v.verifications.length === 0 ? <Vide>Rien en attente.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {v.ameliorationsAValider.map((a) => (
                <li key={a.id} className="py-2">{lien(`/admin/qualite/actions/${a.id}`, `Action n° ${a.numero} — ${a.titre}`)}<p className="text-xs text-(--color-ink-muted)">{STATUT_ACTION_LABEL[a.statut]}</p></li>
              ))}
              {v.verifications.slice(0, 6).map((x) => (
                <li key={x.id} className="py-2">{lien(`/admin/qualite/contenus?verif=${x.id}`, `Vérification n° ${x.numero} — ${x.contenu_label}`)}</li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </>
  );
}
