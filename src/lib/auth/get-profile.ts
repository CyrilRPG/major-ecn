import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

export type Profile = Tables<'profiles'>;

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile };
}
