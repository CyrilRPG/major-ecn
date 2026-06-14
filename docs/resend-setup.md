# Resend — Guide de configuration complet

> Pour que les emails Major ECN partent réellement aux étudiants et aux
> professeurs après leur inscription.

---

## TL;DR — checklist 5 minutes

1. Récupère ta clé API Resend (`re_...`) sur https://resend.com/api-keys
2. Ajoute-la sur Vercel : Settings → Environment Variables → `RESEND_API_KEY`
3. Vérifie ton domaine d'expédition sur https://resend.com/domains
4. Configure les 3 DNS (SPF + DKIM + DMARC) chez ton registrar
5. Ajoute `EMAIL_FROM` sur Vercel : `Major ECN <noreply@ton-domaine.fr>`
6. Redéploie l'app (Vercel le fait automatiquement)
7. Teste : crée un compte prof ou élève, vérifie sur https://resend.com/emails

---

## 1. Créer ta clé API Resend

1. Va sur https://resend.com/api-keys
2. Clic « Create API Key »
3. Nom : `Major ECN — production`
4. Permission : **Full access** (sinon limite à *Sending access*)
5. **Copie la clé immédiatement** (elle ne sera plus jamais affichée)

> ⚠️ Une clé compromise (commit dans le code, partagée en clair) doit être
> révoquée et remplacée.

---

## 2. Configurer Vercel

Vercel → ton projet → Settings → Environment Variables

Ajoute ces 3 variables, en cochant **Production**, **Preview** et **Development** :

| Nom | Valeur | Quand |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` | **Obligatoire** |
| `EMAIL_FROM` | `Major ECN <noreply@majorecn.fr>` | Optionnel — voir étape 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://major-ecn.fr` | **Obligatoire** (déjà fait) |

⚠️ Si `EMAIL_FROM` n'est pas défini, le code utilise l'adresse sandbox
`Major ECN <onboarding@resend.dev>` qui marche **immédiatement** sans
configuration DNS. Pratique pour les tests, à remplacer en prod.

Après ajout, redéploye (Deployments → Redeploy ou push un commit).

---

## 3. Vérifier ton domaine d'expédition

Si tu veux envoyer depuis `noreply@majorecn.fr` (ton domaine), il **doit**
être vérifié sur Resend pour que les mails ne soient pas refusés.

1. Va sur https://resend.com/domains
2. Clic « Add Domain »
3. Saisis `majorecn.fr` (ou ton vrai domaine)
4. Resend te donne **3 enregistrements DNS** à ajouter :
   - **SPF** : enregistrement TXT `v=spf1 include:_spf.resend.com ~all`
   - **DKIM** : enregistrement TXT type `resend._domainkey` avec une valeur longue
   - **DMARC** (optionnel mais recommandé) : enregistrement TXT
     `_dmarc.majorecn.fr` avec `v=DMARC1; p=none;`

Ajoute ces 3 enregistrements chez ton registrar (Gandi, OVH, Cloudflare, etc.).
Puis sur Resend, clique « Verify ». La propagation DNS peut prendre 1 à 48 h.

Une fois validé : Resend affiche le domaine en **vert** → tu peux envoyer
depuis `*@majorecn.fr`.

---

## 4. Adresse d'expédition

Une fois ton domaine vérifié, ajoute sur Vercel :

```
EMAIL_FROM=Major ECN <noreply@majorecn.fr>
```

(remplace par ton vrai domaine bien sûr)

Format obligatoire : `Nom affiché <adresse@domaine.fr>` — Resend rejette les
formats invalides.

Adresses recommandées :
- `noreply@majorecn.fr` (inscription, notifications produit)
- `contact@majorecn.fr` (réponses des élèves — configure un alias vers ta
  vraie boîte)

---

## 5. Templates utilisés

Le code Major ECN utilise déjà 5 templates HTML brandés (charte navy + bande
tricolore + Plus Jakarta Sans), définis dans `src/lib/email/templates.ts` :

| Template | Quand | Destinataire |
|---|---|---|
| `welcomeEmail` (student) | Inscription via la vitrine ou via un admin | nouvel élève |
| `welcomeEmail` (professor) | Création d'un compte prof par un admin | nouveau prof |
| `forumNewQuestionEmail` | Élève poste une question forum | profs ayant accès au collège |
| `forumNewAnswerEmail` | Prof répond au forum | élève qui a posé la question |
| `satisfactionSubmittedEmail` | Élève soumet un formulaire de satisfaction | tous les admins |
| `adminSignupNotificationEmail` | Prospect inscrit via la vitrine | tous les admins |

Tous appellent `sendEmail()` de `src/lib/email/send.ts` qui pioche dans
`RESEND_API_KEY` et `EMAIL_FROM`.

---

## 6. Tester l'envoi

### Test rapide via curl

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer re_TA_CLE' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "Major ECN <onboarding@resend.dev>",
    "to": ["ton.email@gmail.com"],
    "subject": "Test Resend OK",
    "html": "<p>Si tu lis ça, la clé fonctionne.</p>"
  }'
```

Réponse attendue : `{ "id": "..." }`

### Test depuis l'app

1. Va sur `/admin/professeurs`
2. Clic « Ajouter un professeur »
3. Renseigne ton **propre email** (pas une adresse de test)
4. Valider
5. Vérifie ta boîte (+ spam)
6. Aussi : https://resend.com/emails → tu vois si l'envoi est passé,
   en attente ou en erreur (avec la raison)

---

## 7. Endpoint de diagnostic interne

Route disponible (admin seulement) :

```
GET /api/admin/email-status
```

Renvoie un JSON :

```json
{
  "resend_api_key_set": true,
  "email_from": "Major ECN <onboarding@resend.dev>",
  "site_url": "https://major-ecn.fr",
  "fallback_in_use": true,
  "note": "..."
}
```

Utile pour vérifier rapidement ce que Vercel a injecté côté serveur sans
avoir à fouiller les logs.

---

## 8. Dépannage

| Symptôme | Cause probable | Fix |
|---|---|---|
| Mail jamais reçu, aucune erreur visible | `RESEND_API_KEY` non définie sur Vercel | Étape 2 |
| Mail jamais reçu, alert dans la dialog dit « Resend 401 » | Clé invalide ou révoquée | Génère une nouvelle clé |
| Mail jamais reçu, alert dit « Resend 403 unauthorized domain » | Tu envoies depuis un domaine non vérifié | Étape 3, ou utilise `onboarding@resend.dev` |
| Mail dans le dossier spam | Pas de DMARC, ou domaine récent | Configure SPF + DKIM + DMARC + attends quelques jours |
| Mail reçu mais design cassé | OK — c'est le rendu Gmail/Outlook qui simplifie | Vérifie sur https://litmus.com ou envoie à différents clients |
| Test compte sandbox refusé | Compte Resend gratuit en mode test : peut uniquement envoyer à toi-même | Vérifie un domaine pour débloquer l'envoi à n'importe quelle adresse |

---

## 9. Quota gratuit Resend

Compte gratuit : **100 emails/jour**, **3 000/mois**, 1 domaine vérifié.

Largement suffisant pour démarrer. Plan payant à 20 $/mois = 50 000 emails
si jamais on dépasse.
