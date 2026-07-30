import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getVerifiedUser } from '@/lib/auth/verified-user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Documents administratifs des professeurs (CV, certificat, carte pro), stockés
 * dans le bucket privé `prof-docs`. Le fichier est téléversé côté client
 * directement dans le bucket (RLS : dossier = uid, ou admin) ; cette route
 * enregistre le CHEMIN dans la colonne profiles correspondante (POST) et sert
 * une URL signée pour consultation (GET).
 *
 * - POST { kind, path, userId? } : enregistre le chemin. `userId` réservé admin.
 * - GET ?kind=&userId? : 302 vers une URL signée (ou l'URL legacy si http).
 */

const COL: Record<string, 'cv_url' | 'certificat_scolarite_url' | 'carte_pro_url'> = {
  cv: 'cv_url',
  certificat: 'certificat_scolarite_url',
  carte_pro: 'carte_pro_url',
};

async function resolveTarget(req: NextRequest, explicitUserId?: string | null) {
  const supabase = await createClient();
  const user = await getVerifiedUser(supabase);
  if (!user) return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const isAdmin = me?.role === 'admin';
  // Un admin peut cibler un autre utilisateur ; sinon on cible soi-même.
  const targetId = explicitUserId && isAdmin ? explicitUserId : user.id;
  return { user, isAdmin, targetId };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { kind?: string; path?: string; userId?: string };
  const col = body.kind ? COL[body.kind] : undefined;
  if (!col || !body.path) return NextResponse.json({ error: 'kind/path invalides' }, { status: 400 });

  const r = await resolveTarget(req, body.userId);
  if ('error' in r) return r.error;

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ [col]: body.path } as any)
    .eq('id', r.targetId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind') ?? '';
  const col = COL[kind];
  if (!col) return NextResponse.json({ error: 'kind invalide' }, { status: 400 });

  const r = await resolveTarget(req, searchParams.get('userId'));
  if ('error' in r) return r.error;

  const admin = createAdminClient();
  const { data: prof } = await admin.from('profiles').select(col).eq('id', r.targetId).maybeSingle();
  const value = (prof as Record<string, string | null> | null)?.[col] ?? null;
  if (!value) return NextResponse.json({ error: 'Aucun document' }, { status: 404 });

  // Compat : anciens enregistrements pouvaient stocker une URL complète.
  if (/^https?:\/\//i.test(value)) return NextResponse.redirect(value);

  const { data: signed, error } = await admin.storage
    .from('prof-docs')
    .createSignedUrl(value, 300);
  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? 'Document introuvable' }, { status: 404 });
  }
  return NextResponse.redirect(signed.signedUrl);
}
