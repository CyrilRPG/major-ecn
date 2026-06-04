import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AdminAgenda, type PlatformEventRow } from '@/components/admin/agenda/admin-agenda';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Agenda' };

export default async function AdminAgendaPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Charge events large autour de la semaine courante (8 semaines passées
  // + 12 à venir), comme l'agenda étudiant.
  const start = new Date(); start.setDate(start.getDate() - 56);
  const end   = new Date(); end.setDate(end.getDate() + 84);

  const [{ data: events }, { data: fac }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges')
      .gte('date', start.toISOString().slice(0, 10))
      .lte('date', end.toISOString().slice(0, 10))
      .order('date').order('start_time'),
    supabase.from('facultes')
      .select('semestres(matieres(id, nom, order_index))')
      .eq('id', EDN_FACULTE_ID).maybeSingle(),
  ]);

  const colleges = (
    ((fac as unknown as { semestres?: { matieres?: { id: string; nom: string; order_index: number | null }[] }[] } | null)
      ?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({ id: m.id, nom: m.nom }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Agenda plateforme</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Cours en visio, ECOS, concours blancs… Chaque évènement cible une offre
          (essentiel / premium / intensif) et éventuellement certains collèges.
          Seuls les étudiants concernés voient l’évènement dans leur agenda.
        </p>
      </header>
      <AdminAgenda
        events={(events ?? []) as PlatformEventRow[]}
        colleges={colleges}
      />
    </main>
  );
}
