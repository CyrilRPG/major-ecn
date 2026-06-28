import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QcmResults } from '@/components/qcm/qcm-results';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ cours: string; sessionId: string }>;
}) {
  const { cours: coursId, sessionId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, score_correct, score_total, started_at, finished_at, qcm_series(id, label, type, cours_id)')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!session || session.qcm_series.cours_id !== coursId) notFound();

  const { data: c } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const { data: attempts } = await supabase
    .from('qcm_attempts')
    .select('id, is_correct, time_spent_seconds, question_id, qcm_questions(id, enonce, order_index)')
    .eq('session_id', sessionId)
    .order('attempted_at');

  const totalSeconds = (attempts ?? []).reduce((sum, a) => sum + (a.time_spent_seconds ?? 0), 0);
  const failed = (attempts ?? [])
    .filter((a) => !a.is_correct)
    .map((a) => ({ id: a.qcm_questions.id, enonce: a.qcm_questions.enonce }));

  const { data: priorSessions } = await supabase
    .from('qcm_sessions')
    .select('id, score_correct, score_total, finished_at')
    .eq('serie_id', session.serie_id)
    .eq('user_id', user.id)
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: true });

  const history = (priorSessions ?? []).map((s, i) => ({
    label: `#${i + 1}`,
    pct: s.score_total > 0 ? (s.score_correct / s.score_total) * 100 : 0,
  }));

  const beforeCurrent = (priorSessions ?? []).filter((s) => s.id !== sessionId);
  const previous = beforeCurrent.length > 0 ? beforeCurrent[beforeCurrent.length - 1] : null;

  const isAnnale = session.qcm_series.type === 'annale';
  const retryHref = `/cours/${coursId}${isAnnale ? '/annales' : '/qcm'}/${session.serie_id}`;
  const reviewBase = `/cours/${coursId}/resultats/${sessionId}/revoir`;

  // --- Série suivante logic ---
  // Fetch all series of the same type for this course, ordered by order_index
  const serieType = session.qcm_series.type;
  const { data: allSeries } = await supabase
    .from('qcm_series')
    .select('id, order_index')
    .eq('cours_id', coursId)
    .eq('type', serieType)
    .order('order_index');

  // Fetch all completed sessions for this user in these series
  const serieIds = (allSeries ?? []).map((s) => s.id);
  const { data: completedSessions } = serieIds.length > 0
    ? await supabase
        .from('qcm_sessions')
        .select('serie_id')
        .eq('user_id', user.id)
        .not('finished_at', 'is', null)
        .in('serie_id', serieIds)
    : { data: [] };

  const completedSerieIds = new Set((completedSessions ?? []).map((s) => s.serie_id));

  // Find next uncompleted serie: first look after the current one by order_index, then wrap around
  const currentOrderIndex = (allSeries ?? []).find((s) => s.id === session.serie_id)?.order_index ?? 0;
  const afterCurrent = (allSeries ?? []).filter((s) => s.order_index > currentOrderIndex && !completedSerieIds.has(s.id));
  const beforeCurrent2 = (allSeries ?? []).filter((s) => s.order_index <= currentOrderIndex && s.id !== session.serie_id && !completedSerieIds.has(s.id));
  const nextUncompleted = afterCurrent[0] ?? beforeCurrent2[0] ?? null;

  const allSeriesDone = nextUncompleted === null;
  const seriesListHref = `/cours/${coursId}${isAnnale ? '/annales' : '/qcm'}`;
  const nextSerieHref = nextUncompleted
    ? `/cours/${coursId}${isAnnale ? '/annales' : '/qcm'}/${nextUncompleted.id}`
    : null;

  return (
    <QcmResults
      scoreCorrect={session.score_correct}
      scoreTotal={session.score_total}
      totalSeconds={totalSeconds}
      questionsCount={attempts?.length ?? 0}
      previous={previous}
      history={history}
      failed={failed}
      coursHref={`/cours/${coursId}`}
      retryHref={retryHref}
      reviewWrongHref={isAnnale ? `${reviewBase}?filter=wrong` : undefined}
      reviewAllHref={isAnnale ? `${reviewBase}?filter=all` : undefined}
      nextSerieHref={nextSerieHref}
      allSeriesDone={allSeriesDone}
      seriesListHref={seriesListHref}
    />
  );
}
