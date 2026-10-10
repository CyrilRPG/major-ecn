import { contexteCockpit, FACULTE, membresEquipe, profilsParIds, type Db, type Moi } from '@/lib/cockpit/server/base';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { instantParis } from '@/lib/agenda/planning';
import { nomComplet } from '@/lib/cockpit/regles';
import { PageCockpit } from '@/components/admin/cockpit/ui';
import { VueDemandes, type DemandeLigne } from '@/components/admin/cockpit/demandes/vue-demandes';

export const dynamic = 'force-dynamic';

/**
 * « Demandes clients » (addendum D) et vue « Suivi comptable » (addendum E,
 * `?nature=comptable`). Dossiers d'équipe : un administrateur voit tout, un
 * collaborateur ne voit que ce qu'il a saisi ou ce qui lui est confié.
 */

const COLONNES =
  'id, numero, created_by, client_id, client_label, client_contact, canal, recue_at, nature, sous_type, motif, resume, priorite, assignee_id, echeance, statut, tache_id, cloturee_at, created_at, updated_at';

/** Demandes terminées affichées (les plus récentes) : l'historique complet reste en base. */
const TERMINEES_MAX = 400;

function visibles(d: Db, moi: Moi) {
  const q = d.from('cockpit_demandes').select(COLONNES).eq('faculte_id', FACULTE);
  return moi.estAdmin ? q : q.or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`);
}

export default async function DemandesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { moi, db: d } = await contexteCockpit();
  const sp = await searchParams;
  const ouverte = typeof sp.d === 'string' ? sp.d : null;

  const [ouvertes, terminees, membres] = await Promise.all([
    fetchAllRows<DemandeLigne>((from, to) => visibles(d, moi).neq('statut', 'terminee').order('created_at', { ascending: false }).order('id').range(from, to)),
    visibles(d, moi).eq('statut', 'terminee').order('cloturee_at', { ascending: false, nullsFirst: false }).limit(TERMINEES_MAX),
    membresEquipe(d),
  ]);
  const lignes: DemandeLigne[] = [...ouvertes, ...((terminees.data ?? []) as DemandeLigne[])];

  // Lien direct (notification, recherche) vers une demande terminée ancienne.
  if (ouverte && /^[0-9a-f-]{36}$/i.test(ouverte) && !lignes.some((l) => l.id === ouverte)) {
    const { data } = await visibles(d, moi).eq('id', ouverte).maybeSingle();
    if (data) lignes.push(data as DemandeLigne);
  }

  const profils = await profilsParIds(d, lignes.flatMap((l) => [l.created_by, l.assignee_id]));
  const noms: Record<string, string> = {};
  for (const [id, p] of profils) noms[id] = nomComplet(p) || 'Membre de l’équipe';

  return (
    <PageCockpit>
      <VueDemandes
        lignes={lignes}
        noms={noms}
        membres={membres.map((m) => ({ id: m.id, nom: nomComplet(m) || m.email || 'Sans nom' }))}
        moiId={moi.id}
        aujourdHui={instantParis().date}
        terminesTronques={(terminees.data ?? []).length >= TERMINEES_MAX}
      />
    </PageCockpit>
  );
}
