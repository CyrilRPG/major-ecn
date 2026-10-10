import { BarreFiltres, Carte, EnTete, Vide } from '@/components/admin/qualite/ui';
import { DownloadButton } from '@/components/admin/suivi/ui';
import { filtresVersQuery, lireFiltres } from '@/lib/qualite/filtres';
import { dateFr } from '@/lib/qualite/format';
import { qdb } from '@/lib/qualite/serveur/base';

export const dynamic = 'force-dynamic';

const REGISTRES = [
  { type: 'envois', label: 'Questionnaires envoyés (statuts, dates, neutralisations, dispenses)' },
  { type: 'reponses', label: 'Réponses (notes par critère, réponses aux questions)' },
  { type: 'commentaires', label: 'Remarques (texte original + classification)' },
  { type: 'alertes', label: 'Alertes et leur traitement' },
  { type: 'reclamations', label: 'Réclamations' },
  { type: 'actions', label: 'Actions correctives (cause, décision, efficacité)' },
  { type: 'verifications', label: 'Vérifications et mises à jour de contenus' },
  { type: 'interventions', label: 'Interventions auprès des candidats' },
  { type: 'enseignants', label: 'Statistiques par enseignant' },
  { type: 'candidats', label: 'Candidats suivis' },
  { type: 'journal', label: 'Journal de traçabilité' },
];

/** Exports et preuves Qualiopi (traçabilité complète, datée, inaltérable). */
export default async function ExportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const { data } = await qdb().from('qualite_journal').select('id, objet_type, objet_id, action, auteur_nom, details, at').order('at', { ascending: false }).limit(200);
  const journal = (data ?? []) as { id: number; objet_type: string; objet_id: string | null; action: string; auteur_nom: string | null; details: Record<string, unknown>; at: string }[];
  return (
    <>
      <EnTete titre="Exports et preuves Qualiopi" description="Chaque registre est daté et tracé : les réponses, les commentaires originaux et le journal sont inaltérables en base. Ces exports sont des éléments de traçabilité ; ils ne constituent pas, seuls, une preuve de conformité." />
      <BarreFiltres filtres={[{ cle: 'du', label: 'Du', type: 'date' }, { cle: 'au', label: 'Au', type: 'date' }]} />
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Carte titre="Dossier Qualiopi complet" description="Un classeur Excel : synthèse des indicateurs, puis une feuille par registre, sur la période choisie.">
          <DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: 'qualiopi', format: 'xlsx' })}`} filename={`dossier-qualite-${f.du ?? 'debut'}-${f.au ?? 'aujourdhui'}.xlsx`} label="Télécharger le dossier (Excel)" variant="primary" size="md" />
        </Carte>
        <Carte titre="Registres séparés">
          <ul className="flex flex-col gap-2 text-sm">
            {REGISTRES.map((r) => (
              <li key={r.type} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-(--color-ink-soft)">{r.label}</span>
                <span className="flex gap-1">
                  <DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: r.type, format: 'xlsx' })}`} filename={`qualite-${r.type}.xlsx`} label="Excel" variant="ghost" />
                  <DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: r.type, format: 'csv' })}`} filename={`qualite-${r.type}.csv`} label="CSV" variant="ghost" />
                </span>
              </li>
            ))}
          </ul>
        </Carte>
      </div>
      <Carte titre="Journal (200 derniers événements)" description="Envois, réponses, neutralisations, dispenses, corrections, alertes, actions, paramètres, exports.">
        {journal.length === 0 ? <Vide>Journal vide.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-xs">
              <thead className="text-left uppercase tracking-wide text-(--color-ink-muted)"><tr><th className="py-2 pr-3">Date</th><th className="pr-3">Objet</th><th className="pr-3">Action</th><th className="pr-3">Auteur</th><th>Détails</th></tr></thead>
              <tbody className="divide-y divide-(--color-border)">
                {journal.map((j) => (
                  <tr key={j.id} className="align-top">
                    <td className="py-1.5 pr-3 whitespace-nowrap">{dateFr(j.at, true)}</td>
                    <td className="pr-3">{j.objet_type}</td>
                    <td className="pr-3">{j.action.replace(/_/g, ' ')}</td>
                    <td className="pr-3">{j.auteur_nom ?? '—'}</td>
                    <td className="max-w-md truncate text-(--color-ink-muted)" title={JSON.stringify(j.details)}>{Object.keys(j.details ?? {}).length ? JSON.stringify(j.details).slice(0, 160) : ''}</td>
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
