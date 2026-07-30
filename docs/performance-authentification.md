# Performance de l'authentification — supporter des dizaines de connexions simultanées

Ce document décrit la cause racine de la lenteur observée fin juillet 2026, le
correctif de fond, sa validation, et la procédure de retour arrière.

## 1. Le symptôme

Aux heures de forte affluence : plateforme lente, pages qui « tournent »,
`ERR_CONNECTION_ABORTED` / « Load failed », parfois 504. Aucune erreur
applicative : rien n'était cassé, tout était simplement trop lent.

## 2. La cause racine mesurée

Les journaux de l'API Auth Supabase montraient **plusieurs `GET /auth/v1/user`
par seconde**, avec des latences allant de 2 ms à **8,3 s** et des 504
ponctuels. Or `auth.getUser()` est un **aller-retour HTTP vers l'API Auth à
chaque appel** — et une seule navigation d'élève en déclenchait beaucoup :

| Origine | Appels `/user` |
| --- | --- |
| middleware (chaque page, chaque payload RSC, chaque préchargement de lien) | 1 par requête |
| rendu serveur de la page (`getCurrentUserAndProfile`) | 1 par rendu |
| composants clients d'étude (vidéo, QCM, flashcards, fiche…) | 1 par action |
| heartbeat « temps de révision » | 1 toutes les 30 s **par onglet ouvert** |

Avec quelques dizaines d'élèves connectés, l'API Auth devenait le goulot
d'étranglement de toute la plateforme. Effet secondaire : chaque appel pouvait
faire tourner le refresh token, d'où les 409 « too many concurrent token refresh
requests » et les `refresh_token_already_used` déjà constatés.

## 3. Le correctif de fond

Le projet signe ses JWT en **ES256** (clés asymétriques ; JWKS public exposé sur
`/auth/v1/.well-known/jwks.json`). La vérification d'identité n'a donc plus
besoin du réseau : `auth.getClaims()` vérifie la **signature** avec
`crypto.subtle` contre le JWKS, mis en cache 10 minutes **au niveau du process**
(donc partagé par toutes les requêtes d'une même instance).

Tout passe désormais par un helper unique, `src/lib/auth/verified-user.ts` :

```ts
const user = await getVerifiedUser(supabase); // { id, email } | null
```

Utilisé dans le middleware, dans `getCurrentUserAndProfile` (donc
`requireUser`/`requireAdmin`), dans l'auth duale cookie/Bearer, dans les routes
API étudiantes et dans les composants clients d'étude.

Coût réseau en régime établi : **zéro**. Le renouvellement du jeton n'a plus
lieu qu'à son expiration réelle (≈ 1 fois par heure et par session) au lieu de
potentiellement chaque requête.

En complément, le heartbeat passe de 30 s à **60 s** (le serveur comptabilise
l'écart réel entre deux battements : la mesure du temps de révision est
inchangée).

## 4. Ce que le correctif ne dégrade pas

- **Sécurité identique.** Ce n'est pas `getSession()` (qui ne vérifie rien) : la
  signature est vérifiée cryptographiquement et `exp` est contrôlé. Si le jeton
  n'est pas vérifiable en local (HS256 hérité, `kid` absent, WebCrypto
  indisponible), `getClaims()` retombe **de lui-même** sur l'appel réseau.
  Enfin, toute lecture de données repasse par PostgREST, qui revérifie le JWT et
  applique la RLS : un jeton forgé ne lit rien.
- **Désactivation d'un compte : effet immédiat.** `is_active`, la fin d'accès EVC
  et la session unique reposent sur des lectures en base, pas sur l'API Auth.
- **Aucune purge de cookie.** Un échec de vérification signifie « pas d'identité
  pour cette requête », jamais « session à détruire » — la purge automatique
  avait déjà cassé des sessions saines.
- **`/login` ne peut plus renvoyer 500.** `getVerifiedUser()` ne lève jamais
  d'exception, là où `getUser()` levait une `AuthApiError` sur refresh token
  périmé (le middleware s'exécutant aussi sur `/login`, la reconnexion devenait
  impossible).

Seule contrepartie assumée : une révocation de session côté Auth (déconnexion
globale) n'est plus effective instantanément mais au plus tard à l'expiration du
jeton d'accès (≤ 1 h). La règle « un seul appareil » ne repose pas dessus : elle
utilise `profiles.active_session_id` (cache signé de 5 min).

## 5. Validation

- `pnpm typecheck` : OK.
- `pnpm build` : OK.
- Test du chemin d'authentification avec une paire de clés ES256 générée pour
  l'occasion et un `fetch` instrumenté :

| Cas | Résultat | Appels réseau |
| --- | --- | --- |
| jeton valide (1ʳᵉ requête du process) | identité renvoyée | 1 × JWKS |
| jeton valide (requête suivante) | identité renvoyée | **0** |
| jeton expiré | `null` | 0 |
| signature forgée (autre clé, même `kid`) | `null` | 0 |
| jeton illisible | `null` | 0 |

## 6. Retour arrière

Le correctif est isolé : `getVerifiedUser()` est le seul point de bascule.

- **Retour arrière global** — revenir au comportement réseau d'avant sans
  toucher aux 30 fichiers appelants : dans `src/lib/auth/verified-user.ts`,
  remplacer le corps de `getVerifiedUser` par
  ```ts
  const { data } = await supabase.auth.getUser(jwt);
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
  ```
  (garder le `try/catch`, sans quoi `/login` peut renvoyer 500).
- **Retour arrière complet** : `git revert <commit>`.

## 7. Reste à faire, côté exploitation

- Ajouter `CRON_SECRET` dans Vercel (Production + Preview) puis redéployer :
  sans lui, les quatre tâches planifiées répondent 401 en silence
  (`stripe-reconcile`, `exams-sweep`, `campaign-drip`, `relance-inactifs`).
- Surveiller après déploiement : le volume de `GET /auth/v1/user` dans les
  journaux Auth doit s'effondrer (il ne doit rester que les rafraîchissements
  `POST /token?grant_type=refresh_token`, environ un par heure et par session).
