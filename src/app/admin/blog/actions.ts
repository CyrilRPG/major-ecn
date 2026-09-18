'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { peutModifierArticle, requireBlogAction } from '@/lib/blog/acces';
import { BLOG_CACHE_TAG } from '@/lib/data/blog-db';
import { findDuplicateArticle } from '@/lib/data/blog-duplicates';
import type { Block } from '@/lib/data/blog-content/types';
import type { BlogCategory } from '@/lib/data/blog-articles';
import type { Database, Json } from '@/types/database';

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
  /** `pending` = « En attente de validation » (auteur sans droit de publier). */
  status: 'draft' | 'pending' | 'published';
  featured: boolean;
  publishedAt: string | null; // 'YYYY-MM-DD'
  blocks: Block[];
  /** L'administrateur a confirmé l'enregistrement malgré un titre déjà pris. */
  confirmDuplicate?: boolean;
};

type SaveResult =
  /** `status` = statut réellement enregistré (peut différer de la demande). */
  | { ok: true; id: string; slug: string; status: 'draft' | 'pending' | 'published' }
  | { ok: false; error: string }
  /** Un article au titre très proche existe déjà : demander confirmation. */
  | { ok: false; error: string; duplicateOf: { title: string; slug: string } };

/**
 * Crée ou met à jour un article de blog.
 *
 * Cahier des charges §6 : le droit de publier est distinct du droit d'écrire.
 * Sans « Publier », un article envoyé en publication est rangé « En attente
 * de validation » (`pending`) ; un article déjà publié ne peut être touché
 * que par qui peut le modifier, et rester publié que par qui peut publier.
 */
export async function savePost(input: BlogPostInput): Promise<SaveResult> {
  let acteur: Awaited<ReturnType<typeof requireBlogAction>>;
  try { acteur = await requireBlogAction(); } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Accès refusé' }; }
  const { user, droits } = acteur;
  // Client service-role (cloisonné par faculté) : la RLS de blog_posts ne
  // connaît que l'administrateur, les droits sont contrôlés ici.
  const supabase = createAdminClient();

  // Existant : droit de modification (ses articles / tous) ; nouveau : droit de création.
  let existant: { author_id: string | null; status: string } | null = null;
  if (input.id) {
    const { data } = await supabase.from('blog_posts').select('author_id, status').eq('id', input.id).maybeSingle();
    if (!data) return { ok: false, error: 'Article introuvable.' };
    existant = data as { author_id: string | null; status: string };
    if (!peutModifierArticle(droits, existant.author_id, user.id)) return { ok: false, error: 'Vous ne pouvez pas modifier cet article.' };
  } else if (!droits.creer) {
    return { ok: false, error: 'Votre accès ne permet pas de créer un article.' };
  }
  // Statut effectif : publier demande le droit ; sinon file de validation.
  let statut: 'draft' | 'pending' | 'published' = input.status;
  if (statut === 'published' && !droits.publier) statut = 'pending';
  // Un article publié qu'on ré-enregistre sans le droit de dépublier reste publié.
  if (existant?.status === 'published' && statut !== 'published' && !droits.depublier) statut = 'published';

  const title = input.title.trim();
  if (!title) return { ok: false, error: 'Le titre est obligatoire.' };
  const slug = slugifySync(input.slug?.trim() || title);
  if (!slug) return { ok: false, error: 'Le slug est invalide.' };

  // Garde anti-doublon : deux articles importés/saisis deux fois sous le même
  // titre ont déjà été publiés (puis supprimés… mais facturés). On demande
  // désormais une confirmation explicite avant d'enregistrer un homonyme.
  if (!input.confirmDuplicate) {
    const dup = await findDuplicateArticle(supabase, title, input.id ?? null);
    if (dup) {
      return {
        ok: false,
        error: `Un article au titre très proche existe déjà : « ${dup.title} » (/blog/${dup.slug}).`,
        duplicateOf: dup,
      };
    }
  }

  // Le hero est géré à part : on le (re)place en tête du contenu pour le rendu.
  const body = input.blocks.filter((b) => b.t !== 'hero');
  const content: Block[] = input.heroImage
    ? [{ t: 'hero', src: input.heroImage, alt: title }, ...body]
    : body;

  const today = new Date().toISOString().slice(0, 10);
  const publishedAt =
    input.publishedAt || (statut === 'published' ? today : null);
  const maintenant = new Date().toISOString();

  const row = {
    slug,
    title,
    excerpt: input.excerpt?.trim() ?? '',
    category: input.category,
    reading_minutes: Math.min(120, Math.max(1, input.readingMinutes || 5)),
    hero_image: input.heroImage,
    content: content as unknown as Json,
    status: statut,
    featured: input.featured,
    published_at: publishedAt,
    // L'auteur reste celui qui a créé l'article (droit « modifier ses articles »).
    author_id: existant?.author_id ?? user.id,
    updated_by: user.id,
    ...(statut === 'pending' ? { submitted_at: maintenant, submitted_by: user.id } : {}),
    ...(statut === 'published' && existant?.status !== 'published' ? { published_by: user.id } : {}),
  };

  if (input.id) {
    const { error } = await supabase.from('blog_posts').update(row).eq('id', input.id);
    if (error) return { ok: false, error: mapError(error) };
    revalidateBlog(slug);
    return { ok: true, id: input.id, slug, status: statut };
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) return { ok: false, error: mapError(error) };
  revalidateBlog(slug);
  return { ok: true, id: data.id, slug, status: statut };
}

/** Supprime un article. */
export async function deletePost(id: string): Promise<{ ok: boolean; error?: string }> {
  let acteur: Awaited<ReturnType<typeof requireBlogAction>>;
  try { acteur = await requireBlogAction(); } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Accès refusé' }; }
  if (!acteur.droits.supprimer) return { ok: false, error: 'Votre accès ne permet pas de supprimer un article.' };
  const supabase = createAdminClient();
  const { data: post } = await supabase.from('blog_posts').select('title, slug').eq('id', id).maybeSingle();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({
    actor: acteur.profile, action: 'delete', entity: 'blog_post', entityId: id,
    description: `Suppression de l’article « ${post?.title ?? id} »`, diff: { slug: post?.slug ?? null },
  });
  revalidateBlog();
  return { ok: true };
}

/**
 * Publier / dépublier / remettre en brouillon un article existant (cahier §6)
 * — l'administrateur valide la file « En attente de validation » d'ici.
 */
export async function setPostStatus(id: string, statut: 'draft' | 'pending' | 'published'): Promise<{ ok: boolean; error?: string }> {
  let acteur: Awaited<ReturnType<typeof requireBlogAction>>;
  try { acteur = await requireBlogAction(); } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'Accès refusé' }; }
  const { droits, user } = acteur;
  const supabase = createAdminClient();
  const { data: post } = await supabase.from('blog_posts').select('id, title, slug, status, author_id, published_at').eq('id', id).maybeSingle();
  if (!post) return { ok: false, error: 'Article introuvable.' };
  if (statut === 'published' && !droits.publier) return { ok: false, error: 'Votre accès ne permet pas de publier.' };
  if (post.status === 'published' && statut !== 'published' && !droits.depublier) return { ok: false, error: 'Votre accès ne permet pas de dépublier.' };
  if (statut === 'pending' && !peutModifierArticle(droits, post.author_id, user.id)) return { ok: false, error: 'Vous ne pouvez pas modifier cet article.' };
  const maintenant = new Date().toISOString();
  const patch: Database['public']['Tables']['blog_posts']['Update'] = { status: statut, updated_by: user.id };
  if (statut === 'published') { patch.published_by = user.id; if (!post.published_at) patch.published_at = maintenant.slice(0, 10); }
  if (statut === 'pending') { patch.submitted_at = maintenant; patch.submitted_by = user.id; }
  const { error } = await supabase.from('blog_posts').update(patch).eq('id', id);
  if (error) return { ok: false, error: error.message };
  const libelle = statut === 'published' ? 'publié' : statut === 'pending' ? 'soumis à validation' : 'remis en brouillon';
  await logAudit({
    actor: acteur.profile, action: 'update', entity: 'blog_post', entityId: id,
    description: `Article « ${post.title} » ${libelle}`, diff: { from: post.status, to: statut },
  });
  revalidateBlog(post.slug);
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
