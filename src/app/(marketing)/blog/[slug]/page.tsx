import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getPublishedArticles, BLOG_CATEGORY_IMAGE } from '@/lib/data/blog-articles';
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

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return { title: 'Article introuvable — Major ECN' };
  return {
    title: `${a.title} — Blog Major ECN`,
    description: a.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      type: 'article',
      url: `/blog/${slug}`,
    },
  };
}

export const revalidate = 3600;

export function generateStaticParams() {
  return getPublishedArticles().map((a) => ({ slug: a.slug }));
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
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const today = new Date().toISOString().slice(0, 10);
  if (article.publishedAt && article.publishedAt > today) notFound();

  return (
    <>
      <JsonLd data={[
        articleSchema({
          title: article.title,
          description: article.excerpt,
          slug,
          image: article.image ?? BLOG_CATEGORY_IMAGE[article.category],
          datePublished: article.publishedAt,
        }),
        breadcrumbSchema([
          { name: 'Accueil', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: article.title, path: `/blog/${slug}` },
        ]),
      ]} />
      {articleBody(slug, article)}
    </>
  );
}
