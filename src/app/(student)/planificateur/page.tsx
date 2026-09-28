import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarDays, CheckCircle2, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext, syncMasteryFromPlatform } from '@/lib/plan/service';
import { coursIdMap, toSessionView } from '@/lib/plan/views';
import { fmtMinutes } from '@/lib/plan/analytics';
import { figuresOf } from '@/lib/plan/figures';
import { FORECAST_NOTICE, VOIE_LABEL } from '@/lib/plan/types';
import { fmtDayKeyLong } from '@/lib/suivi/format';
import { SessionCard } from '@/components/student/plan/session-card';
import { FreeWorkDialog } from '@/components/student/plan/free-work-dialog';
import { ExtraTimeButton, ExtraTimeProvider } from '@/components/student/plan/extra-time';
import { InsufficientBanner, PlanPopups } from '@/components/student/plan/plan-popups';
import { Stat } from '@/components/student/plan/ui';

/**
 * Aujourd'hui (§12, §19, addendum) : détail complet du programme du jour avec
 * durées indicatives. Le planning est une file de travail : « J'ai encore du
 * temps » propose à tout moment la meilleure activité suivante, et le
 * programme terminé déclenche « Bravo… Il vous reste du temps ? ».
 */
export default async function PlanTodayPage() {
  const { user } = await requireUser();
  await syncMasteryFromPlatform(user.id).catch(() => 0);
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const coursIds = coursIdMap(ctx);
  const today = ctx.sessions.filter((s) => s.day === ctx.today && s.status !== 'annulee' && s.status !== 'reportee').map((s) => toSessionView(ctx, s, coursIds));
  const remaining = today.filter((s) => s.status !== 'terminee').reduce((n, s) => n + s.minutes, 0);
  const doneMin = ctx.sessions.filter((s) => s.day === ctx.today && s.status === 'terminee').reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0);
  // « Programme du jour terminé » : seules comptent les activités PRÉVUES aujourd'hui par le planning
  // (une activité ajoutée ou avancée ne fabrique pas un programme du jour).
  const planned = today.filter((s) => s.origin === 'planning');
  const allDone = planned.length > 0 && planned.every((s) => s.status === 'terminee') && !today.some((s) => s.status === 'en_cours');
  const dayClosed = ctx.profile.day_closed_on === ctx.today;
  const summary = ctx.summary;
  const insufficient = !!summary?.insufficientTime;
  const firstPending = !ctx.profile.first_plan_ack_at;
  const nextDay = ctx.sessions.filter((s) => s.day > ctx.today && s.status === 'planifiee').map((s) => s.day).sort()[0];
  const upcoming = nextDay ? ctx.sessions.filter((s) => s.day === nextDay && s.status === 'planifiee').slice(0, 3).map((s) => toSessionView(ctx, s, coursIds)) : [];
  const p = ctx.program;

  return (
    <ExtraTimeProvider>
    <main className="space-y-5">
      <PlanPopups
        today={ctx.today} firstPending={firstPending} insufficient={insufficient} dayDone={allDone && !dayClosed}
        figures={figuresOf(summary ?? { daysLeft: ctx.daysLeft, totalAvailableMinutes: 0 })}
      />

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Aujourd’hui</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {fmtDayKeyLong(ctx.today)} · {ctx.college?.nom ?? 'Votre spécialité'}{ctx.voie ? ` · ${VOIE_LABEL[ctx.voie]}` : ''} · J-{ctx.daysLeft} avant l’EVC
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExtraTimeButton variant="primary" className="bg-[#730d31] text-white hover:bg-[#5e0a28]" />
          <FreeWorkDialog items={ctx.items.map((i) => ({ id: i.id, name: i.nom_item }))} />
        </div>
      </header>

      {!firstPending && insufficient && !ctx.profile.insufficient_ack_at && <InsufficientBanner />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Programme du jour" value={fmtMinutes(remaining + doneMin)} hint={doneMin > 0 ? `${fmtMinutes(doneMin)} déjà réalisées` : 'Durées indicatives'} />
        <Stat label="Activités" value={today.length} hint={`${today.filter((s) => s.status === 'terminee').length} terminée(s)`} />
        <Stat label="Couverture du programme" value={`${p.coveragePct} %`} hint={`${p.workedIds.length} travaillés · ${p.scheduledIds.length} programmés / ${p.total}`} />
        <Stat label="Items restant à travailler" value={p.remainingIds.length} hint={p.remainingIds.length > 0 ? 'Non encore programmés — toujours accessibles' : 'Tout le programme est couvert'} />
      </div>

      {(allDone || dayClosed) && !today.some((s) => s.status === 'en_cours') ? (
        <div className="rounded-(--radius-card) border border-emerald-300/60 bg-emerald-50/60 p-5 text-sm dark:bg-emerald-900/10">
          <p className="flex items-center gap-2 font-semibold text-(--color-ink)"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Programme du jour terminé{dayClosed ? ' — bonne fin de journée' : ''}.</p>
          <p className="mt-1 text-(--color-ink-soft)">Vous pouvez poursuivre à tout moment : le planificateur choisira la prochaine activité la plus pertinente et recalculera la suite.</p>
          <div className="mt-3"><ExtraTimeButton /></div>
        </div>
      ) : null}

      {today.length === 0 ? (
        <div className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-[#730d31]" />
          Aucune activité prévue aujourd’hui{nextDay ? ` — prochaine séance le ${fmtDayKeyLong(nextDay)}` : ''}.
          <div className="mt-3 flex justify-center"><ExtraTimeButton /></div>
        </div>
      ) : (
        <ul className="space-y-2">{today.map((s) => <SessionCard key={s.id} s={s} />)}</ul>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center justify-between text-sm font-semibold text-(--color-ink)">
            <span>Ensuite · {fmtDayKeyLong(nextDay!)}</span>
            <Link href="/planificateur/semaine" className="text-xs font-medium text-[#730d31] underline-offset-4 hover:underline">7 prochains jours</Link>
          </h2>
          <p className="text-xs italic text-(--color-ink-muted)">{FORECAST_NOTICE}</p>
          <ul className="space-y-2">{upcoming.map((s) => <SessionCard key={s.id} s={s} compact />)}</ul>
        </section>
      )}

      <p className="flex items-center gap-2 text-xs text-(--color-ink-muted)"><CalendarDays className="h-3.5 w-3.5" /> Le planning est recalculé à chaque activité réalisée (même en avance), à chaque évaluation et à chaque modification de vos disponibilités ; une séance manquée est redistribuée, jamais accumulée.</p>
    </main>
    </ExtraTimeProvider>
  );
}
