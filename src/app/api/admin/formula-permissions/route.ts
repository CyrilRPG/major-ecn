import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_OFFERS = ['essentiel', 'intensif', 'approfondi'] as const;
const VALID_KEYS = [
  'fiche', 'fiche_express', 'video', 'qcm', 'entrainement',
  'seance_prof', 'flashcards', 'interrogation', 'seance_approfondie', 'notes',
] as const;

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const rows = body.permissions;
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: 'permissions doit être un tableau' }, { status: 400 });
  }

  for (const row of rows) {
    if (!VALID_OFFERS.includes(row.offer)) {
      return NextResponse.json({ error: `Offre invalide : ${row.offer}` }, { status: 400 });
    }
    for (const key of VALID_KEYS) {
      if (typeof row[key] !== 'boolean') {
        return NextResponse.json({ error: `${key} doit être un booléen pour ${row.offer}` }, { status: 400 });
      }
    }
  }

  const admin = createAdminClient();

  for (const row of rows) {
    const update: Record<string, boolean | string> = { updated_at: new Date().toISOString() };
    for (const key of VALID_KEYS) update[key] = row[key] as boolean;

    const { error } = await admin
      .from('formula_permissions')
      .update(update as never)
      .eq('offer', row.offer);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
