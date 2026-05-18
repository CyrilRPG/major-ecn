import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { StudentsTable } from '@/components/admin/students/students-table';
import { AddStudentDialog } from '@/components/admin/students/add-student-dialog';

export const metadata = { title: 'Élèves' };

export default async function ElevesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: students }, { data: facultes }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, promotion, permission_scope, role')
      .eq('role', 'student')
      .order('last_name'),
    supabase.from('facultes').select('id, nom').order('nom'),
  ]);

  const facMap = Object.fromEntries((facultes ?? []).map((f) => [f.id, f.nom]));

  return (
    <main className="px-6 lg:px-10 py-12 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="eyebrow">Administration · Cohorte</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            <em className="display italic text-(--color-primary)">Élèves</em>
          </h1>
          <p className="mt-3 text-(--color-ink-soft)">
            {(students ?? []).length} élève{(students ?? []).length > 1 ? 's' : ''} inscrit{(students ?? []).length > 1 ? 's' : ''} dans la promotion en cours.
          </p>
        </div>
        <AddStudentDialog facultes={facultes ?? []} />
      </header>

      <StudentsTable students={students ?? []} facMap={facMap} facultes={facultes ?? []} />
    </main>
  );
}
