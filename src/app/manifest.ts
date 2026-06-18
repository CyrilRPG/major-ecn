import type { MetadataRoute } from 'next';

/** Web App Manifest — PWA / bonus mobile & SEO. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Major ECN — Préparation aux EVC',
    short_name: 'Major ECN',
    description:
      "La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger souhaitant exercer en France.",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E4002B',
    lang: 'fr',
    icons: [
      { src: '/major-ecn-logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/major-ecn-logo.png', sizes: '512x512', type: 'image/png' },
      { src: '/major-ecn-logo.png', sizes: 'any', type: 'image/png', purpose: 'any' },
    ],
  };
}
