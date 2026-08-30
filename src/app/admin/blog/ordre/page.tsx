import Link from 'next/link';
import { ChevronLeft, ListOrdered } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { getPublishedArticles } from '@/lib/data/blog-articles';
import { applyBlogOrder, getBlogOrderConfig, selectFeatured } from '@/lib/data/blog-order';
import { OrderEditor, type OrderRow } from './order-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ordre des articles — Blog' };

/**
 * /admin/blog/ordre — réordonner les articles du blog (grille « Ressources »)
 * et choisir / ordonner les articles « À la une » (carrousel d'en-tête).
 */
export default async function BlogOrderPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Articles publiés visibles sur /blog : base (les plus récents d'abord) puis
  // statiques — même construction que la page publique, ordre config appliqué.
  const { data } = await supabase
    .from('blog_posts')
    .select('slug,title,category,featured,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  const staticArticles = getPublishedArticles();
  const seen = new Set(staticArticles.map((a) => a.slug));
  const dbRows = ((data ?? []) as { slug: string; title: string; category: string; featured: boolean }[])
    .filter((r) => !seen.has(r.slug));

  const combined: OrderRow[] = [
    ...dbRows.map((r) => ({
      slug: r.slug,
      title: r.title,
      category: r.category,
      featured: r.featured,
      source: 'cms' as const,
    })),
    ...staticArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      category: a.category as string,
      featured: !!a.featured,
      source: 'statique' as const,
    })),
  ];

  const config = await getBlogOrderConfig();
  const ordered = applyBlogOrder(combined, config?.order ?? []);
  const featuredSlugs = selectFeatured(ordered, config).map((a) => a.slug);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-xs font-medium text-(--color-ink-muted) hover:text-(--color-ink)">
          <ChevronLeft className="h-3.5 w-3.5" /> Retour aux articles
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight text-(--color-ink)">
          <ListOrdered className="h-5 w-5 text-[#E4002B]" /> Ordre des articles du blog
        </h1>
        <p className="mt-1 text-sm text-(--color-ink-muted)">
          Réordonnez la grille d’articles de la page /blog et choisissez les articles
          « À la une » (le grand carrousel en tête de page) ainsi que leur ordre de défilement.
        </p>
      </header>
      <OrderEditor initialRows={ordered} initialFeatured={featuredSlugs} />
    </main>
  );
}
