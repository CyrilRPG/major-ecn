import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { coursIdMap, toSessionView } from '@/lib/plan/views';
import { fmtMinutes } from '@/lib/plan/analytics';
import { addDaysKey } from '@/lib/plan/revision';
import { FORECAST_NOTICE } from '@/lib/plan/types';
import { fmtDayKeyLong } from '@/lib/suivi/format';
import { SessionCard } from '@/components/student/plan/session-card';
import { ExtraTimeButton, ExtraTimeProvider } from '@/components/student/plan/extra-time';
import { Stat } from '@/components/student/plan/ui';

/**
 * 7 prochains jours (complément « affichage » §1) : visibilité détaillée sur
 * les séances prévues. Les journées futures sont prévisionnelles ; chaque
 * activité peut être réalisée en avance (« Commencer maintenant »).
 */
export default async function PlanNextDaysPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const coursIds = coursIdMap(ctx);
  const days = Array.from({ length: 7 }, (_, i) => addDaysKey(ctx.today, i)).filter((d) => d < (ctx.profile.exam_date ?? '9999'));
  const unavailable = new Set(ctx.profile.unavailable_days);
  const visible = (s: (typeof ctx.sessions)[number]) => s.status !== 'annulee' && s.status !== 'reportee';
  const byDay = new Map(days.map((d) => [d, ctx.sessions.filter((s) => s.day === d && visible(s)).map((s) => toSessionView(ctx, s, coursIds))]));
  const all = days.flatMap((d) => byDay.get(d) ?? []);
  const planned = all.reduce((n, s) => n + s.minutes, 0);
  const done = all.filter((s) => s.status === 'terminee').reduce((n, s) => n + s.minutes, 0);
  const items = new Set(all.filter((s) => s.kind === 'apprentissage').map((s) => s.itemId));
  if (days.length === 0) {
    return <main><p className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">La date de l’épreuve est atteinte : il n’y a plus de journée à planifier.</p></main>;
  }

  return (
    <ExtraTimeProvider>
    <main className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">7 prochains jours</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Du {fmtDayKeyLong(days[0])} au {fmtDayKeyLong(days[days.length - 1])}.</p>
        </div>
        <ExtraTimeButton />
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Temps prévu" value={fmtMinutes(planned)} hint="Durées indicatives" />
        <Stat label="Déjà réalisé" value={fmtMinutes(done)} />
        <Stat label="Nouveaux items abordés" value={items.size} />
        <Stat label="Couverture du programme" value={`${ctx.program.coveragePct} %`} hint="Distincte de l’avancement du planning" />
      </div>
      <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-xs italic text-(--color-ink-soft)">{FORECAST_NOTICE} Vous pouvez réaliser n’importe quelle activité en avance : elle ne vous sera plus reproposée et la suite sera recalculée.</p>
      <div className="space-y-4">
        {days.map((d) => {
          const list = byDay.get(d) ?? [];
          const minutes = list.reduce((n, s) => n + s.minutes, 0);
          const isToday = d === ctx.today;
          return (
            <section key={d} className={isToday ? 'rounded-(--radius-card) ring-2 ring-[#730d31]/30 ring-offset-2 ring-offset-(--color-surface-soft)' : ''}>
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold capitalize text-(--color-ink)">
                <span>{fmtDayKeyLong(d)}{isToday ? ' · aujourd’hui' : <span className="ml-2 text-xs font-normal normal-case italic text-(--color-ink-muted)">prévisionnel</span>}</span>
                <span className="text-xs font-normal normal-case text-(--color-ink-soft)">{list.length} activité(s) · {fmtMinutes(minutes)}</span>
              </h2>
              {list.length === 0 ? (
                <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-xs text-(--color-ink-muted)">{unavailable.has(d) ? 'Jour d’indisponibilité signalé.' : 'Rien de prévu.'}</p>
              ) : <ul className="space-y-2">{list.map((s) => <SessionCard key={s.id} s={s} compact={!isToday} />)}</ul>}
            </section>
          );
        })}
      </div>
    </main>
    </ExtraTimeProvider>
  );
}
