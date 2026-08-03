import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { messageAuth } from '@/lib/auth/messages';

export async function POST(req: Request) {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
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
  // Le message brut de Supabase était renvoyé tel quel — donc affiché en
  // anglais à l'élève, « New password should be different from the old
  // password » en tête. On traduit, et on distingue l'erreur de saisie (400)
  // d'une vraie panne (500).
  if (error) {
    return NextResponse.json(
      { error: messageAuth(error.code, error.message) },
      { status: error.code === 'same_password' || error.code === 'weak_password' ? 400 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
