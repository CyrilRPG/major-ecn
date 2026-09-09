# Reprise des annales — 9 septembre 2026

Contrôle de la conversation transmise et des 26 questions signalées, avec lecture des sujets Word convertis en PDF et des corrigés Major ECN. Les rapprochements reposent sur la spécialité, l’année, le dossier et la consigne ; aucun score de similarité ne décide de la publication.

## Les 26 questions

| N° dans le fichier de travail | Session | Conclusion | Motif |
|---|---|---|---|
| 1 | Anesthésie-Réanimation 2016 EVCF | Restauré | Anesthésie EVCF 2016, Q11 : corrigé existant retrouvé p. 93 du PDF. |
| 2, 3, 4, 5 | Pédiatrie 2016 EVCF | Hors publication | Pédiatrie EVCF 2016, sujet 3 : dossier de 5 questions absent de la base ; les 4 propositions ne le couvrent pas entièrement. |
| 6, 7 | Pédiatrie 2019 EVCF | Série retirée | Pédiatrie EVCF 2019 : Q10 et Q13 non corrigées dans le document ; 13/15 questions publiées. |
| 8, 9 | Médecine d’urgence 2019 EVCF | Faux rattachement | Le fichier EVCF.43 2019 est Médecine intensive-réanimation, pas Médecine d’urgence (code 77). Aucune insertion dans la série d’urgence. |
| 10 | Pédiatrie 2015 EVCF | Hors publication | Pédiatrie EVCF 2015, sujet 1 : 5 questions officielles ; une seule proposition retrouvée. Dossier absent. |
| 11, 12, 13, 14 | Pédiatrie 2017 EVCF | Hors publication | Pédiatrie EVCF 2017, sujet 3 : 10 questions officielles ; 4 propositions. Dossier absent. |
| 15 | Pneumologie 2017 EVCF | Déjà complet | Pneumologie EVCF 2017, Q4 : figure numérotée et réponses 1 à 9 déjà présentes ; image HTTP 200 et lecture visuelle. |
| 16, 17, 18, 19 | Psychiatrie 2013 EVCP | Hors publication | Psychiatrie EVCP 2013, dossier enfant Q9 à Q13 : la grille fournie couvre seulement le dossier adulte Q1 à Q8. Les propositions ne couvrent pas toutes les consignes. |
| 20, 21, 22 | Pédiatrie 2017 EVCP | Hors publication | Pédiatrie EVCP 2017, sujet 2 prématurité : 11 questions officielles ; 3 propositions. Le dossier bronchiolite publié correspond au sujet 3 et a été renommé. |
| 23 | Pneumologie 2017 EVCP | Déjà complet | Pneumologie EVCP 2017, Q8 : tableau et corrigé présents. VEMS 3,07 → 3,35 L, hausse de 9,1 % ; pas de réversibilité significative au critère du corrigé. |
| 24 | Pédiatrie 2015 EVCP | Consigne restaurée | Pédiatrie EVCP 2015, sujet 1 Q6 : le corrigé des manifestations était déjà publié ; la seconde consigne a été rétablie. |
| 25, 26 | Psychiatrie 2015 EVCP | Hors publication | Psychiatrie EVCP 2015, sujets 1 et 2 : chacun comporte 3 sous-questions, une seule proposition par dossier. Le cas complet Thérèse est renommé sujet 3. |

18 propositions appartiennent à 7 dossiers absents et partiellement couverts : ces dossiers restent hors publication. Deux propositions concernent la série de pédiatrie 2019 retirée ; deux sont mal rattachées ; deux sont déjà complètes en pneumologie ; deux correspondent à un élément restauré.

## Autre manque établi lors de la lecture

Pédiatrie EVCF 2017, sujet 1, partie 2 : la question 8 « Qu’en attendez-vous ? » figure dans le sujet officiel (p. 2), mais pas dans le corrigé (p. 80). Les 7 questions publiées ne couvrent donc pas ce dossier de 8 questions : série retirée. Les parties 1 et 3 sont des blocs distincts et complets.

## Modifications appliquées en production

Le plan exact est dans `scripts/annales/reprises/2026-09-09.json` : 11 opérations, exclusivement mises à jour et insertion. Les motifs restent dans les documents de travail, aucun bandeau ni avertissement ajouté à l’espace élève.

- Deux séries retirées par `allowed_offers = []`, avec conservation des lignes et de l’historique.
- Une question d’anesthésie restaurée depuis le corrigé existant, p. 93 ; pas de publication du brouillon de remplacement.
- Une consigne de pédiatrie restaurée, une numérotation de pneumologie explicitée et la fin d’une vignette de pneumologie rétablie.
- Trois séries renommées pour correspondre aux dossiers officiels.
- Deux mentions « [voir image] » retirées exactement, sans normalisation de la typographie.
- Sept justifications de QCM, repérées pendant le nettoyage, reformulées en explications pédagogiques sans remarque sur le document source. Le plan exact et les références sont dans `scripts/annales/reprises/2026-09-09-editorial.json`.

Les deux plans ont été appliqués puis relus : 18 opérations conformes, aucune opération restante. Chaque ancienne ligne a été sauvegardée avant écriture dans `tmp/annales-finalisation/backups`.

## Accès réellement vérifié

Le contrôle avec un compte étudiant a révélé deux écarts entre le code et les règles réellement déployées en base : la liste de formules vide ne bloquait que les entraînements, et l'exemption des annales à la restriction de voie avait disparu.

- `20260909143000_annales_publication_restrict.sql` bloque toute série explicitement retirée, y compris via l'API, et conserve les accès administratifs.
- `20260909144000_annales_voie_restore.sql` rétablit uniquement l'exemption des annales à la restriction de voie, déjà prévue par les migrations d'août/septembre et le code applicatif. Les autres critères en production sont conservés.

Ces deux migrations sont appliquées et inscrites dans l'historique Supabase. Les règles des questions et propositions héritent du contrôle de la série.

## Vérifications

- 16 tests d’accès réussis, avec les trois états de voie et toutes les formules ; staff conservé.
- TypeScript complet et ESLint ciblé réussis sur une copie isolée du code destiné à la production.
- Audit structurel : 281 séries d'annales accessibles, 2 967 questions, 240 propositions, 10 items d'accueil, 86 couples collège/année et 13 profils applicatifs contrôlés. Les quatre QCM dont toutes les réponses sont justes sont des informations de contrôle, pas des échecs.
- Test réel de l'API avec 12 profils étudiants (3 états de voie × 4 formules) : les deux séries retirées et leurs questions sont invisibles ; le dossier complet témoin reste visible. Lecture administrative des séries retirées conservée.
- Test HTTP authentifié de `https://www.major-ecn.fr` : pages retirées en état « introuvable », dossier témoin complet accessible, séries retirées absentes des navigations 2017 et 2019. Next.js peut retourner HTTP 200 avec son marqueur 404 en flux ; ce marqueur a été vérifié.
- 11 images vérifiées par HTTP ; figures de volumes et EFR de pneumologie vues et rapprochées du sujet.
- Avant et après intervention : **411 tentatives et 232 sessions** sur les 22 séries examinées. Les 183 questions initiales sont conservées et une question a été ajoutée, soit 184.
- Les 287 séries de l'instantané initial existent toujours : 283 annales et 4 séances de professeur consacrées à des annales. Deux des 283 annales sont retirées, d'où les 281 publiées.
- Déploiement du correctif applicatif : commit `7b22f57f`, statut Vercel réussi. Les données et règles d'accès ont ensuite été vérifiées sur le domaine public.
- Compte étudiant temporaire supprimé après les contrôles ; absence confirmée dans Auth et suppression du fichier contenant ses identifiants.
- Le miroir d'accès mobile a également reçu le correctif `[] = aucune offre` dans le dépôt local `application`. Le retrait immédiat côté mobile est assuré par la règle en base, indépendamment d'une nouvelle version mobile.

## Périmètre du nettoyage

La présente livraison finalise les annales de la conversation transmise. L'utilisateur a ensuite autorisé l'extension aux autres banques de QCM : la reprise éditoriale et les retraits complémentaires sont décrits dans `docs/anomalies-hors-annales-2026-09-09.md`. Ces contrôles ne constituent pas une certification médicale indépendante de toutes les réponses du catalogue.

## Sources de contrôle

Les originaux restent dans `Annales/Sujets` et `Annales/Corriges_Majorecn`. Les copies de lecture et leurs extractions sont dans `tmp/annales-finalisation/sources`. La réponse d’anesthésie reproduit le corrigé de l’annale 2016, p. 93. Le contexte des indications urgentes d’épuration a également été vérifié dans les [recommandations SFAR-SRLF](https://sfar.org/epuration-extrarenale-en-reanimation-adulte-et-pediatrique/).
