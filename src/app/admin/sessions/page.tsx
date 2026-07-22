import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { SessionsManager } from '@/components/admin/sessions/sessions-manager';

export const metadata = { title: 'Sessions EVC' };

export default async function SessionsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: sessions }, { data: students }] = await Promise.all([
    supabase
      .from('evc_sessions')
      .select('id, label, default_access_end, is_default, created_at')
      .order('default_access_end', { ascending: false }),
    supabase
      .from('profiles')
      .select('evc_session_id')
      .eq('role', 'student'),
  ]);

  // Nombre d'élèves rattachés par session.
  const counts: Record<string, number> = {};
  for (const s of students ?? []) {
    const id = (s as { evc_session_id: string | null }).evc_session_id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
  const unassigned = (students ?? []).filter((s) => !(s as { evc_session_id: string | null }).evc_session_id).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Sessions EVC</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Chaque session fixe la date de fin d&apos;accès par défaut de ses élèves. Un élève sans session
          (ou sans date individuelle) conserve un accès sans expiration. {unassigned} élève{unassigned > 1 ? 's' : ''} sans session.
        </p>
      </header>

      <SessionsManager sessions={sessions ?? []} counts={counts} />
    </main>
  );
}
