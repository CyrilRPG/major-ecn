import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const pwd = (body.password ?? '').trim();
  if (pwd.length < 8) {
    return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 });
  }
  if (pwd.length > 200) {
    return NextResponse.json({ error: 'Mot de passe trop long' }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({ password: pwd });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
