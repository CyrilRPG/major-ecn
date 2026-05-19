import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Entraînement ciblé' };

type AttemptRow = {
  is_correct: boolean;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; semestres: { faculte_id: string } } } } };
};
type CollegeRow = { id: string; nom: string; order_index: number | null; cours?: { id: string }[] | null };

export default async function EntrainementPage() {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const [{ data: attemptsRaw }, { data: edn }] = await Promise.all([
    supabase
      .from('qcm_attempts')
      .select('is_correct, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, semestres!inner(faculte_id)))))')
      .eq('user_id', user.id),
    supabase
      .from('facultes')
      .select('semestres(matieres(id, nom, order_index, cours(id)))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
  ]);

  const perCollege = new Map<string, { total: number; correct: number }>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID) continue;
    const e = perCollege.get(m.id) ?? { total: 0, correct: 0 };
    e.total++;
    if (a.is_correct) e.correct++;
    perCollege.set(m.id, e);
  }

  const colleges = (
    ((edn as unknown as { semestres?: { matieres?: CollegeRow[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .filter((m) => canAccessCollege(scope, m.id) && (m.cours?.length ?? 0) > 0)
    .map((m) => {
      const p = perCollege.get(m.id);
      const rate = p && p.total > 0 ? Math.round((p.correct / p.total) * 100) : null;
      return { id: m.id, nom: m.nom, items: m.cours?.length ?? 0, rate };
    })
    .sort((a, b) => {
      const ra = a.rate ?? -1;
      const rb = b.rate ?? -1;
      return ra - rb; // jamais travaillé en premier, puis du plus faible au plus fort
    });

  const barColor = (v: number | null) =>
    v === null ? 'var(--color-sand-300)' : v < 50 ? '#E4002B' : v < 75 ? '#F59E0B' : '#22C55E';

  return (
    <div className="px-4 py-5 lg:px-8">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Target className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-(--color-ink)">Entraînement ciblé</h1>
          <p className="text-sm text-(--color-ink-soft)">
            Priorise les collèges où tu es le plus faible, du moins maîtrisé au plus maîtrisé.
          </p>
        </div>
      </header>

      <ul className="space-y-2.5">
        {colleges.map((c) => (
          <li key={c.id}>
            <Link
              href={`/matieres/${c.id}`}
              className="group flex items-center gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft) transition-colors hover:border-(--color-accent)"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold text-(--color-ink)">{c.nom}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-(--color-ink-soft)">
                    {c.rate === null ? 'Non travaillé' : `${c.rate}%`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--color-sand-200)">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.rate ?? 6}%`, background: barColor(c.rate) }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-(--color-ink-muted)">{c.items} item{c.items > 1 ? 's' : ''}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-(--color-primary) px-3.5 py-2 text-sm font-medium text-white">
                S’entraîner
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
        {colleges.length === 0 && (
          <li className="rounded-xl border border-(--color-border) bg-(--color-surface) p-8 text-center text-sm text-(--color-ink-muted)">
            Aucun collège accessible pour le moment.
          </li>
        )}
      </ul>
    </div>
  );
}
