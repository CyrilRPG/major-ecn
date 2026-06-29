import { notFound, redirect } from 'next/navigation';
import { Layers3 } from 'lucide-react';
import { requireUser, getProfessorScope, profPageReadGuard } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { FlashcardSession } from '@/components/flashcards/flashcard-session';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccess } from '@/lib/auth/formula-permissions';
import { canWrite } from '@/lib/schemas/professor';
import { DIFFICULTY_SCORE, type Difficulty } from '@/types/domain';

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
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  if (profile.role !== 'admin' && !(await fetchContentAccess(scope.offer)).flashcards) redirect(`/cours/${coursId}`);
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

  if (allCards.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState
            icon={Layers3}
            title="Pas encore de flashcards"
            description="Les flashcards arrivent dès que l’équipe pédagogique les a finalisées pour ce cours."
          />
        </div>
      </div>
    );
  }

  // Toutes les flashcards avec leur score cumulé (la session gère le filtrage).
  const input = allCards.map((c) => ({
    id: c.id,
    recto: c.recto,
    verso: c.verso,
    score: scoreMap.get(c.id) ?? 0,
  }));

  const profScope = profile.role === 'professor' ? getProfessorScope(profile.permission_scope) : null;
  const editable = profile.role === 'admin' || (profScope ? canWrite(profScope, 'flashcards') : false);

  return (
    <FlashcardSession
      cards={input}
      total={allCards.length}
      coursId={coursId}
      backHref={`/cours/${coursId}`}
      collegeName={c.titre}
      matiereName={c.matieres?.nom ?? undefined}
      editable={editable}
    />
  );
}
