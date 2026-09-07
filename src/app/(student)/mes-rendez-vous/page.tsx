import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { SUIVI_STUDENT_ENABLED } from '@/lib/modules-flags';
import { listAppointments } from '@/lib/suivi/db';
import { MesRendezVous, type MyAppointment } from '@/components/student/mes-rendez-vous';

export const metadata = { title: 'Mes rendez-vous' };
export const dynamic = 'force-dynamic';

/**
 * Rendez-vous de suivi individuel du candidat connecté (§7). Seules SES lignes
 * sont lues (filtre sur l'identifiant de session ; la RLS autorise aussi cette
 * lecture en propre). Aucune information sur un autre candidat n'est transmise.
 */
export default async function MesRendezVousPage() {
  const { user, profile } = await requireUser();
  // Mode test : rubrique réservée au personnel tant que le module n'est pas mis en service.
  if (!SUIVI_STUDENT_ENABLED && profile?.role !== 'admin' && profile?.role !== 'professor') redirect('/accueil');
  const rows = await listAppointments({ userId: user.id });
  const appointments: MyAppointment[] = rows.map((a) => ({ id: a.id, starts_at: a.starts_at, ends_at: a.ends_at, status: a.status, moved_from: a.moved_from }));
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink)">Mes rendez-vous</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Vos points individuels avec l’équipe pédagogique. Vous pouvez déplacer un rendez-vous à venir vers un autre créneau disponible.</p>
      </header>
      <MesRendezVous appointments={appointments} />
    </main>
  );
}
