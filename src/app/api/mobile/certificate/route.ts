import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { signerLienCertificat } from '@/lib/certificats/lien-signe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/certificate?cours=<id> → { url }
 *
 * Lien signé (10 min) vers la feuille d'émargement / certificat PDF de fin de
 * parcours de l'élève connecté — celle que le web ouvre par
 * `/api/certificate/[cours]`. L'app l'ouvre dans le navigateur système, qui
 * affiche le PDF et permet de l'enregistrer ou de le partager.
 *
 * 404 tant que le certificat n'est pas signé (même règle que la route PDF).
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const coursId = new URL(req.url).searchParams.get('cours') ?? '';
  if (!coursId) return NextResponse.json({ error: 'Cours manquant' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: completion } = await (auth.supabase as any)
    .from('parcours_completions')
    .select('certificate_signed_at')
    .eq('user_id', auth.user.id).eq('cours_id', coursId).maybeSingle();
  if (!completion?.certificate_signed_at) {
    return NextResponse.json({ error: 'Feuille d’émargement non encore signée' }, { status: 404 });
  }

  const url = new URL(`/api/certificate/${encodeURIComponent(coursId)}`, req.url);
  url.searchParams.set('t', signerLienCertificat(auth.user.id, coursId));
  return NextResponse.json({ url: url.href }, { headers: { 'Cache-Control': 'private, no-store' } });
}
