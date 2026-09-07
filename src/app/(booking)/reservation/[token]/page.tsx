import { resolveBookingToken } from '@/lib/suivi/tokens';
import { getCampaign, getStudent, listAppointments } from '@/lib/suivi/db';
import { listAvailableSlots } from '@/lib/suivi/booking';
import { isOccupying } from '@/lib/suivi/types';
import { BookingClient } from './booking-client';

export const dynamic = 'force-dynamic';

/**
 * Page de réservation par lien sécurisé (§7). Sans connexion : le jeton
 * identifie le candidat. N'affiche que les créneaux disponibles de la campagne
 * (ou globaux) et le propre rendez-vous du candidat, rien d'autre.
 */
export default async function ReservationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await resolveBookingToken(token);
  if (!t) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-[#E6E8EE] bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold">Ce lien n’est plus valide</h1>
          <p className="mt-2 text-sm text-[#6B7280]">Il a expiré ou n’existe pas. Vous pouvez gérer vos rendez-vous depuis votre espace personnel (rubrique « Mes rendez-vous ») ou demander une nouvelle invitation à l’équipe pédagogique.</p>
          <a href="/mes-rendez-vous" className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#14254E] px-4 text-sm font-semibold text-white">Ouvrir mon espace</a>
        </div>
      </main>
    );
  }
  const [student, campaign, slots, appts] = await Promise.all([
    getStudent(t.user_id),
    t.campaign_id ? getCampaign(t.campaign_id) : Promise.resolve(null),
    listAvailableSlots(t.campaign_id ? { campaignId: t.campaign_id } : { campaignId: null }),
    listAppointments({ userId: t.user_id, campaignId: t.campaign_id ?? undefined }),
  ]);
  const nowIso = new Date().toISOString();
  const current = appts.filter((a) => isOccupying(a.status) && a.starts_at >= nowIso).sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold tracking-tight">Votre rendez-vous de suivi individuel</h1>
      <p className="mb-5 text-sm text-[#6B7280]">Le créneau choisi est réservé immédiatement. Vous pourrez le déplacer depuis ce lien ou depuis votre espace personnel.</p>
      <BookingClient
        token={token}
        prenom={student?.first_name ?? ''}
        campaignName={campaign?.name ?? null}
        initialSlots={slots.filter((s) => s.id !== current?.slot_id)}
        current={current ? { id: current.id, starts_at: current.starts_at, ends_at: current.ends_at } : null}
      />
    </main>
  );
}
