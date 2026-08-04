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
import { estTitreRevisions } from '@/lib/videos/revisions';
import { videoVisible, supportVisible, eleveAutorise, eleveExclu } from '@/lib/videos/audience';
import { scopeOffers } from '@/lib/auth/permissions';

/** Ligne `videos` telle que sélectionnée ci-dessous (types générés incomplets). */
type CourseVideoRow = {
  id: string;
  titre: string;
  type: string | null;
  storage_path: string | null;
  bunny_video_id: string | null;
  order_index: number | null;
  voies: string[] | null;
  offers: string[] | null;
  denied_user_ids: string[] | null;
  allowed_user_ids: string[] | null;
  /** Supports PDF rattachés (plusieurs possibles), avec leurs permissions propres. */
  video_supports?: { id: string; titre: string; order_index: number; voies: string[] | null; offers: string[] | null }[] | null;
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
      videos(id, titre, type, storage_path, bunny_video_id, order_index, voies, offers, denied_user_ids, allowed_user_ids, video_supports(id, titre, order_index, voies, offers)),
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
  // L'autorisation nominative d'une vidéo contourne l'accès normal au collège
  // et à l'item : si au moins une vidéo de ce cours cite l'élève dans son
  // `allowed_user_ids` (sans l'exclure), on le laisse ouvrir la page pour
  // qu'il accède au contenu qui lui est destiné. L'exclusion prime toujours.
  const videosRow = (c.videos ?? []) as unknown as CourseVideoRow[];
  const autoriseParVideo = videosRow.some(
    (v) => eleveAutorise(v, user.id) && !eleveExclu(v, user.id),
  );
  if (!canAccessCollege(scope, c.matiere_id, collegeAccess) && !autoriseParVideo) redirect('/facultes');

  const isAdmin = profile.role === 'admin';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);

  // Les vidéos d'un item sont multiples et ordonnées, avec des supports PDF
  // facultatifs. L'AUDIENCE est portée par la vidéo elle-même (voies de
  // concours + formules cochées à l'ajout) ; le droit global de la formule ne
  // sert que de repli pour une vidéo sans ciblage explicite.
  const videos = videosRow
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const hasSource = (v: CourseVideoRow) => !!v.bunny_video_id || !!v.storage_path;
  const offresEleve = scopeOffers(scope);
  const droitFormulePour = (v: CourseVideoRow) =>
    v.type === 'seance_approfondie' ? (!access || access.seanceApprofondie) : (!access || access.video);
  const visible = (v: CourseVideoRow, droitFormule: boolean) =>
    isAdmin || videoVisible(v, { offres: offresEleve, voie: scope.voie ?? null, droitFormule, userId: user.id });
  const coursVideos = videos.filter(
    (v) => (v.type ?? 'cours') === 'cours' && visible(v, !access || access.video),
  );
  const seanceVideos = videos.filter(
    (v) => v.type === 'seance_approfondie' && visible(v, !access || access.seanceApprofondie),
  );
  // Supports visibles PAR SUPPORT : chacun porte ses permissions propres le cas
  // échéant (sinon celles de la vidéo), plus l'exclusion nominative de la séance.
  const supportsVisibles = (v: CourseVideoRow) =>
    (v.video_supports ?? []).filter((d) => isAdmin || supportVisible(d, v, {
      offres: offresEleve, voie: scope.voie ?? null, droitFormule: droitFormulePour(v), userId: user.id,
    }));

  const availability = {
    video: coursVideos.some(hasSource),
    fiche: (c.fiches ?? []).some((f) => !!f.storage_path),
    // La page « DP · QI » liste les séries QCM **et** les séances du professeur :
    // l'onglet doit suivre le même critère, sinon un item qui n'a que des
    // séances passerait pour vide alors que la page a du contenu.
    qcm: (c.qcm_series ?? []).some((s) => s.type === 'qcm' || s.type === 'seance'),
    flashcards: (c.flashcards?.length ?? 0) > 0,
    seanceApprofondie: seanceVideos.length > 0,
  };

  // Un onglet par vidéo VISIBLE ayant au moins un support visible pour l'élève.
  // Les permissions propres d'un support « répercutent » ici : un support plus
  // restreint que sa vidéo peut disparaître pour l'élève même si la vidéo reste.
  const supportsAll: CourseSupport[] = [...seanceVideos, ...coursVideos]
    .filter((v) => supportsVisibles(v).length > 0)
    .map((v) => ({
      videoId: v.id,
      titre: v.titre,
      type: (v.type ?? 'cours') as CourseSupport['type'],
    }));

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
  // Item de révisions : un bloc sans contenu n'a pas de raison d'exister. On le
  // retire complètement au lieu d'afficher une pastille « bientôt disponible »
  // (ces items ne portent souvent qu'un seul type de contenu).
  const estRevisions = estTitreRevisions(c.titre);
  const blocsVides: Record<string, boolean> = estRevisions
    ? {
        ...(availability.fiche ? {} : { fiche: false, 'fiche-express': false }),
        ...(availability.qcm ? {} : { qcm: false }),
        ...(availability.flashcards ? {} : { flashcards: false }),
        ...(availability.video ? {} : { video: false }),
      }
    : {};

  const visibility = (profVisibility || hiddenBlocks.length > 0 || Object.keys(blocsVides).length > 0)
    ? { ...(profVisibility ?? {}), ...blocsVides, ...hiddenBlocksVisibility(hiddenBlocks) }
    : undefined;
  // Cadenas : le droit de la formule ne suffit plus à trancher — une vidéo peut
  // cibler explicitement la formule de l'élève. Dès qu'un contenu lui est
  // destiné, le bloc s'ouvre.
  const locked = (!isAdmin && !profScope && access) ? {
    fiche: !access.fiche,
    'fiche-express': !access.ficheExpress,
    video: !access.video && coursVideos.length === 0,
    flashcards: !access.flashcards,
    'seance-approfondie': !access.seanceApprofondie && seanceVideos.length === 0,
  } as Partial<Record<string, boolean>> : undefined;

  // `supportsAll` est déjà filtré par la visibilité propre de chaque support.
  const supports = supportsAll;

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
