#!/usr/bin/env tsx
/**
 * Aligne le nom et la description des produits Stripe sur le catalogue du code
 * (`src/lib/stripe/copy.ts`) — même travail que la route admin
 * `/api/admin/stripe-catalogue`, mais lançable depuis un terminal.
 *
 * POURQUOI CE JUMEAU EN LIGNE DE COMMANDE
 * La route admin exige une session admin dans un navigateur. Ce script, lui, ne
 * demande qu'une clé Stripe dans `.env.local` : la clé ne transite alors ni par
 * une conversation ni par un presse-papier partagé.
 *
 * CLÉ À UTILISER
 * Une clé RESTREINTE suffit et c'est ce qu'il faut préférer : dans Stripe,
 * Développeurs → Clés API → « Créer une clé restreinte », avec la seule
 * permission `Produits : Écriture` (`Prices : Lecture` pour résoudre les
 * produits depuis les price_id). Aucune permission sur les paiements, les
 * clients ou les remboursements n'est nécessaire. La clé se révoque en un clic
 * une fois le travail fait.
 *
 * USAGE
 *   STRIPE_SECRET_KEY=rk_live_... pnpm tsx scripts/sync-stripe-catalogue.ts
 *   pnpm tsx scripts/sync-stripe-catalogue.ts --apply
 *
 * Sans `--apply`, rien n'est écrit : le script se contente d'afficher, pour
 * chaque offre, le texte actuel et le texte attendu. Il ne touche JAMAIS aux
 * prix — uniquement `name` et `description` des produits.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import Stripe from 'stripe';
import { stripeCatalogue } from '../src/lib/stripe/catalogue';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
dotenv({ path: join(__dirname, '..', '.env') });

const apply = process.argv.includes('--apply');

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error(
    '❌ STRIPE_SECRET_KEY absente.\n'
    + '   Ajoute-la dans .env.local (une clé restreinte « Produits : Écriture » suffit),\n'
    + '   ou passe-la en variable d’environnement le temps de la commande.',
  );
  process.exit(1);
}

const mode = KEY.startsWith('sk_test_') || KEY.startsWith('rk_test_') ? 'TEST' : 'LIVE';
const stripe = new Stripe(KEY, { typescript: true });

// tsx compile en CommonJS, où le `await` de premier niveau est refusé :
// tout le travail vit donc dans un main() asynchrone.
async function main() {
  console.log(`\n🔗 Catalogue Stripe — mode ${mode}${apply ? '' : ' (simulation, aucune écriture)'}\n`);

  let aJour = 0;
  let corriges = 0;
  let aCorriger = 0;
  let absentes = 0;
  let problemes = 0;

  // Deux offres qui pointent sur le même produit se battraient pour la
  // description : on le signale plutôt que d'écrire la dernière qui passe.
  const owner = new Map<string, string>();

  for (const entry of stripeCatalogue()) {
    const priceId = process.env[entry.envPriceId];
    if (!priceId) {
      absentes++;
      console.log(`⚪ ${entry.label}\n   ${entry.envPriceId} non renseignée — offre non vendue en ligne.\n`);
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
      const productId = typeof price.product === 'string' ? price.product : price.product.id;

      const previous = owner.get(productId);
      if (previous) {
        problemes++;
        console.log(
          `🟠 ${entry.label}\n   Produit ${productId} déjà utilisé par « ${previous} ». `
          + `Une seule description est possible : créez un produit dédié.\n`,
        );
        continue;
      }
      owner.set(productId, entry.label);

      const product = typeof price.product === 'string' ? null : price.product;
      if (!product || product.deleted) {
        problemes++;
        console.log(`🔴 ${entry.label}\n   Produit supprimé dans Stripe — à recréer.\n`);
        continue;
      }

      const same =
        product.name === entry.copy.name && (product.description ?? '') === entry.copy.description;
      if (same) {
        aJour++;
        console.log(`✅ ${entry.label} — déjà à jour`);
        continue;
      }

      console.log(`✏️  ${entry.label}  (${productId})`);
      if (product.name !== entry.copy.name) {
        console.log(`   nom      avant : ${product.name}`);
        console.log(`   nom      après : ${entry.copy.name}`);
      }
      console.log(`   descr.   avant : ${product.description ?? '(vide)'}`);
      console.log(`   descr.   après : ${entry.copy.description}`);

      if (apply) {
        await stripe.products.update(productId, {
          name: entry.copy.name,
          description: entry.copy.description,
        });
        corriges++;
        console.log('   → appliqué\n');
      } else {
        aCorriger++;
        console.log('');
      }
    } catch (e) {
      problemes++;
      console.log(
        `🔴 ${entry.label}\n   ${e instanceof Error ? e.message : String(e)}\n`
        + `   Vérifie que ${entry.envPriceId} correspond bien au mode ${mode} de la clé.\n`,
      );
    }
  }

  console.log('━'.repeat(60));
  console.log(
    `À jour : ${aJour} · ${apply ? `Corrigés : ${corriges}` : `À corriger : ${aCorriger}`} · `
    + `Variables absentes : ${absentes} · Problèmes : ${problemes}`,
  );
  if (!apply && aCorriger > 0) {
    console.log('\nRelance avec --apply pour écrire ces textes dans Stripe.');
  }
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
