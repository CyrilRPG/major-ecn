import Link from 'next/link';
import { BarreFiltres, Carte, EnTete, Pastille, TauxTexte, Vide } from '@/components/admin/qualite/ui';
import { DownloadButton } from '@/components/admin/suivi/ui';
import { filtresVersQuery, lireFiltres } from '@/lib/qualite/filtres';
import { defsFiltres } from '@/lib/qualite/filtres-ui';
import { dateFr, note } from '@/lib/qualite/format';
import { calculerIndicateurs, chargerCommentaires, chargerReponses, groupesRecurrence, optionsFiltres } from '@/lib/qualite/serveur/admin';
import { qdb } from '@/lib/qualite/serveur/base';
import { CRITERE_LABEL, STATUT_ACTION_LABEL, type Critere, type StatutAction } from '@/lib/qualite/types';

export const dynamic = 'force-dynamic';

/**
 * Statistiques par enseignant (§18). Réservé aux administrateurs : les
 * enseignants ne consultent pas les réponses nominatives.
 */
export default async function EnseignantsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const [reponsesTout, commentairesTout, opts] = await Promise.all([
    chargerReponses({ ...f, famille: 'HOT', enseignant: null }), chargerCommentaires({ ...f, famille: 'HOT', enseignant: null, sentiment: null }), optionsFiltres(),
  ]);
  const parEns = new Map<string, { nom: string; reponses: typeof reponsesTout }>();
  for (const r of reponsesTout) {
    if (!r.enseignant_cle) continue;
    const e = parEns.get(r.enseignant_cle) ?? { nom: r.enseignant_nom ?? r.enseignant_cle, reponses: [] };
    e.reponses.push(r); parEns.set(r.enseignant_cle, e);
  }
  const lignes = Array.from(parEns.entries()).map(([cle, e]) => ({
    cle, nom: e.nom,
    ind: calculerIndicateurs(e.reponses, commentairesTout.filter((c) => c.enseignant_cle === cle), []),
    seances: new Set(e.reponses.map((r) => r.seance_id).filter(Boolean)).size,
  })).sort((a, b) => (a.ind.moyenne.moyenne ?? 9) - (b.ind.moyenne.moyenne ?? 9));
  const sansEnseignant = reponsesTout.filter((r) => !r.enseignant_cle).length;

  const choisi = f.enseignant ? lignes.find((l) => l.cle === f.enseignant) ?? null : null;
  let detail: null | {
    reps: typeof reponsesTout; coms: typeof commentairesTout; groupes: Awaited<ReturnType<typeof groupesRecurrence>>;
    actions: { id: string; numero: number; titre: string; statut: StatutAction; mesure_apres: { verdict?: string; explication?: string } | null }[];
  } = null;
  if (choisi) {
    const reps = reponsesTout.filter((r) => r.enseignant_cle === choisi.cle);
    const coms = commentairesTout.filter((c) => c.enseignant_cle === choisi.cle);
    const [groupes, { data: actions }] = await Promise.all([
      groupesRecurrence({ ...f, famille: 'HOT' }),
      qdb().from('qualite_actions').select('id, numero, titre, statut, mesure_apres').eq('cible_type', 'enseignant').eq('cible_cle', choisi.cle).order('created_at', { ascending: false }),
    ]);
    detail = { reps, coms, groupes: groupes.filter((g) => g.portee === 'enseignant' && g.cible === choisi.cle), actions: (actions ?? []) as never };
  }

  return (
    <>
      <EnTete titre="Qualité par enseignant" description="Questionnaires à chaud uniquement. Les moyennes s'affichent avec leurs effectifs ; cliquez sur un enseignant pour le détail."
        action={<DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: 'enseignants', format: 'xlsx' })}`} filename="enseignants.xlsx" label="Exporter (Excel)" />} />
      <BarreFiltres filtres={defsFiltres(opts, ['du', 'au', 'college', 'voie', 'formule', 'promotion', 'typeSeance', 'enseignant'])} />
      {choisi && detail && (
        <div className="mb-6 flex flex-col gap-4">
          <Carte titre={choisi.nom} action={<Link href={`/admin/qualite/enseignants${filtresVersQuery({ ...f, enseignant: null })}`} className="text-sm text-(--color-primary)">Tous les enseignants</Link>}>
            <div className="grid gap-4 md:grid-cols-3">
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-(--color-ink-soft)">Note globale moyenne</dt><dd>{note(choisi.ind.moyenne.moyenne)} <span className="text-xs text-(--color-ink-muted)">({choisi.ind.moyenne.n})</span></dd>
                <dt className="text-(--color-ink-soft)">Séances évaluées</dt><dd>{choisi.seances}</dd>
                <dt className="text-(--color-ink-soft)">Candidats répondants</dt><dd>{choisi.ind.repondants}</dd>
                <dt className="text-(--color-ink-soft)">Satisfaction (4-5)</dt><dd><TauxTexte t={choisi.ind.satisfaction} /></dd>
                <dt className="text-(--color-ink-soft)">Notes défavorables</dt><dd><TauxTexte t={choisi.ind.defavorables} inverse /></dd>
                <dt className="text-(--color-ink-soft)">Commentaires négatifs</dt><dd><TauxTexte t={choisi.ind.commentairesNegatifs} inverse /></dd>
              </dl>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">Par critère</p>
                <ul className="flex flex-col gap-1 text-sm">
                  {(Object.entries(choisi.ind.criteres) as [Critere, { moyenne: number | null; n: number }][]).map(([c, m]) => <li key={c} className="flex justify-between gap-2"><span className="text-(--color-ink-soft)">{CRITERE_LABEL[c]}</span><span>{note(m.moyenne)}</span></li>)}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-(--color-ink-muted)">Évolution mensuelle</p>
                <ul className="flex flex-col gap-1 text-sm">{choisi.ind.serie.map((s) => <li key={s.mois} className="flex justify-between gap-2"><span>{s.mois}</span><span>{note(s.moyenne)} <span className="text-xs text-(--color-ink-muted)">({s.n})</span></span></li>)}</ul>
              </div>
            </div>
          </Carte>
          <div className="grid gap-4 lg:grid-cols-2">
            <Carte titre="Thèmes récurrents">
              {detail.groupes.length === 0 ? <Vide>Aucun thème négatif regroupé.</Vide> : (
                <ul className="flex flex-col gap-1.5 text-sm">{detail.groupes.map((g) => <li key={g.cle} className="flex justify-between gap-2"><Link className="hover:underline" href={`/admin/qualite/remarques${filtresVersQuery({ ...f, enseignant: choisi.cle, theme: g.themeCle, famille: null })}`}>{g.themeLibelle}</Link><span>{g.candidats} candidat(s)</span></li>)}</ul>
              )}
            </Carte>
            <Carte titre="Actions correctives et résultats après intervention">
              {detail.actions.length === 0 ? <Vide>Aucune action pour cet enseignant.</Vide> : (
                <ul className="flex flex-col gap-1.5 text-sm">{detail.actions.map((a) => <li key={a.id}><Link href={`/admin/qualite/actions/${a.id}`} className="hover:underline">n° {a.numero} — {a.titre}</Link> <span className="text-xs text-(--color-ink-muted)">{STATUT_ACTION_LABEL[a.statut]}{a.mesure_apres?.explication ? ` · ${a.mesure_apres.explication}` : ''}</span></li>)}</ul>
              )}
            </Carte>
            <Carte titre="Remarques négatives">
              <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto text-sm">
                {detail.coms.filter((c) => c.sentiment === 'negatif' || c.sentiment === 'mixte').map((c) => <li key={c.id}>« {c.texte} » <span className="text-xs text-(--color-ink-muted)">{dateFr(c.created_at)}</span></li>)}
              </ul>
            </Carte>
            <Carte titre="Remarques positives">
              <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto text-sm">
                {detail.coms.filter((c) => c.sentiment === 'positif').map((c) => <li key={c.id}>« {c.texte} » <span className="text-xs text-(--color-ink-muted)">{dateFr(c.created_at)}</span></li>)}
              </ul>
            </Carte>
          </div>
        </div>
      )}
      <Carte titre={`${lignes.length} enseignant(s)`} description={sansEnseignant ? `${sansEnseignant} réponse(s) sans enseignant identifié : renseignez l'intervenant de la séance (onglet Séances).` : undefined}>
        {lignes.length === 0 ? <Vide>Aucune évaluation à chaud sur la période.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
                <tr><th className="py-2 pr-3">Enseignant</th><th className="pr-3">Note moyenne</th><th className="pr-3">Séances</th><th className="pr-3">Répondants</th><th className="pr-3">Satisfaction</th><th className="pr-3">Défavorables</th><th>Commentaires négatifs</th></tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {lignes.map((l) => (
                  <tr key={l.cle}>
                    <td className="py-2 pr-3"><Link href={`/admin/qualite/enseignants${filtresVersQuery({ ...f, enseignant: l.cle })}`} className="font-medium hover:underline">{l.nom}</Link></td>
                    <td className="pr-3">{note(l.ind.moyenne.moyenne)} <span className="text-xs text-(--color-ink-muted)">({l.ind.moyenne.n})</span>{l.ind.moyenne.moyenne !== null && l.ind.moyenne.moyenne < 3 && <Pastille ton="critique">bas</Pastille>}</td>
                    <td className="pr-3">{l.seances}</td>
                    <td className="pr-3">{l.ind.repondants}</td>
                    <td className="pr-3"><TauxTexte t={l.ind.satisfaction} /></td>
                    <td className="pr-3"><TauxTexte t={l.ind.defavorables} inverse /></td>
                    <td><TauxTexte t={l.ind.commentairesNegatifs} inverse /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Carte>
    </>
  );
}
