import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, FileText, History } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { StaggerList } from '@/components/stagger-list';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

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
  const facId = c.matieres.semestres.faculte_id;
  if (!canAccessFaculte(parseScope(profile.permission_scope), facId)) redirect('/facultes');

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
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: c.matieres.semestres.facultes?.nom ?? '', href: `/facultes/${facId}` },
          { label: c.matieres.semestres.label, href: `/facultes/${facId}/${c.matieres.semestre_id}` },
          { label: c.matieres.nom, href: `/matieres/${c.matiere_id}` },
          { label: c.titre, href: `/cours/${coursId}` },
          { label: 'Annales' },
        ]}
      />
      <main className="mx-auto w-full max-w-4xl px-6 lg:px-8 py-14">
        <header className="mb-10">
          <p className="eyebrow">Sujets officiels · {c.titre}</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            <em className="display italic text-(--color-primary)">Annales</em> par année.
          </h1>
          <p className="mt-3 max-w-2xl text-(--color-ink-soft) text-pretty">
            Les sujets réels des concours précédents, dans les conditions du jour J. Correction détaillée à chaque item.
          </p>
        </header>

        {!annales || annales.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={FileText}
              title="Pas encore d’annales"
              description="Les annales de ce cours seront ajoutées dès que possible."
            />
          </div>
        ) : (
          <StaggerList className="space-y-4">
            {annales.map((a) => {
              const lr = lastBySerie.get(a.id);
              const qCount = a.qcm_questions?.length ?? 0;
              return (
                <Link
                  key={a.id}
                  href={`/cours/${coursId}/annales/${a.id}`}
                  className="group relative block focus-ring rounded-(--radius-card)"
                >
                  <article className="relative overflow-hidden rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) shadow-(--shadow-xs) p-6 md:p-7 flex items-center justify-between gap-5 transition hover:-translate-y-0.5 hover:border-(--color-primary)/40 hover:shadow-(--shadow-glow)">
                    <span aria-hidden className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-gradient-to-b from-(--color-primary) to-(--color-accent) opacity-0 group-hover:opacity-100 transition" />
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary-deep) shrink-0 border border-(--color-primary)/15">
                        <History className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-(--color-ink-muted)">Sujet officiel</p>
                        <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-(--color-ink) truncate">Annale {a.label}</h3>
                        <p className="mt-1 text-sm text-(--color-ink-soft)">{qCount} questions · format concours</p>
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
