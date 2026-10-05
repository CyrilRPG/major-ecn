import Link from 'next/link';
import { CalendarClock, Clock, Flame, Play } from 'lucide-react';
import { todayFor } from '@/lib/moteur/server/today';
import { TEXTS as ENGAGEMENT_TEXTS } from '@/lib/engagement/types';
import { PilotageTiles, TodayProgram, type TodayProgramData } from '@/components/student/moteur/today-program';
import { EngagementAlert, PlannerAlert, RecoveredBanner } from '@/components/student/moteur/alert-banners';
import { HeroStat, heroCta } from '@/components/student/ui/page-kit';
import { activiteQuotidienne, joursActifs7, secondesSemaine } from './donnees';

/** Vue du jour du moteur central (dédupliquée par requête : `todayFor` est mis en cache). */
const vueDuJour = (userId: string) => todayFor(userId).catch((e) => {
  console.error('[moteur] programme du jour :', e instanceof Error ? e.message : e);
  return null;
});

/**
 * Bloc « Que dois-je faire aujourd'hui ? » du tableau de bord : alertes
 * (engagement, planificateur), programme du jour unique, puis les tuiles de
 * pilotage. Streamé à part : il n'attend pas les statistiques du tableau de bord.
 */
export async function PedagoToday({ userId }: { userId: string }) {
  const view = await vueDuJour(userId);
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
      <PilotageTiles data={data} />
    </div>
  );
}

export function PedagoTodaySkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="animate-pulse rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <div className="h-5 w-48 rounded bg-(--color-sand-100)" />
        <div className="mt-2 h-3 w-64 rounded bg-(--color-sand-100)" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-(--color-sand-100)" />)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[118px] animate-pulse rounded-2xl border border-(--color-border) bg-(--color-surface)" />)}
      </div>
    </div>
  );
}

/** Bouton principal de l'en-tête : la prochaine activité du programme du jour. */
export async function AccueilHeroAction({ userId }: { userId: string }) {
  const view = await vueDuJour(userId);
  const restantes = view?.program.activities.filter((a) => !a.done).length ?? 0;
  if (view?.start && restantes > 0) {
    const commencee = (view.program.activities.length - restantes) > 0;
    return (
      <Link href={view.start.href} className={heroCta}>
        <Play className="h-4 w-4" aria-hidden /> {commencee ? 'Continuer ma journée' : 'Commencer ma journée'}
      </Link>
    );
  }
  return (
    <Link href="/revisions-transversales" className={heroCta}>
      <Play className="h-4 w-4" aria-hidden /> Réviser mes acquis
    </Link>
  );
}

const fmtDuree = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
};

/** Pastilles de l'en-tête : compte à rebours EVC, temps de la semaine, régularité. */
export async function AccueilHeroStats({ userId, engine }: { userId: string; engine: boolean }) {
  const aujourdhui = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
  const [view, secondes, jours] = await Promise.all([
    engine ? vueDuJour(userId) : Promise.resolve(null),
    secondesSemaine(userId),
    activiteQuotidienne(),
  ]);
  const exam = view?.ctx.examDate ?? null;
  const restants = exam ? Math.round((Date.parse(`${exam}T12:00:00Z`) - Date.parse(`${aujourdhui}T12:00:00Z`)) / 86_400_000) : null;
  const actifs = joursActifs7(jours, aujourdhui);
  return (
    <>
      {restants !== null && restants >= 0 && <HeroStat icon={CalendarClock} value={`J-${restants}`} label="avant l’EVC" />}
      <HeroStat icon={Clock} value={fmtDuree(secondes)} label="cette semaine" />
      {jours && <HeroStat icon={Flame} value={`${actifs}/7`} label="jours actifs" />}
    </>
  );
}

export function AccueilHeroStatsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => <span key={i} aria-hidden className="h-11 w-36 animate-pulse rounded-xl bg-white/10" />)}
    </>
  );
}

/** Rappel de responsabilité (CDC) : en pied d'accueil, pour ne pas alourdir le programme du jour. */
export async function ResponsabiliteAccueil({ userId }: { userId: string }) {
  const view = await vueDuJour(userId);
  if (!view?.responsibility) return null;
  return <p className="px-1 text-[11.5px] leading-relaxed text-(--color-ink-muted)">{view.responsibility}</p>;
}

