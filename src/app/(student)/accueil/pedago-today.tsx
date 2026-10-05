import { todayFor } from '@/lib/moteur/server/today';
import { TEXTS as ENGAGEMENT_TEXTS } from '@/lib/engagement/types';
import { TodayProgram, type TodayProgramData } from '@/components/student/moteur/today-program';
import { EngagementAlert, PlannerAlert, RecoveredBanner } from '@/components/student/moteur/alert-banners';

/**
 * Bloc « Que dois-je faire aujourd'hui ? » du tableau de bord : alertes
 * (engagement, planificateur), programme du jour unique et synthèse.
 * Streamé à part : il n'attend pas les statistiques du tableau de bord.
 */
export async function PedagoToday({ userId }: { userId: string }) {
  const view = await todayFor(userId).catch((e) => {
    console.error('[moteur] programme du jour :', e instanceof Error ? e.message : e);
    return null;
  });
  if (!view) return null;
  const plan = view.ctx.plan;
  const data: TodayProgramData = {
    activities: view.program.activities,
    totalMinutes: view.program.totalMinutes,
    remainingMinutes: view.program.remainingMinutes,
    backlog: view.program.backlog,
    start: view.start,
    attention: view.attention,
    plannerDay: view.plannerDay,
    plannerStatus: plan && plan.onboarding_done ? plan.planner_status : 'absent',
    transversal: view.transversal,
    lastCheckup: view.lastCheckup ? { id: view.lastCheckup.id, score: view.lastCheckup.score, at: view.lastCheckup.at, scope: view.lastCheckup.scope } : null,
    pendingCorrection: view.pendingCorrection,
    recommendation: view.recommendation,
    notifications: view.notifications.map((n) => ({ id: n.id, title: n.title, body: n.body, cta_label: n.cta_label, cta_href: n.cta_href })),
    examInvite: view.examInvite,
    examDate: view.ctx.examDate,
    responsibility: view.responsibility,
    stale: view.stale,
  };
  return (
    <div className="flex flex-col gap-3">
      {view.alert && <EngagementAlert alert={view.alert} />}
      {!view.alert && view.recovered && <RecoveredBanner text={ENGAGEMENT_TEXTS.recovery.confirmed} />}
      {view.plannerAlert && <PlannerAlert alert={view.plannerAlert} />}
      <TodayProgram data={data} />
    </div>
  );
}

export function PedagoTodaySkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-(--color-border) bg-(--color-surface) p-5" aria-hidden>
      <div className="h-5 w-48 rounded bg-(--color-sand-100)" />
      <div className="mt-2 h-3 w-64 rounded bg-(--color-sand-100)" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-(--color-sand-100)" />)}
      </div>
    </div>
  );
}
