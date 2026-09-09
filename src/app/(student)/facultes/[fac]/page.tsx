import { notFound, redirect } from 'next/navigation';
import { Layers } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';
import { calculerProgressionAgregee } from '@/lib/progress/course-progress';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';

export const dynamic = 'force-dynamic';

export default async function FacultePage({ params }: { params: Promise<{ fac: string }> }) {
  const { fac } = await params;
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessFaculte(scope, fac)) redirect('/facultes');

  const supabase = await createClient();
  const { data: faculte } = await supabase.from('facultes').select('id, nom, ville').eq('id', fac).maybeSingle();
  if (!faculte) notFound();

  const { data: semestres } = await supabase
    .from('semestres')
    .select('id, numero, label, matieres(id, cours(id, course_progress(video_watched, fiche_read)))')
    .eq('faculte_id', fac)
    .order('numero');

  // Progression : LA formule commune (lib/progress), agrégée par semestre —
  // questions accessibles pour la voie/formule de l'élève (85 %) + couverture
  // fiche/flashcards/vidéo (15 %).
  const progression = await chargerProgressionCours({
    userId: user.id,
    faculteId: fac,
    scope,
    staff: profile.role === 'admin',
    cours: (semestres ?? []).flatMap((s) => (s.matieres ?? []).flatMap((m) => m.cours ?? [])),
  });

  const rows: IndexRow[] = (semestres ?? []).map((s) => {
    const matieresCount = s.matieres?.length ?? 0;
    const coursList = (s.matieres ?? []).flatMap((m) => m.cours ?? []);
    const progress = calculerProgressionAgregee(
      coursList.flatMap((c) => progression.get(c.id)?.input ?? []),
    );
    return {
      id: s.id,
      href: `/facultes/${fac}/${s.id}`,
      title: s.label,
      subtitle: `${matieresCount} matière${matieresCount > 1 ? 's' : ''}`,
      leading: <RowIcon Icon={Layers} />,
      badge: `S${s.numero}`,
      progress,
    };
  });

  return (
    <>
      <IndexHeader context={faculte.ville} title={faculte.nom} meta="Semestres" />
      <IndexList rows={rows} />
    </>
  );
}
