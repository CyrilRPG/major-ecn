import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FicheData } from '@/lib/fiches/types';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/fiches/[cours]/content
 *
 * Autosave de la SOURCE structurée (`content_json`) — sans rendu PDF (léger).
 * Le PDF n'est régénéré que via /api/fiches/[cours]/render (bouton « Publier »).
 *
 * Body : { fiche: FicheData }
 * Réponse : { ok, ficheId }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;

  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) {
    return NextResponse.json({ error: 'Réservé aux éditeurs' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { fiche?: FicheData } | null;
  const fiche = body?.fiche;
  if (!fiche || typeof fiche !== 'object') {
    return NextResponse.json({ error: 'FicheData manquante' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const { data: existing } = await a
    .from('fiches')
    .select('id')
    .eq('cours_id', coursId)
    .order('created_at', { ascending: false })
    .limit(1);
  const row = existing?.[0] as { id: string } | undefined;

  const patch = {
    content_json: fiche,
    content_format: 'structured',
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  let ficheId = row?.id;
  if (row) {
    await a.from('fiches').update(patch).eq('id', row.id);
  } else {
    const { data: ins } = await a
      .from('fiches')
      .insert({ cours_id: coursId, titre: fiche.nom_cours || 'Fiche', ...patch })
      .select('id')
      .maybeSingle();
    ficheId = ins?.id;
  }

  return NextResponse.json({ ok: true, ficheId });
}
