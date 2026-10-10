import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { acteurBackOffice, listeGroupes, peut } from '@/lib/echanges/serveur/admin';
import { ListePromotions } from '@/components/admin/echanges/groupes/liste-promotions';
import type { LignePromotion } from '@/components/admin/echanges/groupes/commun';

export const metadata = { title: 'Promotions — Échanges' };
export const dynamic = 'force-dynamic';

/**
 * Promotions en cours (brouillon, active, clôturée) : compteurs d'activité,
 * filtres, accès à la fiche de chaque promotion et création (§83, §104).
 */
export default async function PromotionsPage() {
  const a = await acteurBackOffice();
  if (!a || !peut(a, 'gerer_groupes')) redirect('/admin/echanges');
  const groupes = await listeGroupes(a);
  const lignes: LignePromotion[] = groupes.map((g) => ({
    id: g.id, nom: g.nom, annee: g.annee, promotion: g.promotion, specialite: g.specialite_nom, statut: g.statut, visible: g.visible,
    candidats: g.candidats, enseignants: g.enseignants, messages7j: g.messages7j, questionsEnAttente: g.questionsEnAttente,
    dernierMessage: g.dernierMessage, conservationLegale: g.conservation_legale, archiveeAt: g.archivee_at,
  }));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-(--color-ink)">Promotions</h2>
          <p className="text-sm text-(--color-ink-soft)">Groupes de candidats et leurs enseignants. Les promotions archivées sont dans l’onglet « Archives ».</p>
        </div>
        <Link
          href="/admin/echanges/groupes/nouveau"
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-medium text-white shadow-sm hover:bg-(--color-primary-deep) focus-ring"
        >
          <Plus className="h-4 w-4" /> Nouvelle promotion
        </Link>
      </div>
      <ListePromotions lignes={lignes} />
    </div>
  );
}
