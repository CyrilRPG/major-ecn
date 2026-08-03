import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET  /api/fiches/[cours]/html  → lit `content_html` (réservé staff).
 * POST /api/fiches/[cours]/html  → sauve `content_html` (autosave éditeur).
 *
 * Le HTML autoporté est produit côté Python (`major-ecn-fiche/html_standalone`)
 * ou éditée côté Tiptap (mêmes classes CSS charte appliquées). Dans les deux
 * cas, c'est ce HTML qui servira à régénérer le PDF en un seul appel Chromium.
 */

async function _assertEditor() {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return { error: 'Non authentifié', status: 401 as const, user: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) {
    return { error: 'Réservé aux éditeurs (admin / professeur)', status: 403 as const, user: null };
  }
  return { error: null, status: 200 as const, user };
}

/** Fiche visée : `?doc=`/`ficheId` si fourni, sinon la principale (order_index
 *  le plus bas). Retourne `undefined` si l'id ne correspond à aucune fiche de
 *  cet item — on ne se rabat jamais silencieusement sur une autre. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cibler(a: any, coursId: string, ficheId?: string | null) {
  const { data } = await a
    .from('fiches')
    .select('id, content_html, titre')
    .eq('cours_id', coursId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true });
  const liste = (data ?? []) as { id: string; content_html: string | null; titre: string | null }[];
  if (ficheId) return liste.find((f) => f.id === ficheId);
  return liste[0];
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const auth = await _assertEditor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const cible = await cibler(a, coursId, new URL(req.url).searchParams.get('doc'));

  return NextResponse.json({
    content_html: cible?.content_html ?? null,
    titre: cible?.titre ?? null,
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const auth = await _assertEditor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as {
    content_html?: string;
    /** Fiche visée. Absent → fiche principale de l'item. */
    ficheId?: string;
  } | null;
  const html = body?.content_html;
  if (typeof html !== 'string' || html.length > 5_000_000) {
    // Limite anti-DoS : 5 Mo max (le HTML standalone avec fonts inlinées
    // pèse ~14 Mo, mais ce qu'on sauve depuis l'éditeur est le HTML SANS
    // les fonts — il est reconstruit côté serveur pour le PDF).
    return NextResponse.json({ error: 'content_html invalide ou trop volumineux' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  const existing = await cibler(a, coursId, body?.ficheId);
  if (body?.ficheId && !existing) {
    return NextResponse.json({ error: 'Fiche introuvable sur cet item.' }, { status: 404 });
  }

  const patch = {
    content_html: html,
    content_format: 'html',
    updated_by: auth.user!.id,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await a.from('fiches').update(patch).eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await a.from('fiches').insert({
      cours_id: coursId,
      titre: 'Fiche',
      ...patch,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
