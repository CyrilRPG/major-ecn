import { redirect } from 'next/navigation';
import '@/components/student/plan/v4/plan-theme.css';
import { requireUser } from '@/lib/auth/require-role';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { listOpenNotifications } from '@/lib/moteur/server/db';
import { planTablesReady } from '@/lib/plan/db';
import { planAvailableFor } from '@/lib/plan/service';
import { PlannerHeader } from '@/components/student/plan/v4/header';
import type { Notice } from '@/components/student/plan/v4/notice-bell';

export const metadata = { title: 'Mon planning' };
export const dynamic = 'force-dynamic';

/**
 * Planificateur adaptatif EVC (CDC V4.1) — espace candidat « Mon planning ».
 * Ouvert aux élèves dont une préparation est activée (`plan_preparations`,
 * Médecine générale en V1) ; le personnel y accède pour la recette.
 */
export default async function PlanificateurLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const staff = profile.role !== 'student';
  if (!staff && (!PLAN_STUDENT_ENABLED || !(await planAvailableFor(profile.permission_scope)))) redirect('/accueil');
  if (!(await planTablesReady())) {
    if (!staff) redirect('/accueil');
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold text-(--color-ink)">Planificateur — migration à appliquer</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">Les tables du planificateur V4.1 n’existent pas encore : appliquer les migrations <code>20261005140000</code> à <code>20261005150000</code>.</p>
      </main>
    );
  }
  const initials = `${(profile.first_name ?? '').trim().charAt(0)}${(profile.last_name ?? '').trim().charAt(0)}`.toUpperCase() || 'MA';
  const notices: Notice[] = (await listOpenNotifications(user.id, 6).catch(() => [])).map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.cta_href, cta: n.cta_label }));
  return (
    <div className="plan-v4 min-h-full">
      <div className="@container/plan mx-auto w-full max-w-[1538px] px-4 pb-12 pt-[14px] sm:px-[36px]">
        <PlannerHeader initials={initials} notices={notices} />
        {children}
      </div>
    </div>
  );
}
