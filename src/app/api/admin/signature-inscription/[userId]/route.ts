/**
 * GET /api/admin/signature-inscription/[userId]
 *
 * Signature(s) manuscrite(s) recueillie(s) à l'inscription payante d'un élève.
 * Elles sont rangées dans un bucket privé, indexées par adresse email — la
 * seule clé disponible au moment de la signature, le compte n'existant pas
 * encore (cf. `lib/signatures/inscription.ts`).
 *
 * Réponse : une liste, la plus récente d'abord, chaque entrée portant une URL
 * de consultation signée valable une heure et le contexte figé de la
 * souscription (formule, spécialité, voie, horodatage, session Stripe).
 *
 * Un élève peut en avoir plusieurs : réinscription, ou tentative de paiement
 * abandonnée puis reprise. Aucune n'est écrasée.
 *
 * Réservé aux admins.
 */
import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { listSignaturesForEmail } from '@/lib/signatures/inscription';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: student } = await db
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .maybeSingle();

  const email = (student?.email ?? '').trim();
  if (!email) {
    return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  }

  const signatures = await listSignaturesForEmail(email);
  signatures.sort((a, b) => (b.signedAt ?? '').localeCompare(a.signedAt ?? ''));

  return NextResponse.json({
    student: {
      name: `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.trim(),
      email,
    },
    signatures,
  });
}
