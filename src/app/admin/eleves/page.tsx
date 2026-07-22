import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { StudentsTable } from '@/components/admin/students/students-table';
import { AddStudentDialog } from '@/components/admin/students/add-student-dialog';
import { DeactivateStudentsDialog } from '@/components/admin/students/deactivate-students-dialog';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { fetchContentAccess, OFFER_LABELS, unlockedLabels } from '@/lib/auth/formula-permissions';

// Formules proposées à la création d'un élève (les 3 offres payantes). Ce que
// chacune débloque est lu depuis la Config Permissions (table formula_permissions).
const ADMIN_OFFERS = ['essentiel', 'intensif', 'approfondi'] as const;

export const metadata = { title: 'Élèves' };

export default async function ElevesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: students }, { data: fac }, { data: evcSessions }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone, address, pseudo, promotion, permission_scope, role, is_active, created_at, can_download, download_colleges, evc_session_id, access_start, access_end')
      .eq('role', 'student')
      // Tri décroissant par date d'inscription (les plus récents en premier).
      .order('created_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('facultes')
      .select('semestres(matieres(id, nom, order_index, parent_matiere_id))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle(),
    supabase
      .from('evc_sessions')
      .select('id, label, default_access_end, is_default')
      .order('default_access_end', { ascending: false }),
  ]);

  type MatRaw = {
    id: string; nom: string; order_index: number | null; parent_matiere_id: string | null;
  };
  const matieres = (
    ((fac as unknown as { semestres?: { matieres?: MatRaw[] }[] } | null)?.semestres ?? [])
  )
    .flatMap((s) => s.matieres ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const colleges = matieres.map((m) => ({ id: m.id, nom: m.nom, parentId: m.parent_matiere_id }));

  // Date de dernière connexion (auth.users) → drapeau « jamais connecté » par élève.
  const lastSignIn = new Map<string, string | null>();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aAuth = createAdminClient() as any;
    for (let page = 1; page <= 40; page++) {
      const { data, error } = await aAuth.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = (data?.users ?? []) as any[];
      for (const u of users) lastSignIn.set(u.id, u.last_sign_in_at ?? null);
      if (users.length < 200) break;
    }
  } catch { /* service-role indispo → drapeau non calculé */ }
  const studentsWithLogin = ((students ?? []) as unknown as { id: string }[]).map((s) => ({
    ...s,
    never_connected: !lastSignIn.get(s.id),
  }));

  // Formules + contenus débloqués, d'après la Config Permissions.
  const offers = await Promise.all(
    ADMIN_OFFERS.map(async (offer) => ({
      id: offer,
      label: OFFER_LABELS[offer],
      unlocks: unlockedLabels(await fetchContentAccess(offer)),
    })),
  );

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
        <div className="flex flex-wrap items-center gap-2">
          <DeactivateStudentsDialog />
          <AddStudentDialog colleges={colleges} offers={offers} />
        </div>
      </header>

      <StudentsTable students={studentsWithLogin as unknown as Parameters<typeof StudentsTable>[0]['students']} colleges={colleges} offers={offers} sessions={evcSessions ?? []} />
    </main>
  );
}
