# Configuration Stripe — Major ECN

Guide pas à pas pour configurer Stripe en **mode test** sur ce projet.

## 1. Récupère tes clés API en mode TEST

1. Va sur [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Active le toggle "Test mode" en haut à droite du dashboard
3. Récupère :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)
4. Ajoute-les dans `.env.local` :
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

## 2. Crée les 3 produits + prix en mode TEST

Dans le dashboard Stripe (mode test activé) → **Produits** → **Ajouter un produit**.

### Produit 1 — Formule Essentielle
- **Nom** : `Formule Essentielle`
- **Description** : `Préparation EVC - Formule Essentielle. Accès à la plateforme Major ECN : QCM, flashcards, fiches synthétiques, méthode EVC, accès Médecine Générale.`
- **Prix** : `495.00 EUR` — paiement unique (one-time)
- Copie le `price_id` (commence par `price_...`) dans :
  ```bash
  STRIPE_PRICE_ESSENTIELLE=price_...
  ```

### Produit 2 — Formule Intensive
- **Nom** : `Formule Intensive`
- **Description** : `Préparation EVC - Formule Intensive. Tout l'Essentielle + cas cliniques approfondis, épreuves blanches inspirées des EVC, suivi personnalisé.`
- **Prix** : `995.00 EUR` — paiement unique
- Copie le `price_id` :
  ```bash
  STRIPE_PRICE_INTENSIVE=price_...
  ```

### Produit 3 — Programme Approfondi
- **Nom** : `Programme Approfondi`
- **Description** : `Préparation EVC - Programme Approfondi. Plateforme EVC accès illimité + accompagnement individuel + sessions live et replays.`
- **Prix** : `2395.00 EUR` — paiement unique
- Copie le `price_id` :
  ```bash
  STRIPE_PRICE_PROGRAMME=price_...
  ```

## 3. Configure le webhook

Le webhook reçoit la notification de paiement réussi et provisionne automatiquement
le compte étudiant avec accès à la Médecine Générale (voie interne + voie externe).

### En LOCAL (développement)

1. Installe le CLI Stripe : `brew install stripe/stripe-cli/stripe` (Mac)
   ou télécharge depuis [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli).
2. Connecte-toi : `stripe login`
3. Lance l'écoute :
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copie le `webhook signing secret` (commence par `whsec_...`) affiché et
   ajoute-le à `.env.local` :
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### En PRODUCTION (Vercel)

1. Va dans [dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique **"Ajouter un endpoint"**
3. URL : `https://major-ecn.fr/api/stripe/webhook` (adapte au domaine prod)
4. Événements à écouter :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed` (optionnel)
5. Copie le **Signing secret** et configure-le côté Vercel :
   - Project Settings → Environment Variables → `STRIPE_WEBHOOK_SECRET`

## 4. Activer le paiement en plusieurs fois

Stripe gère nativement les paiements en N fois (3x, 4x) pour les cartes
éligibles en France (Visa / Mastercard certaines).

C'est configuré dans `src/app/api/stripe/checkout/route.ts` via
`payment_method_options.card.installments.enabled`. L'utilisateur choisit
le nombre de fois côté UI, et Stripe propose le plan adapté pendant le
checkout.

> **Important** : les installments natifs nécessitent que ton compte Stripe
> soit éligible (France, EUR, KYC validé). Si tu veux un split garanti
> (mensualités), il faudra créer des prix de type `recurring` (subscription).

## 5. Tester un paiement

1. Va sur `/formules/essentielle` (ou autre formule)
2. Remplis l'email + clique "Commencer maintenant"
3. Sur le checkout Stripe, utilise une carte de test :
   - **4242 4242 4242 4242** — paiement réussi
   - **4000 0000 0000 9995** — paiement refusé
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres
4. Après paiement, tu seras redirigé sur `/merci`
5. Vérifie que :
   - L'email de confirmation arrive (si Resend configuré)
   - Le user a été créé dans Supabase (table `auth.users`)
   - Le profile a `role = 'student'` et le bon `permission_scope`

## 6. Variables d'environnement requises

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète (sk_test_... en test, sk_live_... en prod) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique (pk_test_... en test) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret du webhook |
| `STRIPE_PRICE_ESSENTIELLE` | price_id de la Formule Essentielle |
| `STRIPE_PRICE_INTENSIVE` | price_id de la Formule Intensive |
| `STRIPE_PRICE_PROGRAMME` | price_id du Programme Approfondi |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role Supabase (requise pour le provisioning) |
| `RESEND_API_KEY` | API key Resend pour les emails (optionnel mais recommandé) |

## 7. Passer en mode LIVE (production)

Quand tu es prêt à encaisser de vrais paiements :

1. Dans le dashboard Stripe, désactive le toggle "Test mode"
2. Récupère les nouvelles clés `sk_live_...` et `pk_live_...`
3. Refais les étapes 2 et 3 en mode LIVE (produits, prix, webhook)
4. Mets à jour `.env` en prod avec les clés LIVE
5. Vérifie le webhook en envoyant un événement test depuis le dashboard
