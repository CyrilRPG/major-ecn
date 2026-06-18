import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const STRING_FIELDS = [
  'first_name', 'last_name', 'email', 'phone', 'address', 'pseudo',
  'cv_url', 'certificat_scolarite_url', 'carte_pro_url',
] as const;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { userId?: string } & Record<string, unknown>;
  if (!body.userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 });

  const patch: Record<string, string | boolean | null> = {};
  for (const k of STRING_FIELDS) {
    const v = body[k];
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed.length > 500) return NextResponse.json({ error: `${k} trop long` }, { status: 400 });
      patch[k] = trimmed || null;
    }
  }
  // Permission de téléchargement (booléen) accordée par l'admin.
  if (typeof body.can_download === 'boolean') {
    patch.can_download = body.can_download;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }
  const { error } = await admin.from('profiles').update(patch as never).eq('id', body.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si l'email a changé, le mettre aussi à jour côté auth.users (best-effort).
  if (typeof body.email === 'string' && body.email.trim()) {
    try { await admin.auth.admin.updateUserById(body.userId, { email: body.email.trim() }); } catch { /* ignore */ }
  }

  return NextResponse.json({ ok: true });
}
