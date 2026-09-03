# Publication Anesthésie-Réanimation

Cette procédure maintient le collège et ses 43 cours en accès `specific`
jusqu'au dernier contrôle. Les commandes de préparation locale ne contactent
aucun service externe.

## 1. Préparation locale obligatoire

```powershell
node scripts/audit-anesthesie-editorial-quality.mjs
node scripts/publish-anesthesie-reanimation.mjs --preflight
node --test tests/anesthesie-publication-readiness.test.mjs
node --import tsx --test tests/qcm-access.test.ts tests/prof-content-access.test.ts
```

Le préflight doit afficher `ready: true`, `courses: 43`,
`editorialAudit: "43/43"` et `remoteCalls: 0`. Il recalcule les volumes depuis
les paquets, contrôle les quatre banques et vérifie les empreintes de tous les
artefacts audités.

## 2. Migrations requises

Appliquer les migrations Supabase jusqu'à :

- `20260820150000_anesthesie_reanimation_atomic_content.sql` ;
- `20260821120000_anesthesie_reanimation_publication_guard.sql` ;
- `20260821143000_anesthesie_qcm_answer_balance.sql` ;
- `20260821150000_anesthesie_qcm_series_mix_guard.sql`.

La première remplace les banques d'un cours dans une transaction. La seconde
valide les 43 cours en base et bascule le collège avec ses cours dans une seule
transaction. Elle n'est exécutable que par `service_role`.

La troisième migration permet une correction éditoriale des seules banques
QCM sans suppression : séries, questions, propositions, sessions, tentatives,
flashcards, révisions et fiches conservent leurs identifiants.

La quatrième applique les mêmes règles de mélange à chaque série lors du
préflight distant et au moment de l'activation.

## 3. Rééquilibrage non destructif d'un collège déjà créé

Lorsque seules les réponses QCM sont réécrites, ne pas relancer le remplacement
canonique. Placer d'abord le collège et ses 43 cours en accès `specific`, puis :

```powershell
node scripts/audit-anesthesie-qcm-balance.mjs
node scripts/rebalance-anesthesie-qcm.mjs --preflight
node scripts/rebalance-anesthesie-qcm.mjs --stage
```

La distribution exigée par cours est de 19 ou 20 QCM pour chacune des
cardinalités 1 à 5. Les profils de lettres sont répartis avec un écart maximal
de 1 au sein d'une cardinalité et les fréquences A–E avec un écart maximal de
2. Chaque série mélange au moins trois cardinalités, n'en répète aucune plus de
trois fois et possède une séquence distincte des autres séries de même longueur.
La mise à jour des 43 cours s'exécute dans une seule transaction PostgreSQL.
En cas d'erreur, aucune proposition n'est modifiée.

## 4. Staging restreint

```powershell
node scripts/publish-anesthesie-reanimation.mjs --stage
```

Cette commande :

1. refuse de démarrer si le collège est déjà public ou porte une progression
   QCM/flashcard qui serait supprimée par le remplacement ;
2. crée un instantané versionné et vérifie les PDF sauvegardés par SHA-256 ;
3. crée ou met à jour le collège et les 43 cours en accès `specific` ;
4. remplace les banques cours par cours ;
5. téléverse une fiche PDF et une fiche HTML canoniques par cours ;
6. relit chaque cours depuis la base ;
7. appelle la garde d'activation avec `p_dry_run: true`.

Le fichier `.corpus-anesthesie-reanimation/publish-report.json` doit contenir
`activated: false`, 43 rapports et `activationReadiness.ready: true`.

Avant l'activation, effectuer un smoke test avec trois comptes de test ayant
un accès explicite au collège et aux cours restreints :

- étudiant interne : QCM et DP QCM seulement ;
- étudiant externe : QROC et DP QROC seulement ;
- administrateur ou professeur : les quatre banques.

Tester aussi l'URL directe d'une série de la voie opposée : elle doit être
refusée. Ce smoke test dépend d'identités réelles et ne peut pas être simulé par
le client `service_role`.

## 5. Activation finale

```powershell
node scripts/publish-anesthesie-reanimation.mjs --activate
```

La commande relit les 43 cours, puis l'RPC transactionnelle revérifie volumes,
formats, réponses, voies, fiche unique et accès `specific`. Si un contrôle
échoue, aucun cours ni collège ne passe à `all`.

## 6. Restauration d'urgence

```powershell
node scripts/publish-anesthesie-reanimation.mjs --restore-snapshot --confirm-restore=col-anesthesie-reanimation
```

La restauration refuse un instantané ancien ou incomplet. Elle replace d'abord
le collège et les cours en accès restreint, supprime le staging partiel, restaure
les lignes sauvegardées puis remet les PDF après vérification SHA-256.
