import { requireOnglet } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { AdminAgenda, type PlatformEventRow } from '@/components/admin/agenda/admin-agenda';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { instantParis } from '@/lib/agenda/planning';

export const metadata = { title: 'Agenda' };

export default async function AdminAgendaPage() {
  // Administrateurs et Gestionnaire de l'agenda (module « Agenda »).
  await requireOnglet('agenda');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  // Tous les évènements : quelques centaines au plus. Les vues « Liste » et
  // « Plusieurs mois » couvrent n'importe quelle plage, passée comme à venir.
  const aujourdHui = instantParis().date;

  const [events, { data: fac }] = await Promise.all([
    fetchAllRows<PlatformEventRow>((from, to) => admin.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
      .eq('faculte_id', EDN_FACULTE_ID)
      .order('date').order('start_time').order('id')
      .range(from, to)),
    admin.from('facultes')
      .select('semestres(matieres(id, nom, order_index, parent_matiere_id))')
      .eq('id', EDN_FACULTE_ID).maybeSingle(),
  ]);

  // Liste des spécialités proposées sur la plateforme : collèges de premier
  // niveau (parent NULL) + spécialités de Médecine générale (col-mg-*), en
  // excluant l'espace Découverte. Même modèle que le sélecteur d'accès élève.
  const colleges = (
    ((fac as { semestres?: { matieres?: { id: string; nom: string; order_index: number | null; parent_matiere_id: string | null }[] }[] } | null)
      ?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => m.id !== 'col-decouverte')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({ id: m.id, nom: m.nom, parentId: m.parent_matiere_id }));

  return (
    <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Agenda plateforme</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Cours en visio, ECOS, concours blancs… À chaque évènement, choisissez les
          formules (essentiel / intensif / approfondi) et les spécialités concernées.
          Seuls les étudiants ciblés voient l’évènement dans leur agenda.
        </p>
      </header>
      <AdminAgenda events={events} colleges={colleges} aujourdHui={aujourdHui} />
    </main>
  );
}
