import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { QcmResults } from '@/components/qcm/qcm-results';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { buildQcmAccessContext, canStudentReadSerie, SERIE_ACCESS_COLUMNS, type SerieAccessRow } from '@/lib/data/qcm-access';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ cours: string; sessionId: string }>;
}) {
  const { cours: coursId, sessionId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // La session appartient à l'élève (policy `qcm_sessions_owner`, saine).
  // La série, en revanche, est lue via le client service-role : la RLS de
  // `qcm_series` est récursive en production (42P17) et faisait échouer la
  // jointure — l'élève tombait sur un 404 en fin de dossier progressif.
  const { data: session, error: sessionError } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, score_correct, score_total, started_at, finished_at')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) notFound();

  const admin = createAdminClient();
  const { data: serie, error: serieError } = await admin
    .from('qcm_series')
    .select('id, label, type, cours_id')
    .eq('id', session.serie_id)
    .maybeSingle();
  if (serieError) throw serieError;
  if (!serie || serie.cours_id !== coursId) notFound();

  const { data: c, error: coursError } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (coursError) throw coursError;
  if (!c || !c.matieres?.semestres) notFound();
  if (profile.role !== 'admin' && !canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const { data: attempts } = await supabase
    .from('qcm_attempts')
    .select('id, is_correct, time_spent_seconds, question_id')
    .eq('session_id', sessionId)
    .order('attempted_at');

  // Énoncés des questions ratées : lecture service-role (cf. commentaire ci-dessus).
  const failedIds = (attempts ?? []).filter((a) => !a.is_correct).map((a) => a.question_id);
  const { data: failedQuestions } = failedIds.length > 0
    ? await admin.from('qcm_questions').select('id, enonce').in('id', failedIds)
    : { data: [] as { id: string; enonce: string }[] };
  const enonceById = new Map((failedQuestions ?? []).map((q) => [q.id, q.enonce]));

  const totalSeconds = (attempts ?? []).reduce((sum, a) => sum + (a.time_spent_seconds ?? 0), 0);
  const failed = failedIds.map((id) => ({ id, enonce: enonceById.get(id) ?? '' }));

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

  const isAnnale = serie.type === 'annale';
  const retryHref = `/cours/${coursId}${isAnnale ? '/annales' : '/qcm'}/${session.serie_id}`;
  const reviewBase = `/cours/${coursId}/resultats/${sessionId}/revoir`;

  // --- Série suivante logic ---
  // Fetch all series of the same type for this course, ordered by order_index.
  // Service-role + filtrage applicatif : proposer une série que l'élève n'a pas
  // le droit d'ouvrir la ferait atterrir sur un 404.
  const serieType = serie.type;
  const { data: rawAllSeries } = await admin
    .from('qcm_series')
    .select(`${SERIE_ACCESS_COLUMNS}, order_index, qcm_questions(format)` as 'id, label, type, order_index')
    .eq('cours_id', coursId)
    .eq('type', serieType)
    .order('order_index');
  const accessCtx = await buildQcmAccessContext(profile, c.matiere_id);
  const allSeries = ((rawAllSeries ?? []) as unknown as (SerieAccessRow & {
    order_index: number;
    qcm_questions?: { format: string }[] | null;
  })[]).filter((s) => canStudentReadSerie(s, accessCtx, (s.qcm_questions ?? []).map((q) => q.format)));

  // Fetch all completed sessions for this user in these series
  const serieIds = allSeries.map((s) => s.id);
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
  const currentOrderIndex = allSeries.find((s) => s.id === session.serie_id)?.order_index ?? 0;
  const afterCurrent = allSeries.filter((s) => s.order_index > currentOrderIndex && !completedSerieIds.has(s.id));
  const beforeCurrent2 = allSeries.filter((s) => s.order_index <= currentOrderIndex && s.id !== session.serie_id && !completedSerieIds.has(s.id));
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
