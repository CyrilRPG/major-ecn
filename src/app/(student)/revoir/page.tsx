import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader } from '@/components/shell/index-view';
import { SavedQuestionsList, type SavedQuestion } from '@/components/student/saved-questions-list';

export const metadata = { title: 'Questions à revoir' };
export const dynamic = 'force-dynamic';

export default async function RevoirPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: rows } = await db
    .from('student_saved_questions')
    .select(
      'question_id, serie_id, cours_id, created_at, ' +
        'qcm_questions:question_id(enonce, format), ' +
        'qcm_series:serie_id(label), ' +
        'cours:cours_id(titre, matieres(nom))',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  type Row = {
    question_id: string;
    serie_id: string | null;
    cours_id: string | null;
    created_at: string;
    qcm_questions: { enonce: string; format: string | null } | null;
    qcm_series: { label: string } | null;
    cours: { titre: string; matieres: { nom: string } | null } | null;
  };

  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const questions: SavedQuestion[] = ((rows ?? []) as Row[])
    .filter((r) => r.cours_id && r.serie_id && r.qcm_questions)
    .map((r) => ({
      questionId: r.question_id,
      coursId: r.cours_id as string,
      serieId: r.serie_id as string,
      college: r.cours?.matieres?.nom ?? '',
      coursTitre: r.cours?.titre ?? 'Item inconnu',
      serieLabel: r.qcm_series?.label ?? '',
      format: (r.qcm_questions?.format as 'qcm' | 'qroc' | null) ?? 'qcm',
      preview: stripHtml(r.qcm_questions?.enonce ?? '').slice(0, 220),
      createdAt: r.created_at,
    }));

  return (
    <div>
      <IndexHeader
        context="Mes révisions"
        title="Questions à revoir"
        meta={questions.length > 0 ? `${questions.length} question${questions.length > 1 ? 's' : ''}` : undefined}
      />
      <div className="px-6 py-6 lg:px-10">
        <SavedQuestionsList questions={questions} />
      </div>
    </div>
  );
}
