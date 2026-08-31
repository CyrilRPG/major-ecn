# Page hub « Guide EVC » (/guide-evc)

> Page de référence permanente qui présente tout le sujet des EVC et renvoie
> vers l'ensemble des articles du blog — chaque article renvoyant en retour
> vers elle. Mise en œuvre du cahier des charges « Page hub Guide EVC ».

## 1. L'URL

`https://www.major-ecn.fr/guide-evc`

- **À la racine**, pas dans `/blog` : ce n'est pas un article mais une page de référence.
- **Aucune date, aucune année dans l'URL** : la page est mise à jour, jamais remplacée.
- **URL définitive.** La changer imposerait une redirection permanente : ne pas y toucher.

## 2. Où vit le code

| Rôle | Fichier |
|---|---|
| Structure éditoriale (sections, textes rédigés, FAQ, répartition) | `src/lib/data/guide-evc.ts` |
| Fusion articles statiques + articles créés en administration | `src/lib/data/guide-evc-sections.ts` |
| Rendu de la page | `src/components/marketing/guide-evc/guide-evc-hub.tsx` |
| Route, métadonnées, JSON-LD | `src/app/(marketing)/guide-evc/page.tsx` |
| Maillage retour (fil d'Ariane + encart de fin d'article) | `src/components/marketing/blog/guide-evc-links.tsx` |
| Garde-fou « aucun article orphelin » | `tests/guide-evc.test.ts` |

## 3. Procédure de mise à jour — automatique

**Un nouvel article publié apparaît dans le hub sans intervention.** La page est
régénérée toutes les 10 minutes (`revalidate = 600`) et répartit *tous* les
articles publiés — statiques (`blog-articles.ts`) comme créés depuis
`/admin/blog` (CMS et import IA) — selon cette cascade :

1. **Dérogation explicite par slug** — `SECTION_BY_SLUG` dans `guide-evc.ts` ;
2. **Monographie de spécialité** — slug de la forme `evc-<spécialité>-<année>`
   (par exemple `evc-geriatrie-2026`) → section « Par spécialité » ;
3. **Catégorie de l'article** — `SECTION_BY_CATEGORY`.

Il n'existe donc **aucun article orphelin possible** : à défaut de règle plus
précise, un article rejoint la section de sa catégorie.

**Quand intervenir à la main ?** Uniquement si un article tombe dans une section
qui ne lui correspond pas (sa catégorie de blog ne reflète pas l'étape du
parcours qu'il traite). Ajouter alors une ligne dans `SECTION_BY_SLUG` :

```ts
export const SECTION_BY_SLUG: Record<string, GuideSectionId> = {
  // …
  'mon-nouvel-article': 'se-preparer',
};
```

Vérifier ensuite :

```bash
npx tsx --test tests/guide-evc.test.ts
```

## 4. Maillage retour depuis les articles

Deux emplacements, cumulés, appliqués à **tous** les articles :

- **Fil d'Ariane** — `Accueil › Guide EVC › [catégorie] › [titre]`, rendu par
  `GuideEvcBreadcrumb`. Il est posé dans `ArticleHeader` (gabarit commun) et
  directement dans les cinq articles qui ont leur propre en-tête
  (`article-7-erreurs-evc`, `article-conseils-laureats`, `article-echec-evc`,
  `article-mental-evc`, `article-organiser-revisions-evc`).
- **Encart de fin d'article** — `ArticleGuideFooter`, rendu une seule fois
  depuis `src/app/(marketing)/blog/[slug]/page.tsx`, donc valable pour les
  articles statiques comme pour ceux créés en administration. Il contient aussi
  « À lire aussi dans le guide » : 4 liens internes à ancres descriptives.

Le schéma `BreadcrumbList` de chaque article reflète ce fil d'Ariane.

Si un nouveau gabarit d'article est créé un jour sans passer par
`ArticleHeader`, y ajouter `GuideEvcBreadcrumb` — l'encart de fin, lui, reste
automatique.

## 5. Éléments techniques

- **Title** : `Guide complet des EVC 2026 pour médecins étrangers | Major ECN`
  (déclaré en `absolute`, le gabarit du site ajoutant sinon « · Major ECN »).
- **Meta description** : ~158 caractères.
- **Un seul `<h1>`**, sections en `<h2>`, questions fréquentes en `<h3>`.
- **JSON-LD** : `BreadcrumbList` + `FAQPage` (les questions affichées et le
  schéma proviennent de la même source, `GUIDE_EVC_FAQ`).
- **Sitemap** : `/guide-evc`, priorité `0.95`, `changefreq` hebdomadaire.
- **Performance** : une seule image sur la page (bannière, `next/image`,
  `priority`) ; les articles sont présentés par icône de catégorie, sans
  vignette — la page reste légère malgré sa longueur.

## 6. Reste à faire hors code

- Soumettre `https://www.major-ecn.fr/guide-evc` dans la Search Console et
  demander l'indexation (après déploiement).
- Vérifier la page dans le test des résultats enrichis de Google
  (BreadcrumbList + FAQPage).
