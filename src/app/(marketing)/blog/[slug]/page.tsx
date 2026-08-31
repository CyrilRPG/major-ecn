import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getPublishedArticles, BLOG_CATEGORY_IMAGE, BLOG_CATEGORIES } from '@/lib/data/blog-articles';
import { getDbArticleBySlug, getDbPublishedArticles } from '@/lib/data/blog-db';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/components/seo/json-ld';
import { ArticleRemuneration } from '@/components/marketing/blog/articles/article-remuneration';
import { ArticleStructuresPcc } from '@/components/marketing/blog/articles/article-structures-pcc';
import { ArticleDefisEvc } from '@/components/marketing/blog/articles/article-defis-evc';
import { ArticleImpactEvc } from '@/components/marketing/blog/articles/article-impact-evc';
import { ArticleListeDocuments } from '@/components/marketing/blog/articles/article-liste-documents';
import { ArticleCommentSinscrire } from '@/components/marketing/blog/articles/article-comment-sinscrire';
import { ArticleConseilsLaureats } from '@/components/marketing/blog/articles/article-conseils-laureats';
import { ArticleRatioPostes } from '@/components/marketing/blog/articles/article-ratio-postes';
import { ArticleMipic } from '@/components/marketing/blog/articles/article-mipic';
import { ArticleChoixSpecialitePadhue } from '@/components/marketing/blog/articles/article-choix-specialite-padhue';
import { ArticleEchecEvc } from '@/components/marketing/blog/articles/article-echec-evc';
import { Article7ErreursEvc } from '@/components/marketing/blog/articles/article-7-erreurs-evc';
import { ArticleMentalEvc } from '@/components/marketing/blog/articles/article-mental-evc';
import { ArticleOrganiserRevisionsEvc } from '@/components/marketing/blog/articles/article-organiser-revisions-evc';
import { ArticleGeneric } from '@/components/marketing/blog/articles/article-generic';
import { ArticleRich } from '@/components/marketing/blog/articles/article-rich';
import { RICH_CONTENT } from '@/lib/data/blog-content';
import type { Block } from '@/lib/data/blog-content/types';
import { ArticleGuideFooter } from '@/components/marketing/blog/guide-evc-links';
import { GUIDE_EVC_LABEL, GUIDE_EVC_PATH } from '@/lib/data/guide-evc';

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug) ?? (await getDbArticleBySlug(slug))?.meta ?? null;
  if (!a) return { title: 'Article introuvable — Major ECN' };
  // Image de partage : bannière de l'article, à défaut l'illustration de sa
  // catégorie. Les articles créés en base portent une URL absolue (Supabase),
  // les articles statiques un chemin du site.
  const raw = a.image ?? BLOG_CATEGORY_IMAGE[a.category];
  const image = raw.startsWith('http') ? raw : `${SITE_URL}${raw}`;
  return {
    title: `${a.title} — Blog Major ECN`,
    description: a.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      type: 'article',
      url: `/blog/${slug}`,
      siteName: 'Major ECN',
      locale: 'fr_FR',
      images: [{ url: image, alt: a.title }],
      ...(a.publishedAt ? { publishedTime: a.publishedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: a.excerpt,
      images: [image],
    },
  };
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

// Revalidation courte : un article programmé (published_at futur) passe en ligne
// automatiquement dans les ~5 min suivant sa date, sans redéploiement.
export const revalidate = 300;

export function generateStaticParams() {
  return getPublishedArticles().map((a) => ({ slug: a.slug }));
}

/** Articles dont le corps se termine déjà par sa propre grille d’articles liés
 *  (« Vous aimerez aussi ») : l’encart de fin ne répète pas ces liens. */
const SLUGS_WITH_OWN_RELATED = new Set(['evc-pae-liste-documents-fournir']);

/**
 * Slugs d'articles cités par le corps d'un article à blocs : liens des blocs
 * « À lire aussi » et liens posés dans le texte. Sert à ne pas répéter un lien
 * déjà présent, et à ne pas dépasser les 3 à 5 liens sortants recommandés.
 */
function relatedSlugsIn(blocks: Block[] | undefined): string[] {
  if (!blocks) return [];
  const found = new Set<string>();
  for (const b of blocks) {
    if (b.t === 'related') {
      for (const it of b.items) {
        const m = /^\/blog\/([a-z0-9-]+)$/.exec(it.href);
        if (m) found.add(m[1]);
      }
      continue;
    }
    const html = b.t === 'p' || b.t === 'callout' ? b.html : '';
    for (const m of html.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)) found.add(m[1]);
  }
  return [...found];
}

function articleBody(slug: string, article: NonNullable<ReturnType<typeof getArticleBySlug>>) {
  switch (slug) {
    case 'remuneration-medecin-etranger-france':
      return <ArticleRemuneration article={article} />;
    case 'structures-accueil-laureats-pae':
      return <ArticleStructuresPcc article={article} />;
    case 'decryptage-defis-evc':
      return <ArticleDefisEvc article={article} />;
    case 'impact-evc-acces-soins':
      return <ArticleImpactEvc article={article} />;
    case 'evc-pae-liste-documents-fournir':
      return <ArticleListeDocuments article={article} />;
    case 'comment-se-presenter-aux-evc':
      return <ArticleCommentSinscrire article={article} />;
    case 'comment-reussir-les-evc-conseils-laureats':
      return <ArticleConseilsLaureats article={article} />;
    case 'evc-ratio-candidats-postes-choix-specialite-2026':
      return <ArticleRatioPostes article={article} />;
    case 'evc-medecine-interne-polyvalente-mipic-2026':
      return <ArticleMipic article={article} />;
    case 'psychiatrie-mip-medecine-generale-specialite-evc-padhue-2026':
      return <ArticleChoixSpecialitePadhue article={article} />;
    case 'pourquoi-des-medecins-echouent-aux-evc':
      return <ArticleEchecEvc article={article} />;
    case '7-erreurs-points-evc':
      return <Article7ErreursEvc article={article} />;
    case 'gerer-stress-motivation-evc':
      return <ArticleMentalEvc article={article} />;
    case 'organiser-revisions-evc':
      return <ArticleOrganiserRevisionsEvc article={article} />;
    default:
      return RICH_CONTENT[slug]
        ? <ArticleRich article={article} />
        : <ArticleGeneric article={article} />;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const today = new Date().toISOString().slice(0, 10);

  const article = getArticleBySlug(slug);

  // Article statique (composant dédié ou contenu riche embarqué).
  if (article) {
    if (article.publishedAt && article.publishedAt > today) notFound();
    return (
      <>
        <JsonLd data={jsonLdFor(article, slug)} />
        {articleBody(slug, article)}
        {/* Retour vers la page hub /guide-evc + maillage « À lire aussi ». */}
        <ArticleGuideFooter
          slug={slug}
          excludeSlugs={relatedSlugsIn(RICH_CONTENT[slug])}
          showRelated={!SLUGS_WITH_OWN_RELATED.has(slug) && relatedSlugsIn(RICH_CONTENT[slug]).length < 3}
        />
      </>
    );
  }

  // Article créé depuis /admin/blog (base de données), rendu par le même gabarit premium.
  const dbArticle = await getDbArticleBySlug(slug);
  if (!dbArticle) notFound();
  const extraPublishedSlugs = (await getDbPublishedArticles()).map((a) => a.slug);

  return (
    <>
      <JsonLd data={jsonLdFor(dbArticle.meta, slug)} />
      <ArticleRich
        article={dbArticle.meta}
        blocks={dbArticle.blocks}
        extraPublishedSlugs={extraPublishedSlugs}
      />
      <ArticleGuideFooter
        slug={slug}
        excludeSlugs={relatedSlugsIn(dbArticle.blocks)}
        showRelated={relatedSlugsIn(dbArticle.blocks).length < 3}
      />
    </>
  );
}

function jsonLdFor(article: NonNullable<ReturnType<typeof getArticleBySlug>>, slug: string) {
  // Un article créé en base peut porter une catégorie inconnue du référentiel :
  // on n'insère alors pas de maillon « catégorie » dans le fil d'Ariane.
  const category = BLOG_CATEGORIES[article.category];
  return [
    articleSchema({
      title: article.title,
      description: article.excerpt,
      slug,
      image: article.image ?? BLOG_CATEGORY_IMAGE[article.category],
      datePublished: article.publishedAt,
    }),
    // Le fil d'Ariane affiché passe par la page hub : le schéma le reflète.
    breadcrumbSchema([
      { name: 'Accueil', path: '/' },
      { name: GUIDE_EVC_LABEL, path: GUIDE_EVC_PATH },
      ...(category ? [{ name: category.label, path: `/blog?cat=${article.category}` }] : []),
      { name: article.title, path: `/blog/${slug}` },
    ]),
  ];
}
