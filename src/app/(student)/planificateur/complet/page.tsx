import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { fmtMinutes } from '@/lib/plan/analytics';
import { fmtDayKeyMedium, fmtDateLong } from '@/lib/suivi/format';
import { KindBadge, ProgramReminder, Stat } from '@/components/student/plan/ui';
import { SESSION_STATUS_LABEL } from '@/lib/plan/types';
import { RegenerateButton } from '@/components/student/plan/regenerate-button';

/** Planning complet (§12) : vision jusqu'à la date des épreuves, par semaine. */
export default async function PlanFullPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const itemName = new Map(ctx.items.map((i) => [i.id, i.nom_item]));
  const future = ctx.sessions.filter((s) => s.day >= ctx.today && s.status !== 'annulee');
  const weeks = new Map<string, typeof future>();
  for (const s of future) {
    const [y, m, d] = s.day.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const wd = dt.getUTCDay() === 0 ? 7 : dt.getUTCDay();
    const monday = new Date(Date.UTC(y, m - 1, d - (wd - 1))).toISOString().slice(0, 10);
    weeks.set(monday, [...(weeks.get(monday) ?? []), s]);
  }
  const byKind = { apprentissage: 0, consolidation: 0, evaluation: 0, reactivation: 0, revision_finale: 0 } as Record<string, number>;
  for (const s of future) byKind[s.kind] = (byKind[s.kind] ?? 0) + s.minutes;

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Planning complet</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Jusqu’au {fmtDateLong(`${ctx.profile.exam_date}T12:00:00Z`)} · {future.length} séances · {fmtMinutes(future.reduce((n, s) => n + s.minutes, 0))}.</p>
        </div>
        <RegenerateButton />
      </header>
      <ProgramReminder />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Apprentissage" value={fmtMinutes(byKind.apprentissage)} />
        <Stat label="Consolidation" value={fmtMinutes(byKind.consolidation)} />
        <Stat label="Évaluations" value={fmtMinutes(byKind.evaluation)} />
        <Stat label="Réactivations" value={fmtMinutes(byKind.reactivation)} />
        <Stat label="Révisions finales" value={fmtMinutes(byKind.revision_finale)} />
      </div>
      {weeks.size === 0 ? (
        <p className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">Aucune séance planifiée. Vérifiez vos disponibilités ou recalculez le planning.</p>
      ) : (
        <div className="space-y-4">
          {Array.from(weeks.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([monday, list]) => (
            <section key={monday} className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
              <h2 className="mb-2 flex items-center justify-between text-sm font-semibold text-(--color-ink)">
                <span>Semaine du {fmtDayKeyMedium(monday)}</span>
                <span className="text-xs font-normal text-(--color-ink-soft)">{list.length} séance(s) · {fmtMinutes(list.reduce((n, s) => n + s.minutes, 0))}</span>
              </h2>
              <ul className="divide-y divide-(--color-border) text-sm">
                {list.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 py-1.5">
                    <span className="w-24 shrink-0 text-xs capitalize text-(--color-ink-muted)">{fmtDayKeyMedium(s.day)}</span>
                    <span className="min-w-0 flex-1 truncate text-(--color-ink)">{s.item_id ? itemName.get(s.item_id) ?? 'Item' : 'Révision'}</span>
                    <KindBadge kind={s.kind} />
                    <span className="w-14 text-right tabular-nums text-(--color-ink-soft)">{s.minutes} min</span>
                    {s.status !== 'planifiee' && <span className="text-xs text-(--color-ink-muted)">{SESSION_STATUS_LABEL[s.status]}</span>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <p className="text-xs text-(--color-ink-muted)">Les séances non réalisées ne restent pas « en retard » : elles sont redistribuées sur le temps encore disponible avant les épreuves. <Link href="/planificateur/bilan" className="text-(--color-primary) underline-offset-4 hover:underline">Voir le tableau de bord</Link></p>
    </main>
  );
}
