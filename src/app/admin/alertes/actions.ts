'use server';

import { createClient } from '@/lib/supabase/server';

export async function resolveAlert(alertId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const { error } = await (supa as unknown as {
    from: (t: string) => {
      update: (v: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  }).from('admin_alerts').update({
    resolved_at: new Date().toISOString(),
    resolved_by: user.id,
  }).eq('id', alertId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
