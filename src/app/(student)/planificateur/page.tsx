import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, CalendarDays, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext, syncMasteryFromPlatform } from '@/lib/plan/service';
import { listGenerations } from '@/lib/plan/db';
import { coursIdMap, toSessionView } from '@/lib/plan/views';
import { fmtMinutes } from '@/lib/plan/analytics';
import { fmtDayKeyLong } from '@/lib/suivi/format';
import { SessionCard } from '@/components/student/plan/session-card';
import { FreeWorkDialog } from '@/components/student/plan/free-work-dialog';
import { ProgramReminder, Stat } from '@/components/student/plan/ui';

/** Aujourd'hui (§12, §19) : les séances du jour, temps total, actions, explications. */
export default async function PlanTodayPage() {
  const { user } = await requireUser();
  await syncMasteryFromPlatform(user.id).catch(() => 0);
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const coursIds = coursIdMap(ctx);
  const today = ctx.sessions.filter((s) => s.day === ctx.today && s.status !== 'annulee').map((s) => toSessionView(ctx, s, coursIds));
  const total = today.filter((s) => s.status !== 'terminee').reduce((n, s) => n + s.minutes, 0);
  const doneMin = today.filter((s) => s.status === 'terminee').reduce((n, s) => n + s.minutes, 0);
  const [gen] = await listGenerations(user.id, 1);
  const summary = (gen?.summary ?? {}) as { insufficientTime?: boolean; uncovered?: number };
  const approaching = ctx.daysLeft <= ctx.config.approach_days;
  const insufficient = ctx.coverage.insufficientIds.length;
  const next = ctx.sessions.filter((s) => s.day > ctx.today && s.status === 'planifiee').map((s) => s.day).sort()[0];

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Aujourd’hui</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">{fmtDayKeyLong(ctx.today)} · {ctx.college?.nom ?? 'Votre spécialité'} · J-{ctx.daysLeft} avant les épreuves</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FreeWorkDialog items={ctx.items.map((i) => ({ id: i.id, name: i.nom_item }))} />
          <Link href="/planificateur/programme" className="inline-flex h-9 items-center rounded-(--radius-button) border border-(--color-border) px-3 text-sm text-(--color-ink)">Voir le programme complet</Link>
        </div>
      </header>

      <ProgramReminder />

      {summary.insufficientTime && (
        <div className="rounded-(--radius-card) border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-900/15 dark:text-amber-100">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Votre temps de préparation est limité</p>
          <p className="mt-1">Compte tenu du temps disponible que vous avez déclaré et du temps restant avant les épreuves, votre planning nécessite une forte priorisation. Major ECN organise votre temps en privilégiant les éléments actuellement considérés comme les plus importants pour votre préparation.</p>
          <p className="mt-1">Cela ne signifie pas que les autres éléments du programme ne peuvent pas être évalués. L’ensemble du programme reste à maîtriser.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/planificateur/parametres" className="inline-flex h-9 items-center rounded-(--radius-button) bg-(--color-primary) px-3 text-sm font-medium text-(--color-primary-fg)">Modifier mes disponibilités</Link>
            <Link href="/planificateur/programme?filtre=insuffisant" className="inline-flex h-9 items-center rounded-(--radius-button) border border-current px-3 text-sm">Conserver mon rythme actuel et voir les items concernés</Link>
          </div>
        </div>
      )}

      {approaching && insufficient > 0 && (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 text-sm">
          <p className="font-semibold text-(--color-ink)">Il reste {ctx.daysLeft} jour{ctx.daysLeft > 1 ? 's' : ''} avant les EVC</p>
          <p className="mt-1 text-(--color-ink-soft)">Votre planning privilégie actuellement vos principales lacunes et les éléments à fort rendement. {insufficient} item{insufficient > 1 ? 's' : ''} du programme reste{insufficient > 1 ? 'nt' : ''} néanmoins insuffisamment travaillé{insufficient > 1 ? 's' : ''}.</p>
          <Link href="/planificateur/programme?filtre=insuffisant" className="mt-2 inline-block text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline">Voir les items concernés</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Temps total aujourd’hui" value={fmtMinutes(total + doneMin)} hint={doneMin > 0 ? `${fmtMinutes(doneMin)} déjà réalisées` : undefined} />
        <Stat label="Séances" value={today.length} hint={`${today.filter((s) => s.status === 'terminee').length} terminée(s)`} />
        <Stat label="Programme couvert" value={`${ctx.coverage.coveragePct} %`} hint={`${ctx.coverage.counts.maitrise + ctx.coverage.counts.a_reactiver} maîtrisés · ${ctx.coverage.counts.a_consolider} à consolider`} />
        <Stat label="Planning de la semaine" value={`${ctx.weekExecution.pct} %`} hint={`${ctx.weekExecution.done}/${ctx.weekExecution.planned} séances réalisées`} />
      </div>

      {today.length === 0 ? (
        <div className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-(--color-primary)" />
          Aucune séance prévue aujourd’hui{next ? ` — prochaine séance le ${fmtDayKeyLong(next)}` : ''}.
          <div className="mt-3"><FreeWorkDialog items={ctx.items.map((i) => ({ id: i.id, name: i.nom_item }))} label="Travailler un item quand même" /></div>
        </div>
      ) : (
        <ul className="space-y-2">{today.map((s) => <SessionCard key={s.id} s={s} />)}</ul>
      )}

      <p className="flex items-center gap-2 text-xs text-(--color-ink-muted)"><CalendarDays className="h-3.5 w-3.5" /> Le planning est recalculé à chaque séance terminée ou reportée, à chaque évaluation et à chaque modification de vos disponibilités.</p>
    </main>
  );
}
