import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser, type RequestAuth } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { getProfessorScope } from '@/lib/auth/prof-content-access';
import { canRead } from '@/lib/schemas/professor';
import { MAX_OCTETS_FICHIER, validerListe } from '@/lib/fiches/surlignages-pure';
import { ecrireSurlignages, lireSurlignages } from '@/lib/fiches/surlignages-stockage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Surlignages de l'élève connecté sur UNE fiche de cours.
 *
 *   GET  /api/fiches/[cours]/surlignages?doc=<ficheId>  → { surlignages, majLe }
 *   PUT  /api/fiches/[cours]/surlignages?doc=<ficheId>  body { surlignages: [...] }
 *        (POST accepté à l'identique : le CORS de l'app mobile n'autorise pas PUT)
 *
 * Auth duale cookie (web) ou Bearer (app mobile, avec contrôle d'appareil).
 * Même contrôle d'accès que la page fiche : collège dans le périmètre, droit
 * « fiche » de la formule, lecture autorisée pour un professeur, et la fiche
 * doit appartenir à cet item et avoir un PDF. La liste envoyée REMPLACE la
 * liste stockée (sauvegarde automatique du lecteur).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Contexte = { auth: RequestAuth; ficheId: string };

async function controlerAcces(
  req: Request,
  ctx: { params: Promise<{ cours: string }> },
): Promise<Contexte | NextResponse> {
  const { cours: coursId } = await ctx.params;
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }
  const expiredRes = await assertAccessActive(supabase, user.id);
  if (expiredRes) return expiredRes;

  const ficheId = new URL(req.url).searchParams.get('doc') ?? '';
  if (!UUID_RE.test(ficheId) || !UUID_RE.test(coursId)) {
    return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as SupabaseClient<any>;
  const [{ data: profile }, { data: cours }, { data: fiche }] = await Promise.all([
    db.from('profiles').select('role, permission_scope').eq('id', user.id).maybeSingle(),
    db.from('cours').select('id, matiere_id').eq('id', coursId).maybeSingle(),
    db.from('fiches').select('id, storage_path').eq('id', ficheId).eq('cours_id', coursId).maybeSingle(),
  ]);
  if (!cours || !fiche?.storage_path) return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 });
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  if (profile.role !== 'admin') {
    const scope = parseScope(profile.permission_scope);
    if (!canAccessCollege(scope, cours.matiere_id as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    if (!(await fetchContentAccessForScopeWith(supabase, scope)).fiche) {
      return NextResponse.json({ error: 'Contenu réservé à une autre formule' }, { status: 403 });
    }
    if (profile.role === 'professor' && !canRead(getProfessorScope(profile.permission_scope), 'fiche')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
  }
  return { auth, ficheId };
}

export async function GET(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const acces = await controlerAcces(req, ctx);
  if (acces instanceof NextResponse) return acces;
  try {
    const fichier = await lireSurlignages(acces.auth.user.id, acces.ficheId);
    return NextResponse.json(
      { surlignages: fichier.surlignages, majLe: fichier.majLe },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (e) {
    console.error('[surlignages] lecture impossible :', e);
    return NextResponse.json({ error: 'Surlignages indisponibles pour le moment.' }, { status: 503 });
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const acces = await controlerAcces(req, ctx);
  if (acces instanceof NextResponse) return acces;

  // Taille contrôlée AVANT l'analyse JSON (plafond bien sous les 4,5 Mo Vercel).
  const longueur = Number(req.headers.get('content-length') ?? 0);
  if (longueur > MAX_OCTETS_FICHIER) {
    return NextResponse.json({ error: 'Trop de surlignages sur cette fiche.' }, { status: 413 });
  }
  const texte = await req.text();
  if (Buffer.byteLength(texte, 'utf8') > MAX_OCTETS_FICHIER) {
    return NextResponse.json({ error: 'Trop de surlignages sur cette fiche.' }, { status: 413 });
  }
  let corps: unknown;
  try {
    corps = JSON.parse(texte);
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }
  const res = validerListe(corps);
  if (!res.ok) return NextResponse.json({ error: res.erreur }, { status: 400 });

  try {
    const fichier = await ecrireSurlignages(acces.auth.user.id, acces.ficheId, res.surlignages);
    return NextResponse.json({ ok: true, majLe: fichier.majLe, ecartes: res.ecartes });
  } catch (e) {
    console.error('[surlignages] écriture impossible :', e);
    const trop = e instanceof Error && e.message === 'trop volumineux';
    return NextResponse.json(
      { error: trop ? 'Trop de surlignages sur cette fiche.' : 'Enregistrement impossible pour le moment.' },
      { status: trop ? 413 : 503 },
    );
  }
}

export const POST = PUT;
