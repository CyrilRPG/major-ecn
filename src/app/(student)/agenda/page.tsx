import { CalendarDays } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AgendaWeek, type UserEvent, type PlatformEvent } from '@/components/student/agenda-week';
import { parseScope } from '@/lib/auth/permissions';
import {
  ajouterJours, evenementVisiblePourEleve, instantParis, natureVisio, type EvenementPlateformeBrut,
} from '@/lib/agenda/planning';
import { StudentHero } from '@/components/student/ui/page-kit';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { chargerSujetsAgenda } from '@/lib/agenda/sujets-server';

export const metadata = { title: 'Agenda' };

export default async function AgendaPage({
  searchParams,
}: { searchParams: Promise<{ seance?: string }> }) {
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const { seance } = await searchParams;

  // Fenêtre en heure de PARIS (le serveur est en UTC) : −2 mois / +6 mois.
  // Elle couvre largement les flèches de semaine et le planning 30 jours, d'où
  // l'on arrive avec ?seance=<id> (l'ancienne fenêtre −14/+21 jours laissait
  // des semaines « vides » alors que des séances y étaient programmées).
  const aujourdHui = instantParis().date;
  const startStr = ajouterJours(aujourdHui, -60);
  const endStr = ajouterJours(aujourdHui, 180);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [{ data: userData }, { data: platformData }] = await Promise.all([
    db.from('user_agenda_events')
      .select('id, title, date, start_time, end_time, category, color_key, notes')
      .eq('user_id', user.id)
      .gte('date', startStr).lte('date', endStr)
      .order('date').order('start_time'),
    db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
      .gte('date', startStr).lte('date', endStr)
      .order('date').order('start_time'),
  ]);

  // Filtrage côté serveur selon les permissions de l'étudiant : MÊME règle
  // que le planning de l'accueil (lib/agenda/planning).
  const scope = parseScope(profile.permission_scope);
  // Le lien de la visio ne part PAS dans la page : il n'est remis qu'après
  // émargement, par /api/presences. On ne transmet que son existence.
  const platformEvents: PlatformEvent[] = ((platformData ?? []) as EvenementPlateformeBrut[])
    .filter((e) => evenementVisiblePourEleve(e, scope))
    .map((e) => ({
      id: e.id, title: e.title, date: e.date, start_time: e.start_time, end_time: e.end_time,
      college: e.college, intervenant: e.intervenant, notes: e.notes,
      zoom_url: null,
      visio: natureVisio(e.zoom_url),
    }));

  const events = (userData ?? []) as UserEvent[];

  // Séances à venir de la bibliothèque (dossiers à préparer) datées : « Sujet
  // disponible » sur la séance correspondante de l'agenda. Mêmes gardes que la
  // page de la séance, qui seule ouvre les documents (filigrane).
  const isAdmin = profile.role === 'admin';
  const sujets = await chargerSujetsAgenda(
    supabase,
    { userId: user.id, scope, access: isAdmin ? undefined : await fetchContentAccessForScope(scope), isAdmin },
    { debut: startStr, fin: endStr },
    ((platformData ?? []) as EvenementPlateformeBrut[]).filter((e) => evenementVisiblePourEleve(e, scope)),
  ).catch((e) => { console.error('[agenda] sujets', e); return []; });

  // Sessions déjà émargées : on ne redemande pas la signature à l'étudiant.
  const { data: signedRows } = await db
    .from('session_presences')
    .select('event_id')
    .eq('user_id', user.id)
    .not('signature_png', 'is', null);
  const signedEventIds = ((signedRows ?? []) as { event_id: string | null }[])
    .map((r) => r.event_id)
    .filter((id): id is string => !!id);

  return (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:h-full lg:overflow-hidden lg:px-8">
      <StudentHero
        aide="agenda"
        compact
        className="shrink-0"
        icon={CalendarDays}
        eyebrow="Cours en direct & sessions"
        title="Mon agenda"
        subtitle="Les cours en direct de la semaine et vos révisions personnelles. Cliquez sur « + Ajouter » sous une journée pour planifier une session."
      />
      <AgendaWeek
        userEvents={events}
        platformEvents={platformEvents}
        signedEventIds={signedEventIds}
        aujourdHui={aujourdHui}
        seanceInitiale={seance && platformEvents.some((e) => e.id === seance) ? seance : null}
        sujets={sujets}
      />
    </div>
  );
}
