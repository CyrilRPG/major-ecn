# Conformité aux cahiers des charges — EVC Arena et Suivi individuel

Relecture point par point des deux cahiers des charges du client, avec l'endroit où
chaque exigence est réalisée et son état. Vérifié le 7 septembre 2026 après recette
sur la base réelle.

Légende : **OK** réalisé et vérifié · **OK*** réalisé, à vérifier sur Vercel ·
**Arbitrage** choix par défaut proposé, modifiable · **Mise en service** action à faire
au moment de passer en production.

Tournoi de démonstration prêt pour la recette du client : `/arena/demo-medecine-interne`
(visible en étant connecté à l'administration), administration
`/admin/arena` → « EVC Arena Médecine interne — Démo ». Il se recrée à tout moment avec
`node scripts/arena-demo-seed.mjs`.

---

## 1. EVC Arena (cahier de 11 pages)

### Avant de commencer

| Exigence | Réalisation | État |
|---|---|---|
| Réutiliser l'existant sans limitation fonctionnelle | Pioche dans la banque de QCM, infrastructure emails, Chromium pour les PDF, garde-fous d'authentification et de cloisonnement, journal d'activité | OK |
| Module complet, pérenne, réutilisable ; nouveaux tournois sans développeur | Création, paramétrage, duplication et publication entièrement en administration | OK |
| QRM, QRU, QRP avec barèmes paramétrables par l'administrateur | Onglet Barèmes, aucune intervention développeur | OK |
| Deux arbitrages non bloquants (PDF §12.1, conservation §3.1) | Les deux modes de PDF coexistent ; conservation réglable par tournoi (365 jours) | Arbitrage |
| Règles fonctionnelles prioritaires sur les maquettes | Maquette conservée comme référence de DA, règles appliquées partout | OK |

### §1 Objectif · §2 Principe général

| Exigence | Réalisation | État |
|---|---|---|
| Trois manches, dates et espacement libres, aucun rythme codé en dur | Nombre de manches libre, dates saisies par manche | OK |
| Manche ouverte 24 h paramétrable | Ouverture et clôture libres, bouton « +24 h » | OK |
| 12 questions en 12 minutes, une tentative, pas de retour arrière | Paramètres du tournoi ; index unique d'une tentative par participant et par manche ; validation irréversible | OK |
| M3 n'est jamais appelée « Finale » ; effectif jamais affiché | Libellés M1/M2/M3 ; aucun compteur sur aucun écran, email ou export public | OK |
| §2.2 Classement cumulatif provisoire puis final ; ≥ 2 manches ; absent pénalisé | `src/lib/arena/ranking.ts`, tests `tests/arena-ranking.test.ts` | OK |
| §2.3 Inscription pendant tout le tournoi ; formulaire indique les manches jouables | Page d'inscription avec bandeau des manches clôturées et restantes | OK |
| §2.4 Durée effective = min(12 min, temps restant) ; avertissement et libellé littéraux ; aucun message incitant à attendre | `attemptDeadline`, écran d'accueil de manche, textes `src/lib/arena/texts.ts` | OK |

### §3 Parcours utilisateur

| Exigence | Réalisation | État |
|---|---|---|
| Prénom, nom, email, spécialité, pseudonyme obligatoires ; avatar facultatif ; pas de téléphone | Formulaire d'inscription (avatar généré, modifiable) | OK |
| §3.1 Deux cases distinctes, jamais pré-cochées, textes littéraux, stockées séparément avec horodatage et version | Colonnes `consent_tournament_*` et `consent_marketing_*`, version `2026-09-v1` | OK |
| Export filtrable sur le consentement n° 2 ; emails opérationnels pour tous ; lien de désinscription ; suppression du compte ; durée de conservation | Export « prospection », emails du tournoi indépendants, lien signé dans chaque email, suppression depuis l'espace, `retention_days` | OK |
| §3.2 Email de confirmation ; accès aux manches bloqué avant confirmation ; distinct du consentement marketing ; bouton « Renvoyer » | Route `/arena/confirmer`, garde `currentParticipant`, page « Confirmez votre email » | OK |
| §3.3 Pseudonyme seul élément public ; filtre automatique ; modération administrateur | Filtre `pseudoForbidden`, unicité par tournoi, renommage et blocage dans l'onglet Participants | OK |
| §3.4 Avant / pendant / après | Écran d'accueil (thème, horaires, règles, barème, avertissement), passation, écran de fin | OK |

### §4 Rétention et engagement

| Exigence | Réalisation | État |
|---|---|---|
| Classement comme fil rouge, prochain thème annoncé, message aux scores faibles | Espace participant, écran de fin, email de résultats, message neutre sous le seuil | OK |
| Corrections après clôture, rappels sobres, « Inviter un collègue », commercial après M3 seulement | Emails de la séquence, invitation dans l'espace, après inscription et en fin de manche ; mention commerciale conditionnée à la dernière manche | OK |
| KPI : inscription → confirmation → M1, rétention M1→M2, M2→M3, M1→M3, complétion, ouverture/clic | Onglet Suivi du tournoi ; ouverture/clic non disponibles sans webhook Resend | OK (ouverture/clic : non disponible) |

### §5 Temps et fuseaux

| Exigence | Réalisation | État |
|---|---|---|
| Chronomètre côté serveur, continue en cas de déconnexion, reprise au temps restant réel | `arena_attempts.deadline_at`, reprise de la tentative en cours, cron de clôture | OK |
| Stockage UTC ; affichage fuseau du navigateur avec référence Paris ; fenêtre définie en heure de Paris ; comptes à rebours en temps restant ; emails avec heure de Paris et locale ; relance 3 h en temps restant | `src/lib/arena/time.ts`, composants `Countdown` et `LocalTime`, `parisAndLocalLabel` dans les emails | OK |

### §6 Barèmes

| Exigence | Réalisation | État |
|---|---|---|
| 6.1 Modes par tournoi et par type : CNG, tout ou rien, grille personnalisée, modèle enregistré ; menu déroulant ; champs seulement pour la grille personnalisée | Onglet Barèmes | OK |
| 6.2 QRM libre, QRU limitée à 1 (seconde coche désélectionne), QRP limitée à n avec message | `RoundRunner` et contrôle serveur dans `answerQuestion` | OK |
| 6.3 Discordance comptée sur l'ensemble des propositions | `countDiscordances` | OK |
| 6.4 Preset CNG : 1 / 0,5 / 0,2 / 0 ; jeu de test des six cas ; QRU binaire ; QRP x/n | `scoring.ts`, test « les six cas du jeu de test » | OK |
| 6.5 Tout ou rien sur les trois types | Mode `all_or_nothing` | OK |
| 6.6 Grille personnalisée : paliers, crédits partiels, pénalité ou 0, situations à 0, règles activables ; QRP indexée par n, saisie pour les n présents | `QrmGrid`, `QruGrid`, `QrpGrid`, éditeur avec les n du tournoi | OK |
| 6.7 Modèles enregistrés, applicables ailleurs, modifiables, sans effet sur les tournois ouverts | `arena_bareme_templates`, copie figée dans la manche à l'ouverture | OK |
| 6.8 Prévisualisation sur exemples de réponses | Bloc « Prévisualisation » de chaque type | OK |
| 6.9 Indispensable / inacceptable prioritaires ; jamais les deux sur une proposition | `checkRules`, validation `sanitizeItems` | OK |
| 6.10 Verrouillage à l'ouverture ; modification tracée avec recalcul et réévaluation du rang | `bareme_snapshot`, `overrideRoundBareme`, journal | OK |
| 6.11 Pondération | `weight` par question | OK |
| 6.12 Barème affiché avant chaque manche et dans les règles, généré depuis le paramétrage, type et barème par question | Écran d'accueil, page Règles, étiquette de chaque question | OK |
| 6.13 Départage : points, parfaites, temps moyen ; définitions du temps ; manches tronquées exclues | `compareStandings`, `duration_seconds`, `truncated` | OK |

### §7 Affichage des résultats

| Exigence | Réalisation | État |
|---|---|---|
| Jamais d'effectif ; score, cumul, rang seulement si seuil ; sous 50 % message neutre | Écran de fin, espace, emails | OK |
| 7.1 Droit au rang recalculé à chaque manche dans les deux sens ; aucun cache ; neutralisation réévalue ; pas de signalement de perte ; lien « Comment est calculé le classement ? » | Calcul à la demande, page Règles § classement | OK |
| 7.2 « Meilleurs scores », sans nombre de places, seuil, maximum 10, moins si nécessaire sans mention, colonnes, activable/désactivable | Composant `Leaderboard`, paramètre `leaderboard_enabled` | OK |

### §8 Partage, acquisition, référencement

| Exigence | Réalisation | État |
|---|---|---|
| « Inviter un collègue » : WhatsApp d'abord, email, Messenger, lien ; sur l'inscription et en fin de manche | Espace participant, page après inscription, écran de fin | OK |
| Image Open Graph ; UTM, code d'invitation, source d'acquisition conservés | `opengraph-image.tsx`, colonnes `utm`, `invite_code`, `invited_by`, `acquisition_source` | OK |
| 8.1 Landing indexable, URL pérenne, title et meta rédigés, contenu HTML réel, OG 1200×630 | Paramètres SEO du tournoi, case « indexable » | OK |
| 8.1 Lien depuis la page d'accueil de major-ecn.fr | À ajouter au moment de la mise en service (une ligne dans la page d'accueil) | Mise en service |

### §9 Avertissements · §10 Incidents · §11 Emails · §12 Corrections

| Exigence | Réalisation | État |
|---|---|---|
| §9 Textes littéraux (nature, connexion) | `WARNING_NATURE`, `WARNING_CONNECTION` sur landing, règles, manche, PDF | OK |
| §10 Neutralisation avec recalcul et information ; abandon = points conservés ; manche sans participant ignorée ; exclusion ; déconnexion | `neutralizeQuestion`, `finalizeAttempt`, ranking, blocage participant | OK |
| §10.1 Signalement à la consultation des corrections seulement ; formulaire minimal pré-rempli ; tableau trié par nombre ; accusé de réception ; validation → neutralisation ; rejet → réponse individuelle | `ReportDialog`, onglet Signalements, `handleReport` | OK |
| §11 Sept déclencheurs, chacun activable ; aucune hypothèse hebdomadaire ; désinscription partout | Séquence paramétrable, cron `arena-sweep`, envois manuels | OK |
| §12 Corrections : réponse, explication, pièges, erreurs fréquentes sans effectif, encadré méthodo, références ; PDF ; ton commercial après M3 | Corrections en ligne, PDF généré ou fourni, mention finale | OK* (génération PDF à vérifier sur Vercel) |

### §13 à §20

| Exigence | Réalisation | État |
|---|---|---|
| §13 Identité visuelle : sombre, rouge Major ECN, grands chiffres, sobre, vocabulaire imposé | Composants `src/components/arena/*` | OK |
| §14 Écrans et états listés | Tous présents, y compris mode prévisualisation, barèmes, tableau de bord avec statut | OK |
| §15 Configuration complète ; 15.1 statuts explicites et journalisés, transitions manuelles confirmées, dates figées ; 15.2 prévisualisation réelle ; 15.3 duplication ; 15.4 import, suivi, modération, export, emails | Administration `/admin/arena` | OK |
| §16 Tests : barème (six cas), départage, seuil, fenêtres tronquées, comptes non confirmés, seconde tentative bloquée, statuts, neutralisation, prévisualisation, duplication | Tests unitaires (23) et recette manuelle du 7 septembre documentée dans `docs/chantier-arena-et-suivi.md` ; test de charge à 200 participants à réaliser sur Vercel | OK (charge : à faire) |
| §17 Calendrier libre | Dates par manche | OK |
| §18 Hors périmètre respecté | Pas d'anti-triche, ni paiement, ni messagerie, ni gamification | OK |
| §19 Règles publiques | Page Règles et landing, texte repris | OK |
| §20 Format d'import documenté avec modèle vierge ; validations ; prévisualisation ; correction avant ouverture | Import CSV/tableur, modèle téléchargeable, rejets motivés, tests `tests/arena-import.test.ts` | OK |

---

## 2. Suivi pédagogique individuel (cahier V4)

| Section | Réalisation | État |
|---|---|---|
| §1 Aucune périodicité ni horizon codé en dur | Campagnes et créneaux libres | OK |
| §2 Campagnes par spécialité, formule, voie, cohorte, sélection manuelle, combinables, simultanées | Formulaire de campagne, audience en direct | OK |
| §3 Planification libre sur toute période, sans annonce, annonce générale ou prochaine période | Générateur de créneaux, actions Annoncer / Inviter distinctes | OK |
| §4 Alertes persistantes avec email, quatre types, actions rapides | Onglet Alertes, cron | OK |
| §5 Agenda semaine et mois, couleurs, filtres, compteurs | Onglet Agenda | OK |
| §6 Créneaux : 10 min par défaut, génération, exclusion, tampon, capacité, complet non réservable | Générateur et moteur de réservation | OK |
| §7 Lien sécurisé, créneaux disponibles seulement, confirmation immédiate, espace, déplacement, historique | `/reservation/[jeton]`, « Mes rendez-vous », historique | OK |
| §8 Réservation anticipée du prochain suivi | Fiche candidat | OK |
| §9 Rappels paramétrables avec bouton de déplacement, modèles modifiables | Cron et modèles | OK |
| §10 Vue globale, dix filtres, colonnes imposées | Onglet Candidats | OK |
| §11 Recherche, fiche chronologique, activité plateforme | Fiche candidat | OK |
| §12 Difficultés (11), précisions, constat sans action, notes internes, actions (10) avec statut et rattachement | Compte rendu | OK |
| §13 Logique longitudinale | Bloc « À voir au prochain entretien » | OK |
| §14 Statuts, email d'absence, invités sans réservation, relances individuelles, groupées, automatiques, historique | Campagne, fiche, cron | OK |
| §15 Bibliothèque de sept emails, variables, modifiables avant envoi, traçables | Réglages, dialogue d'envoi, `suivi_history` | OK |
| §16 Tableau de bord, filtres | Page d'accueil du module | OK |
| §17 Exports PDF individuel, PDF multiple, CSV, filtres | Routes d'export | OK* (PDF à vérifier sur Vercel) |
| §18 Rôles, notes internes protégées, traçabilité, minimisation, conservation, suppression | Rôles du module, journal, réglages ; suppression = trace anonyme (voir limites) | OK (limite documentée) |
| §19 MVP | Intégralement couvert | OK |
| §20 Critères de recette | Recette du 7 septembre : tous vérifiés | OK |

---

## 3. Recette réalisée le 7 septembre 2026

EVC Arena : création dans l'administration → contrôle d'intégrité → Programmé →
Inscriptions ouvertes → inscription publique avec consentements → confirmation d'email
→ manche de 12 questions jouée avec chronomètre → clôture et publication par le cron →
score, rang, Meilleurs scores, corrections → signalement → validation, neutralisation,
recalcul (10,7 → 10,2 / 12) → export CSV.

Suivi : campagne → sélection manuelle → 18 créneaux → invitation tracée → réservation
par lien → déplacement (ancien créneau libéré, historique) → « Mes rendez-vous » côté
élève → rendez-vous réalisé → compte rendu avec difficulté et action → agenda et
compteurs → tableau de bord → export CSV → cron.

Deux anomalies détectées et corrigées pendant la recette (suppression des membres par
lots ; identifiant du rendez-vous après réservation). Toutes les données de recette ont
été supprimées.

## 4. Reste à faire côté client

1. Vérifier sur Vercel la génération des PDF (corrections, fiches) et le test de charge à
   200 participants.
2. Décider des arbitrages (PDF fourni ou généré, durée de conservation, QRP en cas
   d'erreur, politique de suppression).
3. À la mise en service : passer les interrupteurs de `src/lib/modules-flags.ts` à `true`,
   cocher « indexable » sur le tournoi, ajouter le lien depuis la page d'accueil.
