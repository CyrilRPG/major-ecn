import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Émargement d'une vidéo de cours ou d'une séance approfondie, depuis l'app.
 *
 * Pendant mobile de la barrière web (`EmargementGate` + POST /api/emargement) :
 * à 20 % de lecture, l'élève DOIT signer sa feuille (formation
 * professionnelle). La page web lit l'état en base au chargement pour qu'un
 * rechargement ne contourne pas la signature ; l'app n'avait ni cette lecture
 * ni la barrière.
 *
 *   GET  /api/mobile/emargement-video?cours=<id>&kind=video|seance
 *     → { required, pending, signed }
 *       required : l'utilisateur est soumis à l'émargement (élève seulement,
 *                  comme sur le web) ;
 *       pending  : émargement dû (seuil franchi) et pas encore signé ;
 *       signed   : déjà signé.
 *
 *   POST /api/mobile/emargement-video
 *     { action: 'require', coursId, kind, watchedRatio?, watchedSeconds? }
 *       → { ok: true, signed }        (idempotent)
 *     { action: 'sign', coursId, kind, signaturePng }
 *       → { ok: true, alreadySigned } (une signature posée n'est jamais écrasée)
 *
 * Mêmes écritures que /api/emargement (table `course_attendances`, RLS de
 * l'élève) ; la vidéo du cours est considérée comme VUE dès la signature.
 */

/** Garde-fou : une signature PNG raisonnable pèse quelques dizaines de Ko. */
const MAX_SIGNATURE_CHARS = 400_000;

type Kind = 'video' | 'seance';

function parseKind(raw: string | null | undefined): Kind {
  return raw === 'seance' ? 'seance' : 'video';
}

type Body = {
  action?: 'require' | 'sign';
  coursId?: string;
  kind?: string;
  watchedRatio?: number;
  watchedSeconds?: number;
  signaturePng?: string;
};

export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const url = new URL(req.url);
  const coursId = (url.searchParams.get('cours') ?? '').trim();
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });
  const kind = parseKind(url.searchParams.get('kind'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any;
  const [{ data: profile }, { data: ligne, error }] = await Promise.all([
    db.from('profiles').select('role').eq('id', auth.user.id).maybeSingle(),
    db.from('course_attendances')
      .select('signed_at')
      .eq('user_id', auth.user.id)
      .eq('cours_id', coursId)
      .eq('kind', kind)
      .maybeSingle(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Administration et professeurs consultent sans être soumis à l'obligation.
  const required = (profile as { role?: string } | null)?.role === 'student';
  const signed = !!(ligne as { signed_at?: string | null } | null)?.signed_at;
  return NextResponse.json({ required, pending: !!ligne && !signed, signed });
}

export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  const userId = auth.user.id;

  const body = (await req.json().catch(() => ({}))) as Body;
  const coursId = (body.coursId ?? '').trim();
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });
  const kind = parseKind(body.kind);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any;

  if (body.action === 'sign') {
    const signature = body.signaturePng ?? '';
    if (!signature.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }
    if (signature.length > MAX_SIGNATURE_CHARS) {
      return NextResponse.json({ error: 'Signature trop volumineuse' }, { status: 413 });
    }
    // Filet : la ligne « émargement dû » doit exister avant la signature (un
    // appel « require » perdu hors ligne ne doit pas faire échouer l'envoi).
    const creation = await creerLigne(db, req, userId, coursId, kind, null, null);
    if (creation) return creation;

    // `.is('signed_at', null)` : idempotent, une signature posée n'est jamais remplacée.
    const { data, error } = await db
      .from('course_attendances')
      .update({ signed_at: new Date().toISOString(), signature_png: signature })
      .eq('user_id', userId)
      .eq('cours_id', coursId)
      .eq('kind', kind)
      .is('signed_at', null)
      .select('id')
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Règle produit (web) : la vidéo du cours est VUE dès l'émargement signé.
    if (data && kind === 'video') {
      await db.from('course_progress').upsert(
        { user_id: userId, cours_id: coursId, video_watched: true, last_seen_at: new Date().toISOString() },
        { onConflict: 'user_id,cours_id' },
      ).then(() => null, () => null);
    }
    return NextResponse.json({ ok: true, alreadySigned: !data });
  }

  const ratio = typeof body.watchedRatio === 'number' && Number.isFinite(body.watchedRatio)
    ? Math.min(1, Math.max(0, body.watchedRatio))
    : null;
  const seconds = typeof body.watchedSeconds === 'number' && Number.isFinite(body.watchedSeconds)
    ? Math.max(0, Math.round(body.watchedSeconds))
    : null;
  const { data: existante } = await db
    .from('course_attendances')
    .select('signed_at')
    .eq('user_id', userId)
    .eq('cours_id', coursId)
    .eq('kind', kind)
    .maybeSingle();
  if (existante) return NextResponse.json({ ok: true, signed: !!existante.signed_at });

  const creation = await creerLigne(db, req, userId, coursId, kind, ratio, seconds);
  if (creation) return creation;
  return NextResponse.json({ ok: true, signed: false });
}

/**
 * Crée la ligne « émargement dû » si elle n'existe pas (instantané du titre
 * et du collège : la feuille reste lisible si le cours change). Renvoie une
 * réponse d'erreur, ou `null`.
 */
async function creerLigne(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  req: Request,
  userId: string,
  coursId: string,
  kind: Kind,
  ratio: number | null,
  seconds: number | null,
): Promise<NextResponse | null> {
  const { data: c } = await db.from('cours').select('id, titre, matiere_id').eq('id', coursId).maybeSingle();
  if (!c) return NextResponse.json({ code: 'COURS_INTROUVABLE', error: 'Cours introuvable' }, { status: 404 });
  const { error } = await db.from('course_attendances').insert({
    user_id: userId,
    cours_id: coursId,
    kind,
    watched_ratio: ratio,
    watched_seconds: seconds,
    cours_titre: c.titre,
    matiere_id: c.matiere_id,
    user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  });
  // 23505 = ligne déjà présente (autre appareil, rejeu) : résultat attendu.
  if (error && !/duplicate|23505/i.test(`${error.code} ${error.message}`)) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return null;
}
