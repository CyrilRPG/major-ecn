import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { ParcoursTimeline } from '@/components/student/parcours-timeline';
import { ContentRefreshDialog } from '@/components/student/content-refresh-dialog';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function CoursParcoursPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, description, matiere_id,
      matieres(id, nom, color_hex, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))),
      videos(id, storage_path),
      fiches(id, storage_path),
      qcm_series(id, type),
      flashcards(id),
      course_progress(video_watched, fiche_read)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres || !c.matieres.semestres) notFound();
  const facId = c.matieres.semestres.faculte_id;
  const scope = parseScope(profile.permission_scope);
  if (!canAccessFaculte(scope, facId)) redirect('/facultes');

  // Mark last_seen_at
  await supabase
    .from('course_progress')
    .upsert(
      { user_id: user.id, cours_id: coursId, last_seen_at: new Date().toISOString() },
      { onConflict: 'user_id,cours_id', ignoreDuplicates: false },
    );

  const progress = c.course_progress?.[0];
  const hasVideo = (c.videos ?? []).some((v) => !!v.storage_path);
  const hasFiche = (c.fiches ?? []).some((f) => !!f.storage_path);
  const hasQcm = (c.qcm_series ?? []).some((s) => s.type === 'qcm');
  const hasAnnales = (c.qcm_series ?? []).some((s) => s.type === 'annale');
  const hasFlashcards = (c.flashcards?.length ?? 0) > 0;

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.semestres.facultes?.nom ?? '', href: `/facultes/${facId}` },
          { label: c.matieres.semestres.label, href: `/facultes/${facId}/${c.matieres.semestre_id}` },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre },
        ]}
      />
      <main className="mx-auto w-full max-w-3xl px-6 lg:px-8 py-14">
        <header className="mb-12">
          <p className="eyebrow">{c.matieres.nom} · {c.matieres.semestres.label}</p>
          <h1 className="mt-2 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            {c.titre}
          </h1>
          {c.description && (
            <p className="mt-4 max-w-2xl text-(--color-ink-soft) leading-relaxed text-pretty text-base md:text-lg">
              {c.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-(--color-border) bg-(--color-surface) px-4 py-1.5 text-xs text-(--color-ink-soft)">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-accent) opacity-60 animate-[pulse-soft_2s_ease-in-out_infinite]" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-(--color-accent)" />
              </span>
              Parcours en 3 étapes : vidéo, fiche, entraînement
            </div>
            <ContentRefreshDialog coursId={coursId} coursTitre={c.titre} />
          </div>
        </header>

        <ParcoursTimeline
          coursId={coursId}
          videoDone={!!progress?.video_watched}
          ficheDone={!!progress?.fiche_read}
          hasVideo={hasVideo}
          hasFiche={hasFiche}
          hasQcm={hasQcm}
          hasAnnales={hasAnnales}
          hasFlashcards={hasFlashcards}
        />
      </main>
    </>
  );
}
