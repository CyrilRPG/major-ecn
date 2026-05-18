import { notFound, redirect } from 'next/navigation';
import { Layers } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export default async function FacultePage({ params }: { params: Promise<{ fac: string }> }) {
  const { fac } = await params;
  const { profile } = await requireUser();
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

  const rows: IndexRow[] = (semestres ?? []).map((s) => {
    const matieresCount = s.matieres?.length ?? 0;
    const coursList = (s.matieres ?? []).flatMap((m) => m.cours ?? []);
    const totalSteps = coursList.length * 2;
    const doneSteps = coursList.reduce((acc, c) => {
      const cp = c.course_progress?.[0];
      return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }, 0);
    const progress = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
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
