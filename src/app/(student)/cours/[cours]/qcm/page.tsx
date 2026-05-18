import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function CoursQcmListPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  if (!c || !c.matieres?.semestres) notFound();
  if (!canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');

  const { data: series } = await supabase
    .from('qcm_series')
    .select('id, label, order_index, qcm_questions(id)')
    .eq('cours_id', coursId)
    .eq('type', 'qcm')
    .order('order_index');

  const { data: sessions } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, score_correct, score_total, finished_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  const lastBySerie = new Map<string, { score_correct: number; score_total: number }>();
  for (const s of sessions ?? []) {
    if (!s.finished_at) continue;
    if (!lastBySerie.has(s.serie_id)) lastBySerie.set(s.serie_id, { score_correct: s.score_correct, score_total: s.score_total });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
      <p className="mb-4 text-sm text-(--color-ink-soft)">
        Chaque proposition est corrigée et justifiée immédiatement, au format EDN.
      </p>

      {!series || series.length === 0 ? (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState
            icon={ClipboardCheck}
            title="Pas encore de dossiers progressifs"
            description="Les séries de ce cours sont en cours de rédaction."
          />
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
          {series.map((s, idx) => {
            const lr = lastBySerie.get(s.id);
            const qCount = s.qcm_questions?.length ?? 0;
            return (
              <li key={s.id}>
                <Link
                  href={`/cours/${coursId}/qcm/${s.id}`}
                  className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-(--color-sand-100) focus-ring"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) font-mono text-xs font-semibold text-(--color-primary)">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--color-ink)">{s.label}</p>
                    <p className="text-xs text-(--color-ink-muted)">
                      {qCount} questions · environ {Math.max(5, qCount * 2)} min
                    </p>
                  </div>
                  {lr && <Badge variant="success">{lr.score_correct} / {lr.score_total}</Badge>}
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
