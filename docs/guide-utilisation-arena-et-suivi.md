# Guide d'utilisation — EVC Arena et Suivi pédagogique individuel

Ce guide explique comment utiliser les deux modules livrés en septembre 2026 depuis
l'administration de Major ECN. Il s'adresse à l'équipe Major ECN (administrateurs,
responsables pédagogiques, intervenants). Les références « §x » renvoient aux cahiers
des charges du client.

Sommaire

1. Mode test et mise en service
2. EVC Arena — tournoi de QCM
3. Suivi pédagogique individuel
4. Fonctionnement technique (emails, crons, variables)
5. Limites connues et points à arbitrer

---

## 1. Mode test et mise en service

Les deux modules sont livrés **en mode test** : ils fonctionnent entièrement, mais ne
sont accessibles qu'au personnel connecté à l'administration (compte administrateur ou
professeur).

| Module | En mode test | Après mise en service |
|---|---|---|
| EVC Arena | Le hub `/arena`, la landing, l'inscription et les manches ne répondent qu'aux comptes du personnel (404 pour le public). | Un tournoi devient public dès qu'il est en « Inscriptions ouvertes ». |
| Suivi individuel | L'administration `/admin/suivi` fonctionne. La rubrique « Mes rendez-vous » est masquée aux élèves. Les liens de réservation envoyés par l'administration fonctionnent. | Les élèves voient « Mes rendez-vous » dans leur espace. |

Pour mettre un module en service, un développeur passe à `true` la constante
correspondante dans `src/lib/modules-flags.ts` (`ARENA_PUBLIC_ENABLED`,
`SUIVI_STUDENT_ENABLED`) et déploie. Rien d'autre à faire : ni migration, ni réglage.

Pour tester en mode test, connectez-vous à l'administration **dans le même navigateur**,
puis ouvrez les pages publiques : elles s'affichent pour vous seul.

Un **tournoi de démonstration** est prêt : « EVC Arena Médecine interne — Démo »
(`/admin/arena`, landing `/arena/demo-medecine-interne`), 36 questions de médecine
interne, manche 1 ouverte 7 jours, manches 2 et 3 programmées ensuite. Il se recrée à
l'identique avec `node scripts/arena-demo-seed.mjs`. La matrice de conformité section
par section est dans `docs/conformite-cahiers-des-charges.md`.

---

## 2. EVC Arena — tournoi de QCM

Menu : **Administration → Pédagogie → EVC Arena** (`/admin/arena`).

### 2.1 Principe

Un tournoi = une spécialité, trois manches (le nombre est libre), 12 questions en
12 minutes par manche, une seule tentative, classement cumulé. Les participants
s'inscrivent sur une page publique dédiée (`/arena/<url-du-tournoi>`), sans compte
Major ECN : leur identité est confirmée par un lien reçu par email, et ils se
reconnectent par un lien magique. Seul leur pseudonyme est public.

### 2.2 Créer un tournoi

1. Cliquez **Nouveau tournoi**, indiquez le titre, la spécialité, un libellé d'édition
   (« Édition 1 ») et, si vous le souhaitez, l'URL (slug). Trois manches vides sont
   créées. Le tournoi est en **Brouillon** : invisible du public.
2. Onglet **Paramètres** :
   - identité et landing : titre, URL, spécialité, balise title et meta description
     (référencement), texte d'introduction, case « indexable » (à cocher uniquement à la
     mise en production) ;
   - règles : questions par manche, durée d'une manche, nombre de manches minimum au
     classement final (2 par défaut), seuil d'affichage du rang (50 % par défaut),
     nombre d'entrées des Meilleurs scores (10), publication ou non du classement
     public, durée de conservation des données (365 jours par défaut, puis
     anonymisation automatique) ;
   - séquence d'emails automatiques : chaque étape (J-7, J-1, ouverture, relance 3 h
     avant clôture, résultats) s'active ou se désactive. Avec des dates resserrées,
     désactivez le J-7. Le délai de publication des résultats après clôture est
     réglable (0 = à la clôture, 1440 = J+1).
3. Onglet **Manches** : pour chaque manche, thème, ouverture et clôture (saisies en
   heure de Paris, le bouton « +24 h » remplit la clôture), durée spécifique éventuelle,
   délai de publication, et contenu éditorial des corrections (introduction, encadré
   méthodologique, erreurs les plus fréquentes, références). Les dates sont libres et
   indépendantes : trois semaines ou huit jours, comme vous voulez.
4. Onglet **Questions** : trois façons d'alimenter une manche.
   - **Saisie** : type QRM / QRU / QRP, nombre attendu n (QRP), pondération,
     vignette, énoncé, images (URL), propositions A à K avec case « exacte » et
     marquages facultatifs **indispensable** / **inacceptable** (§6.9), justification par
     proposition, puis corrections (explication détaillée, pièges, erreurs fréquentes,
     références).
   - **Import CSV ou tableur** : téléchargez le modèle vierge depuis le panneau
     d'import. Colonnes : `type`, `n`, `ponderation`, `vignette`, `enonce`, `A` … `K`,
     `reponses` (ex. « A, C, D »), `indispensables`, `inacceptables`,
     `justification_A` …, `explication`, `pieges`, `erreurs`, `references`. Les lignes
     invalides sont rejetées avec leur motif, les autres importées.
   - **Pioche dans la banque** : copie figée de QCM de la plateforme (les QROC sont
     exclues). Le type est déduit (QRU si une seule proposition exacte, sinon QRM) ;
     complétez ensuite les corrections et, si besoin, requalifiez en QRP.
   Une question peut être modifiée ou réordonnée tant que la manche n'a pas de
   participant. Ensuite, seule la **neutralisation** reste possible (voir 2.6).
5. Onglet **Barèmes** : pour chaque type de question, un menu déroulant : **Barème
   CNG** (préréglé, §6.4), **Tout ou rien**, **Grille personnalisée**, ou un modèle
   enregistré. La grille personnalisée expose les points par nombre de discordances
   (QRM), la correction binaire (QRU) et une grille indexée par n (QRP) avec la
   politique en cas d'erreur. La **prévisualisation** (§6.8) affiche le score que le
   moteur attribuerait à une combinaison de réponses fictive. Une grille peut être
   **enregistrée comme modèle** réutilisable dans d'autres tournois.
   Le barème d'une manche est **verrouillé à son ouverture**. Le modifier après coup
   est possible en bas de l'onglet, avec un motif obligatoire : la modification est
   tracée et tous les scores sont recalculés.

### 2.3 Vérifier avant publication

- Onglet **Paramètres**, bloc « Contrôle d'intégrité » : dates des manches, nombre de
  questions attendu par manche, validité de chaque question. Le passage en
  **Programmé** est bloqué tant que tout n'est pas au vert.
- **Prévisualiser en candidat** (onglet Manches, bouton par manche) : vous jouez la
  manche exactement comme un candidat, avec un bandeau « Mode prévisualisation —
  aucun score n'est enregistré ». Rejouable à volonté, à tout statut, même en
  brouillon. Aucun email, aucune statistique.

### 2.4 Cycle de vie (§15.1)

| Statut | Comment on y arrive | Visible du public |
|---|---|---|
| Brouillon | à la création | non |
| Programmé | bouton « Passer en Programmé » (intégrité au vert) | non |
| Inscriptions ouvertes | bouton « Ouvrir les inscriptions », confirmé | oui |
| Manche ouverte / Manche clôturée / Tournoi terminé | automatique, selon les dates | oui |
| Archivé | bouton « Archiver » | non |

Une fois les inscriptions ouvertes, les dates ne se modifient plus qu'en cochant
explicitement « Forcer » : la modification est tracée et les inscrits sont informés par
email.

### 2.5 Pendant le tournoi

- **Ouverture et clôture** des manches, verrouillage du barème, publication des
  résultats et emails programmés sont assurés automatiquement toutes les cinq minutes.
- Onglet **Participants** : liste avec état (confirmé ou non), source d'acquisition,
  score par manche, cumul, rang. Actions : renvoyer l'email de confirmation, bloquer un
  participant (exclusion §10), supprimer ses données, réinitialiser une tentative en
  cas d'incident avéré (motif obligatoire, tracé). Deux exports CSV : tous les
  participants, ou uniquement ceux ayant coché la case « informations Major ECN »
  (seuls ceux-là sont exploitables en prospection, §3.1).
- Onglet **Suivi** : entonnoir (inscrits, confirmés, joué par manche, complétion,
  rétention M1→M2, M2→M3, M1→M3), sources d'acquisition.
- Onglet **Emails** : déclenchement manuel de n'importe quelle étape pour une manche
  (un participant déjà servi n'est jamais re-sollicité) et journal de tous les envois.

### 2.6 Signalements et neutralisation (§10)

Les participants signalent une question depuis les corrections, jamais pendant la
manche. Onglet **Signalements** : les signalements sont triés par nombre par question.
- **Valider (neutraliser)** : la question est retirée du barème, tous les scores et le
  droit au rang sont recalculés, tous les participants de la manche sont informés par
  email, le signaleur reçoit votre réponse.
- **Écarter** : réponse individuelle au participant.
La neutralisation est aussi possible directement depuis l'onglet Questions (icône
« interdit ») ; elle se rétablit avec l'icône « rétablir ».

### 2.7 Après chaque manche

- Les corrections sont consultables en ligne par chaque participant (même s'il n'a pas
  joué la manche) : réponses attendues, explications, pièges, erreurs fréquentes,
  encadré méthodo, références.
- Onglet **PDF corrections** : **Générer depuis le contenu** (PDF produit par la
  plateforme) ou **Téléverser un PDF fourni** par Major ECN. Le PDF est joint par lien
  dans l'email de résultats.
- Après la dernière manche uniquement, la mention commerciale « Vous souhaitez
  poursuivre votre préparation ? » apparaît.

### 2.8 Dupliquer un tournoi (§15.3)

Depuis la liste, icône « dupliquer » : tout le paramétrage est repris (règles,
barèmes, séquence d'emails, durées, fenêtres, Meilleurs scores), rien des inscrits, des
réponses, des scores, des dates ni des questions. Le nouveau tournoi démarre en
brouillon avec sa propre URL. Parcours cible : dupliquer → spécialité → trois dates →
importer les questions → publier.

### 2.9 Ce que voit un participant

Landing sur le modèle de page principale fourni par le client (07/09/2026) : hero sur
le visuel de l'arène médicale avec le casque et le wordmark EVC ARENA / BY MAJOR ECN,
« Le tournoi de QCM des EVC », carte de la manche en cours (thème, date, compte à
rebours, bouton), puis les trois étapes 01 · 02 · 03 (section claire), les manches du
tournoi avec les Meilleurs scores, les corrections détaillées, le barème et le
règlement. Le score cumulé est rappelé dans le hero et le règlement. L'ancienne
maquette `/arena-preview` redirige vers la landing de démo. Ensuite : inscription (prénom, nom, email, spécialité, pseudonyme,
avatar, deux cases de consentement distinctes jamais pré-cochées), confirmation par
email, espace personnel (manches, scores, rang si le seuil est atteint, corrections,
invitation d'un collègue par WhatsApp, Messenger, email ou lien, préférences, suppression
du compte), manche (écran d'accueil avec barème et avertissements, une question par
écran, chronomètre, validation irréversible, écran de fin), Meilleurs scores, règles.

Règles imposées par le cahier des charges et respectées partout : jamais d'effectif
affiché, jamais de « Top 10 », aucun rang sous le seuil (message neutre), une seule
tentative par manche, chronomètre côté serveur qui continue en cas de déconnexion,
durée réduite au temps restant en cas d'entrée tardive (§2.4).

---


### 2.10 Identité visuelle (maquettes du 01/09/2026)

Les trois planches déposées dans `templates/evc arena/` (parcours complet, cahier
des charges illustré, visuels et expérience) ont été reprises écran par écran :

| Maquette | Écran de la plateforme |
|---|---|
| 1. Inscription | `/arena/<slug>/inscription` — carte centrée, logo, accroche « Relevez le défi. Mesurez-vous aux meilleurs. », six avatars au choix, deux consentements, « Je m'inscris », « Déjà inscrit ? Se connecter », mention « aucun numéro de téléphone » |
| 2. Modération pseudonyme | Vérification en direct dans le formulaire : croix rouge « mot ou format non autorisé », coche verte « pseudonyme disponible », rappel des quatre règles |
| 3. Accueil avant la manche | `/arena/<slug>/manche/<n>` — Manche n / N, thème, ouverture et fermeture, « Règles de la manche », barème, avertissement rouge, encadré connexion ambre, « Commencer la manche » |
| 4. Pendant la manche | Anneau de temps, question n / N et progression, énoncé, type de réponse en rouge, propositions cochées en vert, « Valider & suivante » |
| 5 et 6. Fin de manche | Score de la manche en grand (rouge sous 50 %, vert au-dessus), score cumulé, rang en vert si le seuil est atteint, prochaine manche, « Voir mon récap » |
| 7 et 8. Classements | `/arena/<slug>/classement` et écran de stade de la landing — rang, pseudonyme, score cumulé sur le maximum, ligne du participant surlignée ; **sans médaille ni trophée** (§13 du cahier des charges prime sur la maquette) |
| 9 et 10. Emails | En-tête EVC ARENA · Major ECN, bouton rouge ; contenus inchangés |
| 11. Reprise après fermeture | Écran « Reprise de votre partie en cours » avec temps restant et question courante, « Reprendre la partie » |
| 12. Temps écoulé | Écran « Temps écoulé ! », « Voir mon résultat » |
| 13. Coupure internet | Voile « Connexion perdue » avec chronomètre visible, « Réessayer » |
| 14. Invitation | Lien personnalisé avec copie, partage WhatsApp, Telegram, Email, Messenger, Lien (la limite « 2 amis par mois » de la maquette n'est pas dans le cahier des charges et n'est pas appliquée) |
| 15. Administration | Bloc « Tableau de bord » sombre en tête de chaque tournoi : inscriptions, participants par manche et taux, courbe des inscriptions, rétention, top 5 cumul |
| Style visuel | Fond `#0B0F14`, surfaces `#1A1F26`, rouge Major ECN `#E4002B`, titres Oswald / Bebas Neue, texte Inter ; barre d'onglets mobile Accueil · Classement · Profil · Aide pour les participants |

Photos de stade (Unsplash, licence libre) dans `public/arena/`, crédits dans
`public/arena/CREDITS.md`. Le logo casque est le visuel fourni par le client, détouré en PNG transparent (`public/arena/helmet.png`, composants dans `src/components/arena/arena-logo.tsx`) ; le hero utilise le visuel client `public/arena/hero-arena.jpg`.
Écarts volontaires avec les maquettes, imposés par le cahier des charges : aucun
trophée, médaille ni badge (§13), aucune mention « top 5 % » (§7), aucun effectif.

## 3. Suivi pédagogique individuel

Menu : **Administration → Suivi & analyse → Suivi individuel** (`/admin/suivi`).

### 3.1 Rôles (§18)

| Rôle | Qui | Droits |
|---|---|---|
| Administrateur | comptes admin de la plateforme | tout, y compris réglages et attribution des rôles |
| Responsable pédagogique | professeur désigné dans Réglages | tout sauf réglages |
| Intervenant | professeur désigné | agenda, ses rendez-vous, fiches (sans notes internes), comptes rendus et actions sur ses rendez-vous |
| Lecture seule | professeur désigné | consultation, sans notes internes |

Un professeur sans rôle ne voit pas le module.

### 3.2 Réglages (onglet Réglages)

Durée par défaut des créneaux (10 min), temps tampon, délai de rappel (48 h, 24 h, 2 h
ou personnalisé), durée de conservation, email destinataire des alertes, politique de
suppression d'un compte (suppression ou anonymisation), couleur par spécialité pour
l'agenda, attribution des rôles, et la **bibliothèque d'emails** : sept modèles
(annonce d'un planning, invitation à choisir un créneau, relance sans réservation,
rappel avant rendez-vous, absence / injoignable, après entretien, message lié à une
action), modifiables, avec les variables `{{prenom}}`, `{{specialite}}`, `{{date}}`,
`{{heure}}`, `{{lien}}`. Chaque envoi peut encore être modifié avant de partir et est
tracé dans l'historique du candidat.

### 3.3 Campagne (onglet Campagnes)

1. **Nouvelle campagne** : nom, description interne, ciblage combinable (spécialités,
   formules Essentielle / Intensive / Approfondie, voie interne / externe, session EVC),
   sélection (tous, déjà suivis, jamais suivis, manuelle), période, durée des créneaux.
   Le nombre de candidats ciblés s'affiche en direct.
   Attention : un ciblage par spécialité vise **tous** les élèves concernés. En phase de
   test, utilisez la sélection manuelle.
2. **Créneaux** : indiquez une plage (du… au…, heures de début et de fin, jours de la
   semaine, durée, tampon, capacité, collaborateur), le nombre de créneaux se calcule,
   puis **Générer**. Vous pouvez exclure des jours, bloquer ou supprimer des créneaux
   individuellement. Un créneau complet n'est plus proposé. Capacité > 1 uniquement si
   plusieurs collaborateurs assurent les appels.
3. **Activer** la campagne.
4. **Annoncer le planning** (email d'annonce, sans lien de réservation) ou **Envoyer
   les invitations** (email avec lien sécurisé personnel, valable 30 jours). Vous
   pouvez préparer des créneaux sans les annoncer, ou plusieurs mois à l'avance.
5. Tableau des membres avec statut (ciblé, invité, réservé, réalisé, absent, à
   rappeler…) et actions : relancer un candidat ou un groupe, retirer, marquer absent.
   Les invités sans réservation sont relancés automatiquement (au plus deux fois, à
   trois jours d'intervalle, tant que des créneaux restent).

### 3.4 Agenda (onglet Agenda, §5)

Vue semaine et vue mois de tous les rendez-vous, couleur par spécialité, filtres
(spécialité, formule, voie, campagne, statut). Compteurs par journée et par semaine :
« Cette semaine : 34 rendez-vous — 21 réalisés — 9 à venir — 2 absents — 2 à rappeler —
durée estimée ». Un clic sur un rendez-vous ouvre la fiche du candidat.

### 3.5 Candidats et fiche (onglets Candidats, §10 à §13)

Vue globale avec les dix filtres du cahier des charges (tous, déjà contactés, jamais
contactés, réalisés, programmés, absents / injoignables, sans réservation, à relancer,
prochain rendez-vous programmé, aucun prochain rendez-vous), recherche par nom ou
email, exports.

La fiche présente : identité, spécialité, formule, voie, dernière connexion, activité
sur la plateforme (vidéos, fiches, QCM, flashcards, épreuves blanches), puis :
- **À voir au prochain entretien** : actions non clôturées et derniers constats,
  présentés ensemble lorsqu'ils sont liés ;
- **Rendez-vous** : statut (planifié, réalisé, absent / injoignable, annulé, à
  rappeler, reporté), déplacement, email d'absence, **Programmer le prochain
  rendez-vous** (§8 : le créneau est réservé immédiatement avec le candidat) ;
- **Nouveau compte rendu** : rattaché ou non à un rendez-vous, type de contact,
  synthèse, notes internes (rôles habilités), difficultés (onze catégories, précisions,
  case « constat sans action »), actions (dix catégories, commentaire, responsable,
  échéance, statut À faire / En cours / Réalisée / Non applicable, rattachement facultatif
  à une difficulté) ;
- **Historique** chronologique : rendez-vous, comptes rendus, invitations, relances,
  déplacements, tentatives de contact, anciennes notes du CRM.

### 3.6 Alertes (onglet Alertes, §4)

Programmez une alerte à une date, une semaine, X jours avant une échéance ou à une date
personnalisée, éventuellement liée à une campagne et à un responsable. Elle reste
affichée jusqu'à traitement, report ou clôture, et déclenche un email au responsable
(ou à l'adresse des réglages). Actions rapides : créer la campagne, ouvrir les créneaux,
reporter, marquer comme traité.

### 3.7 Exports (§17)

Depuis la vue Candidats : CSV global (filtres respectés), PDF individuel depuis la
fiche, PDF de plusieurs candidats depuis une sélection ou la liste filtrée.

### 3.8 Côté élève

- Lien de réservation reçu par email : page sans connexion, uniquement les créneaux
  disponibles, jamais l'identité d'un autre candidat, confirmation immédiate,
  déplacement possible depuis le même lien.
- Espace personnel, rubrique **Mes rendez-vous** (après mise en service) : rendez-vous à
  venir et passés, bouton Déplacer.
- Emails : confirmation à la réservation et au déplacement, rappel la veille (délai
  réglable) avec bouton de déplacement.

---

## 4. Fonctionnement technique

- **Emails** : envoyés par Resend (`RESEND_API_KEY`, `EMAIL_FROM` sur Vercel). Sans
  clé, chaque envoi est tracé avec une erreur explicite, rien n'est perdu côté données.
- **Crons** (`vercel.json`, authentifiés par `CRON_SECRET`) :
  `/api/cron/arena-sweep` toutes les 5 minutes (clôture des tentatives, verrouillage
  des barèmes, publication des résultats, emails, anonymisation après la durée de
  conservation) ; `/api/cron/suivi-sweep` toutes les 15 minutes (rappels, emails
  d'alertes, relances automatiques, purge).
- **Base** : tables `arena_*` et `suivi_*`, migrations
  `supabase/migrations/20260906120000_arena.sql` et `20260906130000_suivi.sql`,
  appliquées sur le projet Supabase le 7 septembre 2026. Fichier consolidé
  `supabase/APPLIQUER_ARENA_SUIVI.sql`, sonde `node tmp/_probe-arena-suivi.mjs`.
- **Journal** : chaque tournoi a un onglet Journal (transitions, barèmes, neutralisations,
  envois) ; les actions importantes alimentent aussi le journal d'activité admin.
- **Pièces du code** : `src/lib/arena/*`, `src/app/(arena)/arena/*`,
  `src/app/admin/arena/*`, `src/lib/suivi/*`, `src/app/admin/suivi/*`,
  `src/app/(booking)/reservation/*`, `src/app/(student)/mes-rendez-vous/*`.
  Document de pilotage : `docs/chantier-arena-et-suivi.md`.

---

## 5. Limites connues et points à arbitrer

1. **PDF de corrections** : la génération utilise Chromium sur Vercel ; elle n'a pas pu
   être testée sur le poste de développement (Windows). Le téléversement d'un PDF
   fourni fonctionne dans tous les cas.
2. **Taux d'ouverture et de clic des emails** (§4) : non disponibles sans webhook
   Resend ; tous les autres indicateurs le sont.
3. **Suppression d'un compte élève** côté suivi : les comptes rendus et rendez-vous
   sont supprimés en cascade ; seule une trace statistique anonyme est conservée. Une
   anonymisation ligne à ligne demanderait une évolution du schéma.
4. **Arbitrages du client** : PDF fourni ou généré (les deux sont possibles), durée de
   conservation (365 jours par défaut, réglable par tournoi), valeur du QRP en cas
   d'erreur (« toute erreur annule », modifiable par grille personnalisée), politique de
   suppression (anonymisation par défaut).
5. **Test de charge** (§16, 200 participants simultanés) : à réaliser sur
   l'environnement Vercel avant la première édition.
