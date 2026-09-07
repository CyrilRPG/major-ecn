/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sparkles } from 'lucide-react';
import { requireStaff, canEditCoursContent, canViewCoursContent } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmptyState } from '@/components/empty-state';
import { StudentExercisesTable, type FiltreStatut, type StudentExerciseRow } from '@/components/admin/student-exercises/student-exercises-table';
import { estTableAbsente, MESSAGE_TABLE_ABSENTE, lireExercice } from '@/lib/student-exercises/regles';

export const metadata = { title: 'Entraînements d’élèves' };
export const dynamic = 'force-dynamic';

/**
 * « Entraînements d'élèves » — file de relecture des flashcards et QCM créés
 * par les élèves, pour l'admin et les professeurs.
 *
 * Lecture par le client service-role puis filtrage en application : un
 * professeur ne voit que les items de son périmètre en lecture
 * (`canViewCoursContent`) et n'agit que là où il a le droit d'écriture
 * (`canEditCoursContent`) — même règle que « Contenu ».
 */
export default async function EntrainementsElevesPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { profile, isAdmin } = await requireStaff();
  const sp = await searchParams;
  const filtre: FiltreStatut = (['private', 'published', 'rejected', 'all'] as const).includes(sp.statut as FiltreStatut) ? (sp.statut as FiltreStatut) : 'private';

  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('student_exercises')
    .select('id, user_id, cours_id, kind, recto, verso, enonce, items, correction_generale, status, published_flashcard_id, published_question_id, reviewed_at, review_note, created_at, updated_at, '
      + 'profiles:user_id(first_name, last_name, email, pseudo), '
      + 'cours:cours_id(id, titre, matiere_id, matieres(nom, parent:parent_matiere_id(nom)))')
    .order('created_at', { ascending: false })
    .limit(500);

  const indisponible = estTableAbsente(error);
  if (error && !indisponible) throw error;

  type Row = Record<string, unknown> & {
    profiles: { first_name: string | null; last_name: string | null; email: string | null; pseudo: string | null } | null;
    cours: { id: string; titre: string; matiere_id: string; matieres: { nom: string; parent: { nom: string } | null } | null } | null;
  };

  const toutes: StudentExerciseRow[] = ((data ?? []) as Row[])
    .filter((r) => r.cours)
    .map((r) => {
      const e = lireExercice(r);
      const type = e.kind === 'flashcard' ? 'flashcards' : 'qcm';
      const cours = r.cours as NonNullable<Row['cours']>;
      const m = cours.matieres;
      const nom = [r.profiles?.first_name, r.profiles?.last_name].filter(Boolean).join(' ').trim() || r.profiles?.pseudo || 'Élève';
      return {
        ...e,
        eleve: { nom, email: r.profiles?.email ?? null },
        cours: { id: cours.id, titre: cours.titre, college: m?.parent?.nom ? `${m.parent.nom} › ${m.nom}` : (m?.nom ?? '') },
        peutAgir: isAdmin || canEditCoursContent(profile, type, cours.matiere_id, cours.id),
        visible: isAdmin || canViewCoursContent(profile, type, cours.matiere_id, cours.id),
      } as StudentExerciseRow & { visible: boolean };
    })
    .filter((r) => (r as StudentExerciseRow & { visible: boolean }).visible);

  const compteurs: Record<FiltreStatut, number> = {
    private: toutes.filter((r) => r.status === 'private').length,
    published: toutes.filter((r) => r.status === 'published').length,
    rejected: toutes.filter((r) => r.status === 'rejected').length,
    all: toutes.length,
  };
  const rows = filtre === 'all' ? toutes : toutes.filter((r) => r.status === filtre);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-(--color-border) pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration · Pédagogie</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Entraînements d’élèves</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">
            Flashcards et QCM créés par les élèves pour leur propre entraînement. Ajoutez les meilleurs à la base commune de l’item en un clic :
            la flashcard rejoint les flashcards du cours, le QCM une série « Entraînement · Propositions d’élèves ».
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FAF5FF] px-3 py-1.5 text-xs font-semibold text-[#6D28D9]"><Sparkles className="h-4 w-4" /> {compteurs.private} à examiner</span>
      </header>

      {indisponible ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState icon={Sparkles} title="Base de données à mettre à jour" description={MESSAGE_TABLE_ABSENTE} />
        </div>
      ) : (
        <StudentExercisesTable rows={rows} filtre={filtre} compteurs={compteurs} />
      )}
    </main>
  );
}
