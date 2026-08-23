import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminExamResults, type ResultRow } from '@/components/admin/epreuves/admin-exam-results';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Résultats de l’épreuve' };

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: exam } = await a.from('mock_exams').select('id, title, qroc_mode, status, exam_mode').eq('id', id).maybeSingle();
  if (!exam) notFound();

  const [{ data: qs }, { data: subsRaw }, { data: colsRaw }] = await Promise.all([
    a.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index'),
    a.from('mock_exam_submissions')
      .select('id, user_id, status, score, max_score, percentage, time_spent_seconds, submitted_at, ai_report')
      .eq('exam_id', id)
      .in('status', ['submitted', 'graded', 'absent'])
      .order('percentage', { ascending: false, nullsFirst: false }),
    a.from('matieres').select('id, nom, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subs = (subsRaw ?? []) as any[];
  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const { data: profs } = userIds.length
    ? await a.from('profiles').select('id, first_name, last_name, email').in('id', userIds)
    : { data: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pById = new Map<string, any>(((profs ?? []) as any[]).map((p) => [p.id, p]));
  const collegeNames: Record<string, string> = Object.fromEntries(
    ((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]),
  );

  const rows: ResultRow[] = subs.map((s) => {
    const p = pById.get(s.user_id);
    return {
      submissionId: s.id,
      userId: s.user_id,
      name: [p?.first_name, p?.last_name].filter(Boolean).join(' ') || '(profil incomplet)',
      email: p?.email ?? '',
      status: s.status,
      score: s.score,
      maxScore: s.max_score,
      percentage: s.percentage,
      timeSpentSeconds: s.time_spent_seconds,
      submittedAt: s.submitted_at,
      hasAiReport: !!s.ai_report,
    };
  });

  const graded = rows.filter((r) => r.percentage != null);
  const avg = graded.length ? Math.round(graded.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / graded.length) : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/epreuves-blanches" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-4 w-4" /> Toutes les épreuves
      </Link>

      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Résultats de l’épreuve</p>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <Users className="h-5 w-5 text-(--color-primary)" />
          {exam.title}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-(--color-ink-soft)">
          <span>{rows.length} copie{rows.length > 1 ? 's' : ''}</span>
          {avg != null && <span>· Moyenne {avg}%</span>}
          <span>· Correction QROC : {exam.qroc_mode === 'ai' ? 'IA' : 'auto-évaluation'}</span>
        </p>
      </header>

      <AdminExamResults
        exam={{ id: exam.id, title: exam.title, qroc_mode: exam.qroc_mode }}
        questions={(qs ?? []) as Record<string, unknown>[]}
        rows={rows}
        collegeNames={collegeNames}
      />
    </main>
  );
}
