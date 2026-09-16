import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadStudentContext } from '@/lib/plan/service';
import { listActivity, listEvaluations, listGenerations, listMasteryHistory, listStudentsByIds } from '@/lib/plan/db';
import { fmtMinutes } from '@/lib/plan/analytics';
import { MASTERY_SOURCE_LABEL, MASTERY_STATUS_LABEL, PRIORITY_TIER_LABEL, SESSION_KIND_LABEL, SESSION_STATUS_LABEL, WEEKDAY_LABEL, type Availability, type MasterySource } from '@/lib/plan/types';
import { fmtDateTime, fmtDayKeyMedium } from '@/lib/suivi/format';
import { Kpi, SectionCard } from '@/components/admin/suivi/ui';
import { Badge } from '@/components/ui/badge';

/** Dossier d'un candidat (lecture) : profil, couverture, statuts, séances, évolution du niveau (§23). */
export default async function PlanCandidatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const ctx = await loadStudentContext(userId);
  if (!ctx) notFound();
  const [student] = await listStudentsByIds([userId]);
  const [history, generations, evaluations, activity] = await Promise.all([listMasteryHistory(userId), listGenerations(userId, 10), listEvaluations(userId), listActivity(userId, { limit: 60 })]);
  const itemName = new Map(ctx.items.map((i) => [i.id, i.nom_item]));
  const name = [student?.first_name, student?.last_name].filter(Boolean).join(' ') || student?.email || userId;
  const upcoming = ctx.sessions.filter((s) => s.day >= ctx.today && s.status === 'planifiee').slice(0, 30);
  const c = ctx.coverage;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/candidats" className="text-xs text-(--color-ink-muted) hover:underline">← Candidats</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{name}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{ctx.college?.nom ?? ctx.profile.specialite_id} · {ctx.profile.voie ?? 'voie non précisée'} · épreuves le {ctx.profile.exam_date} (J-{ctx.daysLeft}) · disponibilités : {(Object.keys(WEEKDAY_LABEL) as (keyof Availability)[]).map((k) => `${WEEKDAY_LABEL[k].slice(0, 3)} ${fmtMinutes(ctx.profile.availability[k])}`).join(' · ')}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <Link href={`/admin/suivi/candidats/${userId}`} className="rounded-(--radius-button) border border-(--color-border) px-2.5 py-1 text-(--color-ink)">Fiche de suivi individuel</Link>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Kpi label="Programme couvert" value={`${c.coveragePct} %`} hint={`${c.counts.maitrise + c.counts.a_reactiver} maîtrisés · ${c.counts.a_consolider} à consolider`} />
        <Kpi label="Maîtrise estimée" value={`${ctx.estimatedMastery} %`} />
        <Kpi label="Planning de la semaine" value={`${ctx.weekExecution.pct} %`} hint={`${ctx.weekExecution.done}/${ctx.weekExecution.planned} séances`} />
        <Kpi label="Items à travailler" value={c.counts.a_travailler + c.counts.programme + c.counts.en_cours} />
        <Kpi label="Non évalués" value={c.counts.non_evalue} />
        <Kpi label="Évaluations faites" value={evaluations.filter((e) => e.completed_at).length} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard title="Programme (par priorité)">
          <ul className="max-h-[32rem] divide-y divide-(--color-border) overflow-auto text-sm">
            {ctx.statuses.map((r) => ({ ...r, p: ctx.priorities.get(r.item.id)! })).sort((a, b) => b.p.score - a.p.score).map((r) => (
              <li key={r.item.id} className="flex flex-wrap items-center gap-2 py-1.5">
                <span className="min-w-0 flex-1 truncate text-(--color-ink)">{r.item.nom_item}</span>
                <Badge variant="outline">{MASTERY_STATUS_LABEL[r.status]}</Badge>
                <span className="w-16 text-right text-xs tabular-nums text-(--color-ink-soft)">{r.mastery ? `${Math.round(r.mastery.score)} %` : '—'}</span>
                <span className="w-40 text-right text-xs text-(--color-ink-muted)">{PRIORITY_TIER_LABEL[r.p.tier]} · {r.p.score}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Prochaines séances">
          {upcoming.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucune séance planifiée.</p> : (
            <ul className="max-h-[32rem] divide-y divide-(--color-border) overflow-auto text-sm">
              {upcoming.map((s) => <li key={s.id} className="flex items-center gap-2 py-1.5"><span className="w-24 text-xs text-(--color-ink-muted)">{fmtDayKeyMedium(s.day)}</span><span className="min-w-0 flex-1 truncate text-(--color-ink)">{s.item_id ? itemName.get(s.item_id) : 'Révision'}</span><Badge variant="outline">{SESSION_KIND_LABEL[s.kind]}</Badge><span className="w-14 text-right tabular-nums text-(--color-ink-soft)">{s.minutes} min</span></li>)}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="Évolution du niveau (historisation)">
          <ul className="max-h-80 divide-y divide-(--color-border) overflow-auto text-sm">
            {history.slice(0, 200).map((h) => <li key={h.id} className="flex items-center gap-2 py-1.5"><span className="w-32 text-xs text-(--color-ink-muted)">{fmtDateTime(h.created_at)}</span><span className="min-w-0 flex-1 truncate text-(--color-ink)">{itemName.get(h.item_id) ?? h.item_id}</span><span className="text-xs text-(--color-ink-soft)">{MASTERY_SOURCE_LABEL[h.source as MasterySource] ?? h.source}</span><span className="w-14 text-right tabular-nums text-(--color-ink)">{Math.round(Number(h.score))} %</span></li>)}
            {history.length === 0 && <li className="py-2 text-(--color-ink-soft)">Aucune mesure.</li>}
          </ul>
        </SectionCard>
        <SectionCard title="Journal (séances, reports, travail libre, recalculs)">
          <ul className="max-h-80 divide-y divide-(--color-border) overflow-auto text-sm">
            {generations.map((g) => <li key={g.id} className="flex items-center gap-2 py-1.5"><span className="w-32 text-xs text-(--color-ink-muted)">{fmtDateTime(g.created_at)}</span><span className="flex-1 text-(--color-ink)">Recalcul v{g.plan_version} ({g.trigger})</span><span className="text-xs text-(--color-ink-soft)">{String((g.summary as { sessions?: number }).sessions ?? 0)} séances{(g.summary as { insufficientTime?: boolean }).insufficientTime ? ' · temps insuffisant' : ''}</span></li>)}
            {activity.map((a) => <li key={a.id} className="flex items-center gap-2 py-1.5"><span className="w-32 text-xs text-(--color-ink-muted)">{fmtDateTime(a.created_at)}</span><span className="flex-1 text-(--color-ink)">{a.kind.replace(/_/g, ' ')}{a.item_id ? ` · ${itemName.get(a.item_id) ?? ''}` : ''}</span><span className="text-xs text-(--color-ink-soft)">{a.minutes ? `${a.minutes} min` : ''}</span></li>)}
          </ul>
        </SectionCard>
      </div>
      <p className="mt-4 text-xs text-(--color-ink-muted)">Statuts de séance possibles : {Object.values(SESSION_STATUS_LABEL).join(', ')}.</p>
    </main>
  );
}
