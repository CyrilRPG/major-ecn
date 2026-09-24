# Annonces de l’accueil (onglet « Annonces »)

Refonte du 24/09/2026. Avant, chaque information était un bloc, et il fallait
un bloc par spécialité : compte à rebours MG, calendrier MG, postes MG, puis la
même chose pour chaque spécialité, plus une carte MG écrite en dur. Une élève
de médecine générale voyait huit blocs, dont trois « J−113 ».

Il n’y a plus que deux choses à gérer.

## 1. Les fiches concours (une par spécialité)

La mise en forme est commune à toutes les spécialités et automatique. Pour
chaque spécialité, on saisit seulement ce qui change :

- **la date de l’épreuve écrite**, qui alimente le compte à rebours J−X ;
- **les inscriptions**, avec l’ouverture et la clôture en heure de Paris. L’élève
  voit « Ouverture le… », puis « Ouvertes jusqu’au… » (et « plus que N jours »
  pendant la dernière semaine). Une fois les inscriptions closes, il ne voit plus
  rien ;
- **les postes**, par voie. La voie de l’élève est mise en évidence ;
- **le calendrier** (résultats, oral, choix de poste…). Les dates passées
  disparaissent d’elles-mêmes ;
- éventuellement **un bouton** (par ex. « Accéder à mon espace CNG ») et **une note**.

Pour ne pas saisir cinquante fois la même chose :

- **Nouvelle fiche** : on coche toutes les spécialités qui partagent ces
  informations, et une fiche est créée pour chacune ;
- **Appliquer aussi à d’autres spécialités** (dans une fiche ouverte) : on
  recopie seulement les rubriques cochées (date, inscriptions, calendrier…) vers
  les spécialités choisies. Le reste de leur fiche, comme leurs postes, est
  conservé.

Côté élève :

- l’élève voit **une seule carte** par spécialité, qui regroupe tout ;
- un sous-collège (par ex. Ophtalmologie MG) prend la fiche de son collège
  parent ;
- un élève Gériatrie ne voit pas la fiche MG de son bonus pédagogique ;
- au-delà de deux spécialités (accès intégral), une carte compacte
  **« Vos épreuves »** remplace les cartes ;
- la page d’une spécialité (bandeau J−X) lit la même fiche.

**Retirer** une fiche fait disparaître toute information de cette spécialité,
y compris celle des anciens blocs.

Stockage : table `homepage_generic_data`, `section_key = 'concours'`, une ligne
par collège. Le code est dans `src/lib/annonces/concours.ts` (logique pure,
testée par `tests/annonces-concours.test.ts`) et `src/lib/annonces/server.ts`
(lecture).

## 2. Les messages

Les messages servent aux informations ponctuelles : lien CNG, rappel,
nouveauté… Chaque message a un titre, un texte, un bouton facultatif, un
encadré facultatif, une icône et une couleur. Son audience se règle en clair :

- **Tous les élèves**, **Certaines spécialités** (cocher au moins une
  spécialité ; une spécialité parente vise aussi ses sous-collèges), ou
  **Accès intégral seulement** ;
- la **voie** (externe / interne) ;
- la **formule minimale** ;
- une **date de fin d’affichage**, facultative. Après cette date, le message
  disparaît tout seul.

Sous chaque message, la liste résume en une ligne qui le voit.

## Aperçu élève

La colonne de droite montre exactement l’accueil d’un élève fictif
(spécialité, voie, formule). C’est le moyen de vérifier qu’il n’y a ni
doublon ni bloc inutile.

## Anciens blocs

Les anciens comptes à rebours, calendriers et statistiques ne s’affichent plus
séparément : ce sont eux qui créaient les doublons. Ceux qui visaient une
spécialité alimentent sa fiche (badge « reprise des anciens blocs ») tant
qu’ils ne sont pas convertis.

Le bouton **Convertir en fiches et nettoyer** enregistre ces fiches, puis
supprime les anciennes lignes. Les anciens blocs qui visaient tout le monde
restent listés, pour être supprimés à la main.

La carte « Médecine générale — EVC 2026 », qui était écrite en dur, est
devenue la fiche MG par défaut : épreuve le 15/01/2027, inscriptions du
17/06/2026 14 h au 16/07/2026 17 h, 35 postes en voie externe et 89 en voie
interne. Elle s’applique tant qu’aucune fiche MG n’a été enregistrée ou
retirée.
