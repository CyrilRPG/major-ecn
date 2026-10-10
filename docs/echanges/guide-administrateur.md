# Échanges des promotions — guide administrateur

Les Échanges sont la messagerie collective d'une promotion. Les candidats y écrivent avec leurs enseignants. Le back-office se trouve dans **Administration → Communication → Échanges des promotions** (`/admin/echanges`).

## Qui voit quoi (niveaux)

Le niveau détermine les onglets visibles dans le back-office.

| Niveau | Qui | Peut |
|---|---|---|
| **Super Admin** | Tout compte administrateur | Tout. Réservé à ce niveau : paramètres, mode du module, restauration des messages supprimés, RGPD (export, effacement), conservation légale, journal d'audit, équipe de modération. |
| **Administrateur pédagogique** | Membre de l'équipe désigné dans *Paramètres → Équipe de modération* | Promotions, enseignants, modération, sanctions (suspension comprise), messages supprimés en lecture, statistiques et export, bibliothèque |
| **Modérateur** | Membre de l'équipe désigné, éventuellement limité à certaines promotions | Lecture, modération (valider, refuser, supprimer), signalements, avertissement et lecture seule. Suspension seulement si l'option est accordée. |

## Mise en service

1. **Mode du module** (*Paramètres*). C'est le point de départ.
   - *Désactivé* : Super Admin seulement.
   - *Interne* : l'équipe, les enseignants affectés et les comptes testeurs. C'est le mode actuel.
   - *Actif* : les candidats de chaque promotion.
   Passer en *Actif* demande une confirmation.
2. **Créer une promotion** (*Promotions → Nouvelle promotion*).
   - Renseigner le nom, l'année et la spécialité.
   - Choisir les participants :
     - *critères* : formules, voies, spécialités, inscription active ;
     - *manuel* ;
     - *mixte*.
   - Régler les options de la promotion : modération préalable, accès à la bibliothèque, message d'accueil, dates d'ouverture, de clôture et d'archivage.
   - La promotion est créée en **brouillon** : elle n'est visible de personne.
3. **Enseignants.** Dans la fiche de la promotion, onglet *Enseignants* :
   - renseigner d'abord l'**identité publique** de chaque enseignant (prénom public et qualité). Le nom de famille n'apparaît jamais.
   - l'affecter ensuite, avec les droits « publier » et « épingler » ;
   - si besoin, choisir l'adresse de notification et faire annoncer son arrivée.
4. **Activer.** À l'activation, les participants sont synchronisés automatiquement et un message système ouvre l'espace.

## Cycle de vie d'une promotion

`brouillon → active → clôturée → (réouverte) → archivée`

| Action | Effet |
|---|---|
| **Désactiver** | Masque la promotion sans rien supprimer. |
| **Clôturer** | Fige les publications. La consultation reste possible. |
| **Archiver** | Propose de verser les réponses épinglées dans la **bibliothèque** : toutes, une sélection ou aucune. Une alerte part quelques jours avant l'archivage prévu. |
| **Dupliquer** | Copie uniquement la configuration (jamais les candidats, messages ni sanctions). Les enseignants sont proposés, pas réaffectés. |
| **Conservation légale** (Super Admin) | En cas de litige, bloque la purge et l'effacement RGPD des messages de la promotion. |

## Participants

- **Modifier les critères.** Un **aperçu** liste, avant toute application, les candidats qui seraient ajoutés ou retirés, ainsi que les exceptions manuelles.
- **Synchroniser maintenant** recalcule la liste depuis les inscriptions. La synchronisation se fait aussi automatiquement chaque jour.
- **Exceptions.** Un ajout manuel, un retrait ou une **exclusion forcée** n'est jamais défait par la synchronisation automatique.

## Modération (*Modération*)

| Onglet | Contenu |
|---|---|
| **File de validation** | Messages en attente (promotions en modération préalable ou contenus suspects). *Valider* les publie ; *Refuser* prévient l'auteur, avec un motif facultatif. |
| **Signalements** | Traités, classés sans suite ou à réexaminer. Raccourci vers une mesure envers l'auteur. |
| **Tentatives bloquées** | Coordonnées personnelles ou liens non reconnus repérés automatiquement. *Publier quand même* corrige un faux positif. |
| **Mesures en cours** | Avertissement, lecture seule, restriction de tag, suspension, exclusion des échanges. Elles se lèvent ou se réintègrent ici. Une mesure ne touche jamais aux cours, fiches, QCM ni replays du candidat. |
| **RGPD** (Super Admin) | Export JSON des données d'un candidat. Effacement définitif après confirmation « EFFACER » ; les promotions sous conservation légale sont exceptées. |

Les **messages supprimés** restent restaurables par le Super Admin jusqu'à leur purge, dont le délai est réglable dans *Paramètres*.

## Réactivité des enseignants (*Statistiques*)

- **Délai mesuré.** C'est toujours « première réponse valide − question taguée ». Le même calcul sert partout : écran, tableau de bord, export.
- **Seuil de relance.** Un enseignant est relancé automatiquement passé le seuil (*Paramètres → Relances*), et peut l'être une seconde fois si l'escalade est activée.
- **Filtres.** Par promotion, spécialité, enseignant, période et état.
- **Export.** CSV ou Excel. Chaque export est inscrit au journal d'audit.

## Bibliothèque pédagogique

- **Nature.** Ce sont des réponses permanentes, indépendantes des promotions. La question est anonymisée par défaut.
- **Mise à jour.** Une réponse se corrige quand une recommandation évolue. « Revalider aujourd'hui » met à jour la date affichée aux candidats.
- **Alimentation.** Les ressources viennent de l'archivage d'une promotion, du menu d'un message épinglé, ou d'une création manuelle.

## Journal d'audit

- **Contenu.** Toute action sensible est tracée, en ajout seul : création ou modification de promotion, critères, participants, enseignants, suppressions et restaurations, sanctions, paramètres, exports, RGPD.
- **Journal technique.** Il présente les e-mails, les crons et les erreurs, et indique l'état des tâches automatiques.

## Tâches automatiques (cron)

- **`/api/cron/echanges`, toutes les 5 minutes :**
  - relances et escalades des questions ;
  - file d'e-mails ;
  - échéances de clôture et d'archivage ;
  - synchronisation des participants ;
  - purge selon les durées de conservation.
- **`/api/cron/notifications`, toutes les 5 minutes :** centre de notifications (nouveaux contenus, rappels de séances, récapitulatifs e-mail).
