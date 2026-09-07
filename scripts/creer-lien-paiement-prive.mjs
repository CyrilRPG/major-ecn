#!/usr/bin/env node
/**
 * Crée un LIEN DE PAIEMENT Stripe (Payment Link) pour une vente PRIVÉE, hors
 * plateforme : le candidat paie, et rien d'autre ne se produit — aucun compte
 * élève, aucun accès aux contenus. La préparation se fait de gré à gré.
 *
 * À ne pas confondre avec le tunnel du site (/formules/…), qui provisionne un
 * compte : c'est justement ce qu'on ne veut PAS ici.
 *
 * Paiement en N fois
 * ------------------
 * Stripe ne sait pas « découper » un paiement unique : un lien en 4× est un
 * abonnement mensuel, et un abonnement se renouvelle À L'INFINI tant qu'on ne
 * le borne pas. On s'appuie donc sur le webhook déjà en place
 * (`/api/stripe/webhook`, événement `customer.subscription.created`) : il lit
 * `metadata.installments` sur l'abonnement et le convertit en
 * SubscriptionSchedule de N mensualités puis annulation
 * (`src/lib/stripe/installments.ts`). C'est pour cela que ce script REFUSE de
 * créer le lien si cet événement n'est pas activé sur l'endpoint webhook :
 * sans lui, le client serait prélevé tous les mois sans fin.
 *
 * Usage :
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/creer-lien-paiement-prive.mjs
 *
 * Idempotent : relancé avec la même `reference`, il réutilise le produit, le
 * prix et le lien déjà créés au lieu d'en fabriquer de nouveaux.
 */
import Stripe from 'stripe';

// ── L'offre vendue ────────────────────────────────────────────────────────
const OFFRE = {
  /** Clé stable : sert à retrouver produit / prix / lien d'une exécution à
   *  l'autre. En changer crée une NOUVELLE offre. */
  reference: 'prive-hepatologie-approfondi-2395',
  /** Nom lu par le client en haut de la page de paiement. */
  nom: 'Programme Approfondi — Hépatologie',
  totalCents: 239500,
  mensualites: 4,
  /** Lien à usage unique : une fois payé, il ne peut plus servir. */
  usageUnique: true,
};

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY manquante. Usage :');
  console.error('   STRIPE_SECRET_KEY=sk_live_... node scripts/creer-lien-paiement-prive.mjs');
  process.exit(1);
}

const stripe = new Stripe(key, { typescript: true });
const modeTest = key.startsWith('sk_test_');
console.log(`Mode : ${modeTest ? 'TEST' : 'LIVE'}\n`);

// Montant à la française : séparateur de milliers, virgule décimale. Formaté à
// la main plutôt qu'avec toLocaleString, dont l'espace varie selon la version
// d'ICU — ce texte part chez Stripe et doit être stable d'une exécution à
// l'autre (sinon chaque relance « change » les descriptions).
const eur = (cents) => {
  const [entiers, decimales] = (cents / 100).toFixed(2).split('.');
  const milliers = entiers.length > 3
    ? `${entiers.slice(0, -3)} ${entiers.slice(-3)}`
    : entiers;
  return `${milliers},${decimales}`;
};
const mensualiteCents = Math.round(OFFRE.totalCents / OFFRE.mensualites);
if (mensualiteCents * OFFRE.mensualites !== OFFRE.totalCents) {
  console.error(
    `❌ ${eur(OFFRE.totalCents)} € ne se divise pas exactement en ${OFFRE.mensualites} : `
    + `${OFFRE.mensualites} × ${eur(mensualiteCents)} € = ${eur(mensualiteCents * OFFRE.mensualites)} €. `
    + `Ajustez le total ou le nombre de mensualités.`,
  );
  process.exit(1);
}

// ── 1. Le webhook borne-t-il bien le plan ? ───────────────────────────────
// Sans `customer.subscription.created`, l'abonnement ne serait jamais arrêté.
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const actifs = endpoints.data.filter((e) => e.status === 'enabled');
const borne = actifs.filter(
  (e) => e.enabled_events.includes('customer.subscription.created')
    || e.enabled_events.includes('*'),
);
if (borne.length === 0) {
  console.error(
    "❌ Aucun endpoint webhook actif n'écoute `customer.subscription.created`.\n"
    + "   Sans cet événement, le paiement en plusieurs fois ne serait JAMAIS borné :\n"
    + "   le client serait prélevé tous les mois indéfiniment.\n\n"
    + "   Dashboard Stripe > Développeurs > Webhooks > l'endpoint /api/stripe/webhook\n"
    + "   > « Écouter d'autres événements » > customer.subscription.created,\n"
    + "   puis relancer ce script.",
  );
  if (actifs.length > 0) {
    console.error('\n   Endpoints actifs trouvés :');
    for (const e of actifs) console.error(`   - ${e.url} (${e.enabled_events.length} événements)`);
  }
  process.exit(1);
}
console.log(`✅ Webhook OK : ${borne.map((e) => e.url).join(', ')}\n`);

// ── 2. Produit (réutilisé si déjà créé) ───────────────────────────────────
const trouves = await stripe.products.search({
  query: `active:'true' AND metadata['lien_prive']:'${OFFRE.reference}'`,
});
const ficheProduit = {
  name: OFFRE.nom,
  description:
    `Préparation individuelle aux EVC. Paiement en ${OFFRE.mensualites} fois sans frais : `
    + `${OFFRE.mensualites} prélèvements mensuels de ${eur(mensualiteCents)} € `
    + `(total ${eur(OFFRE.totalCents)} €). Le plan s'arrête automatiquement après le `
    + `${OFFRE.mensualites}e prélèvement — aucun renouvellement.`,
  metadata: { lien_prive: OFFRE.reference },
};
// Fiche réécrite à chaque exécution : c'est le texte que le client lit en haut
// de la page de paiement, il doit suivre le bloc OFFRE sans intervention
// manuelle dans le dashboard.
const product = trouves.data[0]
  ? await stripe.products.update(trouves.data[0].id, ficheProduit)
  : await stripe.products.create(ficheProduit);
console.log(`${trouves.data[0] ? '↩️  Produit mis à jour' : '✅ Produit créé'} : ${product.id}`);

// ── 3. Prix mensuel (immuable : on ne le recrée jamais) ───────────────────
const prixExistants = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
const price = prixExistants.data.find(
  (p) => p.unit_amount === mensualiteCents
    && p.currency === 'eur'
    && p.recurring?.interval === 'month'
    && p.recurring?.interval_count === 1,
) ?? await stripe.prices.create({
  product: product.id,
  unit_amount: mensualiteCents,
  currency: 'eur',
  recurring: { interval: 'month' },
  metadata: { lien_prive: OFFRE.reference, total_cents: String(OFFRE.totalCents) },
});
console.log(`✅ Prix mensuel : ${price.id}  (${eur(mensualiteCents)} € × ${OFFRE.mensualites})`);

// ── 4. Le lien de paiement ────────────────────────────────────────────────
const liens = await stripe.paymentLinks.list({ active: true, limit: 100 });
const existant = liens.data.find((l) => l.metadata?.lien_prive === OFFRE.reference);

// `installments` est LA métadonnée que lit le webhook pour borner le plan.
// Elle doit être posée sur l'ABONNEMENT (subscription_data), pas seulement sur
// le lien : c'est l'abonnement que le webhook reçoit.
const metadata = {
  lien_prive: OFFRE.reference,
  installments: String(OFFRE.mensualites),
  total_cents: String(OFFRE.totalCents),
  // Vente privée : aucun provisionnement. `formule` est absente, donc
  // /api/stripe/webhook loggue « provisioning impossible » et s'arrête là,
  // sans créer de compte ni envoyer d'email. C'est le comportement voulu.
  vente: 'privee-hors-plateforme',
};

const recap =
  `Paiement en ${OFFRE.mensualites} fois sans frais : ${OFFRE.mensualites} prélèvements `
  + `mensuels de ${eur(mensualiteCents)} € (total ${eur(OFFRE.totalCents)} €). `
  + `Le plan s'arrête automatiquement après le ${OFFRE.mensualites}e prélèvement. `
  + `Aucun renouvellement.`;

const params = {
  line_items: [{ price: price.id, quantity: 1 }],
  currency: 'eur',
  metadata,
  subscription_data: { description: recap, metadata },
  phone_number_collection: { enabled: true },
  billing_address_collection: 'auto',
  custom_text: { submit: { message: recap.slice(0, 1200) } },
  after_completion: {
    type: 'hosted_confirmation',
    hosted_confirmation: {
      custom_message:
        'Merci, votre inscription est enregistrée. Vous serez recontacté directement '
        + 'pour la mise en place de votre préparation.',
    },
  },
  ...(OFFRE.usageUnique ? { restrictions: { completed_sessions: { limit: 1 } } } : {}),
};

let link = existant;
if (!link) {
  try {
    link = await stripe.paymentLinks.create(params);
  } catch (e) {
    // `restrictions` n'est pas accepté par toutes les versions d'API : plutôt
    // que d'échouer, on crée le lien sans la limite — en le disant.
    if (!OFFRE.usageUnique) throw e;
    console.warn(`⚠️  Limite « usage unique » refusée par Stripe (${e.message}) — lien réutilisable.`);
    delete params.restrictions;
    link = await stripe.paymentLinks.create(params);
  }
}
console.log(`${existant ? '↩️  Lien existant' : '✅ Lien créé'} : ${link.id}\n`);

console.log('─'.repeat(64));
console.log(`\n${OFFRE.nom}`);
console.log(`${eur(OFFRE.totalCents)} € — ${OFFRE.mensualites} × ${eur(mensualiteCents)} €/mois`);
console.log(`\n  ${link.url}\n`);
if (modeTest) console.log("⚠️  Lien de TEST : il n'encaisse rien.\n");
console.log("Le lien ne donne AUCUN accès à la plateforme : aucun compte n'est créé.");
console.log(`Suivi des prélèvements : Stripe > Abonnements (métadonnée lien_prive=${OFFRE.reference}).`);
