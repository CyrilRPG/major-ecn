# Bilans EVC Arena — septembre 2026

Six variantes utilisent le même composant `TournamentFinal` : Champion, Argent, Bronze, Top (palier de 5 %, jusqu’à 50 %), progression et parcours incomplet. L’espace participant affiche automatiquement le bilan lorsque les résultats des trois manches sont publiés. Le dernier écran de manche donne accès au bilan ; `/arena/[slug]/corrections` regroupe les corrections.

Les trophées, la bannière et le blason sont recréés avec `image_gen` à partir des maquettes fournies. Les huit images sont dans `public/arena/final/` ; les instructions sont consignées dans `arena-final-image-prompts.json`. Les fonds sont bleu nuit, fondus par CSS dans le décor existant. Les éléments graphiques générés ne constituent pas une copie pixel à pixel garantie des images originales. Les textes, scores, rangs, dates et années restent des éléments HTML et des données du tournoi. Le badge illustré « 2026 » n’est utilisé que pour cette édition. Les avatars proviennent exclusivement du catalogue existant de la plateforme.

## Calculs et confidentialité

- `computeArenaRankings` calcule séparément les rangs de chaque manche et le cumul. L’effectif de manche comprend les participants ayant une tentative réelle terminée dans cette manche ; les prévisualisations, comptes exclus, anonymisés et non confirmés sont exclus. Les effectifs administratifs existent avant publication ; les scores cumulés publics ne prennent en compte que les publications.
- L’effectif général comprend uniquement les personnes ayant disputé les trois manches, y compris celles sous le seuil. Une participation incomplète ne donne aucun rang général et conserve les résultats et rangs des manches jouées.
- Le seuil de score existant (50 % par défaut) continue de conditionner le droit au rang. La page publique affiche tous les participants ayant droit au rang, sans limite de 50 lignes, avec l’effectif correspondant. Les onglets de manche utilisent les rangs de manche ; les avatars gardent l’habillage de leur rang cumulé actuel.
- `afficher_effectif_general` est faux par défaut, modifiable dans les paramètres et copié lors d’une duplication. Sur les bilans individuels, il affiche l’effectif uniquement avec un rang visible. Aucun dénominateur de manche n’est transmis au composant de bilan. Les rangs/effectifs de manche restent dans l’administration et le CSV.
- La mention « Classement général établi sur les participants ayant disputé les trois manches. » accompagne chaque bloc général, y compris le palmarès final.
- Le temps moyen est calculé dans le classement, une fois : `Math.round(tempsCumule / manchesDisputees)`. Le bilan réutilise cette valeur. Le contrôle 1694 / 3 donne 565 s, soit 9 min 25 s. Le départage utilise la même moyenne. Les manches à durée réduite font partie du temps cumulé.
- Le score maximum et le nombre de questions du parcours incomplet portent sur les manches disputées. Les points forts/faibles comparent les taux de réussite pondérés par type de question ; aucune appréciation clinique n’est inventée.

## Format de vingt questions

La création et la duplication préparent trois manches de vingt questions. Les durées affichées sont dérivées des questions effectivement chargées. La démonstration peut être préparée avec 20 questions par manche : ses 12 questions initiales sont complétées par 8 questions indépendantes de la banque de la plateforme, avec corrections existantes. `node scripts/arena-demo-seed.mjs --check` prépare et vérifie les 60 questions sans écrire en base.

Le script de seed sans `--check` remet la démonstration à zéro : il n’a pas été exécuté. Le 9 septembre, `arena-complete-upcoming.mjs demo-medecine-interne --apply` a complété uniquement M2 et M3 à 20 questions issues de la banque de la plateforme. M1 conserve ses 12 questions et ses quatre tentatives réelles. L’accueil indique les nombres réellement chargés (12 / 20 / 20). Les nouvelles éditions prévoient trois manches de vingt questions.

## Activation et vérification

Les migrations `20260909110000_arena_avatar_rank_history.sql`, `20260909150000_arena_final_format.sql` et `20260909170000_arena_functional_actions.sql` ont été appliquées le 9 septembre 2026 au projet Supabase via son éditeur SQL, après reconnexion de l’utilisateur. Les tables, paramètres et contraintes ont été vérifiés sur la base réelle et avec PostgreSQL embarqué PGlite. Cette application manuelle ne constitue pas un déploiement du code Next.js.

L’ancienne URL de recette `/arena-preview/design` redirige désormais vers l’espace réel du tournoi de démonstration. Les maquettes chiffrées ne sont accessibles qu’en développement avec l’activation explicite `ARENA_DESIGN_FIXTURES=1`, et portent alors une mention « données fictives ». Cette route n’existe pas en production.

Vérifications : tests de classement, scoring, import, résultats, avatars, publication transactionnelle et bilans ; compilation TypeScript et ESLint ciblés ; rendu 1536 × 1024 et 390 × 844, images chargées, absence de débordement horizontal, dénominateur masqué sous le seuil et visible conjointement au rang quand demandé. Les captures sont conservées dans `tmp/arena-final-*`.

Une recette fonctionnelle isolée a parcouru les trois manches depuis le navigateur : 60 réponses effectivement sauvegardées, 51,8 / 63 points, 48 réponses parfaites, 488 secondes cumulées et une moyenne réutilisée de 163 secondes. Les contrôles couvrent la connexion par lien consommé, la modification du pseudonyme avant participation, la confirmation initiale, les sélections QRU/QRM/QRP, le marquage persistant, la reprise, les corrections, le cumul, le profil, le palmarès et le classement public. Le tournoi temporaire est archivé à l’issue du contrôle et ne remplace aucune donnée de participant existant.

Les erreurs de base remontent désormais explicitement au lieu d’afficher des zéros ou un succès fictif. Le mode local d’envoi simulé a été désactivé et Arena refuse également les succès d’envoi simulés. La configuration locale de `RESEND_API_KEY` et `EMAIL_FROM` reste nécessaire pour les emails : ces secrets ne sont pas exportables depuis l’environnement de production Vercel et ne sont pas définis dans l’environnement de développement. Aucun email n’a été envoyé pendant la recette.
