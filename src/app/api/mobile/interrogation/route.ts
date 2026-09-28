/* eslint-disable @typescript-eslint/no-explicit-any -- `parcours_completions` et `mock_exam*`
   sont absentes de l'instantané curaté de `types/database.ts`. */
import { NextResponse } from 'next/server';
import { getBearerUser, type RequestAuth } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  N_QUESTIONS_INTERROGATION,
  interrogationsComposees,
  ouverturesInterrogation,
  questionsDuTirage,
  viviersInterrogation,
  type OuvertureInterrogation,
} from '@/lib/pedago/interrogation';
import { signerJeton, verifierJeton } from '@/lib/certificats/lien-signe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Garde-fou : une signature PNG raisonnable pèse quelques dizaines de Ko. */
const MAX_SIGNATURE_CHARS = 400_000;

/**
 * Jeton du tirage : la liste des questions tirées au GET, signée (HMAC) pour
 * CET élève et CE cours, valable 3 h. Le POST ne note que ces questions :
 * sans lui, l'app pouvait choisir dans le vivier les N questions qui lui
 * convenaient (ou rejouer des GET jusqu'à un tirage facile).
 */
const USAGE_TIRAGE = 'interrogation-tirage';
const DUREE_TIRAGE_MS = 3 * 60 * 60_000;
type ChargeTirage = { u: string; c: string; q: string[] };

function signerTirage(userId: string, coursId: string, questionIds: string[]): string {
  return signerJeton(USAGE_TIRAGE, { u: userId, c: coursId, q: questionIds } satisfies ChargeTirage, DUREE_TIRAGE_MS);
}

/** Questions du tirage signé, ou null (absent, falsifié, expiré, autre élève ou cours). */
function questionsDuJeton(jeton: unknown, userId: string, coursId: string): string[] | null {
  if (typeof jeton !== 'string' || jeton.length > 8_000) return null;
  const charge = verifierJeton<ChargeTirage>(USAGE_TIRAGE, jeton);
  if (!charge || charge.u !== userId || charge.c !== coursId || !Array.isArray(charge.q)) return null;
  const ids = charge.q.filter((id): id is string => typeof id === 'string');
  return ids.length > 0 ? ids : null;
}

/**
 * /api/mobile/interrogation — l'interrogation de fin de parcours de l'app,
 * décidée SERVEUR par les fonctions de la page web (`/cours/[cours]/interrogation`)
 * et du verrou (`/api/mobile/gates`).
 *
 * GET ?cours=<id> →
 *  - `{ statut: 'indisponible' }` : la page web renverrait ailleurs ;
 *  - `{ statut: 'prerequis', titre, prerequis }` : parcours non terminé ;
 *  - `{ statut: 'composee', titre, examen_id, signe }` : interrogation composée,
 *    passée par le moteur d'épreuve (`/api/mobile/exams?id=`) ;
 *  - `{ statut: 'tirage', titre, questions, jeton, signe, score, total }` :
 *    tirage automatique. Les questions portent leurs images (énoncé et
 *    propositions) mais JAMAIS leur corrigé : la note n'est donnée qu'à la
 *    fin, comme sur le web, et calculée ICI. `jeton` = ids tirés signés (3 h).
 *
 * POST { action: 'terminer', cours, reponses?, jeton? } → { score, total }
 *   Tirage : `jeton` du GET OBLIGATOIRE (400 `TIRAGE_INVALIDE` sinon) ;
 *   `reponses = [{ question_id, lettres }]`, notées serveur pour les SEULES
 *   questions du jeton (la question n'est juste que si les lettres cochées
 *   sont exactement les bonnes).
 *   Composée : score de la copie remise, relu en base.
 *   Dans les deux cas, le score est reporté dans `parcours_completions` (ce que
 *   fait `saveInterrogationResult` sur le web) : c'est la ligne que la
 *   signature marque ensuite.
 *
 * POST { action: 'signer', cours, signature } → { ok: true }
 *   Signature manuscrite (PNG en data URL) du certificat : renseigne
 *   `certificate_signed_at`, ce qui lève le verrou de l'interrogation.
 */

type Contexte = { auth: RequestAuth; profile: { role: string | null; permission_scope: unknown; promotion: string | null } | null };

async function contexte(req: Request): Promise<Contexte | NextResponse> {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  // Profil lu comme par les gates (service-role) : le rôle et le périmètre qui
  // décident du verrou décident aussi de cet écran.
  const { data: profile } = await (createAdminClient() as any)
    .from('profiles').select('role, permission_scope, promotion').eq('id', auth.user.id).maybeSingle();
  return { auth, profile: profile ?? null };
}

async function ouverture(ctx: Contexte, coursId: string): Promise<OuvertureInterrogation> {
  return (await ouverturesInterrogation(
    ctx.auth.supabase,
    { id: ctx.auth.user.id, role: ctx.profile?.role ?? null, permission_scope: ctx.profile?.permission_scope ?? null },
    [coursId],
  )).get(coursId) ?? { ok: false as const, refus: 'introuvable' as const };
}

async function completion(ctx: Contexte, coursId: string) {
  const { data } = await (ctx.auth.supabase as any)
    .from('parcours_completions')
    .select('qcm_test_score, qcm_test_total, certificate_signed_at')
    .eq('user_id', ctx.auth.user.id).eq('cours_id', coursId).maybeSingle();
  return data as { qcm_test_score: number | null; qcm_test_total: number | null; certificate_signed_at: string | null } | null;
}

export async function GET(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;

  const coursId = new URL(req.url).searchParams.get('cours') ?? '';
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });

  const ouv = await ouverture(ctx, coursId);
  if (!ouv.ok) {
    if (ouv.refus === 'prerequis') {
      return NextResponse.json({ statut: 'prerequis', titre: ouv.cours.titre, prerequis: ouv.prerequis });
    }
    return NextResponse.json({ statut: 'indisponible' });
  }
  const titre = ouv.cours.titre;
  const faite = await completion(ctx, coursId);

  const composee = (await interrogationsComposees([coursId])).get(coursId);
  if (composee) {
    return NextResponse.json({
      statut: 'composee',
      titre,
      examen_id: composee.id,
      signe: !!faite?.certificate_signed_at,
    });
  }

  const vivier = (await viviersInterrogation(ctx.auth.supabase, [coursId])).get(coursId)
    ?? { series: [], questions: [] };
  // Déjà signée : l'écran final, sans nouveau tirage (web : phase « done »).
  const questions = faite?.certificate_signed_at ? [] : (await questionsDuTirage(ctx.auth.supabase, vivier)).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    images: q.images ?? [],
    items: q.items.map(({ id, lettre, enonce, images }) => ({ id, lettre, enonce, images: images ?? [] })),
  }));
  return NextResponse.json({
    statut: 'tirage',
    titre,
    questions,
    jeton: questions.length > 0 ? signerTirage(ctx.auth.user.id, coursId, questions.map((q) => q.id)) : null,
    // Taille du vivier jouable : un élève déjà signé garde l'accès à l'écran final.
    disponible: vivier.questions.length > 0,
    signe: !!faite?.certificate_signed_at,
    score: faite?.qcm_test_score ?? null,
    total: faite?.qcm_test_total ?? null,
  });
}

/** Report du score dans le parcours — pendant de `saveInterrogationResult`. */
async function reporter(ctx: Contexte, coursId: string, score: number, total: number) {
  const { error } = await (ctx.auth.supabase as any).from('parcours_completions').upsert(
    {
      user_id: ctx.auth.user.id,
      cours_id: coursId,
      qcm_test_score: score,
      qcm_test_total: total,
      qcm_test_completed_at: new Date().toISOString(),
      promotion: ctx.profile?.promotion ?? null,
    },
    { onConflict: 'user_id,cours_id' },
  );
  return error ? error.message : null;
}

export async function POST(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;

  const body = await req.json().catch(() => ({})) as {
    action?: string;
    cours?: string;
    reponses?: { question_id?: unknown; lettres?: unknown }[];
    signature?: string;
    jeton?: unknown;
  };
  const coursId = typeof body.cours === 'string' ? body.cours : '';
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });

  const ouv = await ouverture(ctx, coursId);
  if (!ouv.ok) return NextResponse.json({ error: 'Interrogation indisponible.' }, { status: 403 });

  if (body.action === 'terminer') {
    // Certificat signé : la note qu'il porte ne se réécrit plus (le web
    // n'offre plus que l'écran final).
    if ((await completion(ctx, coursId))?.certificate_signed_at) {
      return NextResponse.json({ error: 'Cette interrogation est déjà signée.' }, { status: 409 });
    }
    const composee = (await interrogationsComposees([coursId])).get(coursId);
    if (composee) {
      // Score de la copie remise, relu en base : jamais celui de l'appareil.
      const { data: copie } = await (createAdminClient() as any)
        .from('mock_exam_submissions').select('score, max_score')
        .eq('exam_id', composee.id).eq('user_id', ctx.auth.user.id)
        .in('status', ['submitted', 'graded'])
        .order('submitted_at', { ascending: false }).limit(1).maybeSingle();
      if (!copie) return NextResponse.json({ error: 'Aucune copie remise.' }, { status: 400 });
      const score = Math.round(Number(copie.score ?? 0));
      const total = Math.round(Number(copie.max_score ?? 0));
      const err = await reporter(ctx, coursId, score, total);
      if (err) return NextResponse.json({ error: err }, { status: 500 });
      return NextResponse.json({ score, total });
    }

    // Tirage : seules les questions TIRÉES au GET (jeton signé) sont notées,
    // toutes attendues — sans quoi une copie d'une seule question facile
    // vaudrait 1/1, ou l'app choisirait ses questions dans le vivier. Une
    // question retirée du vivier depuis le tirage n'est plus comptée.
    const tirees = questionsDuJeton(body.jeton, ctx.auth.user.id, coursId);
    if (!tirees) {
      return NextResponse.json(
        { error: 'Ce tirage a expiré ou n’est pas valide : recommencez l’interrogation.', code: 'TIRAGE_INVALIDE' },
        { status: 400 },
      );
    }
    const vivier = (await viviersInterrogation(ctx.auth.supabase, [coursId])).get(coursId)
      ?? { series: [], questions: [] };
    const duVivier = new Set(vivier.questions.map((q) => q.id));
    const autorisees = new Set(tirees.filter((id) => duVivier.has(id)));
    const attendu = Math.min(N_QUESTIONS_INTERROGATION, autorisees.size);
    const reponses = new Map<string, Set<string>>();
    for (const r of Array.isArray(body.reponses) ? body.reponses : []) {
      if (typeof r?.question_id !== 'string' || !autorisees.has(r.question_id)) continue;
      const lettres = Array.isArray(r.lettres) ? r.lettres.filter((l): l is string => typeof l === 'string') : [];
      reponses.set(r.question_id, new Set(lettres));
    }
    if (attendu === 0 || reponses.size !== attendu) {
      return NextResponse.json({ error: 'Interrogation incomplète : répondez à toutes les questions.' }, { status: 400 });
    }
    const { data: rows, error } = await (ctx.auth.supabase as any)
      .from('qcm_questions')
      .select('id, qcm_items(lettre, is_correct)')
      .in('id', [...reponses.keys()]);
    if (error) return NextResponse.json({ error: 'Correction impossible pour le moment.' }, { status: 503 });
    let score = 0;
    for (const q of (rows ?? []) as { id: string; qcm_items: { lettre: string; is_correct: boolean }[] | null }[]) {
      const bonnes = new Set((q.qcm_items ?? []).filter((it) => it.is_correct).map((it) => it.lettre));
      const cochees = reponses.get(q.id) ?? new Set<string>();
      if (bonnes.size === cochees.size && [...cochees].every((l) => bonnes.has(l))) score++;
    }
    const total = reponses.size;
    const err = await reporter(ctx, coursId, score, total);
    if (err) return NextResponse.json({ error: err }, { status: 500 });
    return NextResponse.json({ score, total });
  }

  if (body.action === 'signer') {
    const signature = typeof body.signature === 'string' ? body.signature : '';
    if (!signature.startsWith('data:image/png;base64,')) {
      return NextResponse.json({ error: 'Signature manuscrite requise.' }, { status: 400 });
    }
    if (signature.length > MAX_SIGNATURE_CHARS) return NextResponse.json({ error: 'Signature trop volumineuse' }, { status: 413 });
    const faite = await completion(ctx, coursId);
    if (faite?.certificate_signed_at) return NextResponse.json({ ok: true, deja: true });
    if (faite?.qcm_test_total == null) {
      return NextResponse.json({ error: 'Terminez d’abord l’interrogation.' }, { status: 409 });
    }
    // Une mise à jour qui ne touche aucune ligne ne renvoie pas d'erreur : on
    // vérifie qu'une ligne a bien été signée avant d'annoncer la levée du verrou.
    const { data, error } = await (ctx.auth.supabase as any).from('parcours_completions')
      .update({ signature_data_url: signature, certificate_signed_at: new Date().toISOString() })
      .eq('user_id', ctx.auth.user.id)
      .eq('cours_id', coursId)
      .select('cours_id');
    if (error || (data ?? []).length === 0) {
      return NextResponse.json({ error: error?.message ?? 'Signature non enregistrée.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
