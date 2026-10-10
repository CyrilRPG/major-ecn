import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, Vide } from '@/components/admin/qualite/ui';
import { jourParis } from '@/lib/evc-calendrier/dates';
import { dateFr, maintenant } from '@/lib/qualite/format';
import { qdb } from '@/lib/qualite/serveur/base';
import { CIBLE_ACTION_LABEL, STATUT_ACTION_LABEL, STATUTS_ACTION, type CibleAction, type StatutAction } from '@/lib/qualite/types';
import { actionEnRetard } from '@/lib/qualite/workflow';
import { creerActionAction } from '../actions';

export const dynamic = 'force-dynamic';

type Action = { id: string; numero: number; titre: string; statut: StatutAction; echeance: string | null; responsable_nom: string | null; cible_type: CibleAction; cible_label: string | null; mesure_apres: { verdict?: string } | null; created_at: string };

/** Plan d'actions correctives (§23-§25). */
export default async function ActionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const statut = typeof sp.statut === 'string' && sp.statut ? sp.statut : null;
  let q = qdb().from('qualite_actions').select('id, numero, titre, statut, echeance, responsable_nom, cible_type, cible_label, mesure_apres, created_at').order('created_at', { ascending: false }).limit(500);
  if (statut === 'ouvertes') q = q.not('statut', 'in', '(cloture,sans_suite)');
  else if (statut) q = q.eq('statut', statut);
  const { data } = await q;
  const actions = (data ?? []) as Action[];
  const auj = jourParis(maintenant());
  return (
    <>
      <EnTete titre="Actions correctives" description="Nouveau → En analyse → Action décidée → En cours → Réalisé → Efficacité à vérifier → Clôturé. La clôture exige une validation humaine ; un classement sans suite garde sa justification."
        action={<BoutonAction label="Nouvelle action" variant="primary" action={creerActionAction} champs={[
          { nom: 'titre', label: 'Titre', requis: true }, { nom: 'probleme', label: 'Problème constaté', type: 'long', requis: true },
          { nom: 'cible_type', label: 'Cible', type: 'select', requis: true, options: Object.entries(CIBLE_ACTION_LABEL).map(([v, l]) => ({ v, l })) },
          { nom: 'cible_cle', label: 'Clé de la cible (enseignant, séance, contenu…)' }, { nom: 'cible_label', label: 'Libellé de la cible' },
          { nom: 'echeance', label: 'Échéance', type: 'date' },
        ]} />} />
      <BarreFiltres filtres={[{ cle: 'statut', label: 'Statut', options: [{ v: 'ouvertes', l: 'Ouvertes' }, ...STATUTS_ACTION.map((s) => ({ v: s, l: STATUT_ACTION_LABEL[s] }))] }]} />
      <Carte titre={`${actions.length} action(s)`}>
        {actions.length === 0 ? <Vide>Aucune action corrective.</Vide> : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-(--color-ink-muted)"><tr><th className="py-2 pr-3">N°</th><th className="pr-3">Action</th><th className="pr-3">Cible</th><th className="pr-3">Responsable</th><th className="pr-3">Échéance</th><th className="pr-3">Statut</th><th>Efficacité</th></tr></thead>
            <tbody className="divide-y divide-(--color-border)">
              {actions.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 pr-3">{a.numero}</td>
                  <td className="pr-3"><Link href={`/admin/qualite/actions/${a.id}`} className="font-medium hover:underline">{a.titre}</Link></td>
                  <td className="pr-3 text-xs">{CIBLE_ACTION_LABEL[a.cible_type]}{a.cible_label ? ` : ${a.cible_label}` : ''}</td>
                  <td className="pr-3">{a.responsable_nom ?? '—'}</td>
                  <td className={`pr-3 ${actionEnRetard(a, auj) ? 'font-semibold text-red-600' : ''}`}>{dateFr(a.echeance)}</td>
                  <td className="pr-3"><Pastille ton={a.statut === 'cloture' ? 'ok' : a.statut === 'sans_suite' ? 'neutre' : 'vigilance'}>{STATUT_ACTION_LABEL[a.statut]}</Pastille></td>
                  <td className="text-xs">{a.mesure_apres?.verdict ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Carte>
    </>
  );
}
