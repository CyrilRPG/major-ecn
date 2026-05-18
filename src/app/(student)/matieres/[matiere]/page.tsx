import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { StaggerList } from '@/components/stagger-list';
import { CoursCard } from '@/components/student/cours-card';
import { iconFromKey } from '@/lib/icons';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function MatierePage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase
    .from('matieres')
    .select('id, nom, color_hex, icon_key, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))')
    .eq('id', matiere)
    .maybeSingle();

  if (!m || !m.semestres) notFound();
  const facId = m.semestres.faculte_id;
  const scope = parseScope(profile.permission_scope);
  if (!canAccessFaculte(scope, facId)) redirect('/facultes');

  const { data: cours } = await supabase
    .from('cours')
    .select('id, titre, description, order_index, course_progress(video_watched, fiche_read), qcm_series(id), flashcards(id)')
    .eq('matiere_id', matiere)
    .order('order_index');

  const coursIds = (cours ?? []).map((c) => c.id);
  const { data: attempts } = coursIds.length
    ? await supabase
        .from('qcm_attempts')
        .select('id, question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id))')
        .eq('user_id', user.id)
        .in('qcm_questions.qcm_series.cours_id', coursIds)
    : { data: [] as unknown as { question_id: string; qcm_questions: { qcm_series: { cours_id: string } } }[] };

  const { data: reviews } = coursIds.length
    ? await supabase
        .from('flashcard_reviews')
        .select('id, flashcard_id, flashcards!inner(cours_id)')
        .eq('user_id', user.id)
        .in('flashcards.cours_id', coursIds)
    : { data: [] as unknown as { flashcards: { cours_id: string } }[] };

  const coursQcmHit = new Set<string>();
  for (const a of attempts ?? []) coursQcmHit.add(a.qcm_questions.qcm_series.cours_id);
  const coursFlashHit = new Set<string>();
  for (const r of reviews ?? []) coursFlashHit.add(r.flashcards.cours_id);

  const Icon = iconFromKey(m.icon_key);
  const facNom = m.semestres.facultes?.nom ?? '';

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: facNom, href: `/facultes/${facId}` },
          { label: m.semestres.label, href: `/facultes/${facId}/${m.semestre_id}` },
          { label: m.nom },
        ]}
      />
      <main className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-14">
        <header className="mb-12 flex items-end gap-6 flex-wrap">
          <div className="flex items-center gap-6">
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl shrink-0 shadow-(--shadow-soft)"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${m.color_hex} 28%, var(--color-surface)) 0%, color-mix(in srgb, ${m.color_hex} 10%, var(--color-surface)) 100%)`,
                color: m.color_hex,
                border: `1px solid color-mix(in srgb, ${m.color_hex} 35%, transparent)`,
              }}
            >
              <Icon className="h-10 w-10" />
            </div>
            <div>
              <p className="eyebrow">Matière</p>
              <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
                {m.nom}
              </h1>
              <p className="mt-2 text-sm text-(--color-ink-soft)">
                {(cours ?? []).length} cours dans cette matière.
              </p>
            </div>
          </div>
        </header>

        <StaggerList className="space-y-4">
          {(cours ?? []).map((c, idx) => {
            const progress = c.course_progress?.[0];
            const hasContent = (c.qcm_series?.length ?? 0) > 0 || (c.flashcards?.length ?? 0) > 0;
            const isNew = hasContent && !progress;
            const state = {
              videoWatched: !!progress?.video_watched,
              ficheRead: !!progress?.fiche_read,
              qcmAttempted: coursQcmHit.has(c.id),
              flashcardsReviewed: coursFlashHit.has(c.id),
            };
            return (
              <CoursCard
                key={c.id}
                cours={{
                  id: c.id,
                  titre: c.titre,
                  description: c.description,
                  orderIndex: idx + 1,
                  state,
                  hasContent,
                  isNew,
                }}
              />
            );
          })}
        </StaggerList>
      </main>
    </>
  );
}
