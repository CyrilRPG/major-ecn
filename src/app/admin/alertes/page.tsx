import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AlertsPanel } from './alerts-panel';

export const metadata = { title: 'Alertes pédagogiques' };

export default async function AlertesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: alertsRaw } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        order: (k: string, o: { ascending: boolean }) => Promise<{
          data: {
            id: string; user_id: string; priority: number; motif: string;
            details: Record<string, unknown>; created_at: string;
            resolved_at: string | null; resolved_by: string | null;
          }[] | null;
        }>;
      };
    };
  }).from('admin_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  const alerts = (alertsRaw ?? []).map((a) => ({
    ...a,
    created_at: new Date(a.created_at),
  }));

  const userIds = [...new Set(alerts.map((a) => a.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const enriched = alerts.map((a) => {
    const p = profileMap.get(a.user_id);
    return {
      ...a,
      studentName: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'Inconnu',
      studentEmail: p?.email ?? '',
    };
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-8 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Administration</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Alertes pédagogiques</h1>
        <p className="mt-0.5 text-sm text-(--color-ink-soft)">
          {enriched.filter((a) => !a.resolved_at).length} alerte{enriched.filter((a) => !a.resolved_at).length > 1 ? 's' : ''} en attente
        </p>
      </header>
      <AlertsPanel alerts={enriched} />
    </main>
  );
}
