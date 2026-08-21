import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
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

  // Le drapeau « jamais connecté » vient d'une RPC, plus d'une pagination de
  // l'API Auth : `listUsers({ perPage: 200 })` était appelée en BOUCLE
  // SÉQUENTIELLE, et chaque action de la page déclenchant `router.refresh()`,
  // la boucle repartait à chaque clic — d'où l'impression que rien ne répond.
  // Une requête SQL suffit : `auth.users` est dans la même base.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activiteAuth = (supabase as any).rpc('admin_activite_auth');

  // Les formules ne dépendent d'aucune des autres lectures : elles rejoignent
  // la même vague au lieu d'ajouter un troisième aller-retour derrière.
  const formules = Promise.all(
    ADMIN_OFFERS.map(async (offer) => {
      const access = await fetchContentAccess(offer);
      return {
        id: offer,
        label: OFFER_LABELS[offer],
        unlocks: unlockedLabels(access),
        access,
      };
    }),
  );

  const [{ data: students }, { data: fac }, { data: evcSessions }, { data: activite }, offers] = await Promise.all([
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
    activiteAuth,
    formules,
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

  // Élèves qui ne se sont jamais connectés. En cas d'échec de la RPC, l'ensemble
  // reste vide et le drapeau n'est simplement pas affiché — comme avant, la page
  // ne doit pas tomber pour un indicateur secondaire.
  const jamaisConnectes = new Set(
    ((activite ?? []) as { user_id: string; last_sign_in_at: string | null }[])
      .filter((r) => !r.last_sign_in_at)
      .map((r) => r.user_id),
  );
  const studentsWithLogin = ((students ?? []) as unknown as { id: string }[]).map((s) => ({
    ...s,
    never_connected: jamaisConnectes.has(s.id),
  }));

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
