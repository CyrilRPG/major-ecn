import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import '@/components/student/plan/v4/plan-theme.css';
import { requireUser } from '@/lib/auth/require-role';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { listOpenNotifications } from '@/lib/moteur/server/db';
import { planTablesReady } from '@/lib/plan/db';
import { planAvailableFor } from '@/lib/plan/service';
import { PlannerHeader } from '@/components/student/plan/v4/header';
import { NoticeBell, type Notice } from '@/components/student/plan/v4/notice-bell';

export const metadata = { title: 'Mon planning' };
export const dynamic = 'force-dynamic';

/** Les tables du planificateur ne disparaissent pas : une fois vues, inutile de les re-vérifier à chaque onglet. */
let tablesVues = false;
async function tablesPretes(): Promise<boolean> {
  if (!tablesVues) tablesVues = await planTablesReady();
  return tablesVues;
}

/**
 * Planificateur adaptatif EVC (CDC V4.1) — espace candidat « Mon planning ».
 * Ouvert aux élèves dont une préparation est activée (`plan_preparations`,
 * Médecine générale en V1) ; le personnel y accède pour la recette.
 *
 * Le layout doit répondre vite : c'est lui qui affiche l'en-tête et les
 * onglets avant que la page (et son squelette, `loading.tsx`) ne prenne le
 * relais. Contrôles d'accès en parallèle, nouveautés du planificateur
 * (cloche) diffusées à part.
 */
export default async function PlanificateurLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireUser();
  const staff = profile.role !== 'student';
  const [ouvert, tables] = await Promise.all([
    staff ? Promise.resolve(true) : PLAN_STUDENT_ENABLED ? planAvailableFor(profile.permission_scope) : Promise.resolve(false),
    tablesPretes(),
  ]);
  if (!ouvert) redirect('/accueil');
  if (!tables) {
    if (!staff) redirect('/accueil');
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-xl font-semibold text-(--color-ink)">Planificateur — migration à appliquer</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">Les tables du planificateur V4.1 n’existent pas encore : appliquer les migrations <code>20261005140000</code> à <code>20261005150000</code>.</p>
      </main>
    );
  }
  return (
    <div className="plan-v4 min-h-full">
      <div className="@container/plan mx-auto w-full max-w-[1538px] px-4 pb-12 pt-5 sm:px-[36px] lg:pt-7">
        <PlannerHeader bell={<Suspense fallback={<BellPlaceholder />}><PlannerBell userId={user.id} /></Suspense>} />
        {children}
      </div>
    </div>
  );
}

async function PlannerBell({ userId }: { userId: string }) {
  const notices: Notice[] = (await listOpenNotifications(userId, 6).catch(() => [])).map((n) => ({ id: n.id, title: n.title, body: n.body, href: n.cta_href, cta: n.cta_label }));
  return <NoticeBell notices={notices} />;
}

function BellPlaceholder() {
  return (
    <span aria-hidden className="grid h-[44px] w-[44px] place-items-center text-(--pl-tab-text) opacity-60">
      <Bell className="h-[28px] w-[28px]" strokeWidth={1.8} />
    </span>
  );
}
