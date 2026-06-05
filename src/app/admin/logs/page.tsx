import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { LogsTable, type LogRow } from '@/components/admin/logs/logs-table';

export const metadata = { title: 'Logs' };
export const dynamic = 'force-dynamic';

export default async function AdminLogsPage() {
  await requireAdmin();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('admin_audit_logs')
    .select('id, created_at, actor_name, actor_email, actor_role, action, entity_type, entity_id, cours_titre, matiere_nom, description, diff')
    .order('created_at', { ascending: false })
    .limit(1000);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Journal d&rsquo;activité</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          Toutes les modifications de contenu effectuées par les administrateurs et les professeurs,
          horodatées et tracées au pixel.
        </p>
      </header>
      {error ? (
        <p className="rounded-xl bg-(--color-primary-soft) px-4 py-3 text-sm text-(--color-primary-deep)">
          Impossible de charger les logs : {error.message}
        </p>
      ) : (
        <LogsTable logs={(data ?? []) as LogRow[]} />
      )}
    </main>
  );
}
