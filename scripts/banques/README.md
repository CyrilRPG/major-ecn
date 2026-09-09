# Reprise des banques de QCM

Le plan du 9 septembre 2026 contient les valeurs exactes avant/après, les UUID et les motifs. Il est figé et a été appliqué à la base du projet. Le module `lib/nettoyage-editorial.mjs` conserve les règles utilisées pour préparer le lot ; il ne doit pas être lancé aveuglément sur un nouveau corpus. Les restaurations depuis les sauvegardes et les cas relus sont déjà inclus dans le plan exact.

## Simulation, application, contrôle

Fournir le jeton de gestion par `SUPABASE_ACCESS_TOKEN_FILE` (chemin vers un fichier local privé) ou `SUPABASE_ACCESS_TOKEN`, sans l'inscrire dans le dépôt.

```sh
node scripts/banques/appliquer-reprise.mjs --plan scripts/banques/reprises/2026-09-09-finalisation.json
node scripts/banques/appliquer-reprise.mjs --plan scripts/banques/reprises/2026-09-09-finalisation.json --apply
node scripts/banques/appliquer-reprise.mjs --plan scripts/banques/reprises/2026-09-09-finalisation.json --verify
node --test tests/banques-publication.test.mjs tests/banques-nettoyage.test.mjs
```

Sans option d'écriture, le script simule seulement. Une valeur déjà conforme est ignorée ; toute divergence de contenu arrête le traitement. Chaque lot est transactionnel. Les triggers peuvent changer l'horodatage d'un parent ; une relecture accepte ce changement seulement si tous les autres champs sont conservés. Le contrôle d'horodatage reste actif au moment de chaque écriture.

Les lignes intégrales avant écriture sont sauvegardées dans `tmp/banques-reprise/backups/`, avec le SHA-256 du plan. La relecture finale vérifie les champs prévus et les champs hors plan. Une interruption peut être reprise avec le même plan, après examen de sa cause. Ne pas utiliser un remplacement de chapitre avec suppression/réinsertion pour réparer des questions déjà utilisées par des élèves.

Le retrait d'une série conserve toutes les lignes et utilise `allowed_offers: []`. Une réouverture demande une reprise complète du dossier et un nouveau plan relu. Ne pas restaurer automatiquement les offres sur la seule disparition d'un motif textuel.

`qualite-publication.mjs`, appelé par `_ins-chapter.mjs`, fournit un premier contrôle structurel et éditorial. Il ne remplace ni la vérification du dossier original, ni la validation médicale du corrigé.
