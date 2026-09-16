# Bilan — cahiers des charges « Suivi pédagogique individuel V4 » et « Planificateur adaptatif EVC »

Date : 16 septembre 2026. Poussé sur `main` (commit a35b78d7), déploiement Vercel READY, **migrations appliquées en production le 16/09/2026** (sonde tmp/_probe-planificateur.mjs : 13/13).

## 0. Ce qu'il faut faire AVANT de tester

1. ~~Appliquer le SQL~~ **Fait le 16/09/2026** (`supabase/APPLIQUER_PLANIFICATEUR.sql` via l'API Management ; 12 tables `plan_*` + 3 colonnes `suivi_settings` vérifiées).
2. **Déployer** (preview Vercel ou local `pnpm dev`). Le cron `plan-sweep` (03:30) est déclaré dans `vercel.json`.
3. **Interrupteurs** (`src/lib/modules-flags.ts`) : `SUIVI_STUDENT_ENABLED` et `PLAN_STUDENT_ENABLED` sont à `false` →
   les rubriques élève « Mes rendez-vous » et « Mon planning » ne sont visibles que du personnel (vue étudiant), pour la
   recette. Passer à `true` pour ouvrir aux élèves. Le back-office est disponible immédiatement.

Vérifications faites : `tsc` (tmp/tsconfig.check.json) vert, `eslint` vert sur les modules touchés, **29 tests** verts
(`npx tsx --test tests/suivi-*.test.ts tests/plan-engines.test.ts`).

---

## 1. Cahier des charges 1 — Suivi pédagogique individuel (V4)

Le module existait (livré le 07/09/2026, recette de bout en bout réussie). Audit complet section par section :
tout le MVP (§19) est couvert. Ajouts du jour pour les points qui manquaient ou étaient codés en dur.

### Fait aujourd'hui

| § | Manque constaté | Livré |
|---|---|---|
| §3 Planification libre | Pas de calendrier global ; créneaux seulement par campagne ; borne 2 ans / 5 000 créneaux | Onglet **Créneaux** (`/admin/suivi/creneaux`) : calendrier 1 / 3 / 6 / 9 / 12 mois (places restantes / créneaux par jour, clic → agenda), génération de **créneaux globaux** (hors campagne, réservables par tout invité, utiles au rendez-vous anticipé), liste des créneaux par campagne. Bornes techniques seulement (10 ans, 20 000 créneaux par génération). |
| §4 Alertes | « Ouvrir les créneaux » sans campagne menait à la liste des campagnes | Mène au calendrier global. |
| §11 Fiche candidat | « progression » et « résultats » absents | Bloc **Progression** (formule commune de la plateforme : %, items commencés / accessibles / terminés) et section **Derniers résultats sur la plateforme** (12 dernières séries terminées, score, %). |
| §14 Relances automatiques | Délai (3 j) et plafond (2) codés en dur dans le cron | Réglages **Relance automatique** : activée/désactivée, délai entre relances, nombre maximal (`suivi_settings.auto_relance_*`, migration). |
| §17 Exports | CSV seulement | **Export Excel (.xlsx)** de la liste filtrée, mêmes colonnes et filtres que le CSV (`/api/admin/suivi/export?format=xlsx`). |
| §20 Recette | Pas de tests des critères | `tests/suivi-recette.test.ts` : filtres suivis / non suivis / absents / sans réservation / à relancer / prochain RDV, export « ≥ 2 suivis entre septembre et novembre », constat sans action (aucune action ouverte ni en retard), difficulté + action liées, compteurs agenda/tableau de bord, rappel J-1 (date, heure, lien), planification sur 9 mois. |

### Déjà en place (vérifié dans le code)

§2 campagnes (spécialité, formule, voie, cohorte = session EVC, sélection manuelle, tous / déjà suivis / jamais suivis,
plusieurs campagnes) · §4 alertes (date, semaine, X jours/semaines avant, personnalisée ; persistantes ; email au
responsable ; 4 actions rapides) · §5 agenda semaine/mois, couleurs par spécialité paramétrables, filtres spécialité /
formule / voie / campagne / statut, compteurs par jour et par période, durée totale, clic → fiche · §6 créneaux (10 min
par défaut paramétrable, génération depuis une plage, exclusion, tampon, capacité, complet ⇒ non réservable) ·
§7 réservation par lien sécurisé (jeton haché, 30 j), créneaux disponibles seulement, jamais l'identité d'un autre
candidat, confirmation immédiate, « Mes rendez-vous », déplacement (ancien libéré, nouveau bloqué, historique) ·
§8 « Programmer le prochain rendez-vous » depuis la fiche (créneau bloqué immédiatement, visible du candidat) ·
§9 rappel avant RDV (délai global paramétrable + par rendez-vous ; date, heure, bouton déplacer ; modèle modifiable) ·
§10 vue globale 10 filtres, colonnes exigées · §11 recherche nom/email, fiche chronologique, dernière connexion,
contenus travaillés, évaluations · §12 difficultés (11 catégories, précisions, constat sans action), notes internes
par rôle, actions (10 catégories, commentaire, responsable, date, échéance, statut × 4, rattachement facultatif) ·
§13 longitudinal (actions non clôturées + derniers constats + difficulté/action ensemble au suivi suivant) ·
§14 statuts × 6, email d'absence immédiat, invités sans réservation, relance individuelle / groupée / automatique,
tout tracé · §15 bibliothèque de 7 modèles modifiables (avant envoi aussi), variables, envois tracés ·
§16 tableau de bord (12 indicateurs, filtres spécialité / formule / voie / campagne / période) · §17 exports PDF
individuel / multi / CSV (+ Excel), filtres §17 · §18 rôles (admin, responsable, intervenant, lecture), notes internes
réservées, journal d'audit, rétention paramétrable, politique de suppression (`delete` | `anonymize`) appliquée à la
suppression de compte.

### Reste en suspens (spec 1)

- Rien côté fonctionnel. §18 « anonymisation avec conservation uniquement des statistiques agrégées » : à la
  suppression d'un compte en mode `anonymize`, une trace SANS identité est conservée (rendez-vous, réalisés, absents,
  comptes rendus, difficultés par catégorie, constats sans action, actions par catégorie et réalisées, première date) ;
  les données nominatives disparaissent avec le compte.
- **Emails** : sans `RESEND_API_KEY` en local, chaque envoi est tracé « RESEND_API_KEY non configurée » (attendu).
- Un ciblage par spécialité vise **tous** les élèves réels : en recette, utiliser la **sélection manuelle**.

### Comment tester (spec 1)

1. `/admin/suivi/creneaux` : choisir 9 mois, générer des créneaux globaux (ex. lun/mer 9 h–10 h sur 9 mois) → cases vertes
   sur les 9 mois ; bloquer un créneau → il disparaît des disponibilités du candidat.
2. `/admin/suivi/reglages` : passer la relance automatique à 1 jour / 3 relances → enregistré (colonnes de la migration).
3. `/admin/suivi/candidats` : « Export Excel (liste filtrée) » → fichier .xlsx ; ouvrir une fiche → bloc Progression et
   « Derniers résultats sur la plateforme ».
4. `/admin/suivi/alertes` : créer une alerte sans campagne → « Ouvrir les créneaux » mène au calendrier global.
5. Scénario complet (déjà recetté le 07/09) : campagne manuelle → créneaux → invitation → `/reservation/<jeton>` →
   déplacement → « Mes rendez-vous » → compte rendu (difficulté sans action + action liée) → « À voir au prochain
   entretien » les présente ensemble → tableau de bord / exports.

---

## 2. Cahier des charges 2 — Planificateur adaptatif EVC (nouveau, livré intégralement)

### Architecture (§24) — `src/lib/plan/`

| Module | Fichier | Rôle |
|---|---|---|
| A. Référentiel pédagogique | `plan_items`, `db.ts`, `import.ts` | matrice (importance, volume, temps, transversalité, fréquence, années, récence, actif, priorité forcée, cours relié) |
| B. Prérequis | `plan_prerequisites`, `prerequisites.ts` | indispensable / recommandé, seuil, **chaînes récursives**, **cycles refusés** |
| C. Profil candidat | `plan_profiles`, `plan_mastery`, `plan_mastery_history`, `mastery.ts` | niveau déclaré, score 0–100, **source**, **confiance**, date ; historisation de chaque mesure |
| D. Priority Engine | `priority.ts` | somme pondérée normalisée, **coefficients en base**, priorité forcée, 4 libellés imposés, explications |
| E. Scheduling Engine | `scheduler.ts`, `workload.ts` | charge ajustée au niveau / au crédit / à la proximité, séances 45–60 min, placement par disponibilités, ordre des prérequis, évaluation après apprentissage, révisions finales, bilan de couverture |
| F. Revision Engine | `revision.ts` | J+7 → 14 → 30 → 60 (réglables), ×1,5 si excellent, ÷2 si échec |
| G. Assessment Engine | `assessment.ts`, `service.ts` | QCM de la plateforme → maîtrise ; validation courte (8 questions réglables) : QCM auto-corrigés, QROC auto-corrigés après lecture ; questions déjà utilisées **jamais réutilisées** (`plan_question_uses`) |
| H. Analytics | `analytics.ts` | **couverture du programme ≠ avancement du planning**, maîtrise estimée, statuts × 7 |

Tables : 12 (`plan_*`), RLS admin + lecture propre, cloisonnées par faculté. Cron quotidien `/api/cron/plan-sweep`
(resynchronisation QCM → maîtrise, redistribution des séances non réalisées).

### Couverture du cahier des charges

- §3 Onboarding : spécialité (collèges de la portée de l'élève), voie, date des épreuves, début ; disponibilités par jour
  (modifiables ensuite) ; auto-évaluation **Faible / Moyen / À l'aise / Je ne sais pas** item par item avec « tout le
  reste : … » ; planning généré **immédiatement** (§11).
- §4 Matrice : table + **import CSV / XLSX** (colonnes tolérantes, récence déduite des années, prérequis nommés,
  anomalies listées, modèle téléchargeable) + **création depuis les cours de la plateforme** (données de test, §26) +
  édition en ligne de chaque caractéristique (§22).
- §5–§6 Prérequis : deux types, seuil par relation ou global (70 %), remontée récursive A → B → C, cycles détectés et
  refusés, « débloqué lorsque le seuil est atteint » (§15) — un niveau déjà fiable dispense de refaire le travail.
- §7 Niveau par item : déclaré, score, source, confiance, date ; une auto-évaluation (confiance 0,3) pèse moins qu'une
  validation (0,45–0,85) ou un concours blanc.
- §8 Score de priorité : `poids_niveau_candidat`, `poids_importance`, `poids_frequence`, `poids_recence`,
  `poids_transversalite`, `poids_proximite` — **Réglages du moteur**, jamais codés en dur.
- §9 Priorité ≠ volume : testé (petit item fréquent mal maîtrisé devant gros item maîtrisé).
- §10 Charge : volume 1–5 → minutes (réglables), temps de référence par item, ajustée au niveau et au travail déjà fait,
  compressée à l'approche du concours ; découpage 45–60 min (réglable).
- §12 Planning complet jusqu'au concours : apprentissage, consolidation, évaluation, réactivation, révision finale ;
  vues **Aujourd'hui / Cette semaine / Planning complet**.
- §13 Positionnement : pas de test massif ; questions rattachées aux items par `cours_id` **et** `plan_question_tags`
  (multi-items) ; usages `entrainement | positionnement | validation | concours_blanc` ; question déjà utilisée
  identifiable.
- §14 Validation : 5–10 questions ciblées (réglable) ; ≥ 80 % maîtrisé (réactivations), intermédiaire → consolidation
  (moitié du crédit), insuffisant → reprogrammé avec davantage de travail (crédit remis à zéro). Seuils réglables.
- §16 Répétition espacée : intervalles réglables, adaptés au résultat.
- §17 Recalcul dynamique à chaque : séance terminée, reportée, évaluation, travail libre, disponibilités, resynchronisation
  QCM ; un item démontré maîtrisé libère ses heures (testé : l'item suivant avance).
- §18 Retard : les séances non réalisées sont marquées « non réalisée » (historique) et **redistribuées** ; à l'approche
  du concours le score favorise importance × manque (facteur proximité) et la fenêtre de révisions finales privilégie le rendement.
- §19 Interface : carte de séance « Item — 55 min · Priorité élevée · Maîtrise actuelle 46 % », Commencer / Terminé
  (minutes réelles) / Reporter, temps total.
- §20 Explications : « Pourquoi cette séance ? » (raisons lisibles, jamais la formule).
- §21 Tableau de bord : temps travaillé, prévu, planning réalisé, couverture, maîtrise estimée, items maîtrisés / à
  consolider / prioritaires, planning de la semaine.
- §22 Back-office `/admin/planificateur` : import, item (créer / modifier / désactiver / supprimer), volume, importance,
  transversalité, occurrences aux annales, prérequis, seuils, coefficients, intervalles, **priorité forcée**.
- §23 Historisation : `plan_mastery_history`, `plan_generations` (chaque recalcul), `plan_activity`, `plan_evaluations`,
  séances terminées / reportées avec minutes réelles.
- §25 V1 : règles + matrice + scoring paramétrable + planning dynamique ; aucune IA.

### Complément « couverture du programme »

- §2 Écran d'information **avant la première génération**, case à cocher obligatoire ; `consent_accepted_at` +
  `consent_version` en base (version réglable).
- §3 Rappel court sur chaque écran du planning ; §13 formulation de référence sur le programme complet.
- §4 Vocabulaire : uniquement « très élevée / élevée / normale / **secondaire actuellement** » ; test qui interdit
  « inutile », « ne tombera pas », toute probabilité.
- §5 **Programme complet** : tous les items, 7 statuts, recherche, filtres ; aucun item ne disparaît.
- §6 « Planning de la semaine réalisé : X % » et « Programme couvert : Y % » affichés séparément (testé).
- §7 Objectif 100 % de couverture quand le temps le permet ; la priorité ne supprime rien.
- §8 Temps insuffisant : bandeau avec les deux actions « Modifier mes disponibilités » / « Conserver mon rythme actuel
  (voir les items concernés) » ; rien n'est supprimé silencieusement.
- §9 Liberté : « Travailler un autre item » (enregistré, recalcul), lien vers chaque cours, programme complet.
- §10 Fréquence historique = facteur de priorité, jamais une probabilité affichée.
- §11 Bilan de couverture (N items / maîtrisés / à consolider / à travailler / non évalués / couverture %).
- §12 Rappel à l'approche des épreuves (J-21 réglable) : « N items restent insuffisamment travaillés » → liste.

### Reste en suspens (spec 2)

- Ce qui dépend de Major ECN (§26) : **la matrice réelle** (en attendant : « Créer depuis les cours » ou import CSV) et
  **les coefficients définitifs** (valeurs initiales 35 / 25 / 15 / 10 / 10 / 5, seuils 70 / 80 / 60, intervalles
  7 / 14 / 30 / 60, à saisir dans Réglages du moteur).
- Par construction : les questions rédactionnelles (voie externe) sont auto-corrigées après lecture de la réponse
  attendue (confiance plus faible) ; un item sans cours relié se positionne par auto-évaluation.
- Terminé le 16/09 au soir : **concours blancs → maîtrise** (réponses aux épreuves blanches rattachées aux items par la
  question source, source `concours_blanc` plus fiable qu'un QCM d'entraînement, dans la resynchronisation) et
  **vitesse réelle de travail** (§10 : rapport minutes réelles / prévues sur les séances terminées, borné 0,5–2, appliqué
  à la charge de chaque item à partir de 3 séances mesurées, visible dans le journal des recalculs).
- Aucune notification par email n'est prévue par le cahier ; non développée.

### Comment tester (spec 2)

1. `/admin/planificateur/items` → « Créer depuis les cours » → choisir *Cardiologie* → N items créés (un par cours,
   reliés). Ouvrir un item → ajouter un prérequis indispensable (ex. « Physiologie » pour « Insuffisance cardiaque ») ;
   tenter l'inverse → refus « dépendance circulaire ».
2. `/admin/planificateur/reglages` → modifier un coefficient, un seuil, les intervalles → enregistré.
3. Import : télécharger le modèle CSV, remplir 3 lignes (avec `prerequis_indispensables`), importer → compte rendu
   créés / mis à jour / prérequis / anomalies.
4. **Vue étudiant** (admin ou prof, ou un élève test avec `PLAN_STUDENT_ENABLED = true`) : `/planificateur` →
   onboarding : spécialité, voie, date des épreuves (ex. dans 90 jours), écran d'information + case, disponibilités,
   auto-évaluation → **planning immédiat**.
5. Aujourd'hui : séances avec priorité, maîtrise, « Pourquoi cette séance ? » ; « Terminé » (saisir 40 min) → recalcul ;
   « Reporter » → la séance revient plus tard ; « Travailler un autre item » → enregistré.
6. Programme complet : tous les items, filtres ; « Évaluer » un item relié à des QCM → 8 questions → résultat →
   niveau et planning mis à jour ; refaire « Évaluer » → autres questions (jamais les mêmes).
7. Tableau de bord : « Planning de la semaine réalisé » et « Programme couvert » distincts ; « Items insuffisamment
   travaillés ».
8. Mes disponibilités : passer tous les jours à 0 h 15 avec une échéance proche → bandeau « temps de préparation
   limité » avec ses deux actions ; aucun item n'a disparu du programme.
9. `/admin/planificateur/candidats` → dossier du candidat : couverture, statuts, séances, évolution du niveau, journal.
10. Cron : `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/plan-sweep` → `{ ok, recalculated, synced }`.

---

## 3. Fichiers

- Migrations : `supabase/migrations/20260916100000_suivi_relances_auto.sql`, `supabase/migrations/20260916110000_planificateur.sql`
  → consolidé `supabase/APPLIQUER_PLANIFICATEUR.sql` ; sonde `tmp/_probe-planificateur.mjs`.
- Spec 1 : `src/app/admin/suivi/creneaux/`, `src/components/admin/suivi/slots-calendar.tsx`, `src/lib/suivi/platform.ts`,
  `src/lib/suivi/{sweep,types,fiche,slots}.ts`, `src/app/api/admin/suivi/export/route.ts`, `src/components/admin/suivi/{settings-panels,candidates-table,alerts-panel,suivi-tabs}.tsx`, `tests/suivi-recette.test.ts`.
- Spec 2 : `src/lib/plan/*` (12 modules), `src/app/(student)/planificateur/**`, `src/components/student/plan/*`,
  `src/app/admin/planificateur/**`, `src/components/admin/plan/*`, `src/app/api/cron/plan-sweep/route.ts`,
  `tests/plan-engines.test.ts`, `src/lib/modules-flags.ts` (`PLAN_STUDENT_ENABLED`), navigation élève et admin.
