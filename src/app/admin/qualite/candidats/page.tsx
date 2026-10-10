import Link from 'next/link';
import { BarreFiltres, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { DownloadButton } from '@/components/admin/suivi/ui';
import { lireFiltres } from '@/lib/qualite/filtres';
import { defsFiltres } from '@/lib/qualite/filtres-ui';
import { dateFr, note } from '@/lib/qualite/format';
import { listeCandidats, optionsFiltres } from '@/lib/qualite/serveur/admin';
import { NIVEAU_DIFFICULTE_LABEL, type NiveauDifficulte } from '@/lib/qualite/types';

export const dynamic = 'force-dynamic';

const PALIER = ['—', '7 j', '10 j', '15 j', '21 j'];

/** Suivi individuel (§10-§12) : tous les candidats en formation, avec leurs signaux. */
export default async function CandidatsQualitePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const [toutes, opts] = await Promise.all([listeCandidats(), optionsFiltres()]);
  const q = f.q?.toLowerCase();
  const lignes = toutes.filter((c) =>
    (!f.college || c.colleges.includes(f.college))
    && (!f.voie || c.voie === f.voie)
    && (!f.formule || c.formules.includes(f.formule))
    && (!f.promotion || c.promotion === f.promotion)
    && (!f.niveau || c.difficulteMax === f.niveau || (f.niveau === 'inactifs' && c.inactivitePalier > 0) || (f.niveau === 'alertes' && c.alertes > 0))
    && (!q || c.nom.toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q)))
    .sort((a, b) => b.alertes - a.alertes || (b.difficultes - a.difficultes) || a.nom.localeCompare(b.nom));
  return (
    <>
      <EnTete
        titre="Suivi individuel des candidats"
        description="Candidats inscrits à une formule payante. La fiche de chaque candidat regroupe tout son parcours : progression, présences, résultats, enquêtes, difficultés, réclamations et interventions."
        action={<DownloadButton href="/api/admin/qualite/export?type=candidats&format=xlsx" filename="candidats-qualite.xlsx" label="Exporter (Excel)" />}
      />
      <BarreFiltres filtres={[...defsFiltres(opts, ['college', 'voie', 'formule', 'promotion']),
        { cle: 'niveau', label: 'Situation', options: [{ v: 'prioritaire', l: 'Accompagnement prioritaire' }, { v: 'persistante', l: 'Difficulté persistante' }, { v: 'ponctuelle', l: 'Difficulté ponctuelle' }, { v: 'inactifs', l: 'Inactifs (palier atteint)' }, { v: 'alertes', l: 'Avec alerte ouverte' }] },
        { cle: 'q', label: 'Nom ou e-mail', type: 'texte' }]} />
      <Carte titre={`${lignes.length} candidat(s)`}>
        {lignes.length === 0 ? <Vide>Aucun candidat pour ces filtres.</Vide> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-(--color-ink-muted)">
                <tr><th className="py-2 pr-3">Candidat</th><th className="pr-3">Spécialité · formule</th><th className="pr-3">1re épreuve</th><th className="pr-3">Progression</th><th className="pr-3">Enquêtes</th><th className="pr-3">Dernière note</th><th className="pr-3">Difficultés</th><th className="pr-3">Inactivité</th><th>Alertes</th></tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {lignes.slice(0, 500).map((c) => (
                  <tr key={c.userId}>
                    <td className="py-2 pr-3"><Link href={`/admin/qualite/candidats/${c.userId}`} className="font-medium hover:underline">{c.nom}</Link>
                      <span className="block text-xs text-(--color-ink-muted)">{c.promotion ?? ''}{!c.actif ? ' · accès terminé' : ''}{c.enPause ? ' · en pause' : ''}{c.sansBlocage ? ' · aménagement' : ''}</span></td>
                    <td className="pr-3 text-xs">{c.specialites.slice(0, 2).join(', ')}{c.specialites.length > 2 ? '…' : ''}<span className="block text-(--color-ink-muted)">{c.formules.join(' + ')}{c.voie ? ` · ${c.voie}` : ''}</span></td>
                    <td className="pr-3 whitespace-nowrap">{dateFr(c.premiereEpreuve)}</td>
                    <td className="pr-3">{c.progression === null ? '—' : `${Math.round(c.progression)} %`}</td>
                    <td className="pr-3">{c.completes}/{c.attendus}{c.ouverts ? <span className="block text-xs text-amber-700">{c.ouverts} en attente</span> : null}</td>
                    <td className="pr-3">{note(c.derniereNote)}</td>
                    <td className="pr-3">{c.difficulteMax ? <Pastille ton={c.difficulteMax === 'prioritaire' ? 'critique' : c.difficulteMax === 'persistante' ? 'vigilance' : 'neutre'}>{NIVEAU_DIFFICULTE_LABEL[c.difficulteMax as NiveauDifficulte]} ({c.difficultes})</Pastille> : '—'}</td>
                    <td className="pr-3">{PALIER[c.inactivitePalier] ?? `${c.inactivitePalier}`}</td>
                    <td>{c.alertes ? <Pastille ton="critique">{c.alertes}</Pastille> : '—'}</td>
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
