'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
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

/** Upload une image dans le bucket public `blog-images` et renvoie son URL publique. */
export async function uploadBlogImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Aucun fichier reçu.' };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: 'Image trop lourde (max 8 Mo).' };
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const year = new Date().getFullYear();
  const path = `${year}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) return { ok: false, error: error.message };
  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

function revalidateBlog(slug?: string) {
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  if (slug) revalidatePath(`/blog/${slug}`);
}

function mapError(error: { code?: string; message: string } | null): string {
  if (!error) return 'Erreur inconnue.';
  if (error.code === '23505') return 'Ce slug est déjà utilisé par un autre article.';
  return error.message;
}
