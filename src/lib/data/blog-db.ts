import 'server-only';
import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { getPublishedArticles, type BlogArticleMeta, type BlogCategory } from './blog-articles';
import type { Block } from './blog-content/types';

/** Étiquette de cache : invalidée par les actions de /admin/blog à chaque
 *  publication, modification ou suppression. */
export const BLOG_CACHE_TAG = 'blog-posts';

/**
 * Couche d'accès aux articles créés depuis /admin/blog (table public.blog_posts).
 * Les articles publiés viennent compléter les articles statiques de blog-articles.ts.
 * Ils sont rendus par le MÊME gabarit premium (ArticleRich) : le champ `content`
 * est un tableau de blocs (Block[]) identique au type blog-content/types.ts.
 *
 * Toutes les fonctions dégradent proprement (tableau vide / null) si Supabase
 * n'est pas configuré (ex. clone sans .env.local) : le blog statique reste servi.
 */

type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number;
  hero_image: string | null;
  status: string;
  featured: boolean;
  published_at: string | null;
  content?: unknown;
};

const META_COLUMNS =
  'slug,title,excerpt,category,reading_minutes,hero_image,status,featured,published_at';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToMeta(row: PostRow): BlogArticleMeta {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category as BlogCategory,
    readingMinutes: row.reading_minutes,
    image: row.hero_image ?? undefined,
    readers: 0,
    publishedAt: row.published_at ?? undefined,
    featured: row.featured,
  };
}

function normalizeBlocks(content: unknown): Block[] {
  if (Array.isArray(content)) return content as Block[];
  return [];
}

/**
 * Métadonnées des articles DB publiés (date passée), du plus récent au plus ancien.
 *
 * Mis en cache : le blog est identique pour tous les visiteurs et ne change
 * qu'à la publication depuis l'administration, qui invalide l'étiquette.
 * Auparavant chaque visite déclenchait une requête, et le `revalidate = 300`
 * des pages était neutralisé par le client à cookies.
 */
export const getDbPublishedArticles = unstable_cache(
  async (): Promise<BlogArticleMeta[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select(META_COLUMNS)
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error || !data) return [];
      return (data as PostRow[])
        .filter((r) => !r.published_at || r.published_at <= today())
        .map(rowToMeta);
    } catch {
      return [];
    }
  },
  ['blog-published-articles'],
  { revalidate: 300, tags: [BLOG_CACHE_TAG] },
);

/** Liste {slug, title} de tous les articles publiés (statiques + DB) — pour le sélecteur « À lire aussi ». */
export async function getArticlePicker(): Promise<{ slug: string; title: string }[]> {
  const staticArticles = getPublishedArticles().map((a) => ({ slug: a.slug, title: a.title }));
  const seen = new Set(staticArticles.map((a) => a.slug));
  const db = (await getDbPublishedArticles())
    .filter((a) => !seen.has(a.slug))
    .map((a) => ({ slug: a.slug, title: a.title }));
  return [...staticArticles, ...db];
}

/** Un article DB publié (méta + blocs) par slug, ou null s'il n'existe pas / pas publié. */
export const getDbArticleBySlug = unstable_cache(
  async (slug: string): Promise<{ meta: BlogArticleMeta; blocks: Block[] } | null> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`${META_COLUMNS},content`)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (error || !data) return null;
      const row = data as PostRow;
      if (row.published_at && row.published_at > today()) return null;
      return { meta: rowToMeta(row), blocks: normalizeBlocks(row.content) };
    } catch {
      return null;
    }
  },
  ['blog-article-by-slug'],
  { revalidate: 300, tags: [BLOG_CACHE_TAG] },
);
