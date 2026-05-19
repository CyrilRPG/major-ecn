import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
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
  cours?: { course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null }[] | null;
};

export async function CollegesGrid({ scope }: { scope: PermissionScope }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('facultes')
    .select(
      `semestres(matieres(id, nom, icon_key, color_hex, order_index,
         cours(id, course_progress(video_watched, fiche_read))))`,
    )
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();

  const colleges = (
    ((data as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {colleges.map((m) => {
        const Icon = iconFromKey(m.icon_key);
        const cours = m.cours ?? [];
        const totalSteps = cours.length * 2;
        const done = cours.reduce((acc, c) => {
          const cp = c.course_progress?.[0];
          return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
        }, 0);
        const progress = totalSteps === 0 ? 0 : Math.round((done / totalSteps) * 100);
        return (
          <Link
            key={m.id}
            href={`/matieres/${m.id}`}
            className="group flex flex-col justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:border-(--color-accent) hover:shadow-(--shadow-lifted) focus-ring"
          >
            <div className="flex items-start justify-between">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-sand-100)"
                style={{ color: m.color_hex ?? 'var(--color-accent)' }}
              >
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
