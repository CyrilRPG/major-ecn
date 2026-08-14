/**
 * POST /api/emargement — feuille d'émargement d'un cours.
 *
 * Deux actions :
 *   { action: 'require', coursId, watchedRatio, watchedSeconds }
 *     Déclenchée par le lecteur vidéo au franchissement du seuil (20 %).
 *     Crée la ligne « émargement dû » si elle n'existe pas encore. Idempotent.
 *
 *   { action: 'sign', coursId, signaturePng }
 *     Enregistre la signature manuscrite. Ne peut pas écraser une signature
 *     existante (garanti aussi par la RLS : UPDATE réservé aux lignes non
 *     signées).
 *
 * L'état vit en base, pas dans le navigateur : recharger la page ne permet pas
 * d'échapper à l'émargement.
 */
import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Garde-fou : une signature PNG raisonnable pèse quelques dizaines de Ko. */
const MAX_SIGNATURE_CHARS = 400_000;

type Body = {
  action?: 'require' | 'sign';
  coursId?: string;
  /** 'video' = vidéo du cours ; 'seance' = séance approfondie. */
  kind?: string;
  watchedRatio?: number;
  watchedSeconds?: number;
  signaturePng?: string;
};

/** La vidéo du cours et la séance approfondie sont deux séances de formation
 *  distinctes : chacune s'émarge séparément. */
function parseKind(raw: string | undefined): 'video' | 'seance' {
  return raw === 'seance' ? 'seance' : 'video';
}

export async function POST(req: Request) {
  // Auth duale cookie OU Bearer. Le cookie seul ne suffisait pas : le
  // middleware ne rafraîchit pas la session sur cette route (elle n'est pas
  // dans `isProtectedRoute`), et une page laissée ouverte pendant une longue
  // vidéo finissait avec un jeton périmé dans ses cookies. L'étudiant se
  // voyait alors refuser sa signature — « Non authentifié » — sans aucun
  // moyen de s'en sortir, la modale d'émargement n'étant pas fermable. Le
  // navigateur, lui, sait toujours produire un jeton frais : il l'envoie en
  // Bearer (cf. lib/auth/fresh-token.ts).
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = auth.user;

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

    // `.is('signed_at', null)` rend l'opération idempotente et empêche qu'un
    // second envoi ne remplace la signature déjà enregistrée.
    const { data, error } = await db
      .from('course_attendances')
      .update({ signed_at: new Date().toISOString(), signature_png: signature })
      .eq('user_id', user.id)
      .eq('cours_id', coursId)
      .eq('kind', kind)
      .is('signed_at', null)
      .select('id')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Règle produit : la vidéo du cours est considérée comme VUE dès
    // l'émargement signé (l'obligation naît à 20 % de lecture). On aligne
    // course_progress — la source de vérité des « vidéos vues » partout
    // (CRM, parcours, interrogation) — sans attendre les 80 % du lecteur.
    if (data && kind === 'video') {
      await db.from('course_progress').upsert(
        {
          user_id: user.id,
          cours_id: coursId,
          video_watched: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,cours_id' },
      ).then(() => null, () => null); // best-effort : la signature est déjà enregistrée.
    }

    // Aucune ligne mise à jour = déjà signée (ou jamais déclenchée) : dans les
    // deux cas l'étudiant n'est plus bloqué, on répond OK.
    return NextResponse.json({ ok: true, alreadySigned: !data });
  }

  // ── action 'require' (défaut) ──────────────────────────────────────────
  const { data: existing } = await db
    .from('course_attendances')
    .select('id, signed_at')
    .eq('user_id', user.id)
    .eq('cours_id', coursId)
    .eq('kind', kind)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, signed: !!existing.signed_at });
  }

  // Instantané du cours : la feuille doit rester lisible si le cours change.
  const { data: c } = await db
    .from('cours')
    .select('id, titre, matiere_id')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });

  const ratio = typeof body.watchedRatio === 'number' && Number.isFinite(body.watchedRatio)
    ? Math.min(1, Math.max(0, body.watchedRatio))
    : null;
  const seconds = typeof body.watchedSeconds === 'number' && Number.isFinite(body.watchedSeconds)
    ? Math.max(0, Math.round(body.watchedSeconds))
    : null;

  const { error } = await db.from('course_attendances').insert({
    user_id: user.id,
    cours_id: coursId,
    kind,
    watched_ratio: ratio,
    watched_seconds: seconds,
    cours_titre: c.titre,
    matiere_id: c.matiere_id,
    user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  });

  // 23505 = course créé en parallèle par un autre onglet : c'est le résultat
  // attendu, pas une erreur.
  if (error && !/duplicate|23505/i.test(`${error.code} ${error.message}`)) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, signed: false });
}
