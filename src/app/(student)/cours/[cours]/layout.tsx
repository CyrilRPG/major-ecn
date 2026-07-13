import { notFound, redirect } from 'next/navigation';
import { requireUser, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { StudyConsole } from '@/components/student/study-console';
import { SplitViewProvider } from '@/components/student/split-view';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { canRead } from '@/lib/schemas/professor';

export default async function CoursLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cours: string }>;
}) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`
      id, titre, matiere_id, access_type,
      matieres(nom, access_type, semestres(label)),
      videos(storage_path),
      fiches(storage_path),
      qcm_series(type),
      flashcards(id),
      course_progress(video_watched, fiche_read)
    `)
    .eq('id', coursId)
    .maybeSingle();

  if (!c || !c.matieres || !c.matieres.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  const collegeAccess = (c.matieres as unknown as { access_type?: 'all' | 'specific' }).access_type ?? 'all';
  if (!canAccessCollege(scope, c.matiere_id, collegeAccess)) redirect('/facultes');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: saVids } = await (supabase as any)
    .from('videos').select('id').eq('cours_id', coursId).eq('type', 'seance_approfondie').limit(1);

  const availability = {
    video: (c.videos ?? []).some((v) => !!v.storage_path),
    fiche: (c.fiches ?? []).some((f) => !!f.storage_path),
    qcm: (c.qcm_series ?? []).some((s) => s.type === 'qcm'),
    flashcards: (c.flashcards?.length ?? 0) > 0,
    seanceApprofondie: (saVids ?? []).length > 0,
  };

  const isAdmin = profile.role === 'admin';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  const profScope = profile.role === 'professor' ? getProfessorScope(profile.permission_scope) : null;
  const visibility = profScope
    ? {
        fiche: canRead(profScope, 'fiche'),
        video: canRead(profScope, 'video'),
        qcm: canRead(profScope, 'qcm'),
        flashcards: canRead(profScope, 'flashcards'),
      }
    : undefined;
  const locked = (!isAdmin && !profScope && access) ? {
    fiche: !access.fiche,
    'fiche-express': !access.ficheExpress,
    video: !access.video,
    flashcards: !access.flashcards,
    'seance-approfondie': !access.seanceApprofondie,
  } as Partial<Record<string, boolean>> : undefined;

  const cp = c.course_progress?.[0];
  const [{ count: qcmCount }, { count: flashCount }] = await Promise.all([
    supabase
      .from('qcm_attempts')
      .select('id, qcm_questions!inner(qcm_series!inner(cours_id))', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('qcm_questions.qcm_series.cours_id', coursId),
    supabase
      .from('flashcard_reviews')
      .select('id, flashcards!inner(cours_id)', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('flashcards.cours_id', coursId),
  ]);

  let done = 0;
  let total = 0;
  if (!access || access.video) { total++; if (cp?.video_watched) done++; }
  if (!access || access.fiche) { total++; if (cp?.fiche_read) done++; }
  total++; if ((qcmCount ?? 0) > 0) done++;
  if (!access || access.flashcards) { total++; if ((flashCount ?? 0) > 0) done++; }
  const mastery = total > 0 ? Math.round((done / total) * 100) : 0;

  // Mode Découverte : l'onglet "Cours vidéo" devient un cadenas qui ouvre
  // LockedContentModal au lieu de naviguer vers /video.
  const isDecouverte = c.matiere_id === 'col-decouverte';

  // Notes for the split-view panel (best-effort, empty string if none)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: noteRow } = await (supabase as any)
    .from('course_notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .maybeSingle();

  return (
    <SplitViewProvider
      coursId={coursId}
      hasFiche={availability.fiche}
      hasVideo={availability.video}
      hasQcm={availability.qcm}
      hasFlashcards={availability.flashcards}
      hasSeanceApprofondie={availability.seanceApprofondie}
      locked={locked ?? {}}
      notesHtml={(noteRow?.content as string) ?? ''}
    >
      <StudyConsole
        coursId={coursId}
        titre={c.titre}
        context={`${c.matieres.nom} · Programme EVC`}
        availability={availability}
        mastery={mastery}
        isDecouverte={isDecouverte}
        visibility={visibility}
        locked={locked}
      >
        {children}
      </StudyConsole>
    </SplitViewProvider>
  );
}
