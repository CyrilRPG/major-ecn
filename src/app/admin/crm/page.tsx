import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CrmTabs } from './crm-tabs';
import type { ContactCandidate } from './crm-contacter';

export const metadata = { title: 'CRM pédagogique' };

type PaidOffer = 'essentiel' | 'intensif' | 'approfondi';
type AnyOffer = 'decouverte' | 'essentiel' | 'intensif' | 'approfondi';

function extractPaidOffer(scope: unknown): PaidOffer | null {
  if (!scope || typeof scope !== 'object') return null;
  const o = (scope as Record<string, unknown>).offer;
  if (o === 'essentiel' || o === 'basic') return 'essentiel';
  if (o === 'intensif' || o === 'premium') return 'intensif';
  if (o === 'approfondi') return 'approfondi';
  return null;
}

function extractAnyOffer(scope: unknown): AnyOffer | null {
  if (!scope || typeof scope !== 'object') return null;
  const o = (scope as Record<string, unknown>).offer;
  if (o === 'decouverte') return 'decouverte';
  return extractPaidOffer(scope) ?? null;
}

function extractColleges(scope: unknown): string[] {
  if (!scope || typeof scope !== 'object') return [];
  const c = (scope as Record<string, unknown>).colleges;
  return Array.isArray(c) ? (c as string[]) : [];
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

  const allRows = students ?? [];

  // ── GENERAL TAB ──────────────────────────────────────────

  const allStudents = allRows
    .map((s) => ({ ...s, anyOffer: extractAnyOffer(s.permission_scope), colleges: extractColleges(s.permission_scope) }))
    .filter((s): s is typeof s & { anyOffer: AnyOffer } => s.anyOffer !== null);

  const [{ data: progressRaw }, { data: qcmRaw }, { data: flashRaw }, { data: matieresRaw }] =
    await Promise.all([
      sb.from('course_progress').select('user_id, video_watched, fiche_read, last_seen_at'),
      sb.from('qcm_sessions').select('user_id, finished_at'),
      sb.from('flashcard_reviews').select('user_id, reviewed_at'),
      sb.from('matieres')
        .select('id, nom, parent_matiere_id, order_index')
        .is('parent_matiere_id', null)
        .order('order_index'),
    ]);

  type ProgressRow = { user_id: string; video_watched: boolean; fiche_read: boolean; last_seen_at: string | null };
  type QcmRow = { user_id: string; finished_at: string | null };
  type FlashRow = { user_id: string; reviewed_at: string };

  const progressByUser = new Map<string, ProgressRow[]>();
  for (const p of (progressRaw ?? []) as ProgressRow[]) {
    const arr = progressByUser.get(p.user_id);
    if (arr) arr.push(p); else progressByUser.set(p.user_id, [p]);
  }
  const qcmByUser = new Map<string, QcmRow[]>();
  for (const q of (qcmRaw ?? []) as QcmRow[]) {
    const arr = qcmByUser.get(q.user_id);
    if (arr) arr.push(q); else qcmByUser.set(q.user_id, [q]);
  }
  const flashByUser = new Map<string, FlashRow[]>();
  for (const f of (flashRaw ?? []) as FlashRow[]) {
    const arr = flashByUser.get(f.user_id);
    if (arr) arr.push(f); else flashByUser.set(f.user_id, [f]);
  }

  const generalStudents = allStudents.map((s) => {
    const up = progressByUser.get(s.id) ?? [];
    const uq = qcmByUser.get(s.id) ?? [];
    const uf = flashByUser.get(s.id) ?? [];

    const dates = [
      ...up.map((p) => p.last_seen_at),
      ...uq.map((q) => q.finished_at),
      ...uf.map((f) => f.reviewed_at),
    ].filter(Boolean) as string[];
    dates.sort((a, b) => b.localeCompare(a));

    return {
      id: s.id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      offer: s.anyOffer,
      colleges: s.colleges,
      videosWatched: up.filter((p) => p.video_watched).length,
      fichesRead: up.filter((p) => p.fiche_read).length,
      qcmDone: uq.filter((q) => q.finished_at).length,
      flashcardsDone: uf.length,
      lastActivity: dates[0] ?? null,
    };
  });

  const generalStats = {
    total: generalStudents.length,
    decouverte: generalStudents.filter((s) => s.offer === 'decouverte').length,
    essentiel: generalStudents.filter((s) => s.offer === 'essentiel').length,
    intensif: generalStudents.filter((s) => s.offer === 'intensif').length,
    approfondi: generalStudents.filter((s) => s.offer === 'approfondi').length,
  };

  const colleges = ((matieresRaw ?? []) as { id: string; nom: string }[]).map((m) => ({
    id: m.id,
    nom: m.nom,
  }));

  // ── TRANSVERSAL TAB (existing logic, paid students only) ─

  const paidStudents = allRows
    .map((s) => ({ ...s, offer: extractPaidOffer(s.permission_scope) }))
    .filter((s): s is typeof s & { offer: PaidOffer } => s.offer !== null);

  const studentIds = paidStudents.map((s) => s.id);

  const [{ data: sessionsRaw }, { data: notesRaw }, { data: alertsRaw }, { data: evalsRaw }] =
    await Promise.all([
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
            .select('user_id, priority, motif, created_at, resolved_at')
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
  type AlertRow = { user_id: string; priority: number; motif: string; created_at: string; resolved_at: string | null };
  type EvalRow = { user_id: string; matiere_id: string; status: string };

  const sessions = (sessionsRaw ?? []) as Session[];
  const notes = (notesRaw ?? []) as Note[];
  const alerts = (alertsRaw ?? []) as AlertRow[];
  const evals = (evalsRaw ?? []) as EvalRow[];

  const days30Ago = new Date(Date.now() - 30 * 86_400_000).toISOString();

  // ── Épreuves blanches réalisées + dernière connexion (service-role) ──
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adm = admin as any;
  const epreuvesByUser = new Map<string, number>();
  try {
    const { data: subsRaw } = await adm
      .from('mock_exam_submissions')
      .select('user_id, status, mock_exams!inner(cours_id, specialite_id)')
      .in('status', ['submitted', 'graded'])
      .is('mock_exams.cours_id', null)
      .is('mock_exams.specialite_id', null);
    for (const s of ((subsRaw ?? []) as { user_id: string }[])) {
      epreuvesByUser.set(s.user_id, (epreuvesByUser.get(s.user_id) ?? 0) + 1);
    }
  } catch { /* best-effort */ }
  const lastSignInByUser = new Map<string, string | null>();
  try {
    for (let page = 1; page <= 40; page++) {
      const { data, error } = await adm.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (data?.users ?? []) as any[];
      for (const u of users) lastSignInByUser.set(u.id, u.last_sign_in_at ?? null);
      if (users.length < 200) break;
    }
  } catch { /* best-effort */ }

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
      epreuvesBlanches: epreuvesByUser.get(s.id) ?? 0,
      lastSignIn: lastSignInByUser.get(s.id) ? new Date(lastSignInByUser.get(s.id)!) : null,
      notes: userNotes,
    };
  });

  // ── « Candidats à contacter » : alertes Priorité 1 non résolues ──
  const profileById = new Map(allRows.map((s) => [s.id, s]));
  const contactCandidates: ContactCandidate[] = alerts
    .filter((a) => a.priority === 1 && !a.resolved_at)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => {
      const p = profileById.get(a.user_id);
      return {
        id: a.user_id,
        first_name: p?.first_name ?? null,
        last_name: p?.last_name ?? null,
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        motif: a.motif,
        priority: a.priority,
        created_at: a.created_at,
      };
    });

  const transStats = {
    total: enriched.length,
    essentiel: enriched.filter((s) => s.offer === 'essentiel').length,
    intensif: enriched.filter((s) => s.offer === 'intensif').length,
    approfondi: enriched.filter((s) => s.offer === 'approfondi').length,
    alertsPending: enriched.reduce((sum, s) => sum + s.alertsPending, 0),
    redSpecs: enriched.reduce((sum, s) => sum + s.redSpecs, 0),
    inactive30d: enriched.filter(
      (s) => !s.lastRevision || Date.now() - s.lastRevision.getTime() > 30 * 86_400_000,
    ).length,
  };

  return (
    <CrmTabs
      generalStudents={generalStudents}
      generalStats={generalStats}
      colleges={colleges}
      transversalStudents={enriched}
      transversalStats={transStats}
      contactCandidates={contactCandidates}
    />
  );
}
