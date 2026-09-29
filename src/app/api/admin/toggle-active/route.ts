import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { desactiverCompte, preciserMotif, reactiverCompte } from '@/lib/admin/compte-actif';
import { parseMotif } from '@/lib/admin/compte-actif-pure';

/**
 * Désactive / réactive un compte, ou précise le motif d'un compte déjà
 * désactivé (`motifSeul: true`). Cf. lib/admin/compte-actif.ts.
 */
export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const body = (await req.json().catch(() => ({}))) as {
    userId?: string; isActive?: boolean; motif?: string | null; note?: string | null; motifSeul?: boolean;
  };
  if (!body.userId || (typeof body.isActive !== 'boolean' && !body.motifSeul)) {
    return NextResponse.json({ error: 'userId / isActive manquants' }, { status: 400 });
  }
  if (body.userId === guard.auth.user.id) {
    return NextResponse.json({ error: 'Impossible de désactiver votre propre compte.' }, { status: 400 });
  }

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service indisponible' }, { status: 500 });
  }

  const motif = parseMotif(body.motif);
  const note = typeof body.note === 'string' ? body.note.slice(0, 500) : null;

  const { error } = body.motifSeul
    ? await preciserMotif(admin, body.userId, { motif, note })
    : body.isActive
      ? await reactiverCompte(admin, body.userId)
      : await desactiverCompte(admin, body.userId, { motif, note, par: guard.auth.user.id });
  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
