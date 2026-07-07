import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { getArticlePicker } from '@/lib/data/blog-db';
import type { Block } from '@/lib/data/blog-content/types';
import type { BlogCategory } from '@/lib/data/blog-articles';
import { BlogEditor } from '../../blog-editor';
import type { BlogPostInput } from '../../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Éditer l’article — Blog' };

type Row = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  reading_minutes: number;
  hero_image: string | null;
  content: unknown;
  status: string;
  featured: boolean;
  published_at: string | null;
};

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const row = data as Row;

  const blocks: Block[] = Array.isArray(row.content) ? (row.content as Block[]) : [];
  const heroBlock = blocks.find((b): b is Extract<Block, { t: 'hero' }> => b.t === 'hero');
  const bodyBlocks = blocks.filter((b) => b.t !== 'hero');

  const initial: BlogPostInput & { id: string } = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category as BlogCategory,
    readingMinutes: row.reading_minutes,
    heroImage: row.hero_image ?? heroBlock?.src ?? null,
    status: (row.status as 'draft' | 'published') ?? 'draft',
    featured: row.featured,
    publishedAt: row.published_at,
    blocks: bodyBlocks,
  };

  const allArticles = (await getArticlePicker()).filter((a) => a.slug !== row.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-5">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-xs font-medium text-(--color-ink-muted) hover:text-(--color-ink)">
          <ChevronLeft className="h-3.5 w-3.5" /> Retour aux articles
        </Link>
        <h1 className="mt-2 truncate text-xl font-semibold tracking-tight text-(--color-ink)">
          Éditer : {row.title || '(sans titre)'}
        </h1>
      </header>
      <BlogEditor initial={initial} allArticles={allArticles} />
    </main>
  );
}
