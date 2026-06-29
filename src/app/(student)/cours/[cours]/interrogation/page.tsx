import { notFound, redirect } from 'next/navigation';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, canAccessCours, parseScope, getContentAccess } from '@/lib/auth/permissions';
import { InterrogationSession, type IQuestion } from './interrogation-session';

const PNEUMO_COURS_ID = '33579977-020e-4c94-a561-dee9d3c7bc70';
const N_QUESTIONS = 15;

export default async function InterrogationPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom)')
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (!canAccessCours(scope, c.matiere_id, coursId)) redirect(`/matieres/${c.matiere_id}`);
  if (profile.role !== 'admin' && !getContentAccess(scope.offer).interrogation) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  // Verrouillage : tout doit être fait (sauf bypass Pneumo).
  if (coursId !== PNEUMO_COURS_ID) {
    const [{ data: cp }, { count: qcmAtt }, { count: flashRv }] = await Promise.all([
      supabase.from('course_progress').select('video_watched, fiche_read').eq('user_id', user.id).eq('cours_id', coursId).maybeSingle(),
      supabase.from('qcm_attempts').select('id, qcm_questions!inner(qcm_series!inner(cours_id))', { count: 'exact', head: true }).eq('user_id', user.id).eq('qcm_questions.qcm_series.cours_id', coursId),
      supabase.from('flashcard_reviews').select('id, flashcards!inner(cours_id)', { count: 'exact', head: true }).eq('user_id', user.id).eq('flashcards.cours_id', coursId),
    ]);
    const ok = !!cp?.video_watched && !!cp?.fiche_read && (qcmAtt ?? 0) > 0 && (flashRv ?? 0) > 0;
    if (!ok) redirect(`/cours/${coursId}`);
  }

  // Sélectionne N questions au hasard parmi les QCM du cours.
  const { data: questionsRaw } = await supabase
    .from('qcm_questions')
    .select('id, enonce, qcm_items(id, lettre, enonce, is_correct), qcm_series!inner(cours_id)')
    .eq('qcm_series.cours_id', coursId)
    .limit(80);
  type Row = { id: string; enonce: string; qcm_items: { id: string; lettre: string; enonce: string; is_correct: boolean }[] };
  const allQ = ((questionsRaw ?? []) as unknown as Row[]).filter((q) => (q.qcm_items ?? []).length >= 3);
  // Shuffle Fisher-Yates simple
  const shuffled = [...allQ];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = shuffled.slice(0, Math.min(N_QUESTIONS, shuffled.length));
  const questions: IQuestion[] = picked.map((q) => ({
    id: q.id,
    enonce: q.enonce,
    items: [...(q.qcm_items ?? [])]
      .sort((a, b) => a.lettre.localeCompare(b.lettre))
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, is_correct: it.is_correct })),
  }));

  // Si déjà signé, on saute directement vers le certificat.
  const { data: completion } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { qcm_test_score: number | null; qcm_test_total: number | null; certificate_signed_at: string | null } | null }> };
        };
      };
    };
  }).from('parcours_completions')
    .select('qcm_test_score, qcm_test_total, certificate_signed_at')
    .eq('user_id', user.id).eq('cours_id', coursId).maybeSingle();

  return (
    <InterrogationSession
      coursId={coursId}
      coursTitre={c.titre}
      questions={questions}
      previousScore={completion?.qcm_test_score ?? null}
      previousTotal={completion?.qcm_test_total ?? null}
      alreadySigned={!!completion?.certificate_signed_at}
      firstName={profile.first_name ?? ''}
      lastName={profile.last_name ?? ''}
    />
  );
}
