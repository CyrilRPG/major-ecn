import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { listActivity, listGenerations } from '@/lib/plan/db';
import { fmtMinutes } from '@/lib/plan/analytics';
import { addDaysKey } from '@/lib/plan/revision';
import { MASTERY_STATUS_LABEL, PRIORITY_TIER_LABEL } from '@/lib/plan/types';
import { fmtDateTime, fmtDayKeyMedium } from '@/lib/suivi/format';
import { ProgramReminder, Stat } from '@/components/student/plan/ui';

/**
 * Tableau de bord (§21) + bilan de couverture (complément §6, §11) : temps
 * travaillé / prévu, progression du planning, couverture du programme,
 * maîtrise estimée, items par statut, planning de la semaine.
 */
export default async function PlanBilanPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const since = `${addDaysKey(ctx.today, -30)}T00:00:00Z`;
  const [activity, generations] = await Promise.all([listActivity(user.id, { from: since }), listGenerations(user.id, 5)]);
  const worked30 = activity.filter((a) => a.kind === 'seance_terminee' || a.kind === 'travail_libre').reduce((n, a) => n + (a.minutes ?? 0), 0);
  const totalPlanned = ctx.sessions.filter((s) => s.status !== 'annulee').reduce((n, s) => n + s.minutes, 0);
  const totalDone = ctx.sessions.filter((s) => s.status === 'terminee').reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0);
  const c = ctx.coverage;
  const priorityCounts = { tres_elevee: 0, elevee: 0, normale: 0, secondaire: 0 };
  for (const p of ctx.priorities.values()) priorityCounts[p.tier]++;
  const weekSessions = ctx.sessions.filter((s) => s.day >= ctx.today && s.status === 'planifiee').slice(0, 7);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Tableau de bord</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Deux notions distinctes : l’avancement de votre planning et la couverture réelle du programme.</p>
      </header>
      <ProgramReminder />

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-muted)">Avancement du planning</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Planning de la semaine réalisé" value={`${ctx.weekExecution.pct} %`} hint={`${ctx.weekExecution.done}/${ctx.weekExecution.planned} séances`} />
          <Stat label="Temps travaillé (30 jours)" value={fmtMinutes(worked30)} />
          <Stat label="Temps prévu (planning)" value={fmtMinutes(totalPlanned)} hint={`${fmtMinutes(totalDone)} déjà réalisées`} />
          <Stat label="Jours avant les épreuves" value={ctx.daysLeft} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-ink-muted)">Couverture du programme</h2>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
          <p className="text-lg font-semibold text-(--color-ink)">{c.total} items au programme — couverture : {c.coveragePct} %</p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-(--color-surface-soft)">
            <div className="flex h-full">
              <span className="bg-emerald-500" style={{ width: `${c.total ? ((c.counts.maitrise + c.counts.a_reactiver) / c.total) * 100 : 0}%` }} title="Maîtrisés" />
              <span className="bg-amber-500" style={{ width: `${c.total ? (c.counts.a_consolider / c.total) * 100 : 0}%` }} title="À consolider" />
              <span className="bg-(--color-primary)" style={{ width: `${c.total ? ((c.counts.a_travailler + c.counts.programme + c.counts.en_cours) / c.total) * 100 : 0}%` }} title="À travailler" />
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
            <div><dt className="text-(--color-ink-muted)">Maîtrisés</dt><dd className="font-medium text-(--color-ink)">{c.counts.maitrise + c.counts.a_reactiver} <span className="text-xs font-normal text-(--color-ink-soft)">(dont {c.counts.a_reactiver} à réactiver)</span></dd></div>
            <div><dt className="text-(--color-ink-muted)">À consolider</dt><dd className="font-medium text-(--color-ink)">{c.counts.a_consolider}</dd></div>
            <div><dt className="text-(--color-ink-muted)">À travailler</dt><dd className="font-medium text-(--color-ink)">{c.counts.a_travailler + c.counts.programme + c.counts.en_cours} <span className="text-xs font-normal text-(--color-ink-soft)">({c.counts.programme} programmés, {c.counts.en_cours} en cours)</span></dd></div>
            <div><dt className="text-(--color-ink-muted)">Non encore évalués</dt><dd className="font-medium text-(--color-ink)">{c.counts.non_evalue}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-(--color-ink-soft)">Niveau de maîtrise estimé (moyenne des items) : <strong className="text-(--color-ink)">{ctx.estimatedMastery} %</strong>. Avoir réalisé son planning ne signifie pas maîtriser le programme : la couverture ne progresse qu’avec des évaluations.</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/planificateur/programme?filtre=insuffisant" className="text-(--color-primary) underline-offset-4 hover:underline">Items insuffisamment travaillés ({c.insufficientIds.length})</Link>
            <Link href="/planificateur/programme?filtre=a_consolider" className="text-(--color-primary) underline-offset-4 hover:underline">Items à consolider</Link>
            <Link href="/planificateur/programme?filtre=maitrise" className="text-(--color-primary) underline-offset-4 hover:underline">Items maîtrisés</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="mb-2 text-sm font-semibold text-(--color-ink)">Items prioritaires</h2>
          <ul className="space-y-1 text-sm">
            {(Object.keys(priorityCounts) as (keyof typeof priorityCounts)[]).map((t) => (
              <li key={t} className="flex items-center justify-between"><span className="text-(--color-ink-soft)">{PRIORITY_TIER_LABEL[t]}</span><span className="tabular-nums font-medium text-(--color-ink)">{priorityCounts[t]}</span></li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-(--color-ink-muted)">Les priorités évoluent avec votre niveau, votre avancement et le temps restant : « secondaire actuellement » ne signifie jamais « à ignorer ».</p>
        </div>
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
          <h2 className="mb-2 text-sm font-semibold text-(--color-ink)">Prochaines séances</h2>
          {weekSessions.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucune séance planifiée.</p> : (
            <ul className="space-y-1 text-sm">
              {weekSessions.map((s) => <li key={s.id} className="flex items-center justify-between gap-2"><span className="truncate text-(--color-ink)">{ctx.items.find((i) => i.id === s.item_id)?.nom_item ?? 'Révision'}</span><span className="shrink-0 text-xs text-(--color-ink-muted)">{fmtDayKeyMedium(s.day)} · {s.minutes} min</span></li>)}
            </ul>
          )}
          <Link href="/planificateur/semaine" className="mt-2 inline-block text-sm text-(--color-primary) underline-offset-4 hover:underline">Planning de la semaine</Link>
        </div>
      </section>

      <section className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
        <h2 className="mb-2 text-sm font-semibold text-(--color-ink)">Items par statut</h2>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {(Object.keys(c.counts) as (keyof typeof c.counts)[]).map((s) => (
            <Link key={s} href={`/planificateur/programme?filtre=${s}`} className="flex items-center justify-between rounded-lg border border-(--color-border) px-3 py-2 hover:border-(--color-primary)">
              <span className="text-(--color-ink-soft)">{MASTERY_STATUS_LABEL[s]}</span><span className="tabular-nums font-medium text-(--color-ink)">{c.counts[s]}</span>
            </Link>
          ))}
        </div>
      </section>

      {generations.length > 0 && (
        <section className="text-xs text-(--color-ink-muted)">
          Dernier recalcul : {fmtDateTime(generations[0].created_at)} ({generations[0].trigger}) · version {generations[0].plan_version}.
        </section>
      )}
    </main>
  );
}
