import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, FileText } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

export default async function CoursAnnalesListPage({ params }: { params: Promise<{ cours: string }> }) {
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

  const { data: annales } = await supabase
    .from('qcm_series')
    .select('id, label, annee, qcm_questions(id)')
    .eq('cours_id', coursId)
    .eq('type', 'annale')
    .order('annee', { ascending: false });

  const { data: sessions } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, score_correct, score_total, finished_at')
    .eq('user_id', user.id);

  const lastBySerie = new Map<string, { score_correct: number; score_total: number }>();
  for (const s of sessions ?? []) {
    if (!s.finished_at) continue;
    lastBySerie.set(s.serie_id, { score_correct: s.score_correct, score_total: s.score_total });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 lg:px-8">
      <p className="mb-4 text-sm text-(--color-ink-soft)">
        Les sujets réels des sessions précédentes, en conditions concours.
      </p>

      {!annales || annales.length === 0 ? (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState
            icon={FileText}
            title="Pas encore d’annales"
            description="Les annales de ce cours seront ajoutées dès que possible."
          />
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
          {annales.map((a) => {
            const lr = lastBySerie.get(a.id);
            const qCount = a.qcm_questions?.length ?? 0;
            return (
              <li key={a.id}>
                <Link
                  href={`/cours/${coursId}/annales/${a.id}`}
                  className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-(--color-sand-100) focus-ring"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-(--color-ink)">Annale {a.label}</p>
                    <p className="text-xs text-(--color-ink-muted)">{qCount} questions · format concours</p>
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
