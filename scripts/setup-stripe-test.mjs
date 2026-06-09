#!/usr/bin/env node
/**
 * Script de création des 3 produits Stripe en mode TEST.
 *
 * USAGE :
 *   1. Récupère ta clé secrète test sur https://dashboard.stripe.com/test/apikeys
 *      (commence par sk_test_)
 *   2. Lance ce script :
 *      PowerShell :  $env:STRIPE_SECRET_KEY="sk_test_..."; node scripts/setup-stripe-test.mjs
 *      Bash :        STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-test.mjs
 *   3. Copie les 3 price_id affichés dans Vercel → Environment Variables :
 *        STRIPE_PRICE_ESSENTIELLE = price_xxx
 *        STRIPE_PRICE_INTENSIVE   = price_xxx
 *        STRIPE_PRICE_PROGRAMME   = price_xxx
 *   4. Redéploie le projet sur Vercel.
 */

import Stripe from 'stripe';

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error('❌ STRIPE_SECRET_KEY manquante. Configure-la avant de lancer ce script.');
  console.error('   Exemple : $env:STRIPE_SECRET_KEY="sk_test_..."; node scripts/setup-stripe-test.mjs');
  process.exit(1);
}
if (!KEY.startsWith('sk_test_')) {
  console.error(`❌ La clé fournie n'est pas une clé TEST (préfixe attendu : sk_test_).`);
  console.error(`   Clé fournie : ${KEY.slice(0, 8)}...`);
  process.exit(1);
}

const stripe = new Stripe(KEY, { typescript: false });

const FORMULES = [
  {
    name: 'Formule Essentielle - Major ECN',
    description:
      'Préparation EVC - Formule Essentielle. Accès à la plateforme Major ECN avec QCM, flashcards, fiches synthétiques et méthode EVC. Accès complet à la Médecine Générale (voie interne + voie externe).',
    amountCents: 49500,
    envVar: 'STRIPE_PRICE_ESSENTIELLE',
  },
  {
    name: 'Formule Intensive - Major ECN',
    description:
      "Préparation EVC - Formule Intensive. Tout l'Essentielle + cas cliniques approfondis, épreuves blanches inspirées des EVC et suivi personnalisé. Accès complet à la Médecine Générale (voie interne + voie externe).",
    amountCents: 99500,
    envVar: 'STRIPE_PRICE_INTENSIVE',
  },
  {
    name: 'Programme Approfondi - Major ECN',
    description:
      'Préparation EVC - Programme Approfondi. Plateforme EVC accès illimité + accompagnement individuel haut niveau + sessions live et replays. Accès complet à la Médecine Générale (voie interne + voie externe).',
    amountCents: 239500,
    envVar: 'STRIPE_PRICE_PROGRAMME',
  },
];

async function findExistingProduct(name) {
  // Cherche un produit actif avec ce nom (évite les doublons en cas de relance)
  for await (const p of stripe.products.list({ limit: 100, active: true })) {
    if (p.name === name) return p;
  }
  return null;
}

async function findActivePrice(productId, amountCents) {
  // Cherche un prix actif sur ce produit avec ce montant (EUR, paiement unique)
  for await (const pr of stripe.prices.list({ product: productId, limit: 100, active: true })) {
    if (
      pr.currency === 'eur' &&
      pr.unit_amount === amountCents &&
      pr.type === 'one_time'
    ) {
      return pr;
    }
  }
  return null;
}

async function ensureProductWithPrice(f) {
  let product = await findExistingProduct(f.name);
  if (product) {
    console.log(`   ✓ Produit existant : ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: f.name,
      description: f.description,
    });
    console.log(`   ✓ Produit créé : ${product.id}`);
  }

  let price = await findActivePrice(product.id, f.amountCents);
  if (price) {
    console.log(`   ✓ Prix existant : ${price.id} (${(f.amountCents / 100).toFixed(2)} EUR)`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: f.amountCents,
      currency: 'eur',
    });
    console.log(`   ✓ Prix créé : ${price.id} (${(f.amountCents / 100).toFixed(2)} EUR)`);
  }
  return { productId: product.id, priceId: price.id };
}

async function main() {
  console.log('\n🚀 Création des produits Stripe (mode TEST)\n');

  const results = [];
  for (const f of FORMULES) {
    console.log(`📦 ${f.name}`);
    const r = await ensureProductWithPrice(f);
    results.push({ envVar: f.envVar, ...r });
    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Configuration prête.\n');
  console.log('Copie ces valeurs dans Vercel → Project Settings → Environment Variables :\n');
  for (const r of results) {
    console.log(`   ${r.envVar} = ${r.priceId}`);
  }
  console.log('\nPuis redéploie le projet sur Vercel.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((e) => {
  console.error('❌ Erreur :', e?.message ?? e);
  process.exit(1);
});
