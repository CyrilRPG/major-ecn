import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { StudyConsole } from '@/components/student/study-console';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

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

  const availability = {
    video: (c.videos ?? []).some((v) => !!v.storage_path),
    fiche: (c.fiches ?? []).some((f) => !!f.storage_path),
    qcm: (c.qcm_series ?? []).some((s) => s.type === 'qcm'),
    flashcards: (c.flashcards?.length ?? 0) > 0,
  };

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

  const done =
    (cp?.video_watched ? 1 : 0) +
    (cp?.fiche_read ? 1 : 0) +
    ((qcmCount ?? 0) > 0 ? 1 : 0) +
    ((flashCount ?? 0) > 0 ? 1 : 0);
  const mastery = Math.round((done / 4) * 100);

  return (
    <StudyConsole
      coursId={coursId}
      titre={c.titre}
      context={`${c.matieres.nom} · Programme EVC`}
      availability={availability}
      mastery={mastery}
    >
      {children}
    </StudyConsole>
  );
}
