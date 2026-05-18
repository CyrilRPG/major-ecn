import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { MatiereCard } from '@/components/student/matiere-card';
import { StaggerList } from '@/components/stagger-list';
import { iconFromKey } from '@/lib/icons';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export default async function SemestrePage({ params }: { params: Promise<{ fac: string; sem: string }> }) {
  const { fac, sem } = await params;
  const { profile } = await requireUser();
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

  return (
    <>
      <AppHeader
        profile={profile}
        crumbs={[
          { label: 'Facultés', href: '/facultes' },
          { label: faculte.nom, href: `/facultes/${fac}` },
          { label: semestre.label },
        ]}
      />
      <main className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-14">
        <header className="mb-12">
          <p className="eyebrow">{faculte.nom} · {semestre.label}</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            Tes <em className="display italic text-(--color-primary)">matières</em>.
          </h1>
          <p className="mt-3 text-(--color-ink-soft) max-w-2xl text-pretty">
            Cours filmés, fiches, entraînements et flashcards. Ta progression est suivie en continu.
          </p>
        </header>

        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(matieres ?? []).map((m) => {
            const coursCount = m.cours?.length ?? 0;
            const totalSteps = coursCount * 2;
            const doneSteps = (m.cours ?? []).reduce((acc, c) => {
              const cp = c.course_progress?.[0];
              return acc + (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
            }, 0);
            const progress = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
            return (
              <MatiereCard
                key={m.id}
                id={m.id}
                nom={m.nom}
                colorHex={m.color_hex}
                Icon={iconFromKey(m.icon_key)}
                coursCount={coursCount}
                progress={progress}
              />
            );
          })}
        </StaggerList>
      </main>
    </>
  );
}
