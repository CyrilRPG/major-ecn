import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QcmReviewer } from '@/components/qcm/qcm-reviewer';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string; sessionId: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { cours: coursId, sessionId } = await params;
  const sp = await searchParams;
  const filter: 'wrong' | 'all' = sp.filter === 'wrong' ? 'wrong' : 'all';

  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, qcm_series(id, label, type, cours_id)')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!session || session.qcm_series.cours_id !== coursId) notFound();

  const { data: c } = await supabase
    .from('cours')
    .select('id, matiere_id')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const { data: attempts } = await supabase
    .from('qcm_attempts')
    .select('question_id, selected_items, is_correct')
    .eq('session_id', sessionId);

  const { data: questions } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, qcm_items(id, lettre, enonce, is_correct, justification)')
    .eq('serie_id', session.serie_id)
    .order('order_index');
  if (!questions || questions.length === 0) notFound();

  const attemptsByQ: Record<string, string[]> = {};
  const wrongIds = new Set<string>();
  for (const a of attempts ?? []) {
    attemptsByQ[a.question_id] = (a.selected_items as string[]) ?? [];
    if (!a.is_correct) wrongIds.add(a.question_id);
  }

  const enriched = questions
    .filter((q) => (filter === 'wrong' ? wrongIds.has(q.id) : true))
    .map((q) => ({
      id: q.id,
      enonce: q.enonce,
      items: (q.qcm_items ?? [])
        .map((it) => ({
          id: it.id,
          lettre: it.lettre,
          enonce: it.enonce,
          justification: it.justification,
          is_correct: it.is_correct,
        }))
        .sort((a, b) => a.lettre.localeCompare(b.lettre)),
    }));

  return (
    <QcmReviewer
      questions={enriched}
      attemptsByQ={attemptsByQ}
      filterLabel={filter === 'wrong' ? 'mes erreurs uniquement' : 'toutes les questions'}
      serieLabel={session.qcm_series.label}
      backHref={`/cours/${coursId}/resultats/${sessionId}`}
    />
  );
}
