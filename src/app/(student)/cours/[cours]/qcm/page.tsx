import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { StaggerList } from '@/components/stagger-list';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

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
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

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
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.semestres.facultes?.nom ?? '', href: `/facultes/${facId}` },
          { label: c.matieres.semestres.label, href: `/facultes/${facId}/${c.matieres.semestre_id}` },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre, href: `/cours/${coursId}` },
          { label: 'QCM' },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-6 lg:px-8 py-14">
        <header className="mb-10">
          <p className="eyebrow">Entraînement · {c.titre}</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Séries <em className="display italic text-(--color-primary)">QCM</em>.
          </h1>
          <p className="mt-3 max-w-2xl text-(--color-ink-soft) text-pretty">
            Tu valides chaque question, puis tu reçois la correction immédiate avec la justification de chaque item.
          </p>
        </header>

        {!series || series.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={ClipboardList}
              title="Pas encore de QCM"
              description="Les séries QCM pour ce cours sont en cours de rédaction."
            />
          </div>
        ) : (
          <StaggerList className="space-y-4">
            {series.map((s, idx) => {
              const lr = lastBySerie.get(s.id);
              const qCount = s.qcm_questions?.length ?? 0;
              return (
                <Link
                  key={s.id}
                  href={`/cours/${coursId}/qcm/${s.id}`}
                  className="group relative block focus-ring rounded-(--radius-card)"
                >
                  <article className="relative overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xs) p-6 md:p-7 flex items-center justify-between gap-5 transition hover:-translate-y-0.5 hover:border-(--color-primary)/40 hover:shadow-(--shadow-glow)">
                    <span aria-hidden className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-(--color-primary) to-(--color-accent) opacity-0 group-hover:opacity-100 transition" />
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary-deep) shrink-0 border border-(--color-primary)/15">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-(--color-ink-muted)">Série {String(idx + 1).padStart(2, '0')}</p>
                        <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-(--color-ink) truncate">{s.label}</h3>
                        <p className="mt-1 text-sm text-(--color-ink-soft)">
                          {qCount} questions · environ {Math.max(5, qCount * 2)} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      {lr && <Badge variant="success">{lr.score_correct} / {lr.score_total}</Badge>}
                      <ArrowRight className="h-5 w-5 text-(--color-ink-muted) group-hover:text-(--color-primary) group-hover:translate-x-1 transition" />
                    </div>
                  </article>
                </Link>
              );
            })}
          </StaggerList>
        )}
      </main>
    </>
  );
}
