import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { loadFiche } from '@/lib/suivi/fiche';
import { getSettings, listTemplates } from '@/lib/suivi/db';
import { fmtDateShort, fmtDateTime, todayKey } from '@/lib/suivi/format';
import { DIFFICULTY_LABEL, OFFER_SHORT_LABEL, VOIE_LABEL, roleCan } from '@/lib/suivi/types';
import { Badge } from '@/components/ui/badge';
import { DownloadButton, SectionCard } from '@/components/admin/suivi/ui';
import { FicheAppointments } from '@/components/admin/suivi/fiche-appointments';
import { ReportForm } from '@/components/admin/suivi/report-form';
import { ActionLine, FicheTimeline } from '@/components/admin/suivi/fiche-timeline';
import { AfterMeetingEmailButton, ContactAttemptForm, QuickActionDialog } from '@/components/admin/suivi/fiche-controls';

export const dynamic = 'force-dynamic';

/**
 * Fiche candidat (§11, §13) : identité, activité, ce qui doit être vu au
 * prochain entretien (actions non clôturées + derniers constats), rendez-vous,
 * nouveau compte rendu, historique chronologique.
 */
export default async function FicheCandidatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { role, profile } = await requireSuiviPage('view');
  const { userId } = await params;
  const internal = roleCan(role, 'internal_notes');
  const [fiche, settings, templates] = await Promise.all([loadFiche(userId, { internalNotes: internal }), getSettings(), listTemplates()]);
  if (!fiche) notFound();
  const tpl = Object.fromEntries(templates.map((t) => [t.key, { subject: t.subject, body: t.body }])) as Record<string, { subject: string; body: string }>;
  const can = { manage: roleCan(role, 'manage'), book: roleCan(role, 'book'), report: roleCan(role, 'report') };
  const staff = fiche.staff.map((s) => ({ id: s.id, name: s.name }));
  const campaignNames = Object.fromEntries(fiche.campaigns.map((c) => [c.id, c.name]));
  const today = todayKey();
  const lastReport = fiche.reports[0] ?? null;
  const lastDoneAppt = fiche.appointments.filter((a) => a.status === 'done').sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0] ?? null;
  const memberCampaigns = fiche.members.map((m) => campaignNames[m.campaign_id]).filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <Link href="/admin/suivi/candidats" className="text-xs text-(--color-ink-muted) hover:underline">← Candidats</Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{fiche.name}</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            {fiche.student.email}{fiche.student.phone ? ` · ${fiche.student.phone}` : ''}{fiche.student.promotion ? ` · ${fiche.student.promotion}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{fiche.specialty || 'Spécialité non renseignée'}</Badge>
            <Badge variant="outline">{OFFER_SHORT_LABEL[fiche.offer] ?? fiche.offer}</Badge>
            {fiche.voie && <Badge variant="outline">{VOIE_LABEL[fiche.voie]}</Badge>}
            {fiche.student.is_active === false && <Badge variant="danger">Compte désactivé</Badge>}
            {memberCampaigns.map((n) => <Badge key={n} variant="muted">{n}</Badge>)}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-(--color-ink-soft) sm:grid-cols-4">
            <div><dt className="text-(--color-ink-muted)">Dernière connexion</dt><dd className="text-(--color-ink)">{fmtDateTime(fiche.lastSignIn)}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Dernière activité</dt><dd className="text-(--color-ink)">{fmtDateTime(fiche.activity?.last_activity)}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Contenus travaillés</dt><dd className="text-(--color-ink)">{fiche.activity ? `${fiche.activity.videos_watched} vidéos · ${fiche.activity.fiches_read} fiches · ${fiche.activity.flashcards_done} flashcards` : '—'}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Évaluations</dt><dd className="text-(--color-ink)">{fiche.activity ? `${fiche.activity.qcm_done} séries QCM · ${fiche.activity.epreuves_blanches} épreuves blanches` : '—'}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Inscrit le</dt><dd className="text-(--color-ink)">{fmtDateShort(fiche.student.created_at)}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Accès</dt><dd className="text-(--color-ink)">{fiche.student.access_end ? `jusqu’au ${fmtDateShort(fiche.student.access_end)}` : fiche.student.evc_session_id ?? '—'}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Suivis réalisés</dt><dd className="text-(--color-ink)">{fiche.reports.length}</dd></div>
            <div><dt className="text-(--color-ink-muted)">Prochain rendez-vous</dt><dd className="text-(--color-ink)">{fiche.nextAppointment ? fmtDateTime(fiche.nextAppointment.starts_at) : 'Aucun'}</dd></div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <DownloadButton href={`/api/admin/suivi/fiche/${fiche.student.id}/pdf`} filename={`fiche-suivi-${fiche.name}.pdf`} label="Exporter en PDF" />
          {can.report && <ContactAttemptForm userId={fiche.student.id} />}
          {can.report && <AfterMeetingEmailButton userId={fiche.student.id} appointmentId={lastDoneAppt?.id ?? null} template={tpl.after_meeting} />}
          <Link href={`/admin/crm?q=${encodeURIComponent(fiche.student.email ?? '')}`} className="inline-flex h-9 items-center rounded-(--radius-button) border border-(--color-border) px-3 text-sm text-(--color-ink-soft) hover:text-(--color-ink)">CRM</Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="À voir au prochain entretien" description="Actions non clôturées et derniers constats, présentés ensemble quand ils sont liés."
          action={can.report ? <QuickActionDialog userId={fiche.student.id} staff={staff} selfId={profile.id} /> : undefined}>
          {fiche.openActions.length === 0 && fiche.lastDifficulties.length === 0 ? (
            <p className="text-sm text-(--color-ink-soft)">Aucune action ouverte ni constat récent.</p>
          ) : (
            <div className="space-y-4">
              {fiche.lastDifficulties.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Derniers constats{lastReport ? ` (${fmtDateShort(lastReport.occurred_at)})` : ''}</p>
                  <ul className="space-y-1.5">
                    {fiche.lastDifficulties.map((d) => {
                      const linked = fiche.openActions.filter((a) => a.difficulty_id === d.id);
                      return (
                        <li key={d.id} className="rounded-md bg-(--color-surface-soft) p-2.5 text-sm">
                          <span className="font-medium text-(--color-ink)">{DIFFICULTY_LABEL[d.category]}</span>
                          {d.no_action && <Badge variant="muted" className="ml-2">constat sans action</Badge>}
                          {d.details && <span className="text-(--color-ink-soft)"> — {d.details}</span>}
                          {linked.length > 0 && (
                            <ul className="mt-2 space-y-1.5 border-l-2 border-(--color-border) pl-3">
                              {linked.map((a) => <ActionLine key={a.id} action={a} staff={staff} editable={can.report} template={tpl.action} />)}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {fiche.openActions.filter((a) => !fiche.lastDifficulties.some((d) => d.id === a.difficulty_id)).length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">
                    Actions ouvertes · {fiche.openActions.filter((a) => a.due_date && a.due_date < today).length} en retard
                  </p>
                  <ul className="space-y-1.5">
                    {fiche.openActions.filter((a) => !fiche.lastDifficulties.some((d) => d.id === a.difficulty_id)).map((a) => (
                      <ActionLine key={a.id} action={a} staff={staff} editable={can.report} template={tpl.action}
                        linked={a.difficulty_id ? fiche.allDifficulties.find((d) => d.id === a.difficulty_id) ?? null : null} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Rendez-vous" description="Statuts, déplacement, prochain rendez-vous réservé avec le candidat.">
          <FicheAppointments userId={fiche.student.id} appointments={fiche.appointments} staff={staff} campaignNames={campaignNames}
            absenceTemplate={tpl.absence} can={can} defaultReminderHours={settings.reminder_hours} selfId={profile.id} />
        </SectionCard>
      </div>

      {can.report && (
        <div className="mt-6">
          <SectionCard title="Nouveau compte rendu" description="Constat → difficulté → action → responsable → échéance. Une difficulté peut rester un simple constat sans action.">
            <ReportForm userId={fiche.student.id} appointments={fiche.appointments} staff={staff} selfId={profile.id} canInternalNotes={internal} />
          </SectionCard>
        </div>
      )}

      <div className="mt-6">
        <SectionCard title="Historique" description="Chronologie complète : rendez-vous, comptes rendus, invitations, relances, déplacements, tentatives de contact, notes CRM antérieures.">
          <FicheTimeline fiche={fiche} can={can} actionTemplate={tpl.action} />
        </SectionCard>
      </div>
    </main>
  );
}
