import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { TICKET_TTL_MS, nouveauTicket, origineOnglet } from '@/lib/auth/impersonation-onglet';

export const dynamic = 'force-dynamic';

const Corps = z.object({ user_id: z.string().uuid() });

/** Plafond anti-emballement : tickets émis par un même admin sur 5 minutes. */
const MAX_TICKETS_5_MIN = 20;

/**
 * POST /api/admin/impersonate/onglet — émet un ticket « se connecter en tant
 * que » pour un NOUVEL ONGLET (cf. lib/auth/impersonation-onglet.ts). La
 * session admin courante n'est ni lue ni modifiée : rien n'est écrit dans les
 * cookies de cette origine.
 */
export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const adminId = guard.auth.user.id;

  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Élève invalide' }, { status: 400 });
  const { user_id: targetId } = parsed.data;
  if (targetId === adminId) return NextResponse.json({ error: 'C’est votre propre compte.' }, { status: 400 });

  // Hôte RÉEL de la requête (en-têtes) : `req.url` peut être normalisé par Next.
  const hote = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host).split(',')[0].trim().toLowerCase();
  const origine = origineOnglet(hote);
  if (!origine) {
    return NextResponse.json({ error: 'Ouverture dans un nouvel onglet indisponible sur ce domaine.' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // Seuls les comptes ÉLÈVES : jamais un administrateur ou un membre de l'équipe.
  const { data: cible } = await db.from('profiles').select('id, role, email').eq('id', targetId).maybeSingle();
  if (!cible?.email) return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  if (cible.role !== 'student') {
    return NextResponse.json({ error: 'Réservé aux comptes élèves.' }, { status: 403 });
  }

  const depuis = new Date(Date.now() - 5 * 60_000).toISOString();
  const { count } = await db.from('impersonation_tickets')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', adminId).gte('created_at', depuis);
  if ((count ?? 0) >= MAX_TICKETS_5_MIN) {
    return NextResponse.json({ error: 'Trop d’ouvertures rapprochées — réessayez dans quelques minutes.' }, { status: 429 });
  }

  const { jeton, empreinte } = nouveauTicket();
  const { error } = await db.from('impersonation_tickets').insert({
    token_hash: empreinte,
    admin_id: adminId,
    target_id: targetId,
    expires_at: new Date(Date.now() + TICKET_TTL_MS).toISOString(),
  });
  if (error) return NextResponse.json({ error: 'Impossible de préparer la session.' }, { status: 500 });

  return NextResponse.json(
    { url: `${origine}/api/impersonation/ouvrir?t=${jeton}` },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
