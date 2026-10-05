import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { PLAN_MOBILE_ENABLED } from '@/lib/modules-flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Planificateur adaptatif EVC — pendant mobile.
 *
 * Le planificateur V4.1 (préparations, auto-évaluation, journées versionnées,
 * unités validées, mode prioritaire) n'existe que sur le site : l'app publiée
 * sur les stores parle encore le contrat de l'ancienne version, dont les
 * tables sont retirées. Tant qu'une version de l'app V4.1 n'est pas publiée
 * (`PLAN_MOBILE_ENABLED`), cette route répond « module fermé » à tout le monde,
 * staff compris : l'app affiche alors « Bientôt disponible » au lieu d'écrans
 * construits sur des données qui n'existent plus. Le candidat retrouve son
 * planning complet sur le site.
 *
 * GET (et GET ?acces=1) → { ouvert: false }.
 * POST → 403.
 */

async function identifier(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: profile } = await db.from('profiles').select('is_active').eq('id', auth.user.id).maybeSingle();
  if (profile?.is_active === false) return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
  return null;
}

export async function GET(req: Request) {
  const refus = await identifier(req);
  if (refus) return refus;
  // Contrat V4.1 mobile à écrire avant d'ouvrir ce drapeau : l'ancien contrat n'est plus servi.
  void PLAN_MOBILE_ENABLED;
  return NextResponse.json({ ouvert: false, eligible: false, presentation: false });
}

export async function POST(req: Request) {
  const refus = await identifier(req);
  if (refus) return refus;
  return NextResponse.json({ error: 'Mon planning est disponible sur le site Major ECN.' }, { status: 403 });
}
