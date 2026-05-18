import { notFound, redirect } from 'next/navigation';
import { Layers3 } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/empty-state';
import { FlashcardSession } from '@/components/flashcards/flashcard-session';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

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
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

  const { data: cards } = await supabase
    .from('flashcards')
    .select('id, recto, verso, order_index')
    .eq('cours_id', coursId)
    .order('order_index');

  const cardIds = (cards ?? []).map((c) => c.id);
  const { data: reviews } = cardIds.length
    ? await supabase
        .from('flashcard_reviews')
        .select('flashcard_id, weight, reviewed_at')
        .eq('user_id', user.id)
        .in('flashcard_id', cardIds)
        .order('reviewed_at', { ascending: false })
    : { data: [] as { flashcard_id: string; weight: number }[] };

  const lastWeightMap = new Map<string, number>();
  for (const r of reviews ?? []) {
    if (!lastWeightMap.has(r.flashcard_id)) lastWeightMap.set(r.flashcard_id, r.weight);
  }

  const input = (cards ?? []).map((c) => ({
    id: c.id,
    recto: c.recto,
    verso: c.verso,
    lastWeight: lastWeightMap.get(c.id) ?? null,
  }));

  if (input.length === 0) {
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

  return <FlashcardSession cards={input} coursId={coursId} backHref={`/cours/${coursId}`} />;
}
