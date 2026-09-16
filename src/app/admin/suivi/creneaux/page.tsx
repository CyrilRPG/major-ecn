import Link from 'next/link';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { countOccupancy, getSettings, listCampaigns, listSlots, listStaffProfiles } from '@/lib/suivi/db';
import { addMonths, dayKeyOf, fmtMonthLabel, isValidDayKey, monthStart, todayKey } from '@/lib/suivi/format';
import { roleCan } from '@/lib/suivi/types';
import { SectionCard } from '@/components/admin/suivi/ui';
import { SlotGenerator } from '@/components/admin/suivi/slot-generator';
import { SlotsList } from '@/components/admin/suivi/slots-list';
import { SlotsCalendar } from '@/components/admin/suivi/slots-calendar';

export const dynamic = 'force-dynamic';

/**
 * Planification libre (§3) : calendrier global de TOUS les créneaux (globaux
 * et par campagne) sur autant de mois que souhaité, et génération de créneaux
 * globaux — ouverts à tout candidat invité, quelle que soit la campagne.
 * Une période peut être préparée ici sans être annoncée : rien ne part aux
 * candidats tant qu'une invitation n'est pas envoyée depuis une campagne.
 */
export default async function CreneauxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { role } = await requireSuiviPage('view');
  const canManage = roleCan(role, 'manage');
  const sp = await searchParams;
  const anchor = typeof sp.mois === 'string' && isValidDayKey(sp.mois) ? monthStart(sp.mois) : monthStart(todayKey());
  const months = Math.min(12, Math.max(1, Number(typeof sp.n === 'string' ? sp.n : '3') || 3));

  const [settings, staff, campaigns, globalSlots, allSlots] = await Promise.all([
    getSettings(), listStaffProfiles(), listCampaigns(), listSlots({ campaignId: null }), listSlots(),
  ]);
  const occupancy = await countOccupancy(allSlots.map((s) => s.id));
  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]));

  // Calendrier : compteurs par jour (créneaux, places restantes, réservés), toutes campagnes.
  const perDay = new Map<string, { slots: number; remaining: number; booked: number; campaigns: Set<string> }>();
  for (const s of allSlots) {
    const k = dayKeyOf(s.starts_at);
    const d = perDay.get(k) ?? { slots: 0, remaining: 0, booked: 0, campaigns: new Set<string>() };
    const booked = occupancy.get(s.id) ?? 0;
    d.slots += 1;
    d.booked += booked;
    if (s.status === 'open') d.remaining += Math.max(0, s.capacity - booked);
    d.campaigns.add(s.campaign_id ? campaignName.get(s.campaign_id) ?? 'Campagne' : 'Global');
    perDay.set(k, d);
  }
  const days = Array.from(perDay.entries()).map(([day, d]) => ({ day, slots: d.slots, remaining: d.remaining, booked: d.booked, labels: Array.from(d.campaigns) }));
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">Planification des créneaux</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Vue de tous les créneaux (globaux et par campagne) sur la période de votre choix : 1, 3, 6, 9 mois ou davantage.
          Préparer une période n’annonce rien aux candidats ; les invitations partent depuis les campagnes.
        </p>
      </header>

      <div className="space-y-6">
        <SectionCard
          title="Calendrier global"
          description="Créneaux, places restantes et réservations par jour. Cliquez sur un jour pour ouvrir l’agenda de la semaine."
          action={(
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href={`/admin/suivi/creneaux?mois=${addMonths(anchor, -months)}&n=${months}`} className="rounded-(--radius-button) border border-(--color-border) px-2.5 py-1.5 text-(--color-ink)">←</Link>
              <span className="text-(--color-ink-soft)">{fmtMonthLabel(anchor)} → {fmtMonthLabel(addMonths(anchor, months - 1))}</span>
              <Link href={`/admin/suivi/creneaux?mois=${addMonths(anchor, months)}&n=${months}`} className="rounded-(--radius-button) border border-(--color-border) px-2.5 py-1.5 text-(--color-ink)">→</Link>
              {[1, 3, 6, 9, 12].map((n) => (
                <Link key={n} href={`/admin/suivi/creneaux?mois=${anchor}&n=${n}`} className={`rounded-(--radius-button) px-2.5 py-1.5 ${n === months ? 'bg-(--color-primary) text-(--color-primary-fg)' : 'border border-(--color-border) text-(--color-ink)'}`}>{n} mois</Link>
              ))}
            </div>
          )}
        >
          <SlotsCalendar anchor={anchor} months={months} days={days} />
        </SectionCard>

        <SectionCard title="Créneaux globaux" description="Réservables par tout candidat invité, quelle que soit sa campagne (utile pour les rendez-vous anticipés du prochain suivi). Bloquez un créneau pour l’exclure ; la capacité n’est supérieure à 1 que si plusieurs collaborateurs assurent les appels.">
          {canManage && (
            <div className="mb-5 rounded-lg border border-dashed border-(--color-border) p-4">
              <SlotGenerator
                campaignId={null}
                staff={staffOptions}
                defaults={{ slotMinutes: settings.default_slot_minutes, bufferMinutes: settings.buffer_minutes, from: todayKey(), to: addMonths(todayKey(), 3) }}
              />
            </div>
          )}
          <SlotsList
            canManage={canManage}
            staff={staffOptions}
            slots={globalSlots.map((s) => ({ id: s.id, starts_at: s.starts_at, ends_at: s.ends_at, capacity: s.capacity, booked: occupancy.get(s.id) ?? 0, status: s.status, staff_user_id: s.staff_user_id, note: s.note }))}
          />
        </SectionCard>

        <SectionCard title="Créneaux par campagne" description="Chaque campagne gère ses propres créneaux depuis sa fiche.">
          {campaigns.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucune campagne.</p> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {campaigns.map((c) => {
                const n = allSlots.filter((s) => s.campaign_id === c.id).length;
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2">
                    <Link href={`/admin/suivi/campagnes/${c.id}#creneaux`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{c.name}</Link>
                    <span className="text-(--color-ink-soft)">{n} créneau(x)</span>
                    {c.period_start && <span className="text-xs text-(--color-ink-muted)">{c.period_start} → {c.period_end ?? '…'}</span>}
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
