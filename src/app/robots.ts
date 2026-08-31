import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

/**
 * robots.txt — autorise le crawl du site vitrine, bloque l'application
 * authentifiée, l'admin et les API (jamais indexables). Référence le sitemap.
 *
 * Deux principes appliqués ici :
 *
 * 1. Les règles sont des PRÉFIXES d'URL. `Disallow: /profil` interdisait donc
 *    aussi `/profil-evc`, page vitrine publique (le diagnostic gratuit mis en
 *    avant dans le menu) : elle ne pouvait pas être explorée, donc pas indexée.
 *    D'où `/profil$` (l'URL exacte) et `/profil/` (ses sous-pages).
 *
 * 2. Une page que l'on veut voir DISPARAÎTRE de l'index ne doit pas être
 *    bloquée ici : un robot qui n'a pas le droit de la lire ne voit jamais sa
 *    balise `noindex` et peut la garder dans l'index sans description. Les
 *    pages de remerciement, d'annulation et de connexion portent donc un
 *    `noindex` dans leurs métadonnées et restent explorables.
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
          '/profil$',
          '/profil/',
          '/facultes',
          '/matieres',
          '/cours',
          '/forum',
          '/annales',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
