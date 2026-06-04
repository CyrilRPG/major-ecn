import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AgendaWeek, type UserEvent, type PlatformEvent } from '@/components/student/agenda-week';
import { parseScope } from '@/lib/auth/permissions';

export const metadata = { title: 'Agenda' };

export default async function AgendaPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // On charge un peu plus large que la semaine courante au cas où la
  // bordure de semaine bouge (rendu serveur vs client).
  const start = new Date(); start.setDate(start.getDate() - 14);
  const end = new Date(); end.setDate(end.getDate() + 21);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [{ data: userData }, { data: platformData }] = await Promise.all([
    db.from('user_agenda_events')
      .select('id, title, date, start_time, end_time, category, color_key, notes')
      .eq('user_id', user.id)
      .gte('date', startStr).lte('date', endStr)
      .order('date').order('start_time'),
    db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges')
      .gte('date', startStr).lte('date', endStr)
      .order('date').order('start_time'),
  ]);

  // Filtrage côté serveur selon les permissions de l'étudiant
  const scope = parseScope(profile.permission_scope);
  const platformEvents: PlatformEvent[] = ((platformData ?? []) as Array<{
    id: string; title: string; date: string; start_time: string | null; end_time: string | null;
    college: string | null; intervenant: string | null; zoom_url: string | null; notes: string | null;
    required_offers: string[] | null; scope_type: 'all' | 'college'; scope_colleges: string[] | null;
  }>).filter((e) => {
    const offers = e.required_offers ?? ['essentiel', 'premium', 'intensif'];
    if (!offers.includes(scope.offer)) return false;
    if (e.scope_type === 'college') {
      const ids = e.scope_colleges ?? [];
      if (scope.type === 'all') return true;
      if (ids.length === 0) return true;
      return ids.some((cid) => scope.colleges.includes(cid));
    }
    // 'all' = intégral : visible uniquement par les utilisateurs avec accès à toute l'offre
    return scope.type === 'all';
  });

  const events = (userData ?? []) as UserEvent[];

  return (
    <div className="flex flex-col gap-4 px-4 py-5 lg:h-full lg:overflow-hidden lg:px-8">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-(--color-ink)">Mon agenda</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          Les cours prévus cette semaine + tes révisions personnelles. Clique sur
          « + Ajouter » sous chaque journée pour planifier une session.
        </p>
      </header>
      <AgendaWeek userEvents={events} platformEvents={platformEvents} />
    </div>
  );
}
