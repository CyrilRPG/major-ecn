import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuiviPage } from '@/lib/suivi/roles';
import {
  countOccupancy, getCampaign, getSettings, listActions, listAppointments, listEvcSessions, listHistory, listMembers,
  listReports, listSlots, listStaffProfiles, listStudents, listStudentsByIds, listTemplates, loadLastSignIns,
} from '@/lib/suivi/db';
import { deriveCandidateStates } from '@/lib/suivi/stats';
import { studentName, studentSpecialty } from '@/lib/suivi/students';
import { ENROLLABLE_SPECIALTY_NAMES } from '@/lib/data/enrollable-colleges';
import { fmtDateShort, fmtDateTime } from '@/lib/suivi/format';
import { CAMPAIGN_STATUS_LABEL, HISTORY_KIND_LABEL, roleCan, type HistoryKind } from '@/lib/suivi/types';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/admin/suivi/ui';
import { CampaignForm } from '@/components/admin/suivi/campaign-form';
import { CampaignMembers, type MemberView } from '@/components/admin/suivi/campaign-members';
import { CampaignStatusButtons } from '@/components/admin/suivi/campaign-status-buttons';
import { SlotGenerator } from '@/components/admin/suivi/slot-generator';
import { SlotsList } from '@/components/admin/suivi/slots-list';

export const dynamic = 'force-dynamic';

/** Fiche d'une campagne : ciblage, candidats (§10/§14), créneaux (§6), envois. */
export default async function CampagnePage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireSuiviPage('view');
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign) notFound();
  const canManage = roleCan(role, 'manage');

  const [members, settings, sessions, staff, templates, slots, history, allStudents] = await Promise.all([
    listMembers(id), getSettings(), listEvcSessions(), listStaffProfiles(), listTemplates(), listSlots({ campaignId: id }),
    listHistory({ campaignId: id }), canManage ? listStudents() : Promise.resolve([]),
  ]);
  const userIds = members.map((m) => m.user_id);
  const [students, appointments, reports, actions, signIns, occupancy] = await Promise.all([
    listStudentsByIds(userIds),
    userIds.length > 0 ? listAppointments() : Promise.resolve([]),
    userIds.length > 0 ? listReports() : Promise.resolve([]),
    userIds.length > 0 ? listActions() : Promise.resolve([]),
    loadLastSignIns(),
    countOccupancy(slots.map((s) => s.id)),
  ]);
  const idSet = new Set(userIds);
  const candidates = deriveCandidateStates({
    students,
    appointments: appointments.filter((a) => idSet.has(a.user_id)),
    reports: reports.filter((r) => idSet.has(r.user_id)),
    members,
    actions: actions.filter((a) => idSet.has(a.user_id)),
    lastSignIns: signIns,
  });
  const candById = new Map(candidates.map((c) => [c.id, c]));
  const nowIso = new Date().toISOString();
  const rows: MemberView[] = members
    .map((m) => {
      const c = candById.get(m.user_id);
      if (!c) return null;
      const pastPlanned = appointments.find((a) => a.user_id === m.user_id && a.campaign_id === id && a.status === 'planned' && a.starts_at < nowIso);
      return { memberId: m.id, memberStatus: m.status, invitedAt: m.invited_at, lastReminderAt: m.last_reminder_at, reminderCount: m.reminder_count, candidate: c, pastPlannedAppointmentId: pastPlanned?.id ?? null };
    })
    .filter((x): x is MemberView => x !== null)
    .sort((a, b) => a.candidate.name.localeCompare(b.candidate.name, 'fr'));

  const tpl = Object.fromEntries(templates.map((t) => [t.key, { subject: t.subject, body: t.body }])) as Record<string, { subject: string; body: string }>;
  const present = new Set(allStudents.map((s) => studentSpecialty(s.permission_scope)).filter(Boolean));
  const specialties = Array.from(new Set([...ENROLLABLE_SPECIALTY_NAMES, ...campaign.specialties, ...present])).sort((a, b) => a.localeCompare(b, 'fr'));
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }));
  const sends = history.filter((h) => ['invite', 'announce', 'relance', 'email'].includes(h.kind));
  const variant = campaign.status === 'active' ? 'success' : campaign.status === 'closed' ? 'muted' : 'outline';

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border) pb-5">
        <div>
          <Link href="/admin/suivi/campagnes" className="text-xs text-(--color-ink-muted) hover:underline">← Campagnes</Link>
          <h1 className="mt-1 flex items-center gap-3 text-xl font-semibold tracking-tight text-(--color-ink)">
            {campaign.name} <Badge variant={variant}>{CAMPAIGN_STATUS_LABEL[campaign.status]}</Badge>
          </h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {members.length} candidat(s) ciblé(s) · {slots.length} créneau(x)
            {campaign.announced_at ? ` · planning annoncé le ${fmtDateShort(campaign.announced_at)}` : ' · planning non annoncé'}
            {campaign.invited_at ? ` · invitations le ${fmtDateShort(campaign.invited_at)}` : ''}
          </p>
          <nav className="mt-2 flex gap-3 text-xs">
            <a href="#candidats" className="text-(--color-primary) hover:underline">Candidats</a>
            <a href="#creneaux" className="text-(--color-primary) hover:underline">Créneaux</a>
            <a href="#ciblage" className="text-(--color-primary) hover:underline">Ciblage</a>
            <a href="#envois" className="text-(--color-primary) hover:underline">Envois</a>
          </nav>
        </div>
        {canManage && <CampaignStatusButtons id={campaign.id} status={campaign.status} />}
      </header>

      <div className="space-y-6">
        <SectionCard id="candidats" title="Candidats de la campagne" description="Qui a été invité, qui a réservé, qui reste à relancer. Les envois sont modifiables avant expédition.">
          <CampaignMembers campaignId={campaign.id} rows={rows} canManage={canManage}
            templates={{ planning_announce: tpl.planning_announce, invite: tpl.invite, reminder_no_booking: tpl.reminder_no_booking, absence: tpl.absence }} />
        </SectionCard>

        <SectionCard id="creneaux" title="Créneaux" description="Générés depuis une plage horaire ; bloquez un créneau pour l’exclure, ajustez la capacité si plusieurs collaborateurs assurent les appels.">
          {canManage && (
            <div className="mb-5 rounded-lg border border-dashed border-(--color-border) p-4">
              <SlotGenerator campaignId={campaign.id} staff={staffOptions}
                defaults={{ slotMinutes: campaign.slot_minutes ?? settings.default_slot_minutes, bufferMinutes: settings.buffer_minutes, from: campaign.period_start, to: campaign.period_end }} />
            </div>
          )}
          <SlotsList canManage={canManage} staff={staffOptions}
            slots={slots.map((s) => ({ id: s.id, starts_at: s.starts_at, ends_at: s.ends_at, capacity: s.capacity, booked: occupancy.get(s.id) ?? 0, status: s.status, staff_user_id: s.staff_user_id, note: s.note }))} />
        </SectionCard>

        <SectionCard id="ciblage" title="Ciblage" description="Modifier les critères recalcule l’audience : les nouveaux candidats sont ajoutés, ceux déjà invités ou suivis sont conservés.">
          <CampaignForm
            campaignId={campaign.id}
            readOnly={!canManage}
            initial={{
              name: campaign.name, description: campaign.description, specialties: campaign.specialties, offers: campaign.offers, voies: campaign.voies,
              evc_session_id: campaign.evc_session_id ?? '', selection_mode: campaign.selection_mode, manual_user_ids: campaign.manual_user_ids,
              period_start: campaign.period_start ?? '', period_end: campaign.period_end ?? '', slot_minutes: campaign.slot_minutes ? String(campaign.slot_minutes) : '',
            }}
            specialties={specialties}
            sessions={sessions}
            students={allStudents.filter((s) => s.is_active !== false).map((s) => ({ id: s.id, name: studentName(s), email: s.email ?? '', specialty: studentSpecialty(s.permission_scope) }))}
            defaultSlotMinutes={settings.default_slot_minutes}
          />
        </SectionCard>

        <SectionCard id="envois" title={`Historique des envois (${sends.length})`} description="Invitations, annonces, relances et emails, avec leur résultat.">
          {sends.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucun envoi pour cette campagne.</p> : (
            <ul className="max-h-80 divide-y divide-(--color-border) overflow-auto text-sm">
              {sends.slice(0, 300).map((h) => {
                const p = h.payload as { subject?: string; to?: string; error?: string };
                const c = h.user_id ? candById.get(h.user_id) : null;
                return (
                  <li key={h.id} className="flex flex-wrap items-center gap-2 py-1.5">
                    <span className="w-36 text-xs text-(--color-ink-muted)">{fmtDateTime(h.created_at)}</span>
                    <Badge variant={p.error ? 'danger' : 'outline'}>{HISTORY_KIND_LABEL[h.kind as HistoryKind] ?? h.kind}</Badge>
                    <span className="text-(--color-ink)">{c?.name ?? p.to ?? '—'}</span>
                    <span className="truncate text-xs text-(--color-ink-soft)">{p.subject}</span>
                    {p.error && <span className="text-xs text-(--color-danger)">{p.error}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
