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
 */
import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { activateScheduledPromoCodes, deactivateFixedAmountPromoCodes } from '@/lib/stripe/promo-codes';

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
    // Les codes à montant fixe en euros n'ont plus cours (remise multipliée
    // par le nombre de mensualités en 3×/4×) : fermés à chaque passage.
    const fermes = await deactivateFixedAmountPromoCodes(stripe);
    if (fermes.deactivated.length > 0) {
      console.log('[promo-codes-activate] codes en euros fermés :', fermes.deactivated.join(', '));
    }
    errors.push(...fermes.errors);
    if (errors.length > 0) {
      console.error('[promo-codes-activate] erreurs :', errors.join(' | '));
    }
    return NextResponse.json({ ok: true, activated, deactivated: fermes.deactivated, errors });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur';
    console.error('[promo-codes-activate]', e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
