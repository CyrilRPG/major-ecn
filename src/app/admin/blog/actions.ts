'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { BLOG_CACHE_TAG } from '@/lib/data/blog-db';
import type { Block } from '@/lib/data/blog-content/types';
import type { BlogCategory } from '@/lib/data/blog-articles';
import type { Json } from '@/types/database';

/** Transforme un titre en slug URL (sans accents, tirets). */
export async function slugify(input: string): Promise<string> {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

function slugifySync(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90);
}

export type BlogPostInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readingMinutes: number;
  heroImage: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt: string | null; // 'YYYY-MM-DD'
  blocks: Block[];
};

type SaveResult = { ok: true; id: string; slug: string } | { ok: false; error: string };

/** Crée ou met à jour un article de blog. */
export async function savePost(input: BlogPostInput): Promise<SaveResult> {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const title = input.title.trim();
  if (!title) return { ok: false, error: 'Le titre est obligatoire.' };
  const slug = slugifySync(input.slug?.trim() || title);
  if (!slug) return { ok: false, error: 'Le slug est invalide.' };

  // Le hero est géré à part : on le (re)place en tête du contenu pour le rendu.
  const body = input.blocks.filter((b) => b.t !== 'hero');
  const content: Block[] = input.heroImage
    ? [{ t: 'hero', src: input.heroImage, alt: title }, ...body]
    : body;

  const today = new Date().toISOString().slice(0, 10);
  const publishedAt =
    input.publishedAt || (input.status === 'published' ? today : null);

  const row = {
    slug,
    title,
    excerpt: input.excerpt?.trim() ?? '',
    category: input.category,
    reading_minutes: Math.min(120, Math.max(1, input.readingMinutes || 5)),
    hero_image: input.heroImage,
    content: content as unknown as Json,
    status: input.status,
    featured: input.featured,
    published_at: publishedAt,
    author_id: user.id,
  };

  if (input.id) {
    const { error } = await supabase.from('blog_posts').update(row).eq('id', input.id);
    if (error) return { ok: false, error: mapError(error) };
    revalidateBlog(slug);
    return { ok: true, id: input.id, slug };
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: mapError(error) };
  revalidateBlog(slug);
  return { ok: true, id: data.id, slug };
}

/** Supprime un article. */
export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidateBlog();
  return { ok: true };
}

// Le téléversement des images du blog se fait désormais depuis le navigateur
// (`upload-image-browser.ts`) : la server action qui les recevait butait sur le
// plafond de 4,5 Mo imposé aux corps de requête des fonctions serverless.

function revalidateBlog(slug?: string) {
  // `revalidatePath` ne suffit plus : les articles sont désormais lus à travers
  // `unstable_cache`, dont l'invalidation passe par l'étiquette. Sans cette
  // ligne, une publication resterait invisible jusqu'à l'expiration des
  // 5 minutes de cache.
  //
  // `updateTag` plutôt que `revalidateTag` : appelé depuis une action serveur,
  // il garantit que l'administrateur voit immédiatement sa propre publication
  // au lieu d'attendre le prochain passage de cache.
  updateTag(BLOG_CACHE_TAG);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  if (slug) revalidatePath(`/blog/${slug}`);
}

function mapError(error: { code?: string; message: string } | null): string {
  if (!error) return 'Erreur inconnue.';
  if (error.code === '23505') return 'Ce slug est déjà utilisé par un autre article.';
  return error.message;
}
