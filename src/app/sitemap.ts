import type { MetadataRoute } from 'next';
import { BLOG_ARTICLES } from '@/lib/data/blog-articles';
import { FEATURED_TESTIMONIES } from '@/lib/data/featured-testimonies';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://major-ecn.fr').replace(/\/$/, '');

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = BLOG_ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: now,
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
