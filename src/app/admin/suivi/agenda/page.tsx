import { requireSuiviPage } from '@/lib/suivi/roles';
import { getSettings, listAppointments, listCampaigns, listStaffProfiles, listStudentsByIds } from '@/lib/suivi/db';
import { addDays, addMonths, isValidDayKey, monthStart, todayKey, weekStart, zonedToUtc } from '@/lib/suivi/format';
import { studentName, studentOffer, studentSpecialty, studentVoie } from '@/lib/suivi/students';
import { specialtyColor } from '@/lib/suivi/colors';
import { ENROLLABLE_SPECIALTY_NAMES } from '@/lib/data/enrollable-colleges';
import { AgendaView, type AgendaItem } from '@/components/admin/suivi/agenda-view';

export const dynamic = 'force-dynamic';

/** Agenda global (§5) : tous les rendez-vous, par semaine ou par mois. */
export default async function AgendaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSuiviPage('view');
  const sp = await searchParams;
  const view = sp.view === 'month' ? 'month' : 'week';
  const anchor = typeof sp.date === 'string' && isValidDayKey(sp.date) ? sp.date : todayKey();

  // Plage chargée : la période affichée, avec une marge d'une semaine de chaque côté.
  const from = view === 'week' ? addDays(weekStart(anchor), -7) : addDays(weekStart(monthStart(anchor)), -7);
  const to = view === 'week' ? addDays(weekStart(anchor), 14) : addDays(addMonths(monthStart(anchor), 1), 14);

  const [settings, campaigns, appointments, staff] = await Promise.all([
    getSettings(), listCampaigns(),
    listAppointments({ from: zonedToUtc(from, '00:00').toISOString(), to: zonedToUtc(to, '23:59').toISOString() }),
    listStaffProfiles(),
  ]);
  const students = new Map((await listStudentsByIds(Array.from(new Set(appointments.map((a) => a.user_id))))).map((s) => [s.id, s]));
  const staffName = new Map(staff.map((s) => [s.id, s.name]));
  const items: AgendaItem[] = appointments.map((a) => {
    const s = students.get(a.user_id);
    return {
      ...a,
      name: s ? studentName(s) : 'Candidat',
      specialty: s ? studentSpecialty(s.permission_scope) : '',
      offer: s ? studentOffer(s.permission_scope) : 'decouverte',
      voie: s ? studentVoie(s.permission_scope) : null,
      staffName: a.staff_user_id ? staffName.get(a.staff_user_id) ?? null : null,
    };
  });
  const specialties = Array.from(new Set([...ENROLLABLE_SPECIALTY_NAMES, ...items.map((i) => i.specialty).filter(Boolean)])).sort((a, b) => a.localeCompare(b, 'fr'));
  const colors = Object.fromEntries(specialties.map((s) => [s, specialtyColor(s, settings.specialty_colors)]));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Agenda des rendez-vous</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Tous les rendez-vous de suivi, une couleur par spécialité (modifiable dans les réglages). Cliquez sur un rendez-vous pour ouvrir la fiche du candidat.</p>
      </header>
      <AgendaView view={view} anchor={anchor} items={items} colors={colors} campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))} specialties={specialties} />
    </main>
  );
}
