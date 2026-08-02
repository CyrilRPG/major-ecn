import { notFound, redirect } from 'next/navigation';
import { requireUser, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { StudyConsole } from '@/components/student/study-console';
import { SplitViewProvider } from '@/components/student/split-view';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { canRead } from '@/lib/schemas/professor';
import type { CourseSupport } from '@/lib/student/supports';
import { hiddenBlocksVisibility, parseHiddenBlocks } from '@/lib/student/blocs';

/** Ligne `videos` telle que sélectionnée ci-dessous (types générés incomplets). */
type CourseVideoRow = {
  id: string;
  titre: string;
  type: string | null;
  storage_path: string | null;
  bunny_video_id: string | null;
  order_index: number | null;
  /** Supports PDF rattachés (plusieurs possibles). */
  video_supports?: { id: string }[] | null;
};

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
      id, titre, matiere_id, access_type, hidden_blocks,
      matieres(nom, access_type, semestres(label)),
      videos(id, titre, type, storage_path, bunny_video_id, order_index, video_supports(id)),
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

  // Les vidéos d'un item sont désormais multiples et ordonnées, avec un support
  // PDF facultatif par vidéo. Le TYPE porte la permission : `cours` (Formule
  // Intensive) vs `seance_approfondie` (Programme Approfondi).
  const videos = ((c.videos ?? []) as unknown as CourseVideoRow[])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const hasSource = (v: CourseVideoRow) => !!v.bunny_video_id || !!v.storage_path;
  const coursVideos = videos.filter((v) => (v.type ?? 'cours') === 'cours');
  const seanceVideos = videos.filter((v) => v.type === 'seance_approfondie');

  const availability = {
    video: coursVideos.some(hasSource),
    fiche: (c.fiches ?? []).some((f) => !!f.storage_path),
    qcm: (c.qcm_series ?? []).some((s) => s.type === 'qcm'),
    flashcards: (c.flashcards?.length ?? 0) > 0,
    seanceApprofondie: seanceVideos.length > 0,
  };

  // Un onglet par support, rangé juste après l'onglet de sa vidéo.
  const supportsAll: CourseSupport[] = [...seanceVideos, ...coursVideos]
    .filter((v) => (v.video_supports ?? []).length > 0)
    .map((v) => ({
      videoId: v.id,
      titre: v.titre,
      type: (v.type ?? 'cours') as CourseSupport['type'],
    }));

  const isAdmin = profile.role === 'admin';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  const profScope = profile.role === 'professor' ? getProfessorScope(profile.permission_scope) : null;
  // Blocs masqués pour cet item par l'administration (choix d'affichage, pas
  // une permission) : ils disparaissent des onglets ET de l'aperçu.
  const hiddenBlocks = parseHiddenBlocks((c as unknown as { hidden_blocks?: unknown }).hidden_blocks);
  const profVisibility = profScope
    ? {
        fiche: canRead(profScope, 'fiche'),
        video: canRead(profScope, 'video'),
        qcm: canRead(profScope, 'qcm'),
        flashcards: canRead(profScope, 'flashcards'),
      }
    : undefined;
  const visibility = (profVisibility || hiddenBlocks.length > 0)
    ? { ...(profVisibility ?? {}), ...hiddenBlocksVisibility(hiddenBlocks) }
    : undefined;
  const locked = (!isAdmin && !profScope && access) ? {
    fiche: !access.fiche,
    'fiche-express': !access.ficheExpress,
    video: !access.video,
    flashcards: !access.flashcards,
    'seance-approfondie': !access.seanceApprofondie,
  } as Partial<Record<string, boolean>> : undefined;

  // Le support hérite de la permission de SA vidéo : sans la formule, l'onglet
  // n'apparaît pas du tout (et la route du PDF refuserait de toute façon).
  const supports = supportsAll.filter((s) =>
    !access || (s.type === 'seance_approfondie' ? access.seanceApprofondie : access.video),
  );

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
      supports={supports}
      hiddenBlocks={hiddenBlocks}
      locked={locked ?? {}}
      notesHtml={(noteRow?.content as string) ?? ''}
    >
      <StudyConsole
        coursId={coursId}
        titre={c.titre}
        context={`${c.matieres.nom} · Programme EVC`}
        availability={availability}
        supports={supports}
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
