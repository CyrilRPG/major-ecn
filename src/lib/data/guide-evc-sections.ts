import 'server-only';
import { getPublishedArticles } from './blog-articles';
import { getDbPublishedArticles } from './blog-db';
import { buildGuideSections, type GuideSection } from './guide-evc';

/**
 * Sections du hub /guide-evc alimentées par TOUS les articles publiés :
 * statiques (blog-articles.ts) et créés depuis /admin/blog (base de données,
 * import IA compris). Les doublons de slug sont écartés au profit de la version
 * statique, qui fait autorité.
 *
 * Séparé de guide-evc.ts pour que la structure éditoriale (sections, textes,
 * répartition) reste testable sans dépendance à Supabase.
 */
export async function getGuideEvcSections(): Promise<GuideSection[]> {
  const staticArticles = getPublishedArticles();
  const seen = new Set(staticArticles.map((a) => a.slug));
  const dbArticles = (await getDbPublishedArticles()).filter((a) => !seen.has(a.slug));
  return buildGuideSections([...staticArticles, ...dbArticles]);
}
