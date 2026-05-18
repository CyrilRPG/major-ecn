import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { QcmResults } from '@/components/qcm/qcm-results';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

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
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

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
  const backHref = isAnnale ? `/cours/${coursId}/annales` : `/cours/${coursId}/qcm`;
  const retryHref = `/cours/${coursId}${isAnnale ? '/annales' : '/qcm'}/${session.serie_id}`;

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre, href: `/cours/${coursId}` },
          { label: isAnnale ? 'Annales' : 'QCM', href: backHref },
          { label: session.qcm_series.label, href: retryHref },
          { label: 'Résultats' },
        ]}
      />
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
      />
    </>
  );
}
