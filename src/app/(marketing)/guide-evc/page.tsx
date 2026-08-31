import type { Metadata } from 'next';
import { GuideEvcHub } from '@/components/marketing/guide-evc/guide-evc-hub';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';
import { GUIDE_EVC_FAQ, GUIDE_EVC_LABEL, GUIDE_EVC_PATH } from '@/lib/data/guide-evc';

/**
 * Page hub « Guide EVC » — page de référence permanente, à la racine du site
 * (pas dans /blog, pas d'année dans l'URL : l'adresse ne doit jamais changer).
 * Elle réunit tous les articles du blog par étape du parcours ; chaque article
 * renvoie vers elle (fil d'Ariane + encart de fin d'article).
 */

export const metadata: Metadata = {
  // `absolute` : le gabarit du site ajoute « · Major ECN » à tous les titres,
  // ce qui doublerait la marque et ferait dépasser les ~60 caractères utiles.
  title: { absolute: 'Guide complet des EVC 2026 pour médecins étrangers | Major ECN' },
  description:
    'Le guide de référence des Épreuves de Vérification des Connaissances : voie interne et voie externe, inscription au CNG, préparation, spécialités et carrière.',
  alternates: { canonical: GUIDE_EVC_PATH },
  openGraph: {
    title: 'Guide complet des EVC pour médecins à diplôme étranger',
    description:
      "Comprendre les EVC, s'inscrire au CNG, se préparer, choisir sa spécialité et connaître le parcours après la réussite : tous nos articles réunis.",
    type: 'website',
    url: GUIDE_EVC_PATH,
    siteName: 'Major ECN',
    locale: 'fr_FR',
    images: [{ url: '/blog/couloir-hopital.jpg', alt: 'Guide complet des EVC — Major ECN' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guide complet des EVC pour médecins à diplôme étranger',
    description:
      "Tous nos articles sur les EVC réunis : épreuves, inscription, préparation, spécialités, carrière.",
    images: ['/blog/couloir-hopital.jpg'],
  },
};

// Le hub liste aussi les articles créés depuis /admin/blog : sans régénération
// périodique, un article publié depuis l'administration n'y apparaîtrait qu'au
// prochain déploiement.
export const revalidate = 600;

export default function GuideEvcPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: GUIDE_EVC_LABEL, path: GUIDE_EVC_PATH },
          ]),
          faqSchema(GUIDE_EVC_FAQ),
        ]}
      />
      <GuideEvcHub />
    </>
  );
}
