import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { examWindow, resultsVisible, type AccessOverride } from '@/lib/exams/window';
import { ExamRunner } from '@/components/student/exam-runner';
import { ExamResults } from '@/components/student/exam-results';
import { ExamGate } from '@/components/student/exam-gate';
import { ExamGradingLoading } from '@/components/student/exam-grading-loading';

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
  if (!isExamTargeted(exam, scope, (profile as { promotion?: string }).promotion, user.id)) redirect('/epreuves-blanches');

  const now = Date.now();
  const back = (
    <Link href="/epreuves-blanches" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
      <ArrowLeft className="h-4 w-4" /> Épreuves blanches
    </Link>
  );
  const shell = (content: React.ReactNode) => <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">{back}{content}</div>;

  const { data: submission } = await a
    .from('mock_exam_submissions').select('*')
    .eq('exam_id', id).eq('user_id', user.id)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false }).limit(1).maybeSingle();

  // ── Copie déjà soumise ──
  if (submission) {
    const { data: answers } = await a.from('mock_exam_answers').select('*').eq('submission_id', submission.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answerRows = (answers ?? []) as any[];
    // Auto-évaluation QROC (mode self) encore en attente ?
    const pendingSelf = exam.qroc_mode === 'self' && answerRows.some((x) => x.format === 'qroc' && !x.self_grade);

    // Correction / analyse IA à faire (dans tous les cas) → écran de chargement.
    if (!submission.ai_report && !pendingSelf) {
      return shell(<ExamGradingLoading submissionId={submission.id} />);
    }

    if (submission.ai_report && !resultsVisible(exam, now)) {
      const when = exam.results_publish_mode === 'after_close' ? exam.close_at : exam.results_publish_at;
      return shell(
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 text-center shadow-(--shadow-soft)">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)"><CalendarClock className="h-6 w-6" /></span>
          <h1 className="mt-4 font-display text-xl font-bold text-(--color-ink)">Copie remise ✓</h1>
          <p className="mt-2 text-sm text-(--color-ink-soft)">Vos résultats et le classement seront disponibles {when ? `le ${new Date(when).toLocaleString('fr-FR')}` : 'à la clôture de la session'}.</p>
        </div>,
      );
    }
    const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index');
    const { data: colsRaw } = await a.from('matieres').select('id, nom');
    const collegeNames: Record<string, string> = Object.fromEntries(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));
    // Classement (RPC SECURITY DEFINER, appelée avec le client utilisateur → auth.uid()).
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: leaderboard } = await (supabase as any).rpc('mock_exam_leaderboard', { p_exam_id: id });
    return shell(
      <ExamResults
        exam={{ id: exam.id, title: exam.title, qroc_mode: exam.qroc_mode }}
        submission={submission}
        questions={(qs ?? []) as Record<string, unknown>[]}
        answers={answerRows as Record<string, unknown>[]}
        collegeNames={collegeNames}
        leaderboard={(leaderboard ?? null) as Record<string, unknown> | null}
      />,
    );
  }

  // ── Fenêtre de composition ──
  const { data: access } = await a.from('mock_exam_access').select('open_at, close_at, duration_minutes').eq('exam_id', id).eq('user_id', user.id).maybeSingle();
  const win = examWindow(exam, (access ?? null) as AccessOverride, now, false);

  if (!win.canCompose) {
    return shell(
      <ExamGate
        title={exam.title}
        reason={win.reason === 'before' ? 'before' : 'after'}
        opensAt={win.opensAt?.toISOString() ?? null}
        closesAt={win.closesAt?.toISOString() ?? null}
      />,
    );
  }

  // Reprise éventuelle d'une copie en cours (chronomètre serveur).
  const { data: inProgress } = await a.from('mock_exam_submissions').select('started_at').eq('exam_id', id).eq('user_id', user.id).eq('status', 'in_progress').maybeSingle();

  const { data: rawQs } = await a.from('mock_exam_questions')
    .select('id, order_index, format, enonce, vignette, images, points, items')
    .eq('exam_id', id).order('order_index');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized = ((rawQs ?? []) as any[]).map((q) => ({
    id: q.id, format: q.format as 'qcm' | 'qroc', enonce: q.enonce, vignette: q.vignette ?? null,
    images: (q.images ?? []) as string[], points: q.points,
    items: q.format === 'qcm' ? (q.items ?? []).map((it: { lettre: string; enonce: string }) => ({ lettre: it.lettre, enonce: it.enonce })) : [],
  }));

  return shell(
    <ExamRunner
      exam={{
        id: exam.id, title: exam.title, instructions: exam.instructions ?? '',
        duration_minutes: win.durationMinutes ?? exam.duration_minutes ?? null, question_order: exam.question_order,
        scheduled: exam.exam_mode === 'scheduled', closesAt: win.closesAt?.toISOString() ?? null,
        startedAt: inProgress?.started_at ?? null,
      }}
      questions={sanitized}
    />,
  );
}
