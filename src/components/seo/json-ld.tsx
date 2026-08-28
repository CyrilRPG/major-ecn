/**
 * Injecte des données structurées JSON-LD (schema.org) dans le <head>/DOM.
 * Server component — aucun JS client, invisible pour l'utilisateur, lu par les
 * moteurs de recherche. Ne modifie pas le contenu visible du site.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Le contenu est entièrement contrôlé côté serveur (pas d'entrée utilisateur).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.major-ecn.fr').replace(/\/$/, '');

/** Organisation Major ECN (logo, réseaux, contact). */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Major ECN',
    url: SITE_URL,
    logo: `${SITE_URL}/major-ecn-logo.png`,
    description:
      "Plateforme premium de préparation aux EVC (Épreuves de Vérification des Connaissances) pour les médecins à diplôme étranger souhaitant exercer en France.",
    sameAs: [] as string[],
  };
}

/** Site web + action de recherche interne. */
export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Major ECN',
    url: SITE_URL,
    inLanguage: 'fr-FR',
    publisher: { '@type': 'Organization', name: 'Major ECN', url: SITE_URL },
  };
}

/** FAQ structurée (réutilise les Q/R déjà affichées). */
export function faqSchema(qas: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Fil d'Ariane. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/** Article de blog. */
export function articleSchema(a: {
  title: string; description: string; slug: string; image?: string; datePublished?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    // Les articles créés depuis l'administration portent une URL absolue
    // (bucket Supabase) : la préfixer produirait une image introuvable.
    image: a.image
      ? a.image.startsWith('http') ? a.image : `${SITE_URL}${a.image}`
      : `${SITE_URL}/major-ecn-logo.png`,
    mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
    author: { '@type': 'Organization', name: 'Major ECN' },
    publisher: {
      '@type': 'Organization',
      name: 'Major ECN',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/major-ecn-logo.png` },
    },
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
    inLanguage: 'fr-FR',
  };
}
