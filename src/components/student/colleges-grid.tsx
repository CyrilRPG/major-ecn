import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getVerifiedUserId } from '@/lib/auth/verified-user';
import { iconFromKey } from '@/lib/icons';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { canAccessCollege } from '@/lib/auth/permissions';
import type { PermissionScope } from '@/types/domain';

type CollegeRow = {
  id: string;
  nom: string;
  icon_key: string | null;
  color_hex: string | null;
  order_index: number | null;
  parent_matiere_id: string | null;
  cours?: { id: string; course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null;
};

export async function CollegesGrid({ scope, isAdmin = false }: {
  scope: PermissionScope;
  /** L'administration voit tous les collèges, quelle que soit sa portée. */
  isAdmin?: boolean;
}) {
  const supabase = await createClient();
  const [{ data }, userId] = await Promise.all([
    supabase
      .from('facultes')
      .select(
        `semestres(matieres(id, nom, icon_key, color_hex, order_index, parent_matiere_id,
           cours(id, course_progress(video_watched, fiche_read))))`,
      )
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
    getVerifiedUserId(supabase),
  ]);

  const colleges = (
    ((data as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => !m.parent_matiere_id && (isAdmin || canAccessCollege(scope, m.id)))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  // Progression fiable = QCM distincts faits / QCM totaux (85 %) + couverture (15 %).
  const allCoursIds = colleges.flatMap((m) => (m.cours ?? []).map((c) => c.id));
  const [{ data: qTotals }, { data: qDone }] = allCoursIds.length
    ? await Promise.all([
        supabase.from('qcm_questions').select('id, qcm_series!inner(cours_id, type)')
          .eq('qcm_series.type', 'qcm').in('qcm_series.cours_id', allCoursIds),
        userId
          ? supabase.from('qcm_attempts').select('question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id, type))')
              .eq('user_id', userId).in('qcm_questions.qcm_series.cours_id', allCoursIds)
          : Promise.resolve({ data: [] }),
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {colleges.map((m) => {
        const Icon = iconFromKey(m.icon_key);
        const cours = m.cours ?? [];
        const coverageSteps = cours.length * 2;
        const coverageDone = cours.reduce((acc, c) => {
          const cp = c.course_progress?.[0];
          return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
        }, 0);
        const coverageRatio = coverageSteps === 0 ? 0 : coverageDone / coverageSteps;
        let qcmTotal = 0, qcmDoneCount = 0;
        for (const c of cours) {
          const t = qcmTotalByCours.get(c.id) ?? 0;
          qcmTotal += t;
          qcmDoneCount += Math.min(qcmDoneByCours.get(c.id)?.size ?? 0, t);
        }
        const progress = qcmTotal > 0
          ? Math.round(Math.min(1, qcmDoneCount / qcmTotal) * 85 + coverageRatio * 15)
          : Math.round(coverageRatio * 100);
        return (
          <Link
            key={m.id}
            href={`/matieres/${m.id}`}
            className="group flex flex-col justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-lifted) focus-ring"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-primary) text-white">
                <Icon className="h-6 w-6" />
              </span>
              <ArrowRight className="h-4 w-4 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
            </div>
            <div className="mt-5">
              <h2 className="font-semibold text-(--color-ink)">{m.nom}</h2>
              <p className="mt-0.5 text-xs text-(--color-ink-muted)">
                {cours.length} item{cours.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-sand-200)">
                <div className="h-full rounded-full bg-(--color-accent)" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs tabular-nums text-(--color-ink-muted)">{progress}%</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
