import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { AlertsPanel } from './alerts-panel';

export const metadata = { title: 'Alertes pédagogiques' };

type Offer = 'essentiel' | 'intensif' | 'approfondi';

function extractOffer(scope: unknown): Offer | null {
  if (!scope || typeof scope !== 'object') return null;
  const s = scope as Record<string, unknown>;
  const o = s.offer;
  if (o === 'essentiel' || o === 'basic') return 'essentiel';
  if (o === 'intensif' || o === 'premium') return 'intensif';
  if (o === 'approfondi') return 'approfondi';
  return null;
}

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
        .select('id, first_name, last_name, email, permission_scope')
        .in('id', userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const enriched = alerts
    .map((a) => {
      const p = profileMap.get(a.user_id);
      const offer = p ? extractOffer(p.permission_scope) : null;
      return {
        ...a,
        offer,
        studentName: p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : 'Inconnu',
        studentEmail: p?.email ?? '',
      };
    })
    .filter((a) => a.offer !== null);

  const stats = {
    total: enriched.length,
    pending: enriched.filter((a) => !a.resolved_at).length,
    priority1: enriched.filter((a) => a.priority === 1 && !a.resolved_at).length,
    resolved: enriched.filter((a) => !!a.resolved_at).length,
  };

  return <AlertsPanel alerts={enriched} stats={stats} />;
}
