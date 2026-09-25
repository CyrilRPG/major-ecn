'use server';

import { createClient } from '@/lib/supabase/server';

export async function resolveAlert(alertId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };
  // Page réservée aux administrateurs (requireAdmin) : l'action aussi. La RLS
  // ouvre ces tables à tout le personnel ; un collaborateur (monteur,
  // commercial…) ne doit pas pouvoir l'appeler à la main.
  const { data: moi } = await supa.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if ((moi as { role?: string } | null)?.role !== 'admin') return { ok: false, error: 'Réservé aux administrateurs.' };

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
