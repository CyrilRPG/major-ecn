import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/data/blog-articles';
import { getDbPublishedArticles } from '@/lib/data/blog-db';
import { FEATURED_TESTIMONIES } from '@/lib/data/featured-testimonies';

// Le plan de site inclut les articles créés depuis /admin/blog : sans cette
// régénération périodique, un article publié depuis l'administration (ou importé
// par IA) n'aurait jamais été soumis à l'indexation.
export const revalidate = 600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

/** Pages vitrine statiques, avec priorité/fréquence indicatives pour le crawl. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/methode', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/plateforme', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/tarifs', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/formules/essentielle', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/formules/programme-approfondi', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/formules/intensive', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/specialites', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/specialites/medecine-generale', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/temoignages', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/espace-decouverte', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/recrutement', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/inscription', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cgs', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/conditions-particulieres', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Articles statiques + articles publiés depuis l'administration (CMS / import IA).
  const staticSlugs = new Set(getPublishedArticles().map((a) => a.slug));
  const dbArticles = (await getDbPublishedArticles()).filter((a) => !staticSlugs.has(a.slug));
  const blogEntries: MetadataRoute.Sitemap = [...getPublishedArticles(), ...dbArticles].map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const temoignageEntries: MetadataRoute.Sitemap = FEATURED_TESTIMONIES.map((t) => ({
    url: `${SITE_URL}/temoignages/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticEntries, ...blogEntries, ...temoignageEntries];
}
