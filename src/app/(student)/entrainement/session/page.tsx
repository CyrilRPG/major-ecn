import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { TargetedSession, type TQuestion } from '@/components/student/targeted-session';

const MAX_Q = 12;

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; semestres: { faculte_id: string } } } } };
};
type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  format: 'qcm' | 'qroc' | null;
  reponse_attendue: string | null;
  correction_generale: string | null;
  commentaire_enseignant: string | null;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean }[] | null;
  qcm_series: { cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};

export default async function TargetedSessionPage({
  searchParams,
}: { searchParams: Promise<{ colleges?: string }> }) {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const sp = await searchParams;
  const selected = sp.colleges?.split(',').filter(Boolean) ?? [];
  const collegeFilter: Set<string> | null = selected.length > 0 ? new Set(selected) : null;
  const supabase = await createClient();

  // 1. Fail counts per question (EDN scope)
  const { data: attemptsRaw } = await supabase
    .from('qcm_attempts')
    .select('question_id, is_correct, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, semestres!inner(faculte_id)))))')
    .eq('user_id', user.id);

  const failCount = new Map<string, number>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID || !canAccessCollege(scope, m.id)) continue;
    if (collegeFilter && !collegeFilter.has(m.id)) continue;
    if (!a.is_correct) failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
  }

  const prioritized = [...failCount.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id).slice(0, MAX_Q);

  // 2. Fetch full questions (prioritized + fill with EDN questions if needed)
  const { data: allQRaw } = await supabase
    .from('qcm_questions')
    .select('id, enonce, order_index, format, reponse_attendue, correction_generale, commentaire_enseignant, qcm_items(id, lettre, enonce, justification, is_correct), qcm_series!inner(cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))')
    .order('order_index');

  const allQ = ((allQRaw ?? []) as unknown as QRow[]).filter(
    (q) => q.qcm_series.cours.matieres.semestres.faculte_id === EDN_FACULTE_ID
      && canAccessCollege(scope, q.qcm_series.cours.matieres.id)
      && (!collegeFilter || collegeFilter.has(q.qcm_series.cours.matieres.id))
      // On garde les QCM (avec items) ET les QROC (saisie libre).
      && (q.format === 'qroc' || (!!q.qcm_items && q.qcm_items.length > 0)),
  );

  const byId = new Map(allQ.map((q) => [q.id, q]));
  const ordered: QRow[] = [];
  for (const id of prioritized) {
    const q = byId.get(id);
    if (q) ordered.push(q);
  }
  if (ordered.length < 8) {
    const picked = new Set(ordered.map((q) => q.id));
    for (const q of allQ) {
      if (ordered.length >= MAX_Q) break;
      if (!picked.has(q.id)) ordered.push(q);
    }
  }

  if (ordered.length === 0) redirect('/entrainement');

  const questions: TQuestion[] = ordered.slice(0, MAX_Q).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    college: q.qcm_series.cours.matieres.nom,
    format: q.format ?? 'qcm',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    commentaire_enseignant: q.commentaire_enseignant,
    items: [...(q.qcm_items ?? [])]
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  return <TargetedSession questions={questions} backHref="/entrainement" />;
}
