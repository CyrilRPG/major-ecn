import { notFound, redirect } from 'next/navigation';
import { requireUser, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { InterrogationSession, type IQuestion } from './interrogation-session';
import { InterrogationExamFlow } from './interrogation-exam-flow';

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
  if (profile.role !== 'admin' && !(await fetchContentAccessForScope(scope)).interrogation) redirect(`/cours/${coursId}`);
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

  // ── Interrogation configurée par l'admin (moteur d'épreuve) ──
  // Si l'item a une interrogation avec des questions, elle prime sur le tirage
  // automatique de 15 QCM. Elle est rendue ICI (même URL) : aucune redirection,
  // donc aucun conflit avec le verrou de fin de parcours du layout.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ad = admin as any;
  const { data: interro } = await ad
    .from('mock_exams')
    .select('id, title, qroc_mode, instructions, duration_minutes, question_order')
    .eq('cours_id', coursId).eq('status', 'published').maybeSingle();

  if (interro) {
    const { data: iqs } = await ad
      .from('mock_exam_questions')
      .select('id, order_index, format, enonce, vignette, images, points, items, reponse_attendue, correction_generale, college_id')
      .eq('exam_id', interro.id).order('order_index');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iQuestions = (iqs ?? []) as any[];
    if (iQuestions.length > 0) {
      const { data: sub } = await ad
        .from('mock_exam_submissions').select('*')
        .eq('exam_id', interro.id).eq('user_id', user.id)
        .in('status', ['submitted', 'graded'])
        .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
      const { data: ans } = sub
        ? await ad.from('mock_exam_answers').select('*').eq('submission_id', sub.id)
        : { data: [] };
      const { data: colsRaw } = await ad.from('matieres').select('id, nom');
      const collegeNames: Record<string, string> = Object.fromEntries(
        ((colsRaw ?? []) as { id: string; nom: string }[]).map((x) => [x.id, x.nom]),
      );
      // En passation, on n'expose jamais les corrigés (is_correct/justification).
      const forRunner = iQuestions.map((q) => ({
        id: q.id, format: q.format as 'qcm' | 'qroc', enonce: q.enonce,
        vignette: q.vignette ?? null, images: (q.images ?? []) as string[], points: q.points,
        items: q.format === 'qcm'
          ? (q.items ?? []).map((it: { lettre: string; enonce: string }) => ({ lettre: it.lettre, enonce: it.enonce }))
          : [],
      }));
      return (
        <InterrogationExamFlow
          coursId={coursId}
          coursTitre={c.titre}
          firstName={profile.first_name ?? ''}
          lastName={profile.last_name ?? ''}
          exam={interro}
          questions={sub ? iQuestions : forRunner}
          submission={sub ?? null}
          answers={(ans ?? []) as Record<string, unknown>[]}
          collegeNames={collegeNames}
          alreadySigned={!!completion?.certificate_signed_at}
        />
      );
    }
  }

  // ── Repli : interrogation automatique (15 QCM tirés au hasard) ──
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
