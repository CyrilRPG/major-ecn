# Qualité & Suivi des candidats

CDC « Module de suivi des candidats, enquêtes de satisfaction, qualité pédagogique, amélioration continue et traçabilité Qualiopi » (v1.0, 08/10/2026).

## Où

- Admin : `/admin/qualite` (administrateurs seulement). Onglets : vue générale, enquêtes, candidats (+ fiche), remarques, enseignants, contenus, alertes, réclamations, actions correctives, séances, exports & journal, paramètres.
- Élève : fenêtre bloquante (`components/qualite/garde-enquetes.tsx`, montée par le layout élève), `/enquetes`, `/enquetes/[id]`.
- Sans connexion : `/questionnaire/[jeton]` (post-EVC, suivi différé).
- Cron : `/api/cron/qualite` toutes les 15 min.
- Migration : `supabase/migrations/20261010090000_qualite_suivi_candidats.sql` (appliquée le 10/10/2026).

## Règles

- **Livré éteint.** Rien ne part tant que « Module actif » n'est pas coché dans Paramètres. À l'activation, la date de démarrage est posée : aucune séance antérieure ne déclenche d'enquête.
- **Orchestrateur unique** (`lib/qualite/orchestrateur.ts`, pur, testé) : une clé par candidat et par enquête (`HOT:<séance>`, `PROGRESS_33`, `FINAL:<session>`…), un seul questionnaire bloquant à la fois (le plus prioritaire), bilan final prioritaire, questionnaires à chaud neutralisés pendant la dernière ligne droite (tracé, jamais compté comme réponse).
- **Progression du parcours** : la plus avancée entre la formule commune de `lib/progress` et le temps écoulé (début → fin de formation). Fin de formation = correction admin, sinon fin d'accès, sinon dernière épreuve (aucun compte n'a de fin d'accès au 10/10/2026).
- **Épreuves** : `evc_calendrier` (session en cours) des spécialités de la formule ; corrigeables par candidat. Gynécologie, biologie médicale, ophtalmologie, ORL, odontologie, endocrinologie, MIR, pharmacie n'ont pas de ligne au calendrier : pas de J-3/J+3 pour ces candidats tant qu'elle manque.
- **Présence en direct** = feuille d'émargement de la séance Zoom (seule donnée disponible) ; replay = visionnage ≥ 80 % suivi séance par séance (`qualite_visionnages`, alimenté par le lecteur web). Correction manuelle dans « Séances ».
- **Blocage** (`lib/qualite/blocage.ts`) : `activites` = entraînements, révisions, épreuves, Check-up, parcours ; `pedagogie` ajoute cours/replays. Profil, agenda, formulaires, émargements, messagerie, forum, résultats toujours ouverts. Le candidat peut reporter une fois (problème technique) ; l'admin peut suspendre, dispenser, neutraliser, ou poser un aménagement « sans blocage ».
- **Analyse** : règles immédiates (`analyse-regles.ts`, vocabulaire fermé de thèmes) puis IA (Haiku, sans donnée nominative) ; une correction humaine n'est jamais écrasée.
- **Traçabilité** : réponses et texte original des commentaires inaltérables (déclencheurs), journal en ajout seul. Suppression d'un compte = réponses anonymisées.
- **Réclamations** : registre unique `cockpit_reclamations` (colonnes `origine`, `decision`, `cloturee_at`… ajoutées).

## Recette

- `npx tsx --test tests/qualite-moteur.test.ts`
- `node --conditions=react-server --env-file=.env.local --import tsx tmp/_qa-qualite/e2e.mts` (comptes jetables, nettoyage complet, paramètres restaurés)
- `… tmp/_qa-qualite/simulation-activation.mts` : ce que l'activation déclencherait aujourd'hui (lecture seule).
