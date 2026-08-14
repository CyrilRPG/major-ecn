import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { InterrogationsManager } from './interrogations-manager';

export const metadata = { title: 'Interrogations de spécialité' };
export const dynamic = 'force-dynamic';

/**
 * Composition des interrogations OFFICIELLES de fin de spécialité (cahier des
 * charges §9) : 15 QCM + 2 questions ouvertes + mini-cas clinique éventuel,
 * créées par l'équipe pédagogique. Tant qu'une spécialité n'a pas
 * d'interrogation PUBLIÉE, les élèves qui la terminent restent en
 * « Validation en attente ».
 */
export default async function AdminInterrogationsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const [{ data: matsRaw }, { data: examsRaw }] = await Promise.all([
    a.from('matieres')
      .select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)')
      .eq('semestres.faculte_id', EDN_FACULTE_ID)
      .order('order_index'),
    a.from('mock_exams')
      .select('id, specialite_id, status, mock_exam_questions(count)')
      .not('specialite_id', 'is', null),
  ]);

  type MatRow = { id: string; nom: string; parent_matiere_id: string | null; order_index: number | null };
  type ExamRow = { id: string; specialite_id: string; status: string; mock_exam_questions: { count: number }[] | null };

  const exams = new Map<string, { id: string; status: string; nQuestions: number }>();
  for (const e of ((examsRaw ?? []) as ExamRow[])) {
    exams.set(e.specialite_id, {
      id: e.id,
      status: e.status,
      nQuestions: e.mock_exam_questions?.[0]?.count ?? 0,
    });
  }

  const colleges = ((matsRaw ?? []) as MatRow[]).map((m) => ({
    id: m.id,
    nom: m.nom,
    parentId: m.parent_matiere_id,
    exam: exams.get(m.id) ?? null,
  }));

  return <InterrogationsManager colleges={colleges} />;
}
