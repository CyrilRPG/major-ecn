/* eslint-disable @typescript-eslint/no-explicit-any -- Les tables `mock_exam*` et les
   colonnes récentes de `profiles` sont absentes de l'instantané curaté de `types/database.ts` :
   ces routes lisent la base via un client déstructuré. */
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE_RE = /^[0-9 +().\-]{0,30}$/;
const PSEUDO_RE = /^[a-z0-9._-]{3,40}$/i;

async function mobileAuth(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return { auth: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return { auth: null, response: check.response };
  return { auth, response: null };
}

/**
 * Profil mobile : même propriétaire et mêmes validations que le web, avec
 * authentification Bearer + appareil autorisé. Les routes profil historiques
 * s'appuient sur les cookies Next et ne peuvent donc pas servir Capacitor.
 */
export async function GET(req: Request) {
  const { auth, response } = await mobileAuth(req);
  if (!auth) return response!;
  // Certaines colonnes de personnalisation sont récentes dans les types générés.
  const db = auth.supabase as any;
  const { data, error } = await db
    .from('profiles')
    .select('id, first_name, last_name, email, phone, promotion, permission_scope, access_end, role, pseudo, avatar_seed, trial_until, evc_session:evc_sessions(default_access_end)')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(req: Request) {
  const { auth, response } = await mobileAuth(req);
  if (!auth) return response!;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const patch: Record<string, string | null> = {};
  for (const key of ['first_name', 'last_name'] as const) {
    if (typeof body[key] === 'string') {
      const value = body[key].trim();
      if (value.length > 80) return NextResponse.json({ error: key === 'first_name' ? 'Prénom trop long' : 'Nom trop long' }, { status: 400 });
      patch[key] = value || null;
    }
  }
  if (typeof body.phone === 'string') {
    const value = body.phone.trim();
    if (!PHONE_RE.test(value)) return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 });
    patch.phone = value || null;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  const { error } = await (auth.supabase as any).from('profiles').update(patch).eq('id', auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const { auth, response } = await mobileAuth(req);
  if (!auth) return response!;
  const body = await req.json().catch(() => ({})) as { action?: string; password?: string; pseudo?: string; seed?: string };
  const db = auth.supabase as any;

  if (body.action === 'password') {
    const password = (body.password ?? '').trim();
    if (password.length < 8 || password.length > 200) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir entre 8 et 200 caractères.' }, { status: 400 });
    }
    const { error } = await auth.supabase.auth.updateUser({ password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'pseudo') {
    const pseudo = (body.pseudo ?? '').trim().toLowerCase();
    if (!PSEUDO_RE.test(pseudo)) {
      return NextResponse.json({ error: '3 à 40 caractères : lettres, chiffres, point, tiret ou underscore.' }, { status: 400 });
    }
    const admin = createAdminClient() as any;
    const { data: existing } = await admin.from('profiles').select('id').ilike('pseudo', pseudo).neq('id', auth.user.id).maybeSingle();
    if (existing) return NextResponse.json({ error: 'Ce pseudo est déjà pris.' }, { status: 409 });
    const { error } = await db.from('profiles').update({ pseudo }).eq('id', auth.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, pseudo });
  }

  if (body.action === 'avatar') {
    const seed = (body.seed ?? '').trim().slice(0, 64);
    if (!seed) return NextResponse.json({ error: 'Identifiant d’avatar manquant.' }, { status: 400 });
    const { error } = await db.from('profiles').update({ avatar_seed: seed }).eq('id', auth.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, seed });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { auth, response } = await mobileAuth(req);
  if (!auth) return response!;
  const db = auth.supabase as any;
  const { data: profile } = await db.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  if (profile?.role === 'admin') {
    return NextResponse.json({ error: 'Un administrateur ne peut pas supprimer son propre compte.' }, { status: 403 });
  }
  const admin = createAdminClient();
  await admin.auth.admin.signOut(auth.user.id).catch(() => undefined);
  const { error } = await admin.auth.admin.deleteUser(auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
