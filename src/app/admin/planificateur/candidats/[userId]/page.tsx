import Link from 'next/link';
import { notFound } from 'next/navigation';
import { candidateDetail } from '@/lib/plan/admin';
import { ACTIVITY_STATUS_LABEL, BLOCK_KIND_LABEL, CANCELLATION_REASON_LABEL, type CancellationReason } from '@/lib/plan/model';
import { INCOMPLETE_REASON_LABEL, PLANNER_STATUS_LABEL, VOIE_LABEL, type IncompleteReason, type PlannerStatus } from '@/lib/plan/types';
import { fmtDateTime } from '@/lib/suivi/format';
import { SectionCard } from '@/components/admin/suivi/ui';

const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)} %`);

/**
 * Fiche planificateur d'un candidat : profil, activités récentes et à venir,
 * versions des journées, journées clôturées, générations (versions du CDC, de
 * la matrice et des paramètres), statuts et journal — pour comprendre chaque
 * décision du moteur.
 */
export default async function PlanCandidatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();
  const d = await candidateDetail(userId);
  if (!d) notFound();
  const p = d.profile;
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <header className="border-b border-(--color-border) pb-5">
        <Link href="/admin/planificateur/candidats" className="text-xs text-(--color-ink-muted) hover:underline">← Candidats</Link>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{d.name}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {d.email} · {p.voie ? VOIE_LABEL[p.voie] : 'voie non renseignée'} · épreuve le {p.exam_date ?? '—'} · {PLANNER_STATUS_LABEL[(p.planner_status ?? 'actif') as PlannerStatus]}
          {p.priority_mode ? ` · mode prioritaire depuis le ${p.priority_mode_since} (${(p.priority_mode_reasons ?? []).join(', ')})` : ''} · nouveauté ×{Number(p.novelty_factor ?? 1).toFixed(2)} · fuseau {p.timezone ?? 'Europe/Paris'}
        </p>
      </header>

      <SectionCard title="Activités (14 jours passés, 7 à venir)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-(--color-ink-soft)"><tr><th className="py-1.5 pr-3">Jour</th><th className="pr-3">Bloc</th><th className="pr-3">Item</th><th className="pr-3">Durée</th><th className="pr-3">Unités</th><th className="pr-3">Statut</th><th className="pr-3">Origine</th><th>Raison</th></tr></thead>
            <tbody className="divide-y divide-(--color-border)">
              {d.activities.map((a) => (
                <tr key={a.id}>
                  <td className="py-1.5 pr-3 tabular-nums">{a.scheduled_date}{a.planned_day && a.planned_day !== a.scheduled_date ? ` (prévue ${a.planned_day})` : ''}</td>
                  <td className="pr-3">{BLOCK_KIND_LABEL[a.block_kind] ?? a.block_kind}</td>
                  <td className="pr-3">{(a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : []).map((id) => d.itemNames.get(id) ?? '—').join(' · ') || '—'}</td>
                  <td className="pr-3 tabular-nums">{a.estimated_duration_minutes} min{a.actual_minutes ? ` (réel ${a.actual_minutes})` : ''}</td>
                  <td className="pr-3 tabular-nums">{a.planned_units ? `${a.validated_units}/${a.planned_units}` : 'non mesurable'}</td>
                  <td className="pr-3">{ACTIVITY_STATUS_LABEL[a.status]}{a.cancellation_reason ? ` (${CANCELLATION_REASON_LABEL[a.cancellation_reason as CancellationReason] ?? a.cancellation_reason})` : ''}{a.defer_reason ? ` · ${INCOMPLETE_REASON_LABEL[a.defer_reason as IncompleteReason] ?? a.defer_reason}` : ''}</td>
                  <td className="pr-3">{a.origin}{a.pinned ? ' · épinglée' : ''}</td>
                  <td className="text-xs text-(--color-ink-soft)">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Journées clôturées (30 jours)">
          <ul className="max-h-[360px] space-y-1 overflow-y-auto text-sm">
            {d.metrics.slice().reverse().map((m) => (
              <li key={m.day} className="flex justify-between gap-2 border-b border-(--color-border) py-1">
                <span className="tabular-nums">{m.day}</span>
                <span className="text-(--color-ink-soft)">{m.off ? 'jour OFF' : `${pct(m.completion_rate)} · ${m.activities_completed}/${m.activities_planned} activités · ${m.postponements} report(s)${m.conforming === true ? ' · conforme' : ''}${m.priority_mode ? ' · prioritaire' : ''}`}</span>
              </li>
            ))}
            {d.metrics.length === 0 && <li className="text-(--color-ink-soft)">Aucune journée clôturée.</li>}
          </ul>
        </SectionCard>
        <SectionCard title="Versions des journées (daily_plan_version)">
          <ul className="max-h-[360px] space-y-1 overflow-y-auto text-sm">
            {d.dayPlans.map((v) => <li key={`${v.day}-${v.version}`} className="border-b border-(--color-border) py-1">{v.day} · v{v.version} · {v.status} · {v.entries} activité(s) · {v.reason ?? '—'} <span className="text-xs text-(--color-ink-muted)">({fmtDateTime(v.created_at)})</span></li>)}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Générations (journal des recalculs)">
        <ul className="space-y-1 text-sm">
          {d.generations.map((g) => {
            const s = g.summary as { projection?: { projectedCoverage?: number }; phase?: number; targetProgression?: number; priorityMode?: boolean };
            return (
              <li key={g.id} className="border-b border-(--color-border) py-1">
                {fmtDateTime(g.created_at)} · {g.trigger} · {g.planner_spec_version ?? '—'} / {g.orchestrator_spec_version ?? '—'} · matrice {g.matrix_version ?? '—'} · paramètres v{g.parameter_set_version ?? 0} · jour v{g.daily_plan_version ?? '—'} · {g.duration_ms ?? '—'} ms
                <span className="text-xs text-(--color-ink-muted)"> — phase {s.phase ?? '—'}, progression {s.targetProgression !== undefined ? pct(s.targetProgression) : '—'}, couverture projetée {s.projection?.projectedCoverage !== undefined ? pct(s.projection.projectedCoverage) : '—'}{s.priorityMode ? ', mode prioritaire' : ''}</span>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Statuts du planificateur">
          <ul className="space-y-1 text-sm">{d.statusHistory.map((h, k) => <li key={k} className="border-b border-(--color-border) py-1">{fmtDateTime(h.created_at)} · {h.old_status ?? '∅'} → {h.new_status}{h.reason ? ` · ${h.reason}` : ''}{h.comment ? ` — ${h.comment}` : ''}</li>)}</ul>
        </SectionCard>
        <SectionCard title="Journal">
          <ul className="max-h-[360px] space-y-1 overflow-y-auto text-xs">{d.logs.map((l) => <li key={l.id} className="border-b border-(--color-border) py-1">{fmtDateTime(l.created_at)} · <strong>{l.kind}</strong> {Object.keys(l.detail ?? {}).length > 0 ? <code className="break-all text-(--color-ink-muted)">{JSON.stringify(l.detail).slice(0, 220)}</code> : null}</li>)}</ul>
        </SectionCard>
      </div>
    </main>
  );
}
