/**
 * Ouverture des codes de réduction programmés.
 *
 * Stripe ne connaît pas la notion de « date de début » sur un code
 * promotionnel : seulement une date de fin. Un code créé avec une date de début
 * future est donc créé INACTIF, sa date étant conservée dans ses métadonnées
 * (`starts_at` + `auto_activate`). Ce cron l'ouvre le jour venu.
 *
 * Sans lui, un code annoncé « à partir du 1er septembre » resterait fermé pour
 * toujours — c'est-à-dire une promotion communiquée aux candidats qui ne marche
 * pas. Le cron tourne donc chaque heure, et ne touche jamais à un code qu'un
 * admin a fermé à la main (`auto_activate` repassé à '0' à la désactivation).
 *
 * CE CRON N'A PAS LE DROIT DE FERMER UN CODE. Du 03/09 au 07/09/2026 il
 * fermait d'office tout code en euros : cinq codes remis à des candidats se
 * sont retrouvés refusés sur la page de paiement (« les codes promo ne
 * fonctionnent pas du tout »). Il ne fait plus qu'ouvrir : les codes
 * programmés le jour venu, et — une fois — les codes qu'il avait fermés.
 */
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { activateScheduledPromoCodes, reopenPromoCodesClosedByCron } from '@/lib/stripe/promo-codes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const { activated, errors } = await activateScheduledPromoCodes(stripe);
    if (activated.length > 0) {
      console.log('[promo-codes-activate] codes ouverts :', activated.join(', '));
    }
    // Réparation : rouvre les codes en euros que l'ancienne version de ce cron
    // avait fermés d'office. Sans effet une fois tous rouverts.
    const rouverts = await reopenPromoCodesClosedByCron(stripe);
    if (rouverts.reopened.length > 0) {
      console.log('[promo-codes-activate] codes rouverts :', rouverts.reopened.join(', '));
    }
    errors.push(...rouverts.errors);
    if (errors.length > 0) {
      console.error('[promo-codes-activate] erreurs :', errors.join(' | '));
    }
    return NextResponse.json({ ok: true, activated, reopened: rouverts.reopened, errors });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[promo-codes-activate]', e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
