import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { QcmSession } from '@/components/qcm/qcm-session';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function QcmRunPage({ params }: { params: Promise<{ cours: string; serie: string }> }) {
  const { cours: coursId, serie: serieId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

  const { data: serie } = await supabase
    .from('qcm_series')
    .select('id, label, type, cours_id')
    .eq('id', serieId)
    .eq('cours_id', coursId)
    .maybeSingle();
  if (!serie) notFound();

  const { data: questions } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, qcm_items(id, lettre, enonce, is_correct, justification)')
    .eq('serie_id', serieId)
    .order('order_index');

  if (!questions || questions.length === 0) notFound();

  const enrichedQuestions = questions.map((q) => ({
    id: q.id,
    enonce: q.enonce,
    order_index: q.order_index,
    items: (q.qcm_items ?? [])
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  const { data: session } = await supabase
    .from('qcm_sessions')
    .insert({ user_id: user.id, serie_id: serieId, score_correct: 0, score_total: enrichedQuestions.length })
    .select('id')
    .single();
  if (!session) notFound();

  const isAnnale = serie.type === 'annale';
  const backHref = isAnnale ? `/cours/${coursId}/annales` : `/cours/${coursId}/qcm`;

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.semestres.facultes?.nom ?? '', href: `/facultes/${facId}` },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre, href: `/cours/${coursId}` },
          { label: isAnnale ? 'Annales' : 'QCM', href: backHref },
          { label: serie.label },
        ]}
      />
      <QcmSession
        sessionId={session.id}
        coursId={coursId}
        serieLabel={serie.label}
        serieKind={isAnnale ? 'annale' : 'qcm'}
        questions={enrichedQuestions}
        backHref={backHref}
      />
    </>
  );
}
