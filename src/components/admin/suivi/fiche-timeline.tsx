import { Badge } from '@/components/ui/badge';
import type { Fiche } from '@/lib/suivi/fiche';
import { fmtDateShort, fmtDateTime, todayKey } from '@/lib/suivi/format';
import {
  ACTION_LABEL, APPOINTMENT_STATUS_LABEL, CONTACT_TYPE_LABEL, DIFFICULTY_LABEL, HISTORY_KIND_LABEL, isOpenAction,
  type ActionRow, type DifficultyRow, type HistoryKind,
} from '@/lib/suivi/types';
import { ActionEmailButton, ActionStatusControl, DeleteReportButton } from './fiche-controls';
import { ActionStatusBadge, AppointmentStatusBadge } from './ui';

/**
 * Fiche chronologique (§11) : rendez-vous → compte rendu → difficultés →
 * actions → réalisation → rendez-vous suivant. Composant SERVEUR ; les
 * contrôles (statut d'action, emails) sont des îlots client.
 */
type Entry = { at: string; key: string; node: React.ReactNode };

export function ActionLine({ action, staff, editable, linked, template }: {
  action: ActionRow; staff: { id: string; name: string }[]; editable: boolean; linked?: DifficultyRow | null; template: { subject: string; body: string };
}) {
  const late = isOpenAction(action.status) && action.due_date && action.due_date < todayKey();
  const owner = action.owner_id ? staff.find((s) => s.id === action.owner_id)?.name : null;
  return (
    <li className="flex flex-wrap items-start gap-2 rounded-md border border-(--color-border) p-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-(--color-ink)">
          {ACTION_LABEL[action.category]}
          {linked && <span className="ml-2 rounded bg-(--color-surface-soft) px-1.5 py-0.5 text-xs font-normal text-(--color-ink-soft)">liée à : {DIFFICULTY_LABEL[linked.category]}</span>}
        </p>
        {action.comment && <p className="text-(--color-ink-soft)">{action.comment}</p>}
        <p className="mt-0.5 text-xs text-(--color-ink-muted)">
          {owner ? `Responsable : ${owner}` : 'Sans responsable'}
          {action.due_date && <span className={late ? ' font-semibold text-(--color-danger)' : ''}> · échéance {fmtDateShort(`${action.due_date}T12:00:00Z`)}{late ? ' (en retard)' : ''}</span>}
          {action.done_at && ` · réalisée le ${fmtDateShort(action.done_at)}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        {editable ? <ActionStatusControl action={action} staff={staff} editable /> : <ActionStatusBadge status={action.status} />}
        {editable && <ActionEmailButton action={action} template={template} />}
      </div>
    </li>
  );
}

export function FicheTimeline({ fiche, can, actionTemplate }: { fiche: Fiche; can: { report: boolean; manage: boolean }; actionTemplate: { subject: string; body: string } }) {
  const staff = fiche.staff.map((s) => ({ id: s.id, name: s.name }));
  const reportApptIds = new Set(fiche.reports.map((r) => r.appointment_id).filter(Boolean));
  const campaignName = new Map(fiche.campaigns.map((c) => [c.id, c.name]));
  const entries: Entry[] = [];

  for (const r of fiche.reports) {
    const author = r.author_id ? staff.find((s) => s.id === r.author_id)?.name : null;
    entries.push({
      at: r.occurred_at, key: `r-${r.id}`,
      node: (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>Compte rendu</Badge>
            <span className="text-sm font-medium text-(--color-ink)">{fmtDateTime(r.occurred_at)}</span>
            <span className="text-xs text-(--color-ink-muted)">{CONTACT_TYPE_LABEL[r.contact_type]}{author ? ` · ${author}` : ''}</span>
            {can.manage && <span className="ml-auto"><DeleteReportButton reportId={r.id} /></span>}
          </div>
          {r.summary && <p className="whitespace-pre-line text-sm text-(--color-ink)">{r.summary}</p>}
          {r.difficulties.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Difficultés</p>
              <ul className="space-y-1.5">
                {r.difficulties.map((d) => (
                  <li key={d.id} className="text-sm">
                    <span className="font-medium text-(--color-ink)">{DIFFICULTY_LABEL[d.category]}</span>
                    {d.no_action && <Badge variant="muted" className="ml-2">constat sans action</Badge>}
                    {d.details && <span className="text-(--color-ink-soft)"> — {d.details}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {r.actions.length > 0 && (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Actions décidées</p>
              <ul className="space-y-1.5">
                {r.actions.map((a) => (
                  <ActionLine key={a.id} action={a} staff={staff} editable={can.report} template={actionTemplate}
                    linked={a.difficulty_id ? r.difficulties.find((d) => d.id === a.difficulty_id) ?? null : null} />
                ))}
              </ul>
            </div>
          )}
          {r.next_step && <p className="mt-3 text-sm text-(--color-ink)"><span className="font-medium">Prochaine étape :</span> {r.next_step}</p>}
          {r.internal_notes && (
            <div className="mt-3 rounded-md border-l-4 border-amber-400 bg-amber-50 p-2.5 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-100">
              <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide">Notes internes</p>
              <p className="whitespace-pre-line">{r.internal_notes}</p>
            </div>
          )}
        </div>
      ),
    });
  }

  for (const a of fiche.appointments) {
    if (a.status === 'cancelled' && !a.moved_from) continue;
    entries.push({
      at: a.starts_at, key: `a-${a.id}`,
      node: (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-(--color-border) px-3 py-2 text-sm">
          <Badge variant="outline">Rendez-vous</Badge>
          <span className="font-medium text-(--color-ink)">{fmtDateTime(a.starts_at)}</span>
          <AppointmentStatusBadge status={a.status} />
          <span className="text-xs text-(--color-ink-muted)">{a.campaign_id ? campaignName.get(a.campaign_id) : 'Hors campagne'}{a.moved_from ? ' · issu d’un déplacement' : ''}{reportApptIds.has(a.id) ? ' · compte rendu rédigé' : ''}</span>
        </div>
      ),
    });
  }

  for (const h of fiche.history) {
    if (h.kind === 'report' || h.kind === 'booked' || h.kind === 'status') continue; // déjà représentés
    const p = h.payload as { subject?: string; error?: string; channel?: string; note?: string; from?: string; to?: string; template_key?: string };
    entries.push({
      at: h.created_at, key: `h-${h.id}`,
      node: (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 text-sm">
          <Badge variant={p.error ? 'danger' : 'muted'}>{HISTORY_KIND_LABEL[h.kind as HistoryKind] ?? h.kind}</Badge>
          <span className="text-xs text-(--color-ink-muted)">{fmtDateTime(h.created_at)}</span>
          <span className="text-(--color-ink-soft)">
            {h.kind === 'moved' && p.from && p.to ? `${fmtDateTime(p.from)} → ${fmtDateTime(p.to)}` : h.kind === 'contact_attempt' ? `${p.channel ?? ''}${p.note ? ` — ${p.note}` : ''}` : p.subject ?? ''}
          </span>
          {p.error && <span className="text-xs text-(--color-danger)">{p.error}</span>}
        </div>
      ),
    });
  }

  for (const n of fiche.legacyNotes) {
    entries.push({
      at: n.created_at, key: `n-${n.id}`,
      node: (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface-soft) p-4 text-sm">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="muted">Note CRM (ancien système)</Badge>
            <span className="font-medium text-(--color-ink)">{fmtDateTime(n.created_at)}</span>
            <span className="text-xs text-(--color-ink-muted)">{n.contact_type} · {n.motif}</span>
          </div>
          {n.observations && <p className="text-(--color-ink)">{n.observations}</p>}
          {n.difficultes && <p className="text-(--color-ink-soft)"><span className="font-medium">Difficultés :</span> {n.difficultes}</p>}
          {n.actions_recommandees && <p className="text-(--color-ink-soft)"><span className="font-medium">Actions recommandées :</span> {n.actions_recommandees}</p>}
          {n.relance_date && <p className="text-xs text-(--color-ink-muted)">Relance prévue le {fmtDateShort(`${n.relance_date}T12:00:00Z`)}</p>}
        </div>
      ),
    });
  }

  entries.sort((a, b) => b.at.localeCompare(a.at));
  if (entries.length === 0) return <p className="text-sm text-(--color-ink-soft)">Aucun élément dans l’historique.</p>;
  return (
    <ol className="space-y-2">
      {entries.map((e) => <li key={e.key}>{e.node}</li>)}
    </ol>
  );
}

/** Libellé court d'un statut de rendez-vous pour un texte. */
export function apptStatusText(status: keyof typeof APPOINTMENT_STATUS_LABEL) {
  return APPOINTMENT_STATUS_LABEL[status];
}
