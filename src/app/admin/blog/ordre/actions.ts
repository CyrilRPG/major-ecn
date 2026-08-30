'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { BLOG_CACHE_TAG } from '@/lib/data/blog-db';
import { saveBlogOrderConfig } from '@/lib/data/blog-order';

/**
 * Enregistre l'ordre d'affichage du blog et la sélection « À la une »
 * (/admin/blog/ordre). L'ordre vaut pour TOUS les articles (base + statiques) ;
 * le drapeau `featured` des articles en base est synchronisé pour rester
 * cohérent avec la case « Mettre en avant » de l'éditeur.
 */
export async function saveBlogOrder(input: {
  order: string[];
  featured: string[];
}): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();

  const clean = (v: unknown) =>
    (Array.isArray(v) ? v : [])
      .filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]{1,120}$/.test(s))
      .slice(0, 500);
  const order = clean(input.order);
  const featured = clean(input.featured);

  try {
    await saveBlogOrderConfig({ order, featured });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  // Synchronisation du drapeau `featured` (au mieux : un échec ici ne doit pas
  // faire perdre l'ordre, qui est déjà enregistré).
  try {
    const supabase = await createClient();
    if (featured.length) {
      await supabase.from('blog_posts').update({ featured: true }).in('slug', featured);
      await supabase
        .from('blog_posts')
        .update({ featured: false })
        .not('slug', 'in', `(${featured.map((s) => `"${s}"`).join(',')})`);
    } else {
      // Liste vide = retour au comportement historique : on ne touche pas aux drapeaux.
    }
  } catch (e) {
    console.error('[blog-ordre] synchronisation featured :', e);
  }

  updateTag(BLOG_CACHE_TAG);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  revalidatePath('/admin/blog/ordre');
  return { ok: true };
}
