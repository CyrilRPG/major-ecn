import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AppHeader } from '@/components/app-header';
import { PageHero } from '@/components/page-hero';
import { FaculteCard } from '@/components/student/faculte-card';
import { StaggerList } from '@/components/stagger-list';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';

export const metadata = { title: 'Choisis ta faculté' };

const FAC_STUDENT_COUNTS: Record<string, number> = {
  'sorbonne-paris-nord': 1240,
  'paris-cite': 980,
};

export default async function FacultesPage() {
  const { profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();
  const { data: facultes } = await supabase.from('facultes').select('id, nom, ville').order('nom');

  return (
    <>
      <AppHeader profile={profile} crumbs={[{ label: 'Facultés' }]} />
      <main className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-14">
        <PageHero
          eyebrow="Promotion 2025-2026"
          title={<>Choisis ta <em className="display italic text-(--color-primary)">faculté</em>.</>}
          description="Tu accèdes à tes semestres, tes matières et tes cours en deux clics."
          size="lg"
        />

        <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(facultes ?? []).map((f, i) => (
            <FaculteCard
              key={f.id}
              faculte={{
                id: f.id,
                nom: f.nom,
                ville: f.ville,
                studentCount: FAC_STUDENT_COUNTS[f.id],
                locked: !canAccessFaculte(scope, f.id),
                seed: i + 1,
              }}
            />
          ))}
        </StaggerList>
      </main>
    </>
  );
}
