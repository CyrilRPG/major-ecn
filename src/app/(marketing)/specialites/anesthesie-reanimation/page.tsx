import { AnesthesiePageContent } from '@/components/marketing/anesthesie-page';

/** Le layout racine applique le gabarit « %s · Major ECN » : le titre ne doit
    donc pas répéter la marque. Les balises og/twitter sont propres à la
    spécialité — l'anesthésie-réanimation est ouverte dans les deux voies. */
const TITRE = 'Anesthésie-Réanimation — Préparation EVC (PAE)';
const DESCRIPTION =
  'Préparation aux EVC en anesthésie-réanimation, voie interne (QCM) et voie externe (QROC) : cours en direct, QCM, QROC, cas cliniques et annales corrigées.';
const URL = '/specialites/anesthesie-reanimation';
const IMAGE = '/specialites/anesthesie/og.jpg';

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
        alt: 'Préparation EVC en anesthésie-réanimation — Major ECN',
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

export default function AnesthesieReanimationPage() {
  return <AnesthesiePageContent />;
}
