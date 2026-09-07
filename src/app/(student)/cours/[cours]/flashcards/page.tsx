import { notFound, redirect } from 'next/navigation';
import { Layers3 } from 'lucide-react';
import { requireUser, canEditCoursContent, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { FlashcardSession } from '@/components/flashcards/flashcard-session';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { DIFFICULTY_SCORE, type Difficulty } from '@/types/domain';
import { StudentExercisesEntry } from '@/components/student/exercices/student-exercises-entry';
import { estTableAbsente } from '@/lib/student-exercises/regles';

export default async function FlashcardsPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (profile.role !== 'admin' && !canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccessForScope(scope)).flashcards) redirect(`/cours/${coursId}`);
  profPageReadGuard(profile, 'flashcards', `/cours/${coursId}`);

  const { data: cards } = await supabase
    .from('flashcards')
    .select('id, recto, verso, order_index')
    .eq('cours_id', coursId)
    .order('order_index');

  const allCards = cards ?? [];
  const cardIds = allCards.map((c) => c.id);
  const { data: reviews } = cardIds.length
    ? await supabase
        .from('flashcard_reviews')
        .select('flashcard_id, difficulty')
        .eq('user_id', user.id)
        .in('flashcard_id', cardIds)
    : { data: [] as { flashcard_id: string; difficulty: Difficulty }[] };

  // Cumulative mastery score per card (très facile +5, facile +3, difficile -3, très difficile -5).
  const scoreMap = new Map<string, number>();
  for (const r of reviews ?? []) {
    const delta = DIFFICULTY_SCORE[r.difficulty as Difficulty] ?? 0;
    scoreMap.set(r.flashcard_id, (scoreMap.get(r.flashcard_id) ?? 0) + delta);
  }

  // Entraînements personnels de l'élève sur cet item (table optionnelle tant
  // que la migration 20260907100000 n'est pas appliquée : on n'échoue jamais).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: mesFlashcards, error: mesErr } = await (supabase as any)
    .from('student_exercises').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('cours_id', coursId).eq('kind', 'flashcard');
  const entree = profile.role === 'student'
    ? <div className="mx-auto w-full max-w-4xl px-4 pt-4 lg:px-8"><StudentExercisesEntry coursId={coursId} kind="flashcard" count={mesFlashcards ?? 0} indisponible={estTableAbsente(mesErr)} /></div>
    : null;

  if (allCards.length === 0) {
    return (
      <>
        {entree}
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
            <EmptyState
              icon={Layers3}
              title="Pas encore de flashcards"
              description="Les flashcards arrivent dès que l’équipe pédagogique les a finalisées pour ce cours."
            />
          </div>
        </div>
      </>
    );
  }

  // Toutes les flashcards avec leur score cumulé (la session gère le filtrage).
  const input = allCards.map((c) => ({
    id: c.id,
    recto: c.recto,
    verso: c.verso,
    score: scoreMap.get(c.id) ?? 0,
  }));

  // Écriture « flashcards » ET item attribué au professeur (cf. prof-content-access).
  const editable = canEditCoursContent(profile, 'flashcards', c.matiere_id, c.id);

  return (
    <>
      {entree}
      <FlashcardSession
        cards={input}
        total={allCards.length}
        coursId={coursId}
        backHref={`/cours/${coursId}`}
        collegeName={c.titre}
        matiereName={c.matieres?.nom ?? undefined}
        editable={editable}
      />
    </>
  );
}
