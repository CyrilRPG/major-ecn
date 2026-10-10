import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { ajouterJours, instantParis } from '@/lib/agenda/planning';
import { tachesAgenda, type Db } from '@/lib/postits/depot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * GET /api/postits/agenda?debut=AAAA-MM-JJ&fin=AAAA-MM-JJ — tâches Post-it
 * datées de l'élève, telles que les affiche l'agenda (§38-43). Par défaut :
 * −2 mois / +6 mois autour d'aujourd'hui (Paris), comme la page /agenda.
 * Pour l'application mobile (Bearer) ; le web les lit côté serveur.
 */
export async function GET(req: Request) {
  const a = await getRequestUser(req);
  if (!a) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (a.via === 'bearer') {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }
  const url = new URL(req.url);
  const aujourdHui = instantParis().date;
  const debut = url.searchParams.get('debut') ?? ajouterJours(aujourdHui, -60);
  const fin = url.searchParams.get('fin') ?? ajouterJours(aujourdHui, 180);
  if (!RE_DATE.test(debut) || !RE_DATE.test(fin) || debut > fin) {
    return NextResponse.json({ error: 'Fenêtre invalide' }, { status: 400 });
  }
  try {
    const taches = await tachesAgenda(a.supabase as unknown as Db, a.user.id, debut, fin);
    return NextResponse.json({ aujourdHui, taches }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('[postits/agenda]', e);
    return NextResponse.json({ error: 'Agenda indisponible pour le moment.' }, { status: 503 });
  }
}
