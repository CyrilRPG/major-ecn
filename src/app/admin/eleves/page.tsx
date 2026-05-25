import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { StudentsTable } from '@/components/admin/students/students-table';
import { AddStudentDialog } from '@/components/admin/students/add-student-dialog';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';

export const metadata = { title: 'Élèves' };

export default async function ElevesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: students }, { data: fac }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, promotion, permission_scope, role')
      .eq('role', 'student')
      .order('last_name'),
    supabase
      .from('facultes')
      .select('semestres(matieres(id, nom, order_index))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
  ]);

  const colleges = (
    ((fac as unknown as { semestres?: { matieres?: { id: string; nom: string; order_index: number | null }[] }[] } | null)
      ?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({ id: m.id, nom: m.nom }));

  const collegeMap = Object.fromEntries(colleges.map((c) => [c.id, c.nom]));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Élèves</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {(students ?? []).length} élève{(students ?? []).length > 1 ? 's' : ''} inscrit{(students ?? []).length > 1 ? 's' : ''}.
          </p>
        </div>
        <AddStudentDialog colleges={colleges} />
      </header>

      <StudentsTable students={students ?? []} collegeMap={collegeMap} colleges={colleges} />
    </main>
  );
}
