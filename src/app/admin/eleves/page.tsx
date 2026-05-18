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
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Élèves</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {(students ?? []).length} élève{(students ?? []).length > 1 ? 's' : ''} inscrit{(students ?? []).length > 1 ? 's' : ''}.
          </p>
        </div>
        <AddStudentDialog facultes={facultes ?? []} />
      </header>

      <StudentsTable students={students ?? []} facMap={facMap} facultes={facultes ?? []} />
    </main>
  );
}
