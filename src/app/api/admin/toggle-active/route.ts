import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { userId?: string; isActive?: boolean };
  if (!body.userId || typeof body.isActive !== 'boolean') {
    return NextResponse.json({ error: 'userId / isActive manquants' }, { status: 400 });
  }
  if (body.userId === user.id) {
    return NextResponse.json({ error: 'Impossible de désactiver votre propre compte.' }, { status: 400 });
  }

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }

  const { error } = await admin
    .from('profiles')
    .update({ is_active: body.isActive } as never)
    .eq('id', body.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si on désactive, on invalide les sessions actives pour forcer le logout
  // immédiat. Le mot de passe reste intact côté auth.users.
  if (!body.isActive) {
    try { await admin.auth.admin.signOut(body.userId); } catch { /* best-effort */ }
  }

  return NextResponse.json({ ok: true });
}
