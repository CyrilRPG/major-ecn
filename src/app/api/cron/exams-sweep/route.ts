import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Balayage des épreuves programmées : finalise les copies « en cours » dont la
 * fenêtre (fermeture ou start+durée) est dépassée — filet de sécurité de
 * l'auto-remise côté client (navigateur fermé). Sans réponse enregistrée, la
 * copie est simplement clôturée à 0 (l'auto-remise client écrit les réponses
 * avant la clôture dans le cas nominal). La publication des résultats et
 * l'affichage « Absent » sont gérés à la lecture (gardes now()).
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
  const nowMs = Date.now();
  const graceMs = 120_000;

  // Épreuves programmées avec des copies encore en cours.
  const { data: exams } = await a
    .from('mock_exams')
    .select('id, close_at, duration_minutes')
    .eq('exam_mode', 'scheduled');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scheduled = (exams ?? []) as any[];

  let finalized = 0;
  for (const exam of scheduled) {
    const closeMs = exam.close_at ? new Date(exam.close_at).getTime() : null;
    const { data: inProgress } = await a
      .from('mock_exam_submissions')
      .select('id, started_at')
      .eq('exam_id', exam.id).eq('status', 'in_progress');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const sub of (inProgress ?? []) as any[]) {
      const startMs = sub.started_at ? new Date(sub.started_at).getTime() : 0;
      const byDuration = exam.duration_minutes ? startMs + exam.duration_minutes * 60_000 : null;
      const deadline = Math.min(...[closeMs, byDuration].filter((x): x is number => x !== null));
      if (!Number.isFinite(deadline)) continue;
      if (nowMs <= deadline + graceMs) continue; // encore dans les temps (+ grâce)

      // Recalcule le score depuis les réponses déjà enregistrées (souvent aucune).
      const { data: ans } = await a.from('mock_exam_answers').select('points_awarded, max_points').eq('submission_id', sub.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (ans ?? []) as any[];
      const score = rows.reduce((s, r) => s + Number(r.points_awarded), 0);
      const maxScore = rows.reduce((s, r) => s + Number(r.max_points), 0);
      const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      await a.from('mock_exam_submissions').update({
        status: 'graded', submitted_at: new Date().toISOString(), graded_at: new Date().toISOString(),
        score: Math.round(score * 100) / 100, max_score: Math.round(maxScore * 100) / 100, percentage: pct,
        time_spent_seconds: Math.max(0, Math.floor((deadline - startMs) / 1000)),
      }).eq('id', sub.id);
      finalized += 1;
    }
  }

  return NextResponse.json({ ok: true, scheduledExams: scheduled.length, finalized });
}
