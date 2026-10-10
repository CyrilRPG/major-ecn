import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { acteurBackOffice, peut } from '@/lib/echanges/serveur/admin';
import { contexteCriteres } from '@/lib/echanges/serveur/acces';
import { FormulairePromotion } from '@/components/admin/echanges/groupes/formulaire-promotion';
import { VALEURS_VIDES } from '@/components/admin/echanges/groupes/commun';

export const metadata = { title: 'Nouvelle promotion — Échanges' };
export const dynamic = 'force-dynamic';

/**
 * Création d'une promotion : toujours en brouillon (rien n'est visible des
 * candidats avant l'activation), puis ouverture de sa fiche.
 */
export default async function NouvellePromotionPage() {
  const a = await acteurBackOffice();
  if (!a || !peut(a, 'gerer_groupes')) redirect('/admin/echanges');
  const ctx = await contexteCriteres();
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <Link href="/admin/echanges/groupes" className="inline-flex items-center gap-1 text-[13px] font-medium text-(--color-ink-soft) hover:text-(--color-primary)">
          <ArrowLeft className="h-3.5 w-3.5" /> Promotions
        </Link>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-(--color-ink)">Nouvelle promotion</h2>
        <p className="text-sm text-(--color-ink-soft)">Elle est créée en brouillon : vous ajouterez ensuite les enseignants et vérifierez les participants avant de l’activer.</p>
      </div>
      <FormulairePromotion initial={VALEURS_VIDES} specialites={ctx.specialites} />
    </div>
  );
}
