import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Flag } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { loadStudentContext } from '@/lib/plan/service';
import { fmtMinutes } from '@/lib/plan/analytics';
import { addDaysKey } from '@/lib/plan/revision';
import { fmtDayKeyMedium, fmtDateLong } from '@/lib/suivi/format';
import { Stat } from '@/components/student/plan/ui';
import { FORECAST_NOTICE, SESSION_KIND_LABEL, type SessionKind } from '@/lib/plan/types';
import { RegenerateButton } from '@/components/student/plan/regenerate-button';

const KIND_COLOR: Record<SessionKind, string> = {
  apprentissage: '#730d31', consolidation: '#b4586f', approfondissement: '#c98a5a', evaluation: '#2f7a5b',
  reactivation: '#6b7fb3', entrainement: '#8e6a48', revision_finale: '#4b4f6b',
};
const ORDER: SessionKind[] = ['apprentissage', 'approfondissement', 'consolidation', 'evaluation', 'reactivation', 'entrainement', 'revision_finale'];

/**
 * Jusqu'à l'EVC (complément « affichage » §1) : vision synthétique, semaine
 * par semaine, pour savoir où l'on va. Tout y est prévisionnel.
 */
export default async function PlanUntilExamPage() {
  const { user } = await requireUser();
  const ctx = await loadStudentContext(user.id);
  if (!ctx) redirect('/planificateur/onboarding');
  const itemName = new Map(ctx.items.map((i) => [i.id, i.nom_item]));
  const future = ctx.sessions.filter((s) => s.day >= ctx.today && s.status !== 'annulee' && s.status !== 'reportee' && s.status !== 'sautee');
  const mondayOf = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay() || 7;
    return addDaysKey(day, 1 - wd);
  };
  const weeks = new Map<string, typeof future>();
  for (const s of future) weeks.set(mondayOf(s.day), [...(weeks.get(mondayOf(s.day)) ?? []), s]);
  const summary = ctx.summary;
  const coverageDone = summary?.firstCoverageDoneOn ?? null;
  const finalStart = summary && summary.finalRevisionDays > 0 && ctx.profile.exam_date ? addDaysKey(ctx.profile.exam_date, -summary.finalRevisionDays) : null;
  const byKind = Object.fromEntries(ORDER.map((k) => [k, 0])) as Record<SessionKind, number>;
  for (const s of future) byKind[s.kind] += s.minutes;
  const total = future.reduce((n, s) => n + s.minutes, 0);
  const maxWeek = Math.max(1, ...Array.from(weeks.values()).map((l) => l.reduce((n, s) => n + s.minutes, 0)));

  return (
    <main className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Jusqu’à l’EVC</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Jusqu’au {fmtDateLong(`${ctx.profile.exam_date}T12:00:00Z`)} · {weeks.size} semaine(s) · {fmtMinutes(total)} de travail programmé.</p>
        </div>
        <RegenerateButton />
      </header>
      <p className="rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-xs italic text-(--color-ink-soft)">{FORECAST_NOTICE}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Première couverture" value={fmtMinutes(byKind.apprentissage)} hint={coverageDone ? `Programme entièrement couvert le ${fmtDayKeyMedium(coverageDone)}` : `${ctx.program.remainingIds.length} item(s) non programmé(s)`} />
        <Stat label="Approfondissement" value={fmtMinutes(byKind.approfondissement + byKind.consolidation)} hint="Items prioritaires et à consolider" />
        <Stat label="Réactivations et évaluations" value={fmtMinutes(byKind.reactivation + byKind.evaluation)} hint="J+7 · J+14 · J+30 · J+60, adaptés" />
        <Stat label="Entraînement et révisions finales" value={fmtMinutes(byKind.entrainement + byKind.revision_finale)} />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-ink-soft)">
        {ORDER.filter((k) => byKind[k] > 0).map((k) => (
          <li key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: KIND_COLOR[k] }} /> {SESSION_KIND_LABEL[k]}</li>
        ))}
      </ul>

      {weeks.size === 0 ? (
        <p className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-center text-sm text-(--color-ink-soft)">Aucune séance planifiée. Vérifiez vos disponibilités ou recalculez le planning.</p>
      ) : (
        <ol className="space-y-2">
          {Array.from(weeks.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([monday, list], idx) => {
            const minutes = list.reduce((n, s) => n + s.minutes, 0);
            const newItems = Array.from(new Set(list.filter((s) => s.kind === 'apprentissage' && s.part === 1 && s.item_id).map((s) => s.item_id as string)));
            const sunday = addDaysKey(monday, 6);
            const milestones: string[] = [];
            if (coverageDone && coverageDone >= monday && coverageDone <= sunday) milestones.push('Première couverture de tout le programme');
            if (finalStart && finalStart >= monday && finalStart <= sunday) milestones.push('Début des révisions finales');
            const kinds = ORDER.map((k) => ({ k, m: list.filter((s) => s.kind === k).reduce((n, s) => n + s.minutes, 0) })).filter((x) => x.m > 0);
            return (
              <li key={monday} className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="font-semibold text-(--color-ink)">Semaine {idx + 1} <span className="font-normal text-(--color-ink-soft)">· du {fmtDayKeyMedium(monday < ctx.today ? ctx.today : monday)} au {fmtDayKeyMedium(sunday)}</span></p>
                  <p className="text-xs text-(--color-ink-soft)">{fmtMinutes(minutes)} · {newItems.length === 0 ? 'aucun nouvel item' : newItems.length === 1 ? '1 nouvel item' : `${newItems.length} nouveaux items`}</p>
                </div>
                <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-(--color-surface-soft)" style={{ width: `${Math.max(8, (minutes / maxWeek) * 100)}%` }}>
                  {kinds.map(({ k, m }) => <span key={k} title={`${SESSION_KIND_LABEL[k]} : ${fmtMinutes(m)}`} style={{ width: `${(m / minutes) * 100}%`, background: KIND_COLOR[k] }} />)}
                </div>
                {milestones.map((m) => <p key={m} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#730d31]"><Flag className="h-3.5 w-3.5" /> {m}</p>)}
                {newItems.length > 0 && (
                  <details className="mt-2 text-xs text-(--color-ink-soft)">
                    <summary className="cursor-pointer select-none">Items abordés</summary>
                    <p className="mt-1 leading-relaxed">{newItems.map((id) => itemName.get(id)).filter(Boolean).join(' · ')}</p>
                  </details>
                )}
              </li>
            );
          })}
        </ol>
      )}
      <p className="text-xs text-(--color-ink-muted)">Les séances non réalisées ne restent pas « en retard » : elles sont redistribuées sur le temps encore disponible. Un candidat plus rapide avance plus tôt dans le programme et gagne du temps pour l’approfondissement, les réactivations et l’entraînement. <Link href="/planificateur/bilan" className="text-[#730d31] underline-offset-4 hover:underline">Voir le tableau de bord</Link></p>
    </main>
  );
}
