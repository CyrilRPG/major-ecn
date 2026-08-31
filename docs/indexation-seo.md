# Indexation du site (Search Console)

> Diagnostic du 31 août 2026 et corrections appliquées. À relire avant toute
> modification du `robots.txt`, du plan de site ou du garde d'authentification :
> trois des sept problèmes trouvés venaient de ces fichiers.

## 1. État constaté

Rapport « Pourquoi des pages ne sont pas indexées » :

| Motif | Pages | Nature |
|---|---:|---|
| Introuvable (404) | 37 | anciennes adresses encore explorées |
| Page avec redirection | 21 | domaine nu vers `www`, redirections 301 en place |
| Autre page avec balise canonique correcte | 7 | `/blog?cat=…`, canonique vers `/blog` : normal |
| Bloquée par le fichier robots.txt | 1 | `/login`, bloqué au crawl |
| Bloquée, autre problème 4xx | 1 | à identifier avec l'export |
| Détectée, actuellement non indexée | 34 | budget d'exploration |
| Explorée, actuellement non indexée | 28 | pages jugées de faible valeur |

## 2. Ce qui a été corrigé

### `/profil-evc` était inaccessible (deux causes cumulées)

Le diagnostic gratuit, mis en avant dans le menu, le lanceur flottant et le
popup, redirigeait **tous** les visiteurs non connectés vers `/login`, et son
exploration était en plus interdite aux robots.

- `src/lib/supabase/middleware.ts` : la liste des routes protégées testait
  `path.startsWith('/profil')`, ce qui capturait `/profil-evc`. Le test porte
  désormais sur `/profil` exactement et sur `/profil/`.
- `src/app/robots.ts` : `Disallow: /profil` interdisait de même `/profil-evc`
  (les règles sont des préfixes). Remplacé par `/profil$` et `/profil/`.

**Règle à retenir : dans ces deux fichiers, un chemin est un préfixe.** Avant
d'ajouter une entrée, vérifier qu'aucune route publique ne commence par elle.

### `/formules` renvoyait un 404

Il n'existe que `/formules/<offre>`. La page était pourtant liée depuis
`/contact`. Redirection permanente vers `/tarifs` (`next.config.ts`) et lien
corrigé.

### Le plan de site déclarait tout le site modifié en permanence

`sitemap.ts` est régénéré toutes les dix minutes et renvoyait
`lastModified: new Date()` pour chaque URL. Un `lastmod` qui bouge sans
changement de contenu détruit la valeur du signal et fait explorer en boucle
des pages inchangées, au détriment des nouvelles. La date est désormais fixe
(`VITRINE_LAST_MODIFIED`, à mettre à jour lors d'une vraie refonte) et vient de
`publishedAt` pour les articles.

### Pages manquantes au plan de site

`/guide-methodologie-evc-2026` et `/profil-evc` n'étaient atteignables que par
un menu déroulant ou un bouton (donc invisibles dans le HTML) et n'étaient
listées nulle part. Elles y figurent désormais.

### Pages de service : `noindex` plutôt que blocage

`/merci`, `/annule`, `/espace-decouverte/confirmation` et `/login` étaient
seulement bloquées dans `robots.txt`. Un robot qui n'a pas le droit de lire une
page ne voit jamais sa directive `noindex` et peut la garder dans l'index sans
description. Elles portent maintenant `robots: { index: false, follow: true }`
et sont redevenues explorables.

### Page 404 dédiée

`src/app/not-found.tsx` renvoie vers le guide EVC, le blog, la préparation et
le contact. Les anciennes adresses encore suivies ne finissent plus sur un
cul-de-sac.

### Maillage

- Page hub `/guide-evc` : voir [guide-evc-hub.md](./guide-evc-hub.md). Chaque
  article renvoie vers elle, elle renvoie vers chaque article.
- Pages de témoignages : elles n'avaient aucun lien sortant. Chacune renvoie
  désormais vers trois autres témoignages et vers le guide.

### Métadonnées

Titre de `/profil-evc` ramené sous 60 caractères, description de `/tarifs`
portée à 155 caractères.

## 3. Vérifications automatisées

Deux scripts d'audit (à exécuter depuis la racine du projet, sans rien
modifier sur le site) :

```bash
node scripts/seo/audit-index.mjs https://www.major-ecn.fr
```

Il explore le plan de site puis les liens internes, et signale : 404,
redirections, canoniques divergentes, `noindex`.

```bash
node scripts/seo/audit-meta.mjs https://www.major-ecn.fr
```

Il liste, pour chaque page publique, le statut, la longueur du titre et de la
description, le nombre de mots, la directive `robots` et la canonique.

### Les 37 adresses « Introuvable (404) »

Traitées à partir de l'export du 31/08/2026. Ce sont les URL de l'ancien site
WordPress, liées nulle part sur le site actuel mais toujours explorées et
suivies depuis l'extérieur. Chacune part désormais vers la page qui traite le
même sujet (`next.config.ts`) :

| Origine | Destination |
|---|---|
| anciens articles (documents à fournir, rémunération, structures d'accueil, impact des EVC, décryptage des défis, réforme ECN) | l'article correspondant du blog |
| `/concours-evc-pae`, `/concours-medecins-etrangers`, `/stagiaire-associe-…` | `/guide-evc` |
| `/formules-major-ecn-preparation-ecn/*`, `/formule-d3`, `/formule-d4`, `/d4-special-dernier-tour`, `/reduction-dimpot` | `/tarifs` |
| `/nous-contacter`, `/faq-major-ecn-preparation-ecn`, `/inscription-programme` | `/contact`, `/faq`, `/inscription` |
| `/qui-sommes-nous`, `/qui-sommes-nous-major-ecn`, `/enseignants-major-ecn` | `/methode` |
| `/category/*`, `/conseils` | `/blog` |
| `/megamenu/*` | `/` |

Deux adresses restent volontairement en 404 : `/20` (adresse parasite) et
`/wp-content/themes/histudy/*` (fichiers de l'ancien thème). Les rediriger
vers une page sans rapport produirait une erreur douce, ce que Google traite
plus mal qu'un 404 franc.

Vérification, qui suit les chaînes de redirection jusqu'à la page finale :

```bash
node scripts/seo/verifier-redirections.mjs https://www.major-ecn.fr
```

### Les 21 « Pages avec redirection »

Rien à corriger : l'export ne contient que des redirections voulues, le
domaine nu et `http` vers `https://www`, la normalisation du slash final, et
les anciennes adresses déjà traitées ci-dessus. Une seule y était encore en
impasse (`/decryptage-des-principaux-defis-…`), désormais redirigée.

## 4. Ce qui reste à faire côté Search Console

1. Demander la validation des corrections pour chaque motif traité.
2. Soumettre `https://www.major-ecn.fr/guide-evc` et demander son indexation.
3. Vérifier le guide dans le test des résultats enrichis (BreadcrumbList et
   FAQPage).
4. Réexporter les rapports dans quelques semaines : le nombre de 404 doit
   tendre vers les deux adresses laissées volontairement en erreur.
