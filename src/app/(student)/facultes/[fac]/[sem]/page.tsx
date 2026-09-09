import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';
import { calculerProgressionAgregee } from '@/lib/progress/course-progress';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';

export default async function SemestrePage({ params }: { params: Promise<{ fac: string; sem: string }> }) {
  const { fac, sem } = await params;
  const { user, profile } = await requireUser();
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

  // Progression : LA formule commune (lib/progress), agrégée par matière —
  // questions accessibles pour la voie/formule de l'élève (85 %) + couverture
  // fiche/flashcards/vidéo (15 %).
  const progression = await chargerProgressionCours({
    userId: user.id,
    faculteId: fac,
    scope,
    staff: profile.role === 'admin',
    cours: (matieres ?? []).flatMap((m) => m.cours ?? []),
  });

  const rows: IndexRow[] = (matieres ?? []).map((m) => {
    const coursCount = m.cours?.length ?? 0;
    const progress = calculerProgressionAgregee(
      (m.cours ?? []).flatMap((c) => progression.get(c.id)?.input ?? []),
    );
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
