# Espace professeur : le 404 du 2026-08-14, et comment il ne peut plus revenir

## Le signalement

Dr Borgne (mission QI/QCM/QROC, hématologie) :

> Je rencontre des difficultés pour ajouter mes propres questions, comme si je
> n'avais pas les droits à partir de l'espace professeur. De même, lorsque je
> clique sur « gérer les QCM », une page 404 non found apparaît.

## Ce qui se passait réellement

Deux causes distinctes, qui produisaient le même écran.

### 1. Récursion RLS (42P17) — cause principale

Mesure faite en production le 2026-08-14, avec un compte de test à sa portée
exacte : **toute** lecture de `qcm_series`, `qcm_questions` ou `qcm_items` par un
client soumis à la RLS échouait en
`42P17 infinite recursion detected in policy`, pour les trois rôles (élève,
professeur, administrateur).

La production portait encore la policy `qcm_series_entrainement_voie_restrict`
version 20260811120000, qui appelle `qcm_series_default_allowed_voies(id)` →
lecture de `qcm_questions` → policy `qcm_questions_read` → retour vers
`qcm_series`. Cycle fermé. Le correctif définitif existait
(`20260811180000_qcm_rls_recursion_definitive.sql`) mais **n'avait jamais été
exécuté sur cette base** — les migrations sont appliquées à la main dans le SQL
Editor.

`/admin/contenu/[cours]` lisait l'item avec l'embed
`qcm_series(… qcm_questions(id))` via le client RLS et **ne testait pas
l'erreur** : `data` valait `null`, `notFound()` s'ensuivait, le professeur voyait
« 404 non found » sur *tous* les items, y compris les siens. Deux requêtes plus
bas, le détail des questions échouait de la même façon : quand la page
s'affichait, l'éditeur s'ouvrait sans aucune question — « impossible d'ajouter
mes propres questions ».

Les pages élèves ne le voyaient pas : elles lisent ces tables en service-role
depuis l'incident du 2026-08-11.

### 2. Portée d'item vs portée de collège — cause secondaire

`permission_scope` de Dr Borgne : 21 collèges de Médecine générale, mais 13 items
(toute l'hématologie). Depuis `20260813090000_exact_college_course_rls.sql`, la
RLS n'ouvre plus que ces 13 items — c'est voulu.

Mais l'application, elle, décidait d'afficher « Gérer les QCM » sur le seul
critère `canWrite(scope, 'qcm')`, sans regarder l'item : le bouton apparaissait
sur les 168 items de ses collèges et menait à un 404 sur 155 d'entre eux. Et
l'ouverture d'un item hors portée en vue élève renvoyait un 404 nu.

## Ce qui a été corrigé

| Correctif | Fichier |
| --- | --- |
| Ré-application du correctif de récursion, name-agnostic, avec garde-fou | `supabase/migrations/20260814090000_qcm_rls_recursion_repair.sql` |
| `/admin/contenu/[cours]` lit en service-role, droits rejoués en application | `src/app/admin/contenu/[cours]/page.tsx` |
| Écran « item hors périmètre » au lieu d'un 404 muet | idem |
| Règle unique « peut éditer CE type sur CET item » | `src/lib/auth/prof-content-access.ts` |
| Boutons d'édition gouvernés par cette règle (QCM, série, fiche, flashcards) | pages `(student)/cours/[cours]/…` |
| Professeur hors portée renvoyé vers ses items au lieu d'un 404 | `(student)/cours/[cours]/layout.tsx` |
| Portée d'item vérifiée côté serveur dans les server actions | `admin/contenu/[cours]/{qcm-,}actions.ts` |
| Tests de régression | `tests/prof-content-access.test.ts` |

## Les trois règles à ne plus enfreindre

1. **Une erreur SQL/RLS ne se traduit jamais en `notFound()`.** On teste
   `error` et on le laisse remonter. Un 404 doit vouloir dire « cette ligne
   n'existe pas », rien d'autre.
2. **Un refus d'accès se dit.** Ni 404, ni bouton qui disparaît sans un mot :
   l'écran indique que l'item n'est pas attribué et où trouver les siens.
3. **Un bouton d'édition s'affiche avec `canEditCoursContent`**, jamais avec
   `canWrite` seul : sinon l'interface propose un lien que le serveur refusera.
   Symétriquement, toute server action de contenu appelle `checkCoursScope` en
   remontant à l'item depuis l'entité visée (jamais depuis le `coursId` envoyé
   par le navigateur).

## Lancer les tests

```bash
node --import tsx --test tests/*.test.ts
```

## Vérifier l'état de la base

Le script `tmp/_probe-rls.mjs` (compte de test créé puis supprimé) rejoue les
lectures sous chaque rôle et affiche le code d'erreur éventuel. Attendu après
application de la migration : aucune erreur 42P17.
