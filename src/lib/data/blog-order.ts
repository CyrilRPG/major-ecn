import 'server-only';
import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { BLOG_CACHE_TAG } from './blog-db';

/**
 * Ordre d'affichage du blog, contrôlé depuis /admin/blog/ordre.
 *
 * Le réglage vit dans un petit JSON du bucket PRIVÉ `site-config` (et non dans
 * une colonne) : les articles viennent de DEUX sources — la table `blog_posts`
 * et les articles statiques du code — et seul un document commun peut ordonner
 * l'ensemble. Lu via service role, invalidé par l'étiquette de cache du blog.
 *
 *  - `order`    : slugs dans l'ordre d'affichage de la grille « Ressources ».
 *                 Les articles absents de la liste suivent, dans l'ordre
 *                 habituel (base par date, puis statiques).
 *  - `featured` : slugs « À la une », dans l'ordre du carrousel. Liste vide ou
 *                 absente → comportement historique (drapeau `featured`).
 */

export type BlogOrderConfig = { order: string[]; featured: string[] };

const BUCKET = 'site-config';
const OBJECT_PATH = 'blog/order.json';

function sanitize(raw: unknown): BlogOrderConfig | null {
  const o = raw as { order?: unknown; featured?: unknown } | null;
  if (!o || typeof o !== 'object') return null;
  const slugs = (v: unknown) =>
    (Array.isArray(v) ? v : [])
      .filter((s): s is string => typeof s === 'string' && /^[a-z0-9-]{1,120}$/.test(s))
      .slice(0, 500);
  return { order: slugs(o.order), featured: slugs(o.featured) };
}

/** Lecture mise en cache (même étiquette que les articles : toute action de
 *  /admin/blog l'invalide). `null` si le réglage n'existe pas encore. */
export const getBlogOrderConfig = unstable_cache(
  async (): Promise<BlogOrderConfig | null> => {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.storage.from(BUCKET).download(OBJECT_PATH);
      if (error || !data) return null;
      return sanitize(JSON.parse(await data.text()));
    } catch {
      return null;
    }
  },
  ['blog-order-config'],
  { revalidate: 300, tags: [BLOG_CACHE_TAG] },
);

/** Écrit le réglage (crée le bucket privé au premier enregistrement). */
export async function saveBlogOrderConfig(config: BlogOrderConfig): Promise<void> {
  const admin = createAdminClient();
  const clean = sanitize(config) ?? { order: [], featured: [] };
  // Idempotent : échoue silencieusement si le bucket existe déjà.
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => null);
  const body = new Blob([JSON.stringify(clean, null, 1)], { type: 'application/json' });
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(OBJECT_PATH, body, { upsert: true, contentType: 'application/json' });
  if (error) throw new Error(`Enregistrement de l’ordre impossible : ${error.message}`);
}

/** Applique `order` : les slugs listés d'abord (dans cet ordre), le reste à la
 *  suite dans son ordre d'origine. */
export function applyBlogOrder<T extends { slug: string }>(articles: T[], order: string[]): T[] {
  if (!order.length) return articles;
  const rank = new Map(order.map((slug, i) => [slug, i]));
  const listed: T[] = [];
  const rest: T[] = [];
  for (const a of articles) (rank.has(a.slug) ? listed : rest).push(a);
  listed.sort((a, b) => (rank.get(a.slug) ?? 0) - (rank.get(b.slug) ?? 0));
  return [...listed, ...rest];
}

/** Articles « À la une », dans l'ordre du carrousel. */
export function selectFeatured<T extends { slug: string; featured?: boolean }>(
  articles: T[],
  config: BlogOrderConfig | null,
): T[] {
  if (config?.featured.length) {
    const bySlug = new Map(articles.map((a) => [a.slug, a]));
    const out = config.featured.map((s) => bySlug.get(s)).filter(Boolean) as T[];
    if (out.length) return out;
  }
  // Sans sélection explicite : les articles marqués « featured », plafonnés à 4
  // pour que le carrousel par défaut reste sobre (l'admin peut en choisir plus).
  const flagged = articles.filter((a) => a.featured).slice(0, 4);
  if (flagged.length) return flagged;
  return articles.length ? [articles[0]] : [];
}
