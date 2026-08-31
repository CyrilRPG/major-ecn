# Configuration Stripe — Major ECN

Guide pour configurer Stripe sur ce projet.

> ✅ **Les 3 produits + prix ont été créés en mode LIVE via MCP** (voir section 1 ci-dessous).
> Reste à faire côté toi : webhook + variables d'env Vercel + (optionnel) duplication en TEST.

---

## 1. Produits + prix créés en mode LIVE ✅

Compte Stripe : `acct_1RbKygFAa1EUmjlQ` (Major ECN)

| Formule | Product ID | Price ID | Montant |
|---|---|---|---|
| **Formule Essentielle** | `prod_Ufl575jJV7LB8K` | `price_1TgPZ2FAa1EUmjlQnSJrYsP0` | 495,00 € |
| **Formule Intensive** | `prod_Ufl5XKehCtyXHx` | `price_1TgPZ3FAa1EUmjlQFtDoaKxg` | 995,00 € |
| **Programme Approfondi** | `prod_Ufl5Z8p4n3KkGS` | `price_1TgPZ4FAa1EUmjlQMknZ29bL` | 2 395,00 € |

Tous en EUR, paiement unique (one-time). Visibles sur [dashboard.stripe.com/products](https://dashboard.stripe.com/products).

---

## 2. Variables d'environnement à configurer sur Vercel

Va dans **Project Settings → Environment Variables** et ajoute pour `Production` :

```bash
# Clés API LIVE (récupérables sur https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook (à créer à l'étape 3)
STRIPE_WEBHOOK_SECRET=whsec_...

# IDs des prix LIVE (déjà créés ✅)
STRIPE_PRICE_ESSENTIELLE=price_1TgPZ2FAa1EUmjlQnSJrYsP0
STRIPE_PRICE_INTENSIVE=price_1TgPZ3FAa1EUmjlQFtDoaKxg
STRIPE_PRICE_PROGRAMME=price_1TgPZ4FAa1EUmjlQMknZ29bL
```

Et redéploie l'app sur Vercel.

---

## 3. Créer le webhook (étape manuelle dashboard)

Le MCP Stripe n'expose pas la création de webhook, à faire à la main :

1. Va sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Clique **"Add endpoint"**
3. **Endpoint URL** : `https://major-ecn.fr/api/stripe/webhook`
   (ou ton vrai domaine de prod)
4. **Description** : `Provisioning auto comptes étudiants Major ECN`
5. **Events to send** — coche :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed` (optionnel)
   - `payment_intent.payment_failed` (optionnel)
6. Clique **"Add endpoint"**
7. Sur la page de l'endpoint créé, clique **"Reveal signing secret"**
8. Copie le secret (commence par `whsec_...`) et colle-le dans Vercel sous `STRIPE_WEBHOOK_SECRET`
9. Redéploie l'app

---

## 4. Tester un paiement en mode LIVE

⚠️ **Mode LIVE = vrais paiements.** Pour tester sans payer :
1. Crée une carte de test gratuite : passe en mode TEST sur le dashboard, génère des cartes test
2. OU utilise une vraie petite carte avec un coupon promo 100% (Section 5)

### Cartes de test (uniquement avec clés `sk_test_...`)
- `4242 4242 4242 4242` — paiement réussi
- `4000 0000 0000 9995` — paiement refusé
- Date d'expiration : n'importe quelle future
- CVC : 3 chiffres au hasard

---

## 5. (Optionnel) Configuration mode TEST pour développement

Pour pouvoir tester sans risque côté dev :

1. Active le toggle **"Test mode"** en haut à droite du dashboard
2. Récupère les clés test (`sk_test_...` / `pk_test_...`)
3. Crée 3 produits IDENTIQUES en mode test (même noms, même prix)
4. Copie les nouveaux `price_id` (commencent par `price_...`)
5. Configure ces clés/IDs dans `.env.local` (jamais en commit)
6. Pour les webhooks locaux : `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## 6. Activer le paiement en plusieurs fois (installments)

Déjà configuré dans `src/app/api/stripe/checkout/route.ts`. L'utilisateur choisit
1x / 3x / 4x dans le `CheckoutButton`, et Stripe propose le plan adapté pendant
le checkout pour les cartes éligibles (Visa / Mastercard FR).

> Note : les installments natifs Stripe nécessitent que ton compte soit
> éligible (France, EUR, KYC validé). Vérifie dans
> [dashboard.stripe.com/settings/payment_methods](https://dashboard.stripe.com/settings/payment_methods)
> que "Pay in installments" est activé.

---

## 7. Flow utilisateur complet

1. Visiteur va sur `/formules/essentielle` (ou autre formule)
2. Section **"Choisir cette formule"** : remplit prénom + nom + email + choisit 1×/3×/4×
3. Clique **"Commencer maintenant"** → `POST /api/stripe/checkout`
4. Redirigé vers Stripe Checkout (locale FR, installments proposés si éligible)
5. Paie → redirigé sur `/merci`
6. Stripe envoie un événement `checkout.session.completed` au webhook
7. Le webhook déclenche `provisionStudentAccount` :
   - Crée le user dans `auth.users`
   - Configure `profile.role = 'student'`
   - Configure `permission_scope.colleges = [MG Voie interne, MG Voie externe]`
   - Génère un lien magic-link pour `/auth/setup-password`
8. Envoie l'email de confirmation (`purchaseConfirmationEmail`) avec récap +
   lien d'activation
9. L'utilisateur clique le lien → définit son mot de passe → accède à la plateforme

---

## 8. Vérifier que tout fonctionne

Une fois le webhook configuré et déployé :

1. Va sur https://major-ecn.fr/formules/essentielle
2. Section "Choisir cette formule" : remplis avec un email réel + carte test
3. Paie
4. Vérifie :
   - ✅ Redirection sur `/merci`
   - ✅ Email reçu (vérifie le subject "✅ Confirmation d'inscription")
   - ✅ User créé dans Supabase (`auth.users` + `profiles` avec role=student)
   - ✅ `permission_scope` contient les 2 collèges MG
   - ✅ Lien d'activation fonctionne → accès à la plateforme MG

---

## 9. Variables d'environnement complètes

| Variable | Description | Statut |
|---|---|---|
| `STRIPE_SECRET_KEY` | Clé secrète (sk_live_... en prod) | ⏳ À configurer Vercel |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique (pk_live_...) | ⏳ À configurer Vercel |
| `STRIPE_WEBHOOK_SECRET` | Signing secret du webhook | ⏳ À créer (étape 3) |
| `STRIPE_PRICE_ESSENTIELLE` | `price_1TgPZ2FAa1EUmjlQnSJrYsP0` | ✅ Créé |
| `STRIPE_PRICE_INTENSIVE` | `price_1TgPZ3FAa1EUmjlQFtDoaKxg` | ✅ Créé |
| `STRIPE_PRICE_PROGRAMME` | `price_1TgPZ4FAa1EUmjlQMknZ29bL` | ✅ Créé |
| `SUPABASE_SERVICE_ROLE_KEY` | Pour provisioning | ⏳ Doit déjà être configuré |
| `RESEND_API_KEY` | Pour les emails | ⏳ Recommandé pour la prod |
| `NEXT_PUBLIC_SITE_URL` | https://major-ecn.fr | ⏳ Doit déjà être configuré |

---

## 10. Textes affichés sur la page de paiement Stripe

La page Stripe Checkout n'affiche pas le texte du site : elle affiche le **nom et
la description du produit Stripe**, enregistrés dans le dashboard. Ces
descriptions avaient été créées une fois pour toutes avec la phrase
« Accès complet à la Médecine Générale (voie interne + voie externe) ». Un
étudiant inscrit en Médecine interne polyvalente, voie interne, lisait donc sur
sa page de paiement qu'il achetait la Médecine générale dans les deux voies.

Deux règles depuis :

1. **La fiche produit ne nomme jamais une spécialité ni une voie de concours.**
   Elle est partagée par tous les acheteurs de la formule (le prix ne dépend pas
   de la spécialité). Texte de référence : `src/lib/stripe/copy.ts`.
2. **Le périmètre réellement acheté** — spécialité, voie, couverture partielle
   éventuelle — est composé pour chaque achat par `purchaseScopeNotice()` et
   affiché sur la page de paiement juste au-dessus du bouton
   (`custom_text.submit.message`).

### Pousser les textes dans le dashboard

Connecté en admin, ouvrir dans le navigateur :

| URL | Effet |
|---|---|
| `/api/admin/stripe-catalogue` | **Dry-run** : compare le dashboard au code, n'écrit rien |
| `/api/admin/stripe-catalogue?apply=1` | Applique `name` + `description` à chaque produit |

La route ne touche jamais aux prix. Elle parcourt les 3 formules **et** les
offres du Programme Approfondi (une par spécialité × niveau), et signale les
variables `STRIPE_PRICE_*` absentes, les prix introuvables dans le mode de la
clé utilisée, et les produits partagés par deux offres (cas où la description
ne peut pas être juste pour les deux).

À relancer après toute modification de `src/lib/stripe/copy.ts` ou création
d'une nouvelle offre.
