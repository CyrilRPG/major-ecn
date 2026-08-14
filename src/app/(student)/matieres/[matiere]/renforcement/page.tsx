import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { RenforcementFlow } from './renforcement-flow';

export const metadata = { title: 'Renforcement approfondi' };

type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[] | null;
  qcm_series: { cours_id: string };
};

export default async function RenforcementPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, matiere)) redirect('/facultes');

  const { data: mat } = await supabase
    .from('matieres')
    .select('id, nom, semestres!inner(faculte_id)')
    .eq('id', matiere)
    .maybeSingle();
  if (!mat) notFound();
  const sem = mat.semestres as unknown as { faculte_id: string };
  if (sem.faculte_id !== EDN_FACULTE_ID) notFound();

  const matiereName = (mat as unknown as { nom: string }).nom;

  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, titre, order_index, fiches(id), flashcards(id)')
    .eq('matiere_id', matiere)
    .order('order_index');
  type CoursRow = { id: string; titre: string; order_index: number | null; fiches: { id: string }[] | null; flashcards: { id: string }[] | null };
  const coursList = ((coursRaw ?? []) as unknown as CoursRow[]);
  const coursIds = coursList.map((c) => c.id);
  if (coursIds.length === 0) redirect(`/matieres/${matiere}`);

  const [{ data: seriesRaw }, { data: attemptsRaw }, { data: progressRow }] = await Promise.all([
    supabase
      .from('qcm_series')
      .select('id')
      .in('cours_id', coursIds),
    supabase
      .from('qcm_attempts')
      .select('question_id, is_correct')
      .eq('user_id', user.id),
    // Parcours de renforcement en cours : reprendre là où l'élève s'était arrêté.
    (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => {
            eq: (k: string, v: string) => {
              is: (k: string, v: null) => {
                maybeSingle: () => Promise<{ data: {
                  fiches_completed: boolean | null; flashcards_completed: boolean | null;
                  qcm_completed: boolean | null; eval_completed: boolean | null;
                } | null }>;
              };
            };
          };
        };
      };
    }).from('renforcement_progress')
      .select('fiches_completed, flashcards_completed, qcm_completed, eval_completed')
      .eq('user_id', user.id)
      .eq('matiere_id', matiere)
      .is('completed_at', null)
      .maybeSingle(),
  ]);
  const serieIds = (seriesRaw ?? []).map((s) => s.id);

  const { data: allQRaw } = serieIds.length > 0
    ? await supabase
        .from('qcm_questions')
        .select('id, enonce, order_index, qcm_items(id, lettre, enonce, justification, is_correct), qcm_series!inner(cours_id)')
        .in('serie_id', serieIds)
        .order('order_index')
    : { data: [] };

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter(
    (q) => q.qcm_items && q.qcm_items.length >= 3,
  );

  // Série renforcée : priorité aux questions déjà ratées, puis tirage.
  const failCount = new Map<string, number>();
  const qIds = new Set(allQ.map((q) => q.id));
  for (const a of ((attemptsRaw ?? []) as unknown as { question_id: string; is_correct: boolean }[])) {
    if (qIds.has(a.question_id) && !a.is_correct) {
      failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
    }
  }
  const shuffled = [...allQ]
    .map((q) => ({ q, w: -(failCount.get(q.id) ?? 0) + Math.random() }))
    .sort((a, b) => a.w - b.w)
    .map((x) => x.q);

  const qcmQuestions = shuffled.slice(0, Math.min(50, shuffled.length));
  const pickedIds = new Set(qcmQuestions.map((q) => q.id));
  const evalPool = shuffled.filter((q) => !pickedIds.has(q.id));
  const evalQuestions = evalPool.slice(0, Math.min(30, evalPool.length));

  const mapQ = (q: QRow) => ({
    id: q.id,
    enonce: q.enonce,
    cours_id: q.qcm_series.cours_id,
    college: matiereName,
    items: [...(q.qcm_items ?? [])]
      .sort((a, b) => a.lettre.localeCompare(b.lettre))
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct })),
  });

  const initialCompleted: number[] = [];
  if (progressRow?.fiches_completed) initialCompleted.push(1);
  if (progressRow?.flashcards_completed) initialCompleted.push(2);
  if (progressRow?.qcm_completed) initialCompleted.push(3);
  if (progressRow?.eval_completed) initialCompleted.push(4);

  return (
    <RenforcementFlow
      matiereId={matiere}
      matiereName={matiereName}
      coursFiches={coursList.filter((c) => (c.fiches?.length ?? 0) > 0).map((c) => ({ id: c.id, titre: c.titre }))}
      coursFlashcards={coursList.filter((c) => (c.flashcards?.length ?? 0) > 0).map((c) => ({ id: c.id, titre: c.titre }))}
      qcmQuestions={qcmQuestions.map(mapQ)}
      evalQuestions={evalQuestions.map(mapQ)}
      initialCompleted={initialCompleted}
    />
  );
}
