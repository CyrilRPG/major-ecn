import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { getArticlePicker } from '@/lib/data/blog-db';
import { BlogEditor } from '../blog-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nouvel article — Blog' };

export default async function NewBlogPostPage() {
  await requireAdmin();
  const allArticles = await getArticlePicker();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-5">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 text-xs font-medium text-(--color-ink-muted) hover:text-(--color-ink)">
          <ChevronLeft className="h-3.5 w-3.5" /> Retour aux articles
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-(--color-ink)">Nouvel article</h1>
      </header>
      <BlogEditor allArticles={allArticles} />
    </main>
  );
}
