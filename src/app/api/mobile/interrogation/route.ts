import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  interrogationsComposees,
  ouverturesInterrogation,
  questionsDuTirage,
  viviersInterrogation,
} from '@/lib/pedago/interrogation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/interrogation?cours=<id> — l'écran d'interrogation de l'app,
 * décidé SERVEUR par les fonctions de la page web (`/cours/[cours]/interrogation`)
 * et du verrou (`/api/mobile/gates`).
 *
 * L'écran rejouait ses propres règles côté client : il exigeait une
 * `qcm_sessions` TERMINÉE quand le verrou compte une réponse (`qcm_attempts`),
 * ignorait le contournement Pneumologie et les interrogations composées. Un
 * élève que les gates conduisaient sur son interrogation y trouvait des
 * prérequis « à faire » dont chaque lien le ramenait… sur l'interrogation. Lu
 * ici par les mêmes fonctions que les gates, un cours que le verrou retient
 * s'ouvre toujours, avec des questions.
 *
 * Réponses :
 *  - `indisponible` : la page web renverrait ailleurs (cours masqué, accès perdu
 *    au collège, à l'item ou à l'interrogation par la formule) ;
 *  - `prerequis`    : le parcours n'est pas terminé — les quatre étapes ;
 *  - `composee`     : interrogation composée par l'équipe, passée par le moteur
 *    d'épreuve (`/api/mobile/exams?id=`) ;
 *  - `tirage`       : les questions du tirage automatique (éventuellement
 *    aucune : « Aucune question disponible »).
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const coursId = new URL(req.url).searchParams.get('cours') ?? '';
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });

  // Profil lu comme par les gates (service-role) : le rôle et le périmètre qui
  // décident du verrou décident aussi de cet écran.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (createAdminClient() as any)
    .from('profiles').select('role, permission_scope').eq('id', auth.user.id).maybeSingle();

  const ouverture = (await ouverturesInterrogation(
    auth.supabase,
    { id: auth.user.id, role: profile?.role, permission_scope: profile?.permission_scope },
    [coursId],
  )).get(coursId) ?? { ok: false as const, refus: 'introuvable' as const };
  if (!ouverture.ok) {
    if (ouverture.refus === 'prerequis') {
      return NextResponse.json({ statut: 'prerequis', titre: ouverture.cours.titre, prerequis: ouverture.prerequis });
    }
    return NextResponse.json({ statut: 'indisponible' });
  }
  const titre = ouverture.cours.titre;

  const composee = (await interrogationsComposees([coursId])).get(coursId);
  if (composee) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: completion } = await (auth.supabase as any)
      .from('parcours_completions')
      .select('certificate_signed_at')
      .eq('user_id', auth.user.id).eq('cours_id', coursId).maybeSingle();
    return NextResponse.json({
      statut: 'composee',
      titre,
      examen_id: composee.id,
      signe: !!completion?.certificate_signed_at,
    });
  }

  const vivier = (await viviersInterrogation(auth.supabase, [coursId])).get(coursId)
    ?? { series: [], questions: [] };
  const questions = (await questionsDuTirage(auth.supabase, vivier)).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    items: q.items.map(({ lettre, enonce, is_correct }) => ({ lettre, enonce, is_correct })),
  }));
  return NextResponse.json({ statut: 'tirage', titre, questions });
}
