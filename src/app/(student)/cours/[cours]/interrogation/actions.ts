'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveInterrogationResult(input: {
  cours_id: string;
  score: number;
  total: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const { data: profile } = await supa
    .from('profiles')
    .select('promotion')
    .eq('id', user.id)
    .maybeSingle();

  const { error } = await (supa as unknown as {
    from: (t: string) => {
      upsert: (v: Record<string, unknown>, o: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
    };
  }).from('parcours_completions').upsert(
    {
      user_id: user.id,
      cours_id: input.cours_id,
      qcm_test_score: input.score,
      qcm_test_total: input.total,
      qcm_test_completed_at: new Date().toISOString(),
      promotion: profile?.promotion ?? null,
    },
    { onConflict: 'user_id,cours_id' },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveSignature(input: {
  cours_id: string;
  signature_data_url: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const { error } = await (supa as unknown as {
    from: (t: string) => {
      update: (v: Record<string, unknown>) => {
        eq: (k: string, v: string) => { eq: (k: string, v: string) => Promise<{ error: { message: string } | null }> };
      };
    };
  }).from('parcours_completions')
    .update({
      signature_data_url: input.signature_data_url,
      certificate_signed_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('cours_id', input.cours_id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
