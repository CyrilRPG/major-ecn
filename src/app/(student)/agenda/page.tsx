import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AgendaWeek, type UserEvent } from '@/components/student/agenda-week';

export const metadata = { title: 'Agenda' };

export default async function AgendaPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // On charge un peu plus large que la semaine courante au cas où la
  // bordure de semaine bouge (rendu serveur vs client).
  const start = new Date();
  start.setDate(start.getDate() - 14);
  const end = new Date();
  end.setDate(end.getDate() + 21);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data } = await db
    .from('user_agenda_events')
    .select('id, title, date, start_time, end_time, category, color_key, notes')
    .eq('user_id', user.id)
    .gte('date', start.toISOString().slice(0, 10))
    .lte('date', end.toISOString().slice(0, 10))
    .order('date')
    .order('start_time');

  const events = (data ?? []) as UserEvent[];

  return (
    <div className="flex flex-col gap-4 px-4 py-5 lg:h-full lg:overflow-hidden lg:px-8">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-(--color-ink)">Mon agenda</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Les cours prévus cette semaine + tes révisions personnelles. Clique sur
          « + Ajouter » sous chaque journée pour planifier une session.
        </p>
      </header>
      <AgendaWeek userEvents={events} />
    </div>
  );
}
