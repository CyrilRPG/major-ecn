import { requireAdmin } from '@/lib/auth/require-role';
import { planTablesReady } from '@/lib/plan/db';
import { PlanAdminTabs } from '@/components/admin/plan/plan-admin-tabs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Planificateur EVC' };

/** Back-office du planificateur adaptatif (CDC V4.1 §34) — administrateur uniquement. */
export default async function PlanificateurAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  if (!(await planTablesReady())) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-8">
        <h1 className="text-xl font-semibold text-(--color-ink)">Planificateur EVC — migration à appliquer</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">
          Les tables du planificateur V4.1 n’existent pas encore dans la base : appliquer les migrations <code>20261005140000_planificateur_v41</code>,
          <code>20261005140100_planificateur_v41_coachings</code> et <code>20261005150000_planificateur_v41_moteur_central</code>, puis recharger cette page.
        </p>
      </main>
    );
  }
  return (
    <div className="min-w-0">
      <PlanAdminTabs />
      {children}
    </div>
  );
}
