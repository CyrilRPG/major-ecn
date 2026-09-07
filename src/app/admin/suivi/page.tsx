import Link from 'next/link';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { loadCandidates } from '@/lib/suivi/candidates';
import { listActions, listAlerts } from '@/lib/suivi/db';
import { computeDashboard, type DashboardFilters } from '@/lib/suivi/stats';
import { fmtDateMedium, fmtDateTime, fmtMinutes, isValidDayKey, addDays, todayKey, dayKeyOf } from '@/lib/suivi/format';
import { OFFER_KEYS, OFFER_SHORT_LABEL, VOIE_LABEL, isOccupying } from '@/lib/suivi/types';
import { Kpi, SectionCard } from '@/components/admin/suivi/ui';
import { AppointmentStatusBadge } from '@/components/admin/suivi/ui';

export const dynamic = 'force-dynamic';

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

/** Tableau de bord (§16) : indicateurs filtrables par spécialité, formule, voie, campagne, période. */
export default async function SuiviDashboardPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireSuiviPage('view');
  const sp = await searchParams;
  const filters: DashboardFilters = {
    specialty: one(sp.specialty) || undefined,
    offer: one(sp.offer) || undefined,
    voie: one(sp.voie) || undefined,
    campaignId: one(sp.campaign) || undefined,
    from: isValidDayKey(one(sp.from)) ? one(sp.from) : undefined,
    to: isValidDayKey(one(sp.to)) ? one(sp.to) : undefined,
  };

  const [bundle, actions, alerts] = await Promise.all([loadCandidates(), listActions(), listAlerts()]);
  const stats = computeDashboard({
    candidates: bundle.candidates, members: bundle.members, appointments: bundle.appointments, actions, alerts, campaigns: bundle.campaigns, filters,
  });
  const candById = new Map(bundle.candidates.map((c) => [c.id, c]));
  const campaignName = new Map(bundle.campaigns.map((c) => [c.id, c.name]));

  const today = todayKey();
  const weekAppts = bundle.appointments
    .filter((a) => {
      const day = dayKeyOf(a.starts_at);
      if (day < stats.weekStart || day > stats.weekEnd) return false;
      if (a.status === 'cancelled') return false;
      const c = candById.get(a.user_id);
      if (!c) return false;
      if (filters.specialty && c.specialty !== filters.specialty) return false;
      if (filters.offer && c.offer !== filters.offer) return false;
      if (filters.voie && c.voie !== filters.voie) return false;
      if (filters.campaignId && a.campaign_id !== filters.campaignId) return false;
      return true;
    })
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const futureAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'postponed').sort((a, b) => a.due_at.localeCompare(b.due_at)).slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Tableau de bord du suivi individuel</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Où en est chaque campagne : candidats ciblés, invitations, réservations, entretiens, absences, actions et alertes.
        </p>
      </header>

      <form method="get" className="mb-6 grid grid-cols-2 gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 md:grid-cols-6">
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Spécialité
          <select name="specialty" defaultValue={filters.specialty ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
            <option value="">Toutes</option>
            {bundle.specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Formule
          <select name="offer" defaultValue={filters.offer ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
            <option value="">Toutes</option>
            {OFFER_KEYS.map((o) => <option key={o} value={o}>{OFFER_SHORT_LABEL[o]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Voie
          <select name="voie" defaultValue={filters.voie ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
            <option value="">Toutes</option>
            {Object.entries(VOIE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Campagne
          <select name="campaign" defaultValue={filters.campaignId ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
            <option value="">Toutes</option>
            {bundle.campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Du
          <input type="date" name="from" defaultValue={filters.from ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-(--color-ink-soft)">Au
          <input type="date" name="to" defaultValue={filters.to ?? ''} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)" />
        </label>
        <div className="col-span-2 flex items-center gap-3 md:col-span-6">
          <button type="submit" className="h-9 rounded-(--radius-button) bg-(--color-primary) px-4 text-sm font-medium text-(--color-primary-fg)">Appliquer</button>
          <Link href="/admin/suivi" className="text-sm text-(--color-ink-soft) underline-offset-4 hover:underline">Réinitialiser</Link>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Kpi label="Candidats ciblés" value={stats.targeted} />
        <Kpi label="Invitations envoyées" value={stats.invited} />
        <Kpi label="Rendez-vous réservés" value={stats.booked} />
        <Kpi label="Sans réservation" value={stats.noBooking} tone={stats.noBooking > 0 ? 'warning' : undefined} />
        <Kpi label="Entretiens réalisés" value={stats.done} tone="success" />
        <Kpi label="Absents" value={stats.noShow} tone={stats.noShow > 0 ? 'danger' : undefined} />
        <Kpi label="À rappeler" value={stats.toRecall} tone={stats.toRecall > 0 ? 'warning' : undefined} />
        <Kpi label="Actions ouvertes" value={stats.openActions} />
        <Kpi label="Actions en retard" value={stats.lateActions} tone={stats.lateActions > 0 ? 'danger' : undefined} />
        <Kpi label="Alertes futures" value={stats.futureAlerts} />
        <Kpi label="Rendez-vous de la semaine" value={stats.week.total} hint={`${stats.week.done} réalisés · ${stats.week.upcoming} à venir`} />
        <Kpi label="Charge estimée (semaine)" value={fmtMinutes(stats.week.minutes)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title={`Cette semaine (${fmtDateMedium(addDays(stats.weekStart, 0) + 'T12:00:00Z')} → ${fmtDateMedium(stats.weekEnd + 'T12:00:00Z')})`}
          description={`${stats.week.total} rendez-vous — ${stats.week.done} réalisés — ${stats.week.upcoming} à venir — ${stats.week.noShow} absents — ${stats.week.toRecall} à rappeler`}
          className="lg:col-span-2"
          action={<Link href="/admin/suivi/agenda" className="text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline">Ouvrir l’agenda</Link>}
        >
          {weekAppts.length === 0 ? (
            <p className="text-sm text-(--color-ink-soft)">Aucun rendez-vous cette semaine.</p>
          ) : (
            <ul className="divide-y divide-(--color-border)">
              {weekAppts.slice(0, 40).map((a) => {
                const c = candById.get(a.user_id);
                const past = dayKeyOf(a.starts_at) < today;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                    <span className={`w-36 tabular-nums ${past && isOccupying(a.status) ? 'text-(--color-ink-muted)' : 'text-(--color-ink)'}`}>{fmtDateTime(a.starts_at)}</span>
                    <Link href={`/admin/suivi/candidats/${a.user_id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{c?.name ?? 'Candidat'}</Link>
                    <span className="text-(--color-ink-soft)">{c?.specialty || '—'}</span>
                    {a.campaign_id && <span className="text-xs text-(--color-ink-muted)">{campaignName.get(a.campaign_id)}</span>}
                    <span className="ml-auto"><AppointmentStatusBadge status={a.status} /></span>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Prochaines alertes" action={<Link href="/admin/suivi/alertes" className="text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline">Toutes</Link>}>
          {futureAlerts.length === 0 ? (
            <p className="text-sm text-(--color-ink-soft)">Aucune alerte programmée.</p>
          ) : (
            <ul className="space-y-2">
              {futureAlerts.map((al) => (
                <li key={al.id} className="rounded-lg border border-(--color-border) p-3 text-sm">
                  <p className="font-medium text-(--color-ink)">{al.title}</p>
                  <p className="text-xs text-(--color-ink-soft)">{fmtDateTime(al.due_at)}{al.due_at <= new Date().toISOString() ? ' · échue' : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
