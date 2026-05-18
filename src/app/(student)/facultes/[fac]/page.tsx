import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, Layers } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { Progress } from '@/components/ui/progress';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FacultePage({ params }: { params: Promise<{ fac: string }> }) {
  const { fac } = await params;
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessFaculte(scope, fac)) redirect('/facultes');

  const supabase = await createClient();
  const { data: faculte } = await supabase.from('facultes').select('id, nom, ville').eq('id', fac).maybeSingle();
  if (!faculte) notFound();

  const { data: semestres } = await supabase
    .from('semestres')
    .select('id, numero, label, matieres(id, cours(id, course_progress(video_watched, fiche_read)))')
    .eq('faculte_id', fac)
    .order('numero');

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: faculte.nom },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl px-6 lg:px-8 py-14">
        <header className="mb-12">
          <p className="eyebrow">{faculte.ville}</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            {faculte.nom}
          </h1>
          <p className="mt-3 text-(--color-ink-soft) max-w-2xl text-pretty">
            Choisis ton semestre pour rejoindre tes cours.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(semestres ?? []).map((s) => {
            const matieresCount = s.matieres?.length ?? 0;
            const coursList = (s.matieres ?? []).flatMap((m) => m.cours ?? []);
            const totalSteps = coursList.length * 2;
            const doneSteps = coursList.reduce((acc, c) => {
              const cp = c.course_progress?.[0];
              return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
            }, 0);
            const progress = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
            return (
              <Link
                key={s.id}
                href={`/facultes/${fac}/${s.id}`}
                className="group surface-card relative overflow-hidden p-8 focus-ring hover:-translate-y-1 hover:shadow-(--shadow-glow) hover:border-(--color-primary) transition"
              >
                <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-(--color-primary-soft) opacity-60 transition group-hover:scale-110" aria-hidden />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full surface-glass px-3 py-1 text-xs font-medium text-(--color-ink-soft)">
                      <Layers className="h-3.5 w-3.5 text-(--color-accent)" />
                      Semestre
                    </div>
                    <span className="text-5xl font-semibold tracking-tight text-(--color-primary)">S{s.numero}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">{s.label}</h2>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-(--color-ink-soft)">
                      <BookOpen className="h-4 w-4" />
                      {matieresCount} matière{matieresCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-(--color-ink-soft)">
                      <span>Progression</span>
                      <span className="font-semibold text-(--color-ink)">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-(--color-primary-deep) group-hover:gap-2.5 transition">
                    Ouvrir le semestre
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
