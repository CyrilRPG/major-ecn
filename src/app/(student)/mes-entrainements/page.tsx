import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Layers3, PenLine, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Callout, HeroStat, StudentHero, StudentPage } from '@/components/student/ui/page-kit';
import { EmptyState } from '@/components/empty-state';
import { estTableAbsente, MESSAGE_TABLE_ABSENTE, lireExercice } from '@/lib/student-exercises/regles';

export const metadata = { title: 'Mes entraînements' };
export const dynamic = 'force-dynamic';

/**
 * Tableau de bord des entraînements personnels de l'élève, regroupés par
 * item. La création se fait depuis les pages Flashcards / QCM d'un item (le
 * contexte y est déjà connu) ; ici on retrouve, révise et gère.
 */
export default async function MesEntrainementsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('student_exercises')
    .select('id, user_id, cours_id, kind, recto, verso, enonce, items, correction_generale, status, published_flashcard_id, published_question_id, reviewed_at, review_note, created_at, updated_at, cours:cours_id(titre, matieres(nom, parent:parent_matiere_id(nom)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const indisponible = estTableAbsente(error);
  if (error && !indisponible) throw error;

  type Row = Record<string, unknown> & { cours: { titre: string; matieres: { nom: string; parent: { nom: string } | null } | null } | null };
  const parCours = new Map<string, { titre: string; college: string; flashcards: number; qcm: number; publies: number }>();
  for (const r of ((data ?? []) as Row[])) {
    const e = lireExercice(r);
    const m = r.cours?.matieres;
    const entree = parCours.get(e.cours_id) ?? { titre: r.cours?.titre ?? 'Item', college: m?.parent?.nom ?? m?.nom ?? '', flashcards: 0, qcm: 0, publies: 0 };
    if (e.kind === 'flashcard') entree.flashcards++; else entree.qcm++;
    if (e.status === 'published') entree.publies++;
    parCours.set(e.cours_id, entree);
  }
  const lignes = [...parCours.entries()];
  const total = lignes.reduce((n, [, l]) => n + l.flashcards + l.qcm, 0);
  const flashcards = lignes.reduce((n, [, l]) => n + l.flashcards, 0);
  const qcm = lignes.reduce((n, [, l]) => n + l.qcm, 0);

  return (
    <StudentPage>
      <StudentHero
        icon={PenLine}
        eyebrow="Vos créations"
        title="Mes entraînements"
        subtitle="Vos flashcards et QCM personnels, visibles de vous seul. L’équipe pédagogique peut proposer d’ajouter les meilleurs à la base commune."
        stats={total > 0 ? (
          <>
            <HeroStat icon={Layers3} value={flashcards} label={flashcards > 1 ? 'flashcards' : 'flashcard'} />
            <HeroStat icon={ClipboardCheck} value={qcm} label="QCM" />
            <HeroStat value={lignes.length} label={lignes.length > 1 ? 'items' : 'item'} />
          </>
        ) : undefined}
      />
      <div>
        <Callout icon={Sparkles} title="Créer un entraînement" className="mb-5">
          Ouvrez un item, puis <strong>Flashcards</strong> ou <strong>Dossiers progressifs &amp; QI</strong> : vos créations apparaissent ici, regroupées par item.
        </Callout>

        {indisponible ? (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
            <EmptyState icon={Sparkles} title="Bientôt disponible" description={MESSAGE_TABLE_ABSENTE} />
          </div>
        ) : lignes.length === 0 ? (
          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
            <EmptyState icon={Sparkles} title="Aucun entraînement personnel" description="Créez votre première flashcard ou votre premier QCM depuis un item." />
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {lignes.map(([coursId, l]) => (
              <li key={coursId}>
                <Link href={`/mes-entrainements/${coursId}`} className="group flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-(--color-ink-muted)">{l.college}</p>
                    <p className="truncate text-[15px] font-semibold text-(--color-ink)">{l.titre}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-(--color-ink-soft)">
                      <span className="inline-flex items-center gap-1"><Layers3 className="h-3.5 w-3.5" /> {l.flashcards} flashcard{l.flashcards > 1 ? 's' : ''}</span>
                      <span className="inline-flex items-center gap-1"><ClipboardCheck className="h-3.5 w-3.5" /> {l.qcm} QCM</span>
                      {l.publies > 0 && <span className="text-[#16793C]">{l.publies} dans la base commune</span>}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudentPage>
  );
}
