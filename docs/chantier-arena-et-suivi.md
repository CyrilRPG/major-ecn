# Chantier — EVC Arena + Suivi pédagogique individuel

Document de pilotage du chantier (septembre 2026). Il sert de mémoire de travail :
décisions d'architecture, état d'avancement, points à vérifier. Les deux cahiers des
charges du client sont dans `C:\Users\Admin\Downloads\861.PDF` (Arena, 11 p.) et
`872.PDF` (Suivi, 5 p.).

Contrainte de livraison : tout reste **en mode test** (aucune page indexée, tournois en
brouillon, module de suivi réservé à l'administration) jusqu'à validation du client.

## Conventions transverses (issues de la cartographie du code)

- Multi-tenant : toute nouvelle table porte `faculte_id text not null default 'major-ecn'`
  et est ajoutée à `TABLES_CLOISONNEES` dans `src/lib/supabase/faculte-scope.ts`.
- Pages admin : `requireAdmin()` (ou `requireStaff()` + rôle module) ; mutations en
  server actions `{ ok, error }` + `revalidatePath` ; appels client → `fetchAuthentifie`.
- Lectures pleine table : `fetchAllRows` avec `.order('id')` final, ou RPC SQL.
- Emails : `sendEmail()` de `src/lib/email/send.ts` (Resend REST) ; `siteUrl()` pour les URL.
- Crons : `Authorization: Bearer CRON_SECRET`, `runtime='nodejs'`, `maxDuration` déclaré,
  entrée dans `vercel.json`.
- PDF : `launchBrowser()` de `src/lib/fiches/chromium.ts` (HTML → PDF), stockage privé +
  URL signée.
- Fichiers : jamais dans une action serveur (plafond Vercel 4,5 Mo) → upload direct
  Storage par URL signée.
- Migrations : fichiers `supabase/migrations/2026090xxxxxxx_*.sql` **et** un fichier
  consolidé `supabase/APPLIQUER_ARENA_SUIVI.sql` à coller dans le SQL Editor. Le poste
  n'a pas d'accès CLI (pas de token, pas de mot de passe). Vérifier l'état réel de la
  base avec `tmp/_probe-arena-suivi.mjs` avant de conclure.
- Types Supabase générés obsolètes : nouvelles tables accédées via
  `createAdminClient()` casté (`as any`) derrière des modules typés `src/lib/arena/*`
  et `src/lib/suivi/*`.

## 1. EVC Arena

### Décisions

- Participants = identité propre (`arena_participants`), sans compte Supabase Auth :
  inscription → email de confirmation (jeton) → cookie de session HMAC `arena_session`.
  Reconnexion par lien magique. Un élève Major ECN peut s'inscrire avec le même email,
  les deux identités restent indépendantes.
- Barèmes : `src/lib/arena/scoring.ts` (pur, partagé client/serveur) — presets CNG et
  tout-ou-rien, grille personnalisée, modèles enregistrés (`arena_bareme_templates`).
  Règles indispensable/inacceptable prioritaires. Barème figé dans
  `arena_rounds.bareme_snapshot` à l'ouverture de la manche.
- Timer côté serveur : `arena_attempts.started_at` / `deadline_at =
  min(started + durée, clôture)`. Chaque validation est persistée (`arena_answers`).
  Cron `arena-sweep` (toutes les 5 min) clôt les tentatives expirées, publie les
  résultats, envoie les emails programmés et journalise les transitions de statut.
- Classement : calcul TypeScript `src/lib/arena/ranking.ts` (testé) — cumul, seuil 50 %,
  ≥ 2 manches pour le final, départage points → parfaites → temps moyen (manches
  tronquées exclues). Aucun effectif exposé.
- Corrections : contenu saisi en admin par question (explication, pièges, erreurs
  fréquentes, références) + encadré méthodo par manche → PDF généré (HTML → PDF) ;
  un PDF fourni par Major ECN peut aussi être téléversé (arbitrage §12.1 : les deux).
- Conservation (arbitrage §3.1) : `retention_days` paramétrable par tournoi
  (défaut 365) ; suppression/anonymisation sur demande depuis l'espace participant.
- Prévisualisation (§15.2) : tentatives `is_preview = true` liées à un compte staff,
  exclues de tout calcul, rejouables, bandeau ambre non masquable.
- Routes publiques sous `src/app/(arena)/arena/...` (segment sans header marketing,
  `noindex` tant que `arena_tournaments.indexable = false`).

### Tables (`supabase/migrations/20260906120000_arena.sql`)

`arena_tournaments`, `arena_rounds`, `arena_questions`, `arena_participants`,
`arena_attempts`, `arena_answers`, `arena_bareme_templates`, `arena_reports`,
`arena_emails`, `arena_log` + bucket `arena` (privé).

### Avancement

- [x] Maquette non répertoriée `/arena-preview` → remplacée le 07/09/2026 par la landing refondue (`src/components/arena/landing/`), `/arena-preview` redirige vers la démo
- [x] Jetons de DA dans `src/components/arena/tokens.ts` (module sans `'use client'` : un export non-composant d'un module client arrive vide dans un composant serveur)
- [x] Migration SQL (`20260906120000_arena.sql`)
- [x] Lib : scoring + tests §6.4, ranking + tests, import + tests, temps, session, emails, séquence
- [x] Public : landing, inscription, confirmation, connexion, espace, manche, corrections,
      classement, règles, désinscription, suppression, OG image
- [x] Admin : liste, création/duplication, paramètres, manches, questions (import CSV +
      banque), barèmes + prévisualisation, participants + export, suivi/KPI, signalements,
      emails, PDF, journal, prévisualisation candidat (`?preview=1`)
- [x] Cron `arena-sweep` (5 min) + `vercel.json`
- [x] PDF corrections (généré ou fourni)
- [x] Fichier SQL consolidé `supabase/APPLIQUER_ARENA_SUIVI.sql` + sonde `tmp/_probe-arena-suivi.mjs`
- [x] Migration appliquée sur Supabase le 07/09/2026 (CLI `supabase db query --linked`, jeton fourni par le client) ; sonde au vert
- [x] Recette de bout en bout le 07/09/2026 : création admin → intégrité → statuts → inscription → confirmation → manche jouée → clôture par le cron → résultats, rang, corrections, signalement → neutralisation + recalcul, export CSV. Données de recette supprimées ensuite.

## 2. Suivi pédagogique individuel

### Décisions

- Module admin `/admin/suivi/*` (agenda, campagnes, candidats, fiche, alertes, tableau de
  bord, exports, réglages, modèles d'emails). Rôles module : admin (tout),
  `responsable` (tout sauf réglages), `intervenant` (ses rendez-vous, comptes rendus,
  pas de notes internes), `lecture` — portés par `suivi_staff_roles`.
- Ciblage des campagnes : même vocabulaire que le reste de la plateforme (spécialité via
  `permission_scope`, formule `offer`, voie, session EVC) + sélection manuelle.
- Créneaux générés depuis des plages (durée par défaut 10 min, tampon, capacité) ;
  réservation candidat par lien sécurisé (jeton) ou depuis son espace
  (`/mes-rendez-vous`) ; déplacement libère l'ancien créneau.
- Comptes rendus : `suivi_reports` → `suivi_difficulties` (constat sans action possible)
  → `suivi_actions` (rattachées ou non à une difficulté). Les `pedagogical_notes`
  existantes restent lisibles dans l'historique.
- Emails : bibliothèque `suivi_email_templates` (7 modèles, variables `{{prenom}}`,
  `{{specialite}}`, `{{date}}`, `{{heure}}`, `{{lien}}`), envois tracés dans
  `suivi_history`. Rappels J-1 (paramétrable) par cron `suivi-sweep`.
- Alertes administrateur : `suivi_alerts` persistantes + email au responsable, cron.

### Tables (`supabase/migrations/20260906130000_suivi.sql`)

`suivi_settings`, `suivi_staff_roles`, `suivi_campaigns`, `suivi_campaign_members`,
`suivi_slots`, `suivi_appointments`, `suivi_reports`, `suivi_difficulties`,
`suivi_actions`, `suivi_alerts`, `suivi_email_templates`, `suivi_history`,
`suivi_booking_tokens`.

### Avancement

- [x] Migration SQL (`20260906130000_suivi.sql`)
- [x] Lib `src/lib/suivi/` : ciblage, créneaux (tests), statuts, emails/modèles (tests), rôles, réservation, stats, PDF
- [x] Admin `/admin/suivi` : tableau de bord, agenda, campagnes, candidats + fiche, comptes rendus,
      alertes, exports (CSV, PDF individuel et multiple), réglages, modèles d'emails, rôles
- [x] Candidat : `/mes-rendez-vous`, réservation par lien `/reservation/[token]`, déplacement
- [x] Cron `suivi-sweep` (15 min) : rappels, alertes, relances automatiques, rétention
- [x] Fichier SQL consolidé + sonde (communs avec Arena)
- [x] Migration appliquée sur Supabase le 07/09/2026 (CLI `supabase db query --linked`, jeton fourni par le client) ; sonde au vert
- [x] Recette de bout en bout le 07/09/2026 : campagne (ciblage manuel) → créneaux → invitation tracée → réservation par lien → déplacement → « Mes rendez-vous » élève → statut réalisé → compte rendu (difficulté + action) → agenda, tableau de bord, export CSV, cron. Deux correctifs issus de la recette : suppression des membres par lots (URL PostgREST) et identifiant du rendez-vous renvoyé après réservation (déplacement immédiat).

Limite connue (§18) : `suivi_reports.user_id` et `suivi_appointments.user_id` sont `on delete cascade` ;
la suppression d'un compte conserve seulement une trace statistique anonyme dans `suivi_history`.
Une anonymisation ligne à ligne demanderait `user_id` nullable + `on delete set null`.

## Recette locale

- Comptes et données de test : `tmp/_qa-arena-accounts.mjs` (création / `delete`), `tmp/_qa-arena-seed.mjs <slug>`
  (36 questions + dates), `tmp/_qa-arena-token.mjs <email> confirmation|login`, `tmp/_qa-arena-check.mjs [close]`,
  `tmp/_qa-suivi-token.mjs`, `tmp/_qa-arena-cleanup.mjs`.
- `CRON_SECRET=qa-local-cron-secret` ajouté à `.env.local` pour appeler les crons en local (valeur sans
  intérêt en production ; Vercel a la sienne).
- Sans `RESEND_API_KEY` en local, chaque envoi est tracé avec l'erreur « RESEND_API_KEY non configurée »
  (journal `arena_emails`, `suivi_history`) : c'est attendu.
- La génération du PDF de corrections (Chromium) n'a pas été testée en local (binaire Linux) : à vérifier sur Vercel.

## Points ouverts à confirmer avec le client

1. Arena §12.1 : PDF fourni ou généré → les deux sont possibles (choix par manche).
2. Arena §3.1 : durée de conservation → paramètre par tournoi, défaut 12 mois.
3. Arena §6.4 QRP : valeur par défaut « toute erreur annule » retenue, modifiable.
4. Suivi §18 : suppression d'un compte → paramètre `deletion_policy`
   (`delete` | `anonymize`), défaut `anonymize`.
