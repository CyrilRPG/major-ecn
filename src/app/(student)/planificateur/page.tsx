import { redirect } from 'next/navigation';
import { PlanPageTitle } from '@/components/student/plan/v4/header';
import { StatusPanel } from '@/components/student/plan/v4/status-panel';
import { TodayView } from '@/components/student/plan/v4/today/today-view';
import type { TimeFigures } from '@/components/student/plan/plan-modals';
import { todayData } from '@/lib/plan/pages';
import { pageEnv } from './_env';

export const metadata = { title: 'Mon planning' };

/** Liens d'action de l'accueil qui relèvent de « Mes objectifs » (statut et charge du planificateur). */
const OBJECTIVE_ACTIONS = new Set(['adapter', 'desactiver', 'pause', 'reactiver']);

/**
 * « Mon planning » : le programme du jour (§28), les 7 prochains jours (§30),
 * la fin de journée (§32) et les actions du cahier « Alertes » (reporter,
 * journée incomplète, alerte de la veille, mode prioritaire).
 */
export default async function MonPlanningPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  const { action } = await searchParams;
  if (typeof action === 'string' && OBJECTIVE_ACTIONS.has(action)) redirect(`/planificateur/objectifs?action=${action}`);
  const env = await pageEnv();
  if (env.status !== 'actif') {
    return (
      <>
        <PlanPageTitle subtitle="Votre programme du jour, organisé selon vos priorités et votre progression." daysLeft={null} />
        <StatusPanel status={env.status} pauseUntil={env.profile.pause_until ?? null} reason={env.profile.reconfigure_reason ?? null} />
      </>
    );
  }
  const data = await todayData(env);
  const avail = Object.values(env.profile.availability).filter((m) => m > 0);
  const figures: TimeFigures | null = data.summary ? {
    daysLeft: data.daysLeft, daysPerWeek: avail.length, avgMinutesPerDay: avail.length > 0 ? Math.round(avail.reduce((s, m) => s + m, 0) / avail.length) : 0,
    plannableMinutes: data.summary.projection.capacityMinutes,
  } : null;
  return (
    <>
      <PlanPageTitle subtitle="Votre programme du jour, organisé selon vos priorités et votre progression." daysLeft={data.daysLeft} />
      <TodayView data={data} action={typeof action === 'string' ? action : null} figures={figures} />
    </>
  );
}
