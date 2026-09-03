#!/usr/bin/env node
/**
 * Crée les 4 produits + prix Stripe pour Orthopédie et Odontologie
 * (Approfondi + Approfondi+).
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/create-stripe-products-ortho-odonto.mjs
 *
 * Pour le mode TEST :
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/create-stripe-products-ortho-odonto.mjs
 */
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY manquante. Usage :');
  console.error('   STRIPE_SECRET_KEY=sk_live_... node scripts/create-stripe-products-ortho-odonto.mjs');
  process.exit(1);
}

const stripe = new Stripe(key, { typescript: true });
const isTest = key.startsWith('sk_test_');
console.log(`Mode : ${isTest ? 'TEST' : 'LIVE'}\n`);

const PRODUCTS = [
  {
    name: 'Programme Approfondi — Orthopédie',
    amountCents: 209500,
    envVar: 'STRIPE_PRICE_APPRO_ORTHO',
  },
  {
    name: 'Programme Approfondi + — Orthopédie',
    amountCents: 269500,
    envVar: 'STRIPE_PRICE_APPRO_ORTHO_PLUS',
  },
  {
    name: 'Programme Approfondi — Odontologie',
    amountCents: 209500,
    envVar: 'STRIPE_PRICE_APPRO_ODONTO',
  },
  {
    name: 'Programme Approfondi + — Odontologie',
    amountCents: 269500,
    envVar: 'STRIPE_PRICE_APPRO_ODONTO_PLUS',
  },
];

const results = [];

for (const p of PRODUCTS) {
  const product = await stripe.products.create({
    name: p.name,
    description: `Major ECN — ${p.name}`,
    metadata: { env_var: p.envVar },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: p.amountCents,
    currency: 'eur',
  });

  results.push({ ...p, productId: product.id, priceId: price.id });
  console.log(`✅ ${p.name}`);
  console.log(`   Product : ${product.id}`);
  console.log(`   Price   : ${price.id}  (${p.amountCents / 100} €)`);
  console.log(`   Env var : ${p.envVar}=${price.id}\n`);
}

console.log('─'.repeat(60));
console.log('\nVariables d\'environnement à ajouter sur Vercel :\n');
for (const r of results) {
  console.log(`${r.envVar}=${r.priceId}`);
}
console.log('\n✅ Terminé. Ajoutez ces variables dans Vercel > Project Settings > Environment Variables, puis redéployez.');
