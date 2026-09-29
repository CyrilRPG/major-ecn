/* eslint-disable @typescript-eslint/no-explicit-any -- Les tables `mock_exam*` et les
   colonnes récentes de `profiles` sont absentes de l'instantané curaté de `types/database.ts` :
   ces routes lisent la base via un client déstructuré. */
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPlatformAvatar, platformAvatarUrl, effectiveSeed } from '@/lib/avatar';
import { PORTRAITS, decrireAvatar } from '@/lib/avatars/portraits';
import { generatePseudo } from '@/lib/auth/pseudo';
import { purgerSurlignages } from '@/lib/fiches/surlignages-purge';
import { anonymiserMessagesForum } from '@/lib/forum/anonymiser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE_RE = /^[0-9 +().\-]{0,30}$/;
const PSEUDO_RE = /^[a-z0-9._-]{3,40}$/i;
const PSEUDO_PROF_RE = /^[\p{L}\p{N} ._'-]{3,60}$/u;

/**
 * Pseudo déjà porté par un AUTRE compte ? Comparaison exacte insensible à la
 * casse (l'index unique `profiles_pseudo_unique` porte sur `lower(pseudo)`) :
 * `ilike` dont les jokers `%` et `_` (et l'échappement) sont neutralisés —
 * « jean_d » ne doit pas heurter « jeanxd » — puis `.limit(1)` : plusieurs
 * lignes ne font plus échouer `maybeSingle` en « libre ».
 */
async function pseudoPris(admin: any, pseudo: string, userId: string): Promise<boolean | { error: string }> {
  const motif = pseudo.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await admin.from('profiles').select('id').ilike('pseudo', motif).neq('id', userId).limit(1);
  if (error) return { error: error.message };
  return (data ?? []).length > 0;
}

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
  const db = createAdminClient() as any;
  const { data, error } = await db
    .from('profiles')
    .select('id, first_name, last_name, email, phone, promotion, permission_scope, access_end, role, pseudo, avatar_seed, trial_until, evc_session:evc_sessions(default_access_end)')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  const seed = effectiveSeed(data.id, data.avatar_seed);
  const absoluteAvatarUrl = (id: string) => new URL(platformAvatarUrl(id), req.url).href;
  return NextResponse.json({
    profile: { ...data, avatar_seed: seed, avatar_url: absoluteAvatarUrl(seed) },
    // Tout le catalogue, avec les traits de chaque portrait : l'application
    // mène le même parcours de choix que le site (et une version plus
    // ancienne, qui ne connaît que `id`/`label`/`url`, affiche la grille).
    avatars: PORTRAITS.map((p) => ({ id: p.code, label: decrireAvatar(p.code), url: absoluteAvatarUrl(p.code), traits: p.traits })),
  });
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

  if (body.action === 'regenerate_pseudo') {
    // Même règle que l'action web `regeneratePseudoAction` : initiales + promo
    // + suffixe court, décliné jusqu'à trouver un pseudo libre.
    const admin = createAdminClient() as any;
    const { data: me } = await db.from('profiles').select('first_name, last_name, promotion').eq('id', auth.user.id).maybeSingle();
    const base = generatePseudo(me?.first_name ?? '', me?.last_name ?? '', me?.promotion ?? 'X');
    let candidate: string | null = null;
    for (let i = 0; i < 50 && !candidate; i++) {
      const trial = i === 0 ? base : `${base}-${i + 1}`;
      const pris = await pseudoPris(admin, trial, auth.user.id);
      if (typeof pris === 'object') return NextResponse.json({ error: pris.error }, { status: 500 });
      if (!pris) candidate = trial;
    }
    if (!candidate) return NextResponse.json({ error: 'Aucun pseudo libre trouvé, réessayez.' }, { status: 409 });
    const { error } = await db.from('profiles').update({ pseudo: candidate }).eq('id', auth.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, pseudo: candidate });
  }

  if (body.action === 'pseudo') {
    // Parité web (`updatePseudoAction`) : les enseignants ont droit à un
    // pseudo lisible (« Professeur Cardiologie »), les élèves à un identifiant.
    const { data: me } = await db.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
    const isStaff = me?.role === 'professor' || me?.role === 'admin';
    const raw = (body.pseudo ?? '').trim();
    const pseudo = isStaff ? raw.replace(/\s+/g, ' ') : raw.toLowerCase();
    if (!(isStaff ? PSEUDO_PROF_RE : PSEUDO_RE).test(pseudo)) {
      return NextResponse.json({
        error: isStaff
          ? '3 à 60 caractères : lettres (accents compris), chiffres, espace, point, tiret, underscore ou apostrophe.'
          : '3 à 40 caractères : lettres, chiffres, point, tiret ou underscore.',
      }, { status: 400 });
    }
    const admin = createAdminClient() as any;
    const pris = await pseudoPris(admin, pseudo, auth.user.id);
    if (typeof pris === 'object') return NextResponse.json({ error: pris.error }, { status: 500 });
    if (pris) return NextResponse.json({ error: 'Ce pseudo est déjà pris.' }, { status: 409 });
    const { error } = await db.from('profiles').update({ pseudo }).eq('id', auth.user.id);
    // Course entre deux comptes : l'index unique tranche.
    if (error?.code === '23505') return NextResponse.json({ error: 'Ce pseudo est déjà pris.' }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, pseudo });
  }

  if (body.action === 'avatar') {
    const seed = body.seed;
    if (!isPlatformAvatar(seed)) return NextResponse.json({ error: 'Choisissez un avatar du catalogue Major ECN.' }, { status: 400 });
    // Aucune unicité côté Major ECN : plusieurs comptes peuvent porter le même
    // portrait (seule EVC Arena l'impose, tournoi par tournoi).
    const { data, error } = await createAdminClient().from('profiles').update({ avatar_seed: seed }).eq('id', auth.user.id).select('avatar_seed').maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    return NextResponse.json({ ok: true, seed: data.avatar_seed });
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
  // Les surlignages vivent dans un bucket (pas de cascade SQL) : on les purge
  // avant le compte, comme l'annonce la page publique /suppression-compte.
  await purgerSurlignages(admin, auth.user.id).catch(() => undefined);
  // Forum : questions et relances restent visibles, signées « Ancien élève »
  // (même promesse). Échec → le compte n'est pas supprimé.
  const anonErr = await anonymiserMessagesForum(admin, auth.user.id);
  if (anonErr) return NextResponse.json({ error: anonErr }, { status: 500 });
  await admin.auth.admin.signOut(auth.user.id).catch(() => undefined);
  const { error } = await admin.auth.admin.deleteUser(auth.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
