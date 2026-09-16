import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { coursIdMap, toSessionView } from '@/lib/plan/views';
import { fmtMinutes } from '@/lib/plan/analytics';
import { addDaysKey } from '@/lib/plan/revision';
import { fmtDayKeyLong, isoWeekday } from '@/lib/suivi/format';
import { SessionCard } from '@/components/student/plan/session-card';
import { ProgramReminder, Stat } from '@/components/student/plan/ui';

/** Cette semaine (§12) : toutes les séances des 7 jours en cours. */
export default async function PlanWeekPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const coursIds = coursIdMap(ctx);
  const start = addDaysKey(ctx.today, 1 - isoWeekday(ctx.today));
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(start, i));
  const byDay = new Map(days.map((d) => [d, ctx.sessions.filter((s) => s.day === d && s.status !== 'annulee').map((s) => toSessionView(ctx, s, coursIds))]));
  const planned = ctx.weekExecution.plannedMinutes;

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Cette semaine</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Du {fmtDayKeyLong(days[0])} au {fmtDayKeyLong(days[6])}.</p>
      </header>
      <ProgramReminder />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Temps prévu" value={fmtMinutes(planned)} />
        <Stat label="Temps réalisé" value={fmtMinutes(ctx.weekExecution.doneMinutes)} />
        <Stat label="Planning de la semaine réalisé" value={`${ctx.weekExecution.pct} %`} hint={`${ctx.weekExecution.done}/${ctx.weekExecution.planned} séances`} />
        <Stat label="Programme couvert" value={`${ctx.coverage.coveragePct} %`} hint="Distinct de l’avancement du planning" />
      </div>
      <div className="space-y-4">
        {days.map((d) => {
          const list = byDay.get(d) ?? [];
          const minutes = list.reduce((n, s) => n + s.minutes, 0);
          return (
            <section key={d} className={d === ctx.today ? 'rounded-(--radius-card) ring-2 ring-(--color-primary)/40 ring-offset-2 ring-offset-(--color-surface-soft)' : ''}>
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold capitalize text-(--color-ink)">
                <span>{fmtDayKeyLong(d)}{d === ctx.today ? ' · aujourd’hui' : ''}</span>
                <span className="text-xs font-normal text-(--color-ink-soft)">{list.length} séance(s) · {fmtMinutes(minutes)}</span>
              </h2>
              {list.length === 0 ? <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-xs text-(--color-ink-muted)">Rien de prévu.</p>
                : <ul className="space-y-2">{list.map((s) => <SessionCard key={s.id} s={s} compact={d !== ctx.today} />)}</ul>}
            </section>
          );
        })}
      </div>
    </main>
  );
}
