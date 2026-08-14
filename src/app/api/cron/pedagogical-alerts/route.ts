import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { raiseAdminAlert, sendDailyAlertDigest } from '@/lib/pedago/alerts';
import { isExamTargeted } from '@/lib/exams/targeting';
import { parseScope } from '@/lib/auth/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Cron pédagogique quotidien — critères TEMPORELS de la section 13 du cahier
 * des charges (les critères événementiels sont déclenchés au fil de l'eau par
 * les server actions) :
 *
 *  Priorité 1 : plus de 21 jours sans activité globale ;
 *               épreuve blanche < 40 % (copies récentes).
 *  Priorité 2 : moins de 15 révisions transversales sur les 30 derniers jours ;
 *               épreuve blanche non réalisée depuis 30 jours.
 *
 * Et maintenance : recalcul des compteurs de maintien des acquis
 * (user_revision_stats) — la fenêtre de 30 jours et la série en cours
 * « décroissent » avec le temps même sans nouvelle session.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const now = Date.now();
  const summary = {
    statsRecomputed: 0,
    inactivity21d: 0,
    lowRevisions30d: 0,
    examUnder40: 0,
    examNotTaken30d: 0,
    digest: { sent: false, p1: 0, p2: 0 },
  };

  /* ── 0. Recalcul des compteurs de maintien ── */
  const { data: sessionUsers } = await a
    .from('transversal_sessions')
    .select('user_id')
    .not('completed_at', 'is', null);
  const usersWithSessions = [...new Set(((sessionUsers ?? []) as { user_id: string }[]).map((r) => r.user_id))];
  for (const uid of usersWithSessions) {
    try {
      await a.rpc('recompute_user_revision_stats', { p_user_id: uid });
      summary.statsRecomputed++;
    } catch { /* best-effort */ }
  }

  /* ── Élèves actifs (accès en cours) ── */
  const { data: studsRaw } = await a
    .from('profiles')
    .select('id, first_name, last_name, email, created_at, permission_scope, access_end')
    .eq('role', 'student')
    .eq('is_active', true);
  type Stud = {
    id: string; first_name: string | null; last_name: string | null; email: string | null;
    created_at: string; permission_scope: unknown; access_end: string | null;
  };
  const students = ((studsRaw ?? []) as Stud[])
    .filter((s) => !s.access_end || new Date(s.access_end).getTime() > now);
  const studentIds = new Set(students.map((s) => s.id));

  // Périmètre des ALERTES : formules payantes uniquement — la page Alertes
  // pédagogiques et le CRM masquent les comptes Découverte, on ne crée donc
  // pas d'alertes qui y seraient invisibles. (Le recalcul des compteurs de
  // maintien, lui, concerne tout le monde.)
  const isPaying = (scope: unknown) => {
    const o = (scope as Record<string, unknown> | null)?.offer;
    return o === 'essentiel' || o === 'basic' || o === 'intensif' || o === 'premium' || o === 'approfondi';
  };
  const alertable = new Set(students.filter((s) => isPaying(s.permission_scope)).map((s) => s.id));

  /* ── 1. Inactivité globale > 21 jours (P1) ── */
  const [{ data: cpRaw }, { data: attRaw }, { data: fcRaw }, { data: tsRaw }] = await Promise.all([
    a.from('course_progress').select('user_id, last_seen_at').not('last_seen_at', 'is', null),
    a.from('qcm_attempts').select('user_id, attempted_at'),
    a.from('flashcard_reviews').select('user_id, reviewed_at'),
    a.from('transversal_sessions').select('user_id, completed_at').not('completed_at', 'is', null),
  ]);
  const lastActivity = new Map<string, number>();
  const bump = (uid: string, iso: string | null) => {
    if (!iso || !studentIds.has(uid)) return;
    const t = new Date(iso).getTime();
    if (t > (lastActivity.get(uid) ?? 0)) lastActivity.set(uid, t);
  };
  for (const r of (cpRaw ?? []) as { user_id: string; last_seen_at: string }[]) bump(r.user_id, r.last_seen_at);
  for (const r of (attRaw ?? []) as { user_id: string; attempted_at: string }[]) bump(r.user_id, r.attempted_at);
  for (const r of (fcRaw ?? []) as { user_id: string; reviewed_at: string }[]) bump(r.user_id, r.reviewed_at);
  for (const r of (tsRaw ?? []) as { user_id: string; completed_at: string }[]) bump(r.user_id, r.completed_at);

  for (const [uid, last] of lastActivity) {
    if (!alertable.has(uid)) continue;
    const days = Math.floor((now - last) / 86_400_000);
    if (days > 21) {
      const ok = await raiseAdminAlert({
        userId: uid, priority: 1,
        motif: `${days} jours sans activité globale`,
        key: 'inactivite_21j',
        details: { days_inactive: days },
        emailLines: [`Dernière activité : il y a ${days} jours`],
      });
      if (ok) summary.inactivity21d++;
    }
  }

  /* ── 2. Moins de 15 révisions transversales / 30 jours (P2) ── */
  const { data: statsRaw } = await a
    .from('user_revision_stats')
    .select('user_id, transversal_revisions_last_30_days, total_transversal_revisions');
  for (const row of ((statsRaw ?? []) as { user_id: string; transversal_revisions_last_30_days: number; total_transversal_revisions: number }[])) {
    if (!alertable.has(row.user_id)) continue;
    const stud = students.find((s) => s.id === row.user_id);
    const accountAge = stud ? now - new Date(stud.created_at).getTime() : 0;
    // Seuil appliqué aux élèves qui utilisent déjà les révisions (≥ 1 session)
    // et dont le compte a plus de 30 jours — pas aux tout nouveaux inscrits.
    if (row.total_transversal_revisions >= 1 && accountAge > 30 * 86_400_000 && row.transversal_revisions_last_30_days < 15) {
      const ok = await raiseAdminAlert({
        userId: row.user_id, priority: 2,
        motif: `${row.transversal_revisions_last_30_days} révisions transversales sur les 30 derniers jours (< 15)`,
        key: 'revisions_insuffisantes_30j',
        details: { revisions_30d: row.transversal_revisions_last_30_days },
        emailLines: [`Révisions transversales : ${row.transversal_revisions_last_30_days} / 30 derniers jours`],
      });
      if (ok) summary.lowRevisions30d++;
    }
  }

  /* ── 3. Épreuves blanches ── */
  const [{ data: examsRaw }, { data: subsRaw }] = await Promise.all([
    a.from('mock_exams')
      .select('id, title, status, created_at, publish_at, min_offer, target_colleges, voies, target_promos, target_user_ids, college_id')
      .eq('status', 'published')
      .is('cours_id', null)
      .is('specialite_id', null),
    a.from('mock_exam_submissions')
      .select('exam_id, user_id, status, percentage, submitted_at')
      .in('status', ['submitted', 'graded']),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exams = (examsRaw ?? []) as any[];
  type Sub = { exam_id: string; user_id: string; status: string; percentage: number | null; submitted_at: string | null };
  const subs = (subsRaw ?? []) as Sub[];
  const examTitle = new Map<string, string>(exams.map((e) => [e.id, e.title]));

  // 3a. Épreuve blanche < 40 % (P1) — copies des 30 derniers jours.
  for (const s of subs) {
    if (!alertable.has(s.user_id)) continue;
    if (s.percentage === null || s.percentage >= 40) continue;
    if (!s.submitted_at || now - new Date(s.submitted_at).getTime() > 30 * 86_400_000) continue;
    const title = examTitle.get(s.exam_id) ?? 'Épreuve blanche';
    const ok = await raiseAdminAlert({
      userId: s.user_id, priority: 1,
      motif: `Épreuve blanche < 40 % (${Math.round(s.percentage)} %)`,
      key: `epreuve_blanche_faible:${s.exam_id}`,
      details: { exam_id: s.exam_id, percentage: s.percentage },
      emailLines: [`${title} : ${Math.round(s.percentage)} %`],
    });
    if (ok) summary.examUnder40++;
  }

  // 3b. Épreuve blanche non réalisée depuis 30 jours (P2) — pour les élèves
  // ciblés par au moins une épreuve publiée depuis plus de 30 jours.
  const lastSubByUser = new Map<string, number>();
  for (const s of subs) {
    if (!s.submitted_at) continue;
    const t = new Date(s.submitted_at).getTime();
    if (t > (lastSubByUser.get(s.user_id) ?? 0)) lastSubByUser.set(s.user_id, t);
  }
  const oldExams = exams.filter((e) => {
    const ref = e.publish_at ?? e.created_at;
    return ref && now - new Date(ref).getTime() > 30 * 86_400_000;
  });
  if (oldExams.length > 0) {
    for (const stud of students) {
      if (!alertable.has(stud.id)) continue;
      const scope = parseScope(stud.permission_scope);
      const targeted = oldExams.some((e) => isExamTargeted(e, scope, undefined, stud.id));
      if (!targeted) continue;
      const lastSub = lastSubByUser.get(stud.id) ?? 0;
      if (lastSub === 0 || now - lastSub > 30 * 86_400_000) {
        const ok = await raiseAdminAlert({
          userId: stud.id, priority: 2,
          motif: 'Épreuve blanche non réalisée depuis 30 jours',
          key: 'epreuve_blanche_non_realisee',
          details: { last_submission: lastSub ? new Date(lastSub).toISOString() : null },
          emailLines: [lastSub ? `Dernière épreuve blanche : il y a ${Math.floor((now - lastSub) / 86_400_000)} jours` : 'Aucune épreuve blanche réalisée'],
        });
        if (ok) summary.examNotTaken30d++;
      }
    }
  }

  /* ── 4. Email récapitulatif quotidien ──
     UN seul email listant toutes les alertes pas encore emailées — y compris
     les alertes événementielles créées au fil de l'eau depuis la veille par
     les server actions (évaluations, réévaluations, bilans). */
  try {
    summary.digest = await sendDailyAlertDigest();
  } catch (err) {
    console.error('[PedagogicalAlerts] digest en échec', err);
  }

  return NextResponse.json({ ok: true, summary });
}
