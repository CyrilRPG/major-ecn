import { OrthopediePageContent } from '@/components/marketing/orthopedie-page';

/** Le layout racine applique le gabarit « %s · Major ECN » : le titre ne doit
    donc pas répéter la marque. Les balises og/twitter sont propres à la
    spécialité — la chirurgie orthopédique n'est ouverte qu'en voie interne. */
const TITRE = 'EVC Chirurgie orthopédique et traumatologique (PAE)';
const DESCRIPTION =
  'Préparation aux EVC en chirurgie orthopédique et traumatologique : 101 postes en voie interne, épreuve QCM. Cours en direct, QCM et annales corrigées.';
const URL = '/specialites/chirurgie-orthopedique-et-traumatologie';
const IMAGE = '/specialites/orthopedie/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} — Major ECN`,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [
      {
        url: IMAGE,
        width: 1200,
        height: 630,
        alt: 'Préparation EVC en chirurgie orthopédique et traumatologique — Major ECN',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITRE} — Major ECN`,
    description: DESCRIPTION,
    images: [IMAGE],
  },
};

export default function ChirurgieOrthopediquePage() {
  return <OrthopediePageContent />;
}
