import { notFound, redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EmptyState } from '@/components/empty-state';
import { StudentExercisesTrainer } from '@/components/student/exercices/student-exercises-trainer';
import { estTableAbsente, MESSAGE_TABLE_ABSENTE, lireExercice } from '@/lib/student-exercises/regles';

export const dynamic = 'force-dynamic';

/** Espace d'entraînement personnel de l'élève sur UN item. */
export default async function MesEntrainementsCoursPage({ params, searchParams }: {
  params: Promise<{ cours: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { cours: coursId } = await params;
  const { onglet } = await searchParams;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c, error: coursError } = await supabase
    .from('cours').select('id, titre, matiere_id').eq('id', coursId).maybeSingle();
  if (coursError) throw coursError;
  if (!c) notFound();
  const scope = parseScope(profile.permission_scope);
  if (profile.role !== 'admin' && !canAccessCollege(scope, c.matiere_id)) redirect('/facultes');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('student_exercises')
    .select('id, user_id, cours_id, kind, recto, verso, enonce, items, correction_generale, status, published_flashcard_id, published_question_id, reviewed_at, review_note, created_at, updated_at')
    .eq('user_id', user.id).eq('cours_id', coursId)
    .order('created_at', { ascending: true });
  if (error && !estTableAbsente(error)) throw error;
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState icon={Sparkles} title="Bientôt disponible" description={MESSAGE_TABLE_ABSENTE} />
        </div>
      </div>
    );
  }

  return (
    <StudentExercisesTrainer
      coursId={coursId}
      coursTitre={c.titre}
      exercices={((data ?? []) as Record<string, unknown>[]).map(lireExercice)}
      backHref={`/cours/${coursId}`}
      ongletInitial={onglet === 'qcm' ? 'qcm' : 'flashcards'}
    />
  );
}
