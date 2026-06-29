import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { CrmPanel } from './crm-panel';

export const metadata = { title: 'CRM pédagogique' };

type Offer = 'essentiel' | 'intensif' | 'approfondi';

function extractOffer(scope: unknown): Offer | null {
  if (!scope || typeof scope !== 'object') return null;
  const s = scope as Record<string, unknown>;
  const o = s.offer;
  if (o === 'essentiel' || o === 'basic') return 'essentiel';
  if (o === 'intensif' || o === 'premium') return 'intensif';
  if (o === 'approfondi') return 'approfondi';
  return null;
}

export default async function CrmPage() {
  await requireAdmin();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: students } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, promotion, created_at, is_active, permission_scope')
    .eq('role', 'student')
    .order('last_name');

  const paidStudents = (students ?? [])
    .map((s) => ({ ...s, offer: extractOffer(s.permission_scope) }))
    .filter((s): s is typeof s & { offer: Offer } => s.offer !== null);

  const studentIds = paidStudents.map((s) => s.id);

  const [{ data: sessionsRaw }, { data: notesRaw }, { data: alertsRaw }, { data: evalsRaw }] = await Promise.all([
    studentIds.length
      ? sb.from('transversal_sessions')
          .select('user_id, completed_at, score_correct, qcm_count')
          .in('user_id', studentIds)
          .order('completed_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? sb.from('pedagogical_notes')
          .select('id, user_id, contact_type, motif, observations, difficultes, actions_recommandees, relance_date, created_at')
          .in('user_id', studentIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? sb.from('admin_alerts')
          .select('user_id, priority, resolved_at')
          .in('user_id', studentIds)
      : Promise.resolve({ data: [] }),
    studentIds.length
      ? sb.from('specialty_evaluations')
          .select('user_id, matiere_id, status, created_at')
          .in('user_id', studentIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  type Session = { user_id: string; completed_at: string };
  type Note = { id: string; user_id: string; contact_type: string; motif: string; observations: string | null; difficultes: string | null; actions_recommandees: string | null; relance_date: string | null; created_at: string };
  type AlertRow = { user_id: string; priority: number; resolved_at: string | null };
  type EvalRow = { user_id: string; matiere_id: string; status: string };

  const sessions = (sessionsRaw ?? []) as Session[];
  const notes = (notesRaw ?? []) as Note[];
  const alerts = (alertsRaw ?? []) as AlertRow[];
  const evals = (evalsRaw ?? []) as EvalRow[];

  const days30Ago = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const enriched = paidStudents.map((s) => {
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
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      phone: s.phone,
      promotion: s.promotion,
      offer: s.offer,
      lastRevision: last ? new Date(last.completed_at) : null,
      revisions30d: rev30,
      alertsPending: userAlerts.filter((a) => !a.resolved_at).length,
      redSpecs,
      orangeSpecs,
      notes: userNotes,
    };
  });

  const stats = {
    total: enriched.length,
    essentiel: enriched.filter((s) => s.offer === 'essentiel').length,
    intensif: enriched.filter((s) => s.offer === 'intensif').length,
    approfondi: enriched.filter((s) => s.offer === 'approfondi').length,
    alertsPending: enriched.reduce((sum, s) => sum + s.alertsPending, 0),
    redSpecs: enriched.reduce((sum, s) => sum + s.redSpecs, 0),
    inactive30d: enriched.filter((s) => !s.lastRevision || (Date.now() - s.lastRevision.getTime()) > 30 * 86_400_000).length,
  };

  return <CrmPanel students={enriched} stats={stats} />;
}
