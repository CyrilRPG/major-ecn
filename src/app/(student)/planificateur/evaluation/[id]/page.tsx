import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { loadEvaluation } from '@/lib/plan/service';
import { EvaluationRunner } from '@/components/student/plan/evaluation-runner';
import { EVALUATION_RESULT_LABEL, type EvaluationResult } from '@/lib/plan/types';

/** Évaluation courte (§14) : uniquement celles du candidat connecté. */
export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await requireUser();
  const { id } = await params;
  const view = await loadEvaluation(user.id, profile.permission_scope, id);
  if (!view) notFound();
  return (
    <main className="space-y-5">
      <header>
        <Link href="/planificateur" className="text-xs text-(--color-ink-muted) hover:underline">← Aujourd’hui</Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Évaluation : {view.itemName}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">{view.questions.length} questions ciblées. Le résultat met à jour votre niveau sur cet item et recalcule votre planning.</p>
      </header>
      {view.completed ? (
        <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-6 text-center">
          <p className="text-2xl font-semibold text-(--color-ink)">{view.score ?? 0} %</p>
          <p className="mt-1 text-sm text-(--color-ink-soft)">{view.result ? EVALUATION_RESULT_LABEL[view.result as EvaluationResult] : 'Évaluation terminée.'}</p>
          <Link href="/planificateur" className="mt-4 inline-block text-sm font-medium text-(--color-primary) underline-offset-4 hover:underline">Retour à aujourd’hui</Link>
        </div>
      ) : view.questions.length === 0 ? (
        <p className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-sm text-(--color-ink-soft)">Aucune question disponible pour cette évaluation.</p>
      ) : (
        <EvaluationRunner evaluationId={view.id} itemName={view.itemName} questions={view.questions} />
      )}
    </main>
  );
}
