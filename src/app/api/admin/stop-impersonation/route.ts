import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const refresh = cookieStore.get('impersonator_refresh')?.value;

  await supabase.auth.signOut();

  if (refresh) {
    const { error } = await supabase.auth.refreshSession({ refresh_token: refresh });
    if (error) {
      // If refresh failed, ensure user lands on login
      cookieStore.delete('impersonator_id');
      cookieStore.delete('impersonator_refresh');
      cookieStore.delete('impersonator_target_name');
      return NextResponse.json({ error: 'Session admin expirée — reconnecte-toi.' }, { status: 401 });
    }
  }

  cookieStore.delete('impersonator_id');
  cookieStore.delete('impersonator_refresh');
  cookieStore.delete('impersonator_target_name');

  return NextResponse.json({ ok: true });
}
