import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { chargerParametres } from '@/lib/qualite/serveur/base';
import { enregistrerVisionnage } from '@/lib/qualite/serveur/participations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Avancement d'un replay (§4.1) : envoyé par le lecteur à chaque tranche de
 * 10 %. Le premier passage du seuil (80 % par défaut) déclenche, au balayage
 * suivant, le questionnaire à chaud de la séance.
 */
export async function POST(req: Request) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const b = await req.json().catch(() => ({})) as { videoId?: string; coursId?: string | null; ratio?: number; seconds?: number };
  const uuid = /^[0-9a-f-]{36}$/i;
  if (!b.videoId || !uuid.test(b.videoId) || typeof b.ratio !== 'number' || !Number.isFinite(b.ratio)) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  const params = await chargerParametres();
  await enregistrerVisionnage({
    userId: auth.user.id, videoId: b.videoId, coursId: b.coursId && uuid.test(b.coursId) ? b.coursId : null,
    ratio: b.ratio, secondes: typeof b.seconds === 'number' ? b.seconds : 0, seuil: params.hot.seuil_replay,
  });
  return NextResponse.json({ ok: true });
}
