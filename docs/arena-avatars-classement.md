# Avatars EVC Arena — classement cumulé

Les règles écrites du 9 septembre 2026 priment sur les mentions de la maquette : l’apparence représente le rang cumulé actuel, jamais la meilleure performance passée ni le nombre de manches jouées.

- Personnage choisi à l’inscription, conservé pendant toute l’Arena. Les identités déjà enregistrées sont conservées. L’ancienne action de changement refuse un autre personnage ; un trigger protège aussi la colonne en base.
- 1er : Or / Prestige, cercle lumineux, lauriers, accent bordeaux et blason au serpent médical. 2e : Argent et badge 2. 3e : Bronze et badge 3. Les autres, ainsi que les participants sans rang, sont Standard.
- Les calques SVG/CSS s’appliquent au portrait original, y compris aux anciens emblèmes. Aucun jeu de portraits Bronze/Argent/Or distinct n’est nécessaire.
- Les portraits sont les 24 médaillons déjà présents sur la plateforme Arena. Le portrait temporairement ajouté depuis la maquette a été retiré du catalogue et de tous les aperçus. Son ancien identifiant est résolu vers `medecin-01` à l’affichage ; aucun choix existant du catalogue ni aucune donnée de compte n’est remplacé.
- La navigation, le profil, l’entrée de manche et le classement public utilisent le même composant et le rang courant du moteur existant. Le seuil d’accès au classement, le minimum de manches au classement final et le départage restent appliqués. Les égalités parfaites partagent le rang et l’habillage.
- Le classement public expose le rang, le portrait, le pseudonyme et le score cumulé. Le nom réel et l’email n’y sont pas transmis.

## Palmarès et publication

`publishArenaRound` est appelé par le cron et la publication manuelle. Le moteur TypeScript calcule le cumul ; la fonction SQL `arena_publish_ranking_snapshot` enregistre les rangs et publie les résultats dans une même transaction. Une tentative encore ouverte ou une erreur d’enregistrement empêche la publication. Une publication concurrente impose un nouveau calcul.

Chaque checkpoint est conservé lors des manches suivantes. Une relance du cron ou du bouton de publication ne l’écrase pas. Les corrections ultérieures peuvent modifier le classement courant ; le palmarès garde les positions enregistrées à la publication. Il n’existe pas de « meilleur niveau acquis » enregistré pour l’avatar.

Le palmarès est lu uniquement pour le participant authentifié, dans son espace. Les rôles publics et authentifiés Supabase n’ont pas d’accès direct à la table ou à la fonction de publication. Les références sont supprimées en cascade si la manche ou le participant est supprimé.

Pour les résultats publiés avant cette évolution, le prochain balayage du tournoi reconstitue une fois les checkpoints manquants, avec les manches disponibles à chaque date de publication. Les participants inscrits ou confirmés après cette date sont exclus du calcul rétrospectif. Ces entrées sont explicitement étiquetées « Reconstitué ». Les anciens scores ou états de modération qui auraient déjà changé ne peuvent pas être restaurés : cette reprise n’est pas présentée comme un historique original.

## Mise en service

La migration `supabase/migrations/20260909110000_arena_avatar_rank_history.sql` a été appliquée au projet Supabase le 9 septembre 2026. Elle ajoute la table privée, le checkpoint de publication et le verrouillage du personnage. La recette des trois publications a aussi été vérifiée sur un tournoi temporaire dans la base réelle. Le code applicatif est modifié localement ; son déploiement est distinct de l’application des migrations.

## Vérifications

- 37 tests réussis : barème, import, classement, synthèse des résultats, parcours 1 → 2 → 1 et 3 → 6 → 2, absence de promotion sans classement, confidentialité, reprise des publications.
- La migration réelle est exécutée dans un PostgreSQL en mémoire (PGlite, dépendance de développement uniquement). Vérifications de la transaction, des rejets, de l’idempotence, du verrouillage de l’avatar et des permissions.
- Contrôle TypeScript de l’application avec `pnpm exec tsc --noEmit -p tmp/tsconfig.arena-check.json` ; ce fichier local exclut les scripts temporaires préexistants de `tmp`. ESLint ciblé réussi.
- Aperçu local : `http://localhost:3000/arena-preview/design?state=avatars`. Même rendu que les composants de production ; parcours fictifs interactifs, portrait verrouillé pendant la simulation, classement et palmarès synchronisés. Cette route est indisponible hors développement.
- Vérification dans le navigateur des deux sens d’évolution, du portrait constant, de l’historique et de la navigation. Rendu contrôlé à 1599 px, 390 px et 320 px ; aucun débordement horizontal ni image manquante. Vérification supplémentaire de l’en-tête et de l’avatar du lobby à 320 px.

```sh
pnpm exec tsx --test tests/arena-scoring.test.ts tests/arena-ranking.test.ts tests/arena-import.test.ts tests/arena-result-summary.test.ts tests/arena-avatar-ranking.test.ts tests/arena-rank-history-db.test.ts
```
