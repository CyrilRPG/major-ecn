import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { CrmPanel } from './crm-panel';

export const metadata = { title: 'CRM pédagogique' };

export default async function CrmPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: students } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, promotion, created_at, is_active')
    .eq('role', 'student')
    .order('last_name');

  const studentIds = (students ?? []).map((s) => s.id);

  const [{ data: sessionsRaw }, { data: notesRaw }, { data: alertsRaw }, { data: evalsRaw }] = await Promise.all([
    studentIds.length ? (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          in: (k: string, v: string[]) => {
            order: (k: string, o: { ascending: boolean }) => Promise<{
              data: { user_id: string; completed_at: string; score_correct: number; qcm_count: number }[] | null;
            }>;
          };
        };
      };
    }).from('transversal_sessions')
      .select('user_id, completed_at, score_correct, qcm_count')
      .in('user_id', studentIds)
      .order('completed_at', { ascending: false })
    : Promise.resolve({ data: [] }),
    studentIds.length ? (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          in: (k: string, v: string[]) => {
            order: (k: string, o: { ascending: boolean }) => Promise<{
              data: { id: string; user_id: string; contact_type: string; motif: string; observations: string | null; difficultes: string | null; actions_recommandees: string | null; relance_date: string | null; created_at: string }[] | null;
            }>;
          };
        };
      };
    }).from('pedagogical_notes')
      .select('id, user_id, contact_type, motif, observations, difficultes, actions_recommandees, relance_date, created_at')
      .in('user_id', studentIds)
      .order('created_at', { ascending: false })
    : Promise.resolve({ data: [] }),
    studentIds.length ? (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          in: (k: string, v: string[]) => Promise<{
            data: { user_id: string; priority: number; resolved_at: string | null }[] | null;
          }>;
        };
      };
    }).from('admin_alerts')
      .select('user_id, priority, resolved_at')
      .in('user_id', studentIds)
    : Promise.resolve({ data: [] }),
    studentIds.length ? (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          in: (k: string, v: string[]) => {
            order: (k: string, o: { ascending: boolean }) => Promise<{
              data: { user_id: string; matiere_id: string; status: string; created_at: string }[] | null;
            }>;
          };
        };
      };
    }).from('specialty_evaluations')
      .select('user_id, matiere_id, status, created_at')
      .in('user_id', studentIds)
      .order('created_at', { ascending: false })
    : Promise.resolve({ data: [] }),
  ]);

  const sessions = (sessionsRaw ?? []) as { user_id: string; completed_at: string; score_correct: number; qcm_count: number }[];
  const notes = (notesRaw ?? []) as { id: string; user_id: string; contact_type: string; motif: string; observations: string | null; difficultes: string | null; actions_recommandees: string | null; relance_date: string | null; created_at: string }[];
  const alerts = (alertsRaw ?? []) as { user_id: string; priority: number; resolved_at: string | null }[];
  const evals = (evalsRaw ?? []) as { user_id: string; matiere_id: string; status: string; created_at: string }[];

  const days30Ago = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const enriched = (students ?? []).map((s) => {
    const userSessions = sessions.filter((ss) => ss.user_id === s.id);
    const last = userSessions[0];
    const rev30 = userSessions.filter((ss) => ss.completed_at >= days30Ago).length;
    const userAlerts = alerts.filter((a) => a.user_id === s.id);
    const userEvals = evals.filter((e) => e.user_id === s.id);
    const latestByMatiere = new Map<string, string>();
    for (const e of userEvals) {
      if (!latestByMatiere.has(e.matiere_id)) latestByMatiere.set(e.matiere_id, e.status);
    }
    const redSpecs = [...latestByMatiere.values()].filter((st) => st === 'insuffisante').length;
    const orangeSpecs = [...latestByMatiere.values()].filter((st) => st === 'fragile').length;
    const userNotes = notes.filter((n) => n.user_id === s.id);

    return {
      ...s,
      lastRevision: last ? new Date(last.completed_at) : null,
      revisions30d: rev30,
      alertsPending: userAlerts.filter((a) => !a.resolved_at).length,
      redSpecs,
      orangeSpecs,
      notes: userNotes,
    };
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">CRM pédagogique</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Suivi individuel de {enriched.length} candidat{enriched.length > 1 ? 's' : ''}
        </p>
      </header>
      <CrmPanel students={enriched} />
    </main>
  );
}
