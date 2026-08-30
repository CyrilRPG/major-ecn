import 'server-only';
import { getPublishedArticles } from '@/lib/data/blog-articles';

/**
 * Détection des articles en doublon par le TITRE.
 *
 * Deux articles ont déjà été importés deux fois par IA sous le même titre,
 * publiés, supprimés… et facturés deux fois. Toute création (éditeur manuel
 * ou import IA) passe donc par cette vérification : si un article — publié ou
 * brouillon, en base ou statique — porte un titre équivalent, l'administrateur
 * doit confirmer explicitement avant d'enregistrer.
 *
 * L'équivalence est volontairement large : accents, casse, ponctuation et
 * espaces ignorés (« EVC Pédiatrie 2026 : que réviser » ≡ « evc pediatrie
 * 2026, que reviser »).
 */

export function normalizeTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export type DuplicateArticle = { title: string; slug: string };

/**
 * Cherche un article existant dont le titre est équivalent. `excludeId` : id de
 * l'article en cours d'édition (un article n'est jamais son propre doublon).
 * Dégrade en `null` sur toute erreur : la garde ne doit jamais bloquer un
 * enregistrement légitime.
 */
export async function findDuplicateArticle(
  supabase: { from: (t: string) => unknown },
  title: string,
  excludeId: string | null,
): Promise<DuplicateArticle | null> {
  const wanted = normalizeTitle(title);
  if (!wanted) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('blog_posts')
      .select('id, title, slug')
      .limit(1000);
    for (const row of (data ?? []) as { id: string; title: string; slug: string }[]) {
      if (excludeId && row.id === excludeId) continue;
      if (normalizeTitle(row.title) === wanted) return { title: row.title, slug: row.slug };
    }
  } catch {
    return null;
  }

  for (const a of getPublishedArticles()) {
    if (normalizeTitle(a.title) === wanted) return { title: a.title, slug: a.slug };
  }
  return null;
}
