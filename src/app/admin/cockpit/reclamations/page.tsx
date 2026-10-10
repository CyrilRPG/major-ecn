import { contexteCockpit, FACULTE, membresEquipe, profilsParIds } from '@/lib/cockpit/server/base';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { instantParis } from '@/lib/agenda/planning';
import { nomComplet } from '@/lib/cockpit/regles';
import { PageCockpit } from '@/components/admin/cockpit/ui';
import {
  VueReclamations, type AmeliorationLigne, type ReclamationLigne,
} from '@/components/admin/cockpit/reclamations/vue-reclamations';

export const dynamic = 'force-dynamic';

/**
 * « Réclamations & Améliorations » : les retours individuels des candidats
 * (`?vue=reclamations`, `?r=`) et les corrections qui les regroupent
 * (`?vue=ameliorations`, `?a=`). Un administrateur voit tout ; un
 * collaborateur voit ce qu'il a saisi, ce qui lui est confié et les
 * améliorations dont il est responsable.
 */

const COLONNES_RECLAMATION =
  'id, created_by, candidat_id, candidat_label, specialite, categorie, type_probleme, sujet, description, canal, priorite, statut, amelioration_id, assignee_id, tache_id, a_recontacter, recontacte_at, satisfaction, resolue_at, created_at, updated_at';
const COLONNES_AMELIORATION =
  'id, numero, titre, module, probleme, action_prevue, suivi, priorite, statut, responsable_id, echeance, tache_id, created_by, realisee_at, created_at, updated_at';

type Rattachement = { amelioration_id: string; candidat_id: string | null; candidat_label: string; a_recontacter: boolean };

export default async function ReclamationsPage() {
  const { moi, db: d } = await contexteCockpit();

  const [reclamations, ameliorationsBrutes, membres] = await Promise.all([
    fetchAllRows<ReclamationLigne>((from, to) => {
      const q = d.from('cockpit_reclamations').select(COLONNES_RECLAMATION).eq('faculte_id', FACULTE);
      return (moi.estAdmin ? q : q.or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`))
        .order('created_at', { ascending: false }).order('id').range(from, to);
    }),
    fetchAllRows<Omit<AmeliorationLigne, 'candidats' | 'reclamations' | 'aRecontacter'>>((from, to) => {
      const q = d.from('cockpit_ameliorations').select(COLONNES_AMELIORATION).eq('faculte_id', FACULTE);
      return (moi.estAdmin ? q : q.or(`responsable_id.eq.${moi.id},created_by.eq.${moi.id}`))
        .order('created_at', { ascending: false }).order('id').range(from, to);
    }),
    membresEquipe(d),
  ]);

  // Fréquence d'une amélioration = nombre de candidats DISTINCTS parmi toutes
  // ses réclamations (y compris celles qu'un collaborateur ne voit pas : seul
  // le compte est exposé, jamais le dossier).
  const ids = ameliorationsBrutes.map((a) => a.id);
  const rattachements: Rattachement[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const tranche = ids.slice(i, i + 200);
    rattachements.push(...await fetchAllRows<Rattachement>((from, to) => d.from('cockpit_reclamations')
      .select('amelioration_id, candidat_id, candidat_label, a_recontacter, id')
      .eq('faculte_id', FACULTE).in('amelioration_id', tranche).order('id').range(from, to)));
  }
  const parAmelioration = new Map<string, { candidats: Set<string>; total: number; aRecontacter: number }>();
  for (const r of rattachements) {
    const s = parAmelioration.get(r.amelioration_id) ?? { candidats: new Set<string>(), total: 0, aRecontacter: 0 };
    s.candidats.add(r.candidat_id ?? `libelle:${r.candidat_label.trim().toLowerCase()}`);
    s.total += 1;
    if (r.a_recontacter) s.aRecontacter += 1;
    parAmelioration.set(r.amelioration_id, s);
  }
  const ameliorations: AmeliorationLigne[] = ameliorationsBrutes.map((a) => {
    const s = parAmelioration.get(a.id);
    return { ...a, candidats: s?.candidats.size ?? 0, reclamations: s?.total ?? 0, aRecontacter: s?.aRecontacter ?? 0 };
  });

  const profils = await profilsParIds(d, [
    ...reclamations.flatMap((r) => [r.assignee_id, r.created_by]),
    ...ameliorations.flatMap((a) => [a.responsable_id, a.created_by]),
  ]);
  const noms: Record<string, string> = {};
  for (const [id, p] of profils) noms[id] = nomComplet(p) || 'Membre de l’équipe';

  return (
    <PageCockpit>
      <VueReclamations
        reclamations={reclamations}
        ameliorations={ameliorations}
        noms={noms}
        membres={membres.map((m) => ({ id: m.id, nom: nomComplet(m) || m.email || 'Sans nom' }))}
        moiId={moi.id}
        estAdmin={moi.estAdmin}
        aujourdHui={instantParis().date}
      />
    </PageCockpit>
  );
}
