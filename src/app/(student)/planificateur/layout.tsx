import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { planTablesReady } from '@/lib/plan/db';
import { PlanTabs } from '@/components/student/plan/plan-tabs';

export const metadata = { title: 'Mon planning' };
export const dynamic = 'force-dynamic';

/**
 * Planificateur adaptatif EVC — espace candidat. Tant que le module n'est pas
 * mis en service (`PLAN_STUDENT_ENABLED`), seul le personnel y accède (vue
 * étudiant) pour la recette.
 */
export default async function PlanificateurLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  if (!PLAN_STUDENT_ENABLED && profile.role === 'student') redirect('/accueil');
  if (!(await planTablesReady())) {
    if (profile.role === 'student') redirect('/accueil');
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold text-(--color-ink)">Planificateur — migration à appliquer</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">Les tables <code>plan_*</code> n’existent pas encore : appliquer <code>supabase/APPLIQUER_PLANIFICATEUR.sql</code> dans le SQL Editor.</p>
      </main>
    );
  }
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
      <PlanTabs />
      {children}
    </div>
  );
}
