import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

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

  // Progression fiable = QCM distincts faits / QCM totaux par cours (agrégé par
  // matière), 85 % + couverture fiche/vidéo 15 %.
  const allCoursIds = (matieres ?? []).flatMap((m) => (m.cours ?? []).map((c) => c.id));
  const [{ data: qTotals }, { data: qDone }] = allCoursIds.length
    ? await Promise.all([
        supabase.from('qcm_questions').select('id, qcm_series!inner(cours_id, type)')
          .eq('qcm_series.type', 'qcm').in('qcm_series.cours_id', allCoursIds),
        supabase.from('qcm_attempts').select('question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id, type))')
          .eq('user_id', user.id).in('qcm_questions.qcm_series.cours_id', allCoursIds),
      ])
    : [{ data: [] }, { data: [] }];
  const qcmTotalByCours = new Map<string, number>();
  for (const r of (qTotals ?? []) as unknown as { qcm_series: { cours_id: string } }[]) {
    const cid = r.qcm_series?.cours_id; if (!cid) continue;
    qcmTotalByCours.set(cid, (qcmTotalByCours.get(cid) ?? 0) + 1);
  }
  const qcmDoneByCours = new Map<string, Set<string>>();
  for (const a of (qDone ?? []) as unknown as { question_id: string; qcm_questions: { qcm_series: { cours_id: string; type: string } } }[]) {
    const cid = a.qcm_questions?.qcm_series?.cours_id;
    if (!cid || a.qcm_questions?.qcm_series?.type !== 'qcm') continue;
    if (!qcmDoneByCours.has(cid)) qcmDoneByCours.set(cid, new Set());
    qcmDoneByCours.get(cid)!.add(a.question_id);
  }

  const rows: IndexRow[] = (matieres ?? []).map((m) => {
    const coursCount = m.cours?.length ?? 0;
    const coverageSteps = coursCount * 2;
    const coverageDone = (m.cours ?? []).reduce((acc, c) => {
      const cp = c.course_progress?.[0];
      return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
    }, 0);
    const coverageRatio = coverageSteps === 0 ? 0 : coverageDone / coverageSteps;
    let qcmTotal = 0, qcmDoneCount = 0;
    for (const c of m.cours ?? []) {
      const t = qcmTotalByCours.get(c.id) ?? 0;
      qcmTotal += t;
      qcmDoneCount += Math.min(qcmDoneByCours.get(c.id)?.size ?? 0, t);
    }
    const progress = qcmTotal > 0
      ? Math.round(Math.min(1, qcmDoneCount / qcmTotal) * 85 + coverageRatio * 15)
      : Math.round(coverageRatio * 100);
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
