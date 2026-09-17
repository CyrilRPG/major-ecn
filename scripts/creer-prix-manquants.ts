#!/usr/bin/env tsx
/**
 * Crée dans Stripe le produit et le prix des offres du catalogue qui n'en ont
 * pas encore, et affiche les variables d'environnement à poser sur Vercel.
 *
 * POURQUOI CE SCRIPT
 * Le prix de chaque offre vit dans une variable `STRIPE_PRICE_*`. Tant qu'elle
 * est vide, l'offre n'est pas vendable : le tunnel l'affiche « Ouverture
 * prochaine » et le checkout répond 503 (cf. `lib/stripe/approfondi-disponibilite`).
 * C'est le cas de « Radiologie et imagerie médicale », restée au catalogue sans
 * prix Stripe — constaté le 17/09/2026, après qu'une étudiante eut rempli tout
 * le tunnel pour rien. Il manquait l'outil qui crée ce qui manque :
 * `sync-stripe-catalogue.ts` ne touche qu'aux TEXTES de produits existants, et
 * `create-stripe-products-ortho-odonto.mjs` avait ses deux spécialités en dur.
 *
 * Ici, la liste des offres et leurs montants viennent du catalogue du code
 * (`lib/stripe/catalogue.ts`), et les textes de `lib/stripe/copy.ts` : un
 * produit créé porte donc d'emblée la fiche que la page de paiement doit
 * afficher, sans repasser par la synchronisation des textes.
 *
 * CLÉ À UTILISER
 * Une clé RESTREINTE suffit, et c'est ce qu'il faut préférer : dans Stripe,
 * Développeurs → Clés API → « Créer une clé restreinte », avec `Produits :
 * Écriture` et `Prix : Écriture`. Aucune permission sur les paiements, les
 * clients ou les remboursements. La clé se révoque en un clic une fois le
 * travail fait.
 *
 * USAGE
 *   pnpm tsx scripts/creer-prix-manquants.ts              (simulation)
 *   pnpm tsx scripts/creer-prix-manquants.ts --apply      (écrit dans Stripe)
 *   pnpm tsx scripts/creer-prix-manquants.ts --offre appro:radio --apply
 *
 * Sans `--apply`, rien n'est écrit. Le script ne touche JAMAIS à une offre dont
 * la variable est déjà renseignée : un prix en service n'est ni modifié ni
 * remplacé. Avant de créer, il cherche un produit déjà déposé pour cette
 * variable (métadonnée `env_var`) — un script relancé deux fois ne laisse donc
 * pas deux fiches produit en mode LIVE.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import Stripe from 'stripe';
import { stripeCatalogue, type CatalogueEntry } from '../src/lib/stripe/catalogue';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
dotenv({ path: join(__dirname, '..', '.env') });

const apply = process.argv.includes('--apply');
/** `--offre appro:radio` restreint le travail à une offre (clé du catalogue). */
const offreArg = (() => {
  const i = process.argv.indexOf('--offre');
  return i >= 0 ? process.argv[i + 1] : null;
})();

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error(
    '❌ STRIPE_SECRET_KEY absente.\n'
    + '   Ajoute-la dans .env.local (une clé restreinte « Produits : Écriture » +\n'
    + '   « Prix : Écriture » suffit), ou passe-la en variable d’environnement le\n'
    + '   temps de la commande.',
  );
  process.exit(1);
}

const mode = KEY.startsWith('sk_test_') || KEY.startsWith('rk_test_') ? 'TEST' : 'LIVE';
const stripe = new Stripe(KEY, { typescript: true });

const euros = (cents: number) => (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 });

/**
 * Produit déjà déposé pour cette variable d'environnement, s'il existe.
 *
 * La recherche Stripe indexe les métadonnées mais n'est pas immédiate après une
 * création ; on retombe donc sur un balayage du catalogue produits, qui, lui,
 * est cohérent tout de suite. Les deux servent à la même chose : ne pas créer
 * une seconde fiche pour une offre qui en a déjà une.
 */
async function produitExistant(entry: CatalogueEntry): Promise<Stripe.Product | null> {
  try {
    const found = await stripe.products.search({
      query: `metadata['env_var']:'${entry.envPriceId}'`,
      limit: 1,
    });
    if (found.data[0]) return found.data[0];
  } catch {
    // Clé restreinte sans droit de recherche, ou index indisponible : on
    // balaye. Le silence serait pire — il ferait créer un doublon.
  }

  for await (const product of stripe.products.list({ limit: 100, active: true })) {
    if (product.metadata?.env_var === entry.envPriceId) return product;
    if (product.name === entry.copy.name) return product;
  }
  return null;
}

/** Prix EUR actif du bon montant porté par ce produit, s'il existe déjà. */
async function prixExistant(productId: string, amountCents: number): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return (
    prices.data.find(
      (p) => p.currency === 'eur' && p.unit_amount === amountCents && !p.recurring,
    ) ?? null
  );
}

async function main() {
  console.log(
    `\n🔗 Prix manquants — mode ${mode}${apply ? '' : ' (simulation, aucune écriture)'}\n`,
  );

  const catalogue = stripeCatalogue().filter((e) => !offreArg || e.offer === offreArg);
  if (offreArg && catalogue.length === 0) {
    console.error(`❌ Offre « ${offreArg} » inconnue du catalogue.`);
    process.exit(1);
  }

  /** Variables à poser sur Vercel, qu'elles viennent d'être créées ou retrouvées. */
  const aPoser: { envPriceId: string; priceId: string; label: string; cree: boolean }[] = [];
  let dejaVendues = 0;
  let problemes = 0;

  for (const entry of catalogue) {
    if (process.env[entry.envPriceId]) {
      dejaVendues++;
      continue;
    }

    console.log(`⚪ ${entry.label} — ${entry.envPriceId} non renseignée`);
    console.log(`   Prix catalogue : ${euros(entry.amountCents)} €`);

    try {
      let product = await produitExistant(entry);

      if (product) {
        console.log(`   Produit déjà présent dans Stripe : ${product.id} (« ${product.name} »)`);
        const prix = await prixExistant(product.id, entry.amountCents);
        if (prix) {
          // Rien à créer : il ne manquait que la variable côté Vercel.
          console.log(`   Prix déjà présent : ${prix.id}`);
          aPoser.push({ envPriceId: entry.envPriceId, priceId: prix.id, label: entry.label, cree: false });
          console.log('');
          continue;
        }
        console.log('   Aucun prix EUR actif à ce montant : il reste à créer.');
      } else {
        console.log(`   À créer : produit « ${entry.copy.name} » + prix ${euros(entry.amountCents)} €`);
      }

      if (!apply) {
        console.log('');
        continue;
      }

      if (!product) {
        product = await stripe.products.create({
          name: entry.copy.name,
          description: entry.copy.description,
          // `env_var` est ce qui rend ce script rejouable sans doublon ;
          // `offer` relie la fiche à la clé d'offre du catalogue.
          metadata: { env_var: entry.envPriceId, offer: entry.offer },
        });
        console.log(`   → produit créé : ${product.id}`);
      }

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: entry.amountCents,
        currency: 'eur',
        metadata: { env_var: entry.envPriceId, offer: entry.offer },
      });
      console.log(`   → prix créé : ${price.id}`);
      aPoser.push({ envPriceId: entry.envPriceId, priceId: price.id, label: entry.label, cree: true });
      console.log('');
    } catch (e) {
      problemes++;
      console.log(`   🔴 ${e instanceof Error ? e.message : String(e)}\n`);
    }
  }

  console.log('━'.repeat(60));
  console.log(
    `Déjà vendues (variable renseignée) : ${dejaVendues} · `
    + `À ouvrir : ${catalogue.length - dejaVendues} · Problèmes : ${problemes}`,
  );

  if (aPoser.length > 0) {
    console.log(`\nVariables à ajouter sur Vercel (mode ${mode}) :\n`);
    for (const r of aPoser) console.log(`${r.envPriceId}=${r.priceId}`);
    console.log(
      '\nVercel → Project Settings → Environment Variables (Production ET Preview),'
      + '\npuis redéployer : l’offre redevient achetable sans aucune modification du code.',
    );
  } else if (!apply) {
    console.log('\nRelance avec --apply pour créer ce qui manque.');
  }
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
