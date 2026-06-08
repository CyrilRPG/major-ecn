import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, BLOG_ARTICLES } from '@/lib/data/blog-articles';
import { ArticleRemuneration } from '@/components/marketing/blog/articles/article-remuneration';
import { ArticleStructuresPcc } from '@/components/marketing/blog/articles/article-structures-pcc';
import { ArticleDefisEvc } from '@/components/marketing/blog/articles/article-defis-evc';
import { ArticleImpactEvc } from '@/components/marketing/blog/articles/article-impact-evc';
import { ArticleListeDocuments } from '@/components/marketing/blog/articles/article-liste-documents';
import { ArticleCommentSinscrire } from '@/components/marketing/blog/articles/article-comment-sinscrire';
import { ArticleConseilsLaureats } from '@/components/marketing/blog/articles/article-conseils-laureats';
import { ArticleGeneric } from '@/components/marketing/blog/articles/article-generic';

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return { title: 'Article introuvable — Major ECN' };
  return {
    title: `${a.title} — Blog Major ECN`,
    description: a.excerpt,
  };
}

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

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
    default:
      return <ArticleGeneric article={article} />;
  }
}
