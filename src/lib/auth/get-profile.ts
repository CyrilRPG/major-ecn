import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

/** Augmented with columns added by recent migrations not yet in generated types. */
export type Profile = Tables<'profiles'> & {
  pseudo: string | null;
  trial_until: string | null;
};

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // Cast: `pseudo` and `trial_until` are added by recent migrations and not in generated types yet.
  return { user, profile: profile as Profile | null };
}
