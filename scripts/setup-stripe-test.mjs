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

/**
 * Textes d'amorçage des produits.
 *
 * Source de vérité : `src/lib/stripe/copy.ts`, appliquée au dashboard par
 * `/api/admin/stripe-catalogue?apply=1`. Ce script étant du JS pur, il ne peut
 * pas importer le module TypeScript : on recopie ici la version courante, et la
 * route admin fait foi en cas de divergence.
 *
 * Ces descriptions ne nomment volontairement NI spécialité NI voie de concours :
 * la fiche produit est partagée par tous les acheteurs de la formule (le prix ne
 * dépend pas de la spécialité). Les versions précédentes affirmaient « Accès
 * complet à la Médecine Générale (voie interne + voie externe) » — faux dès
 * qu'un étudiant s'inscrivait dans une autre spécialité ou une seule voie. Le
 * périmètre réellement acheté est rappelé sur la page de paiement par
 * `custom_text.submit.message` (cf. api/stripe/checkout).
 */
const FORMULES = [
  {
    name: 'Formule Essentielle - Major ECN',
    description:
      "Préparation aux EVC — Formule Essentielle. Accès à la plateforme Major ECN : QCM corrigés, questions rédactionnelles, flashcards, fiches de synthèse et méthode EVC. L'accès porte sur la spécialité et la voie de concours choisies à l'inscription, rappelées ci-dessous.",
    amountCents: 49500,
    envVar: 'STRIPE_PRICE_ESSENTIELLE',
  },
  {
    name: 'Formule Intensive - Major ECN',
    description:
      "Préparation aux EVC — Formule Intensive. Tout le contenu de la Formule Essentielle, complété par des cas cliniques approfondis, des épreuves blanches inspirées des EVC, les cours vidéo et un suivi personnalisé. L'accès porte sur la spécialité et la voie de concours choisies à l'inscription, rappelées ci-dessous.",
    amountCents: 99500,
    envVar: 'STRIPE_PRICE_INTENSIVE',
  },
  {
    name: 'Programme Approfondi - Major ECN',
    description:
      "Préparation aux EVC — Programme Approfondi. Accès illimité à la plateforme, séances de cours en direct et replays, accompagnement individuel par un enseignant. Le tarif et le périmètre dépendent de la spécialité et du niveau d'offre retenus à l'inscription, rappelés ci-dessous.",
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
    // Un produit existant garde son ANCIENNE description tant qu'on ne la
    // réécrit pas — c'est ainsi que la mention erronée « Médecine Générale
    // (voie interne + voie externe) » a survécu à toutes les relances.
    if (product.description !== f.description) {
      product = await stripe.products.update(product.id, { description: f.description });
      console.log('   ↻ Description mise à jour');
    }
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
