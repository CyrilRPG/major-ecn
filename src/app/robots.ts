import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

/**
 * robots.txt — autorise le crawl du site vitrine, bloque l'application
 * authentifiée, l'admin et les API (jamais indexables). Référence le sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/auth',
          '/accueil',
          '/profil',
          '/facultes',
          '/matieres',
          '/cours',
          '/forum',
          '/annales',
          '/login',
          '/espace-decouverte/confirmation',
          '/merci',
          '/annule',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
