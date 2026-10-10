import { OngletsQualite } from '@/components/admin/qualite/ui';
import { chargerParametres } from '@/lib/qualite/serveur/base';
import { requireQualitePage } from '@/lib/qualite/serveur/droits';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Qualité & Suivi des candidats' };

/**
 * Espace « Qualité & Suivi des candidats » (CDC du 08/10/2026) : réservé aux
 * administrateurs (réponses nominatives, réclamations, actions correctives).
 */
export default async function QualiteLayout({ children }: { children: React.ReactNode }) {
  await requireQualitePage();
  const params = await chargerParametres();
  return (
    <div className="min-w-0">
      <OngletsQualite actif={params.actif} />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</div>
    </div>
  );
}
