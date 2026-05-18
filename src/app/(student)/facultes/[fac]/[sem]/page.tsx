import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function SemestrePage({ params }: { params: Promise<{ fac: string; sem: string }> }) {
  const { fac, sem } = await params;
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessFaculte(scope, fac)) redirect('/facultes');

  const supabase = await createClient();
  const [{ data: faculte }, { data: semestre }, { data: matieres }] = await Promise.all([
    supabase.from('facultes').select('id, nom').eq('id', fac).maybeSingle(),
    supabase.from('semestres').select('id, label, numero').eq('id', sem).eq('faculte_id', fac).maybeSingle(),
    supabase
      .from('matieres')
      .select('id, nom, icon_key, color_hex, order_index, cours(id, course_progress(video_watched, fiche_read))')
      .eq('semestre_id', sem)
      .order('order_index'),
  ]);

  if (!faculte || !semestre) notFound();

  const rows: IndexRow[] = (matieres ?? []).map((m) => {
    const coursCount = m.cours?.length ?? 0;
    const totalSteps = coursCount * 2;
    const doneSteps = (m.cours ?? []).reduce((acc, c) => {
      const cp = c.course_progress?.[0];
      return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }, 0);
    const progress = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
    return {
      id: m.id,
      href: `/matieres/${m.id}`,
      title: m.nom,
      subtitle: `${coursCount} cours`,
      leading: <RowIcon Icon={iconFromKey(m.icon_key)} color={m.color_hex ?? undefined} />,
      progress,
    };
  });

  return (
    <>
      <IndexHeader context={`${faculte.nom} · ${semestre.label}`} title="Matières" meta={`${rows.length} matière${rows.length > 1 ? 's' : ''}`} />
      <IndexList rows={rows} />
    </>
  );
}
