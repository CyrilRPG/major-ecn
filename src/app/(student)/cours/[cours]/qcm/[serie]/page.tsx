import { notFound, redirect } from 'next/navigation';
import { requireUser, getProfessorScope, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { QcmSession } from '@/components/qcm/qcm-session';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { canWrite } from '@/lib/schemas/professor';

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
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  const { data: serie } = await supabase
    .from('qcm_series')
    // cast pour exposer la colonne vignette (ajoutée par migration)
    .select('id, label, type, cours_id, vignette' as 'id, label, type, cours_id')
    .eq('id', serieId)
    .eq('cours_id', coursId)
    .maybeSingle();
  if (!serie) notFound();
  const vignette = (serie as unknown as { vignette?: string | null }).vignette ?? null;

  const { data: questions } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, format, reponse_attendue, correction_generale, images, qcm_items(id, lettre, enonce, is_correct, justification, images)')
    .eq('serie_id', serieId)
    .order('order_index');

  if (!questions || questions.length === 0) notFound();

  type QRow = {
    id: string; enonce: string; order_index: number; format: string;
    reponse_attendue: string | null; correction_generale: string | null;
    images: string[] | null;
    qcm_items: Array<{ id: string; lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }>;
  };
  const enrichedQuestions = (questions as unknown as QRow[]).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    order_index: q.order_index,
    format: q.format as 'qcm' | 'qroc',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    images: q.images ?? [],
    items: (q.qcm_items ?? [])
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images ?? [] }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  // Mode édition prof : visible UNIQUEMENT pour profs ayant le scope écriture
  // sur le contenu QCM. Permet d'ouvrir l'éditeur de question depuis la vue
  // élève via un bouton crayon.
  const profScope = profile.role === 'professor' ? getProfessorScope(profile.permission_scope) : null;
  const editable = profile.role === 'admin' || (profScope ? canWrite(profScope, 'qcm') : false);

  const { data: session } = await supabase
    .from('qcm_sessions')
    .insert({ user_id: user.id, serie_id: serieId, score_correct: 0, score_total: enrichedQuestions.length })
    .select('id')
    .single();
  if (!session) notFound();

  const isAnnale = serie.type === 'annale';
  const backHref = isAnnale ? `/cours/${coursId}/annales` : `/cours/${coursId}/qcm`;

  return (
    <QcmSession
      sessionId={session.id}
      coursId={coursId}
      serieId={serieId}
      serieLabel={serie.label}
      serieKind={isAnnale ? 'annale' : 'qcm'}
      vignette={vignette}
      questions={enrichedQuestions}
      backHref={backHref}
      editable={editable}
    />
  );
}
