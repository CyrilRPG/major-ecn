# Avatars pédagogiques — 9 septembre 2026

Major ECN utilise les 23 images du catalogue EVC Arena autres que `casque` :
17 portraits de soignants et 6 emblèmes. Le catalogue pédagogique est dérivé de
celui de l’Arena dans `src/lib/avatar.ts`. Les fichiers PNG sont partagés, sans
recréation ni duplication des images.

## Données

Migration : `20260909190000_platform_arena_avatars.sql`, appliquée au projet
Supabase `mrrgfnirpwsknuyiwcqy` le 9 septembre 2026.

- 738 profils Major ECN réattribués aléatoirement, y compris les anciens choix.
- Contrôle après migration : 738 avatars valides, aucun casque, aucun avatar nul.
- Les nouveaux profils Major ECN reçoivent automatiquement un choix autorisé.
- Un choix valide reste stable. Une graine héritée ou invalide est normalisée en base.
- Le rejeu de la migration ne réinitialise pas à nouveau les choix des comptes.
- Les profils des autres facultés et les identités Arena ne sont pas modifiés.
- Sauvegarde locale des anciens identifiants d’avatars dans `tmp/`, hors Git.

## Affichages et actions

Le profil, le menu du compte, les listes administratives et les auteurs du forum
lisent `profiles.avatar_seed`. Le sélecteur propose les 23 choix, avec attribution
au hasard facultative et enregistrement. Le menu est actualisé après sauvegarde.

Les routes web et mobile valident le catalogue et n’écrivent que le profil de
l’utilisateur authentifié. L’accès serveur évite la politique récursive UPDATE
de `profiles` rencontrée pendant le test. La route mobile renvoie aussi les URL
des images et la liste autorisée ; le profil de l’application compagnon a été adapté.

## Vérification

- Deux tests du catalogue et de la migration PostgreSQL passent, ainsi que les
  cinq tests existants de l’identité et du classement des avatars Arena.
- TypeScript et ESLint ciblé passent pour le web ; TypeScript passe pour le mobile.
- Un compte temporaire a reçu automatiquement `medecin-15`, puis le choix `hibou`
  a été enregistré depuis le navigateur. Menu, rechargement et base concordent.
- Les 23 images du sélecteur et les avatars des auteurs du forum chargent correctement.
- API : absence d’authentification refusée ; casque, graine inconnue et corps
  invalide refusés ; catalogue et sauvegarde mobile vérifiés.
- Le compte temporaire a été déconnecté et supprimé après contrôle.

La migration est active dans Supabase. Les changements d’interface ont été
vérifiés sur localhost ; aucun déploiement web de production ni publication
d’une nouvelle version mobile n’a été effectué dans cette intervention.
