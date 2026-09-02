import { CardiologiePageContent } from '@/components/marketing/cardiologie-page';
import { lireSpecialite } from '@/lib/tunnel-inscription';
import { APPROFONDI_MIN_EUROS_FR } from '@/lib/stripe/approfondi';
import { FAQ_CARDIO, reponseTexteCardio } from '@/lib/data/faq-cardiologie';
import { JsonLd, breadcrumbSchema, faqSchema } from '@/components/seo/json-ld';

/** L'URL suit le modèle des autres pages spécialité et le slug publié par
    /specialites : le silo reste cohérent et le lien du hub fonctionne. */
const URL = '/specialites/cardiologie-et-maladies-vasculaires';
/** Le layout racine applique le gabarit « %s · Major ECN ». */
const TITRE = 'Préparation EVC Cardiologie 2026';
const DESCRIPTION =
  'Préparez les EVC de Cardiologie 2026 avec Major ECN : cours, QCM ou QROC, cas cliniques, fiches, flashcards, examens blancs et accompagnement.';
const IMAGE = '/specialites/cardiologie/og.jpg';

export const metadata = {
  alternates: { canonical: URL },
  title: TITRE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITRE} — Major ECN`,
    description:
      'Préparez les EVC de Cardiologie avec une méthode structurée, des entraînements adaptés à votre voie et un accompagnement tout au long de votre préparation.',
    url: URL,
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Major ECN',
    images: [
      {
        url: IMAGE,
        width: 1200,
        height: 630,
        alt: 'Préparation EVC Cardiologie Major ECN',
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

export default async function CardiologiePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const specialite = lireSpecialite(await searchParams);
  /* La cardiologie n'a pas de palier Approfondi achetable en ligne qui lui
     soit propre : la page annonce donc le point d'entrée du catalogue, seul
     montant que le paiement pratique effectivement. */
  const prixApprofondie = APPROFONDI_MIN_EUROS_FR;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Accueil', path: '/' },
            { name: 'Préparation EVC', path: '/specialites' },
            { name: 'Cardiologie', path: URL },
          ]),
          // Les Q/R publiées sont exactement celles affichées sur la page.
          faqSchema(FAQ_CARDIO.map((f) => ({ q: f.q, a: reponseTexteCardio(f, prixApprofondie) }))),
        ]}
      />
      <CardiologiePageContent specialite={specialite} prixApprofondie={prixApprofondie} />
    </>
  );
}
