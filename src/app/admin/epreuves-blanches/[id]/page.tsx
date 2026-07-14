import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { ExamEditor, type ExamData, type ExamQuestionData, type CollegeOption } from '@/components/admin/epreuves/exam-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Éditer une épreuve' };

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'];

export default async function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: exam } = await a.from('mock_exams').select('*').eq('id', id).maybeSingle();
  if (!exam) notFound();

  const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index');
  const { data: colsRaw } = await a.from('matieres').select('id, nom, parent_matiere_id').order('nom');

  const colleges: CollegeOption[] = ((colsRaw ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[])
    .map((c) => ({ id: c.id, nom: c.nom, parentId: c.parent_matiere_id }));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/epreuves-blanches" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-4 w-4" /> Toutes les épreuves
      </Link>
      <ExamEditor
        exam={exam as ExamData}
        questions={(qs ?? []) as ExamQuestionData[]}
        colleges={colleges}
        promos={PROMOS}
      />
    </main>
  );
}
