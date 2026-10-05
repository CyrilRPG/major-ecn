import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { hierarchieColleges, listerEquipe } from '@/lib/equipe/server';
import { POST as enregistrerCollaborateur } from '@/app/api/admin/equipe/route';

export const runtime = 'nodejs';

/**
 * /api/mobile/equipe — « Équipe & Permissions » dans l'app (05/10/2026),
 * pendant de la page web /admin/equipe. Administrateurs seulement.
 *
 * GET  → { membres, colleges }  : tout le personnel (scope lu par
 *        `lireScopeEquipe`, 2FA, dernière connexion) et l'arbre des collèges.
 * POST → création (sans `userId`) ou modification (avec `userId`) : MÊME
 *        traitement que le web (`/api/admin/equipe`), qui revérifie
 *        l'administrateur par le jeton Bearer — invitation, périmètre déployé,
 *        restriction d'items ajustée, journal.
 */

async function administrateur(req: Request): Promise<NextResponse | null> {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  const { data } = await createAdminClient().from('profiles').select('role, is_active').eq('id', auth.user.id).maybeSingle();
  const p = data as { role?: string; is_active?: boolean | null } | null;
  if (p?.role !== 'admin' || p.is_active === false) {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const refus = await administrateur(req);
  if (refus) return refus;
  const [membres, hierarchie] = await Promise.all([listerEquipe(), hierarchieColleges()]);
  return NextResponse.json(
    {
      membres: membres.map((m) => ({
        id: m.id, role: m.role, first_name: m.first_name, last_name: m.last_name, email: m.email, phone: m.phone,
        is_active: m.is_active, access_end: m.access_end, last_sign_in: m.last_sign_in, mfa_facteurs: m.mfa_facteurs, scope: m.scope,
      })),
      colleges: hierarchie.arbre,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST(req: Request) {
  const refus = await administrateur(req);
  if (refus) return refus;
  return enregistrerCollaborateur(req);
}
