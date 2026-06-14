import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PHONE_RE = /^[0-9 +().\-]{0,30}$/;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };

  const patch: { first_name?: string | null; last_name?: string | null; phone?: string | null } = {};
  let touched = false;
  if (typeof body.first_name === 'string') {
    const v = body.first_name.trim();
    if (v.length > 80) return NextResponse.json({ error: 'Prénom trop long' }, { status: 400 });
    patch.first_name = v || null;
    touched = true;
  }
  if (typeof body.last_name === 'string') {
    const v = body.last_name.trim();
    if (v.length > 80) return NextResponse.json({ error: 'Nom trop long' }, { status: 400 });
    patch.last_name = v || null;
    touched = true;
  }
  if (typeof body.phone === 'string') {
    const v = body.phone.trim();
    if (!PHONE_RE.test(v)) return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 });
    patch.phone = v || null;
    touched = true;
  }
  if (!touched) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
