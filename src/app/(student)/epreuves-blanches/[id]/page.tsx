import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { ExamRunner } from '@/components/student/exam-runner';
import { ExamResults } from '@/components/student/exam-results';

export const dynamic = 'force-dynamic';

export default async function StudentExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: exam } = await a.from('mock_exams').select('*').eq('id', id).eq('status', 'published').maybeSingle();
  if (!exam) notFound();
  if (!isExamTargeted(exam, scope, (profile as { promotion?: string }).promotion)) redirect('/epreuves-blanches');

  const { data: submission } = await a
    .from('mock_exam_submissions').select('*')
    .eq('exam_id', id).eq('user_id', user.id)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false }).limit(1).maybeSingle();

  const back = (
    <Link href="/epreuves-blanches" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
      <ArrowLeft className="h-4 w-4" /> Épreuves blanches
    </Link>
  );

  // ── Copie déjà soumise → résultats + corrigés ──
  if (submission) {
    const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index');
    const { data: answers } = await a.from('mock_exam_answers').select('*').eq('submission_id', submission.id);
    const { data: colsRaw } = await a.from('matieres').select('id, nom');
    const collegeNames: Record<string, string> = Object.fromEntries(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {back}
        <ExamResults
          exam={{ id: exam.id, title: exam.title, qroc_mode: exam.qroc_mode }}
          submission={submission}
          questions={(qs ?? []) as Record<string, unknown>[]}
          answers={(answers ?? []) as Record<string, unknown>[]}
          collegeNames={collegeNames}
        />
      </div>
    );
  }

  // ── Passation : questions assainies (sans réponses) ──
  const { data: rawQs } = await a.from('mock_exam_questions')
    .select('id, order_index, format, enonce, vignette, images, points, items')
    .eq('exam_id', id).order('order_index');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized = ((rawQs ?? []) as any[]).map((q) => ({
    id: q.id, format: q.format as 'qcm' | 'qroc', enonce: q.enonce, vignette: q.vignette ?? null,
    images: (q.images ?? []) as string[], points: q.points,
    // Ne JAMAIS envoyer is_correct/justification pendant la passation.
    items: q.format === 'qcm' ? (q.items ?? []).map((it: { lettre: string; enonce: string }) => ({ lettre: it.lettre, enonce: it.enonce })) : [],
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      {back}
      <ExamRunner
        exam={{
          id: exam.id, title: exam.title, instructions: exam.instructions ?? '',
          duration_minutes: exam.duration_minutes ?? null, question_order: exam.question_order,
        }}
        questions={sanitized}
      />
    </div>
  );
}
